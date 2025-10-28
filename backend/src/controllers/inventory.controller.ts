import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { scanQueue } from '../queues';
import { AppError } from '../middleware/errorHandler';
import { generateTransactionNo, calculateShrinkage } from '../utils/helpers';
import { io } from '../index';
import redis from '../config/redis';

/**
 * Scan barcode and create inventory transaction
 */
export const scanBarcode = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      barcode,
      type, // INBOUND | OUTBOUND
      itemType, // MATERIAL | PRODUCT
      quantity,
      unit,
      initialWeight,
      referenceNo,
      supplier,
      destination,
      notes,
    } = req.body;

    // Validate barcode exists
    let item;
    if (itemType === 'MATERIAL') {
      item = await prisma.material.findUnique({ where: { barcode } });
    } else {
      item = await prisma.product.findUnique({ where: { barcode } });
    }

    if (!item) {
      throw new AppError(`${itemType} with barcode ${barcode} not found`, 404);
    }

    // Get transaction sequence for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const count = await prisma.inventoryTransaction.count({
      where: {
        type,
        transactionDate: {
          gte: today,
        },
      },
    });

    const transactionNo = generateTransactionNo(type, count + 1);

    // Create transaction
    const transaction = await prisma.inventoryTransaction.create({
      data: {
        transactionNo,
        type,
        itemType,
        barcode,
        materialId: itemType === 'MATERIAL' ? item.id : null,
        productId: itemType === 'PRODUCT' ? item.id : null,
        quantity,
        unit,
        initialWeight,
        currentWeight: initialWeight,
        referenceNo,
        supplier,
        destination,
        notes,
        userId: req.user?.userId,
      },
      include: {
        material: true,
        product: true,
        weighingRecords: true,
      },
    });

    // Update stock summary
    await updateStockSummary(barcode, itemType, type, quantity);

    // Add to queue for async processing if needed
    await scanQueue.add({
      transactionId: transaction.id,
      barcode,
      type,
    });

    // Emit real-time event
    io.emit('inventory:update', {
      type: 'scan',
      transaction,
    });

    // Invalidate cache
    await redis.del('dashboard:stats');
    await redis.del('stock:summary');

    res.status(201).json({
      status: 'success',
      data: transaction,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Re-weigh item and update transaction
 */
export const reweighItem = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { currentWeight, notes } = req.body;

    const transaction = await prisma.inventoryTransaction.findUnique({
      where: { id },
    });

    if (!transaction) {
      throw new AppError('Transaction not found', 404);
    }

    const shrinkage = transaction.initialWeight
      ? transaction.initialWeight - currentWeight
      : 0;

    // Update transaction
    const updated = await prisma.inventoryTransaction.update({
      where: { id },
      data: {
        currentWeight,
        shrinkage,
      },
      include: {
        material: true,
        product: true,
        weighingRecords: true,
      },
    });

    // Create weighing record
    await prisma.weighingRecord.create({
      data: {
        transactionId: id,
        weight: currentWeight,
        weighedBy: req.user?.email,
        notes,
      },
    });

    // Emit real-time event
    io.emit('inventory:update', {
      type: 'reweigh',
      transaction: updated,
    });

    res.json({
      status: 'success',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all transactions with pagination and filters
 */
export const getTransactions = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      page = 1,
      limit = 20,
      type,
      itemType,
      startDate,
      endDate,
      barcode,
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};

    if (type) where.type = type;
    if (itemType) where.itemType = itemType;
    if (barcode) where.barcode = barcode;

    if (startDate || endDate) {
      where.transactionDate = {};
      if (startDate) where.transactionDate.gte = new Date(startDate as string);
      if (endDate) where.transactionDate.lte = new Date(endDate as string);
    }

    const [transactions, total] = await Promise.all([
      prisma.inventoryTransaction.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { transactionDate: 'desc' },
        include: {
          material: true,
          product: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
      prisma.inventoryTransaction.count({ where }),
    ]);

    res.json({
      status: 'success',
      data: transactions,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get transaction by ID
 */
export const getTransactionById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const transaction = await prisma.inventoryTransaction.findUnique({
      where: { id },
      include: {
        material: true,
        product: true,
        weighingRecords: {
          orderBy: { weighedAt: 'desc' },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!transaction) {
      throw new AppError('Transaction not found', 404);
    }

    res.json({
      status: 'success',
      data: transaction,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get stock summary
 */
export const getStockSummary = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Try to get from cache first
    const cached = await redis.get('stock:summary');
    if (cached) {
      return res.json({
        status: 'success',
        data: JSON.parse(cached),
        cached: true,
      });
    }

    const summary = await prisma.stockSummary.findMany({
      include: {
        material: true,
        product: true,
      },
      orderBy: { currentStock: 'asc' },
    });

    // Cache for 5 minutes
    await redis.setex('stock:summary', 300, JSON.stringify(summary));

    res.json({
      status: 'success',
      data: summary,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Helper function to update stock summary
 */
async function updateStockSummary(
  barcode: string,
  itemType: string,
  transactionType: string,
  quantity: number
) {
  const existing = await prisma.stockSummary.findUnique({
    where: { barcode },
  });

  const change = transactionType === 'INBOUND' ? quantity : -quantity;

  if (existing) {
    await prisma.stockSummary.update({
      where: { barcode },
      data: {
        currentStock: { increment: change },
        lastInbound: transactionType === 'INBOUND' ? new Date() : undefined,
        lastOutbound: transactionType === 'OUTBOUND' ? new Date() : undefined,
      },
    });
  } else {
    // Create new summary
    const item =
      itemType === 'MATERIAL'
        ? await prisma.material.findUnique({ where: { barcode } })
        : await prisma.product.findUnique({ where: { barcode } });

    if (item) {
      await prisma.stockSummary.create({
        data: {
          barcode,
          currentStock: change,
          unit: item.unit,
          materialId: itemType === 'MATERIAL' ? item.id : null,
          productId: itemType === 'PRODUCT' ? item.id : null,
          lastInbound: transactionType === 'INBOUND' ? new Date() : null,
          lastOutbound: transactionType === 'OUTBOUND' ? new Date() : null,
        },
      });
    }
  }
}
