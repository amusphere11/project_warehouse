import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';

export const getAllMaterials = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const materials = await prisma.material.findMany({
      orderBy: { name: 'asc' },
    });

    res.json({
      status: 'success',
      data: materials,
    });
  } catch (error) {
    next(error);
  }
};

export const getMaterialById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const material = await prisma.material.findUnique({
      where: { id },
      include: {
        stockSummary: true,
      },
    });

    if (!material) {
      throw new AppError('Material not found', 404);
    }

    res.json({
      status: 'success',
      data: material,
    });
  } catch (error) {
    next(error);
  }
};

export const createMaterial = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { barcode, name, description, unit, minStock } = req.body;

    const material = await prisma.material.create({
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
      data: material,
    });
  } catch (error) {
    next(error);
  }
};

export const updateMaterial = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { name, description, unit, minStock } = req.body;

    const material = await prisma.material.update({
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
      data: material,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteMaterial = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    await prisma.material.delete({
      where: { id },
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
