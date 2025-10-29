import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import redis from '../config/redis';
import { getDateRange } from '../utils/helpers';

export const getWeeklyChartData = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get last 7 days
    const days = 7;
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    
    const chartData = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);
      
      const [inboundCount, outboundCount] = await Promise.all([
        prisma.inventoryTransaction.count({
          where: {
            type: 'INBOUND',
            transactionDate: {
              gte: date,
              lt: nextDate,
            },
          },
        }),
        prisma.inventoryTransaction.count({
          where: {
            type: 'OUTBOUND',
            transactionDate: {
              gte: date,
              lt: nextDate,
            },
          },
        }),
      ]);
      
      // Get day name
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const dayName = dayNames[date.getDay()];
      
      chartData.push({
        name: dayName,
        inbound: inboundCount,
        outbound: outboundCount,
        date: date.toISOString().split('T')[0],
      });
    }
    
    res.json({
      status: 'success',
      data: chartData,
    });
  } catch (error) {
    next(error);
  }
};

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
      lowStockMaterials,
      lowStockProducts,
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
      // Count materials with low stock
      prisma.stockSummary.count({
        where: {
          materialId: { not: null },
          material: {
            minStock: { gt: 0 },
          },
        },
      }).then(async (total) => {
        // Get actual low stock count by comparing with material minStock
        const lowStocks = await prisma.stockSummary.findMany({
          where: {
            materialId: { not: null },
          },
          include: {
            material: {
              select: { minStock: true },
            },
          },
        });
        return lowStocks.filter(s => s.material && s.currentStock <= s.material.minStock).length;
      }),
      // Count products with low stock
      prisma.stockSummary.count({
        where: {
          productId: { not: null },
          product: {
            minStock: { gt: 0 },
          },
        },
      }).then(async (total) => {
        // Get actual low stock count by comparing with product minStock
        const lowStocks = await prisma.stockSummary.findMany({
          where: {
            productId: { not: null },
          },
          include: {
            product: {
              select: { minStock: true },
            },
          },
        });
        return lowStocks.filter(s => s.product && s.currentStock <= s.product.minStock).length;
      }),
    ]);

    const lowStockCount = lowStockMaterials + lowStockProducts;

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
