import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import redis from '../config/redis';
import { getDateRange } from '../utils/helpers';

export const getDashboardStats = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { period = 'today' } = req.query;

    // Try cache first
    const cacheKey = `dashboard:stats:${period}`;
    const cached = await redis.get(cacheKey);
    if (cached) {
      return res.json({
        status: 'success',
        data: JSON.parse(cached),
        cached: true,
      });
    }

    const { start, end } = getDateRange(period as any);

    const [
      totalInbound,
      totalOutbound,
      totalMaterials,
      totalProducts,
      lowStockCount,
    ] = await Promise.all([
      prisma.inventoryTransaction.count({
        where: {
          type: 'INBOUND',
          transactionDate: { gte: start, lte: end },
        },
      }),
      prisma.inventoryTransaction.count({
        where: {
          type: 'OUTBOUND',
          transactionDate: { gte: start, lte: end },
        },
      }),
      prisma.material.count(),
      prisma.product.count(),
      prisma.stockSummary.count({
        where: {
          OR: [
            {
              material: {
                minStock: { gt: 0 },
              },
              currentStock: {
                lte: prisma.material.fields.minStock,
              },
            },
            {
              product: {
                minStock: { gt: 0 },
              },
              currentStock: {
                lte: prisma.product.fields.minStock,
              },
            },
          ],
        },
      }),
    ]);

    const stats = {
      totalInbound,
      totalOutbound,
      totalMaterials,
      totalProducts,
      lowStockCount,
      period,
    };

    // Cache for 2 minutes
    await redis.setex(cacheKey, 120, JSON.stringify(stats));

    res.json({
      status: 'success',
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};

export const getRecentTransactions = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;

    const transactions = await prisma.inventoryTransaction.findMany({
      take: limit,
      orderBy: { transactionDate: 'desc' },
      include: {
        material: true,
        product: true,
        user: {
          select: {
            name: true,
          },
        },
      },
    });

    res.json({
      status: 'success',
      data: transactions,
    });
  } catch (error) {
    next(error);
  }
};

export const getLowStockItems = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const [materials, products] = await Promise.all([
      prisma.material.findMany({
        where: {
          minStock: { gt: 0 },
          stockSummary: {
            currentStock: {
              lte: prisma.material.fields.minStock,
            },
          },
        },
        include: {
          stockSummary: true,
        },
      }),
      prisma.product.findMany({
        where: {
          minStock: { gt: 0 },
          stockSummary: {
            currentStock: {
              lte: prisma.product.fields.minStock,
            },
          },
        },
        include: {
          stockSummary: true,
        },
      }),
    ]);

    res.json({
      status: 'success',
      data: {
        materials,
        products,
      },
    });
  } catch (error) {
    next(error);
  }
};
