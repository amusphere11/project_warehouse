import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';

export const getAllProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const products = await prisma.product.findMany({
      orderBy: { name: 'asc' },
    });

    res.json({
      status: 'success',
      data: products,
    });
  } catch (error) {
    next(error);
  }
};

export const getProductById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        stockSummary: true,
      },
    });

    if (!product) {
      throw new AppError('Product not found', 404);
    }

    res.json({
      status: 'success',
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

export const createProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { barcode, name, description, unit, minStock } = req.body;

    const product = await prisma.product.create({
      data: {
        barcode,
        name,
        description,
        unit,
        minStock: minStock || 0,
      },
    });

    res.status(201).json({
      status: 'success',
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { name, description, unit, minStock } = req.body;

    const product = await prisma.product.update({
      where: { id },
      data: {
        name,
        description,
        unit,
        minStock,
      },
    });

    res.json({
      status: 'success',
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    await prisma.product.delete({
      where: { id },
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
