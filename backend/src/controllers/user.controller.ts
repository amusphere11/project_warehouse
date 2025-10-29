import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';

/**
 * Get all users (ADMIN only)
 */
export const getAllUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { page = 1, limit = 20, search, role, isActive } = req.query;
    
    const skip = (Number(page) - 1) * Number(limit);
    
    const where: any = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { email: { contains: search as string, mode: 'insensitive' } },
      ];
    }
    
    if (role) {
      where.role = role;
    }
    
    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }
    
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              transactions: true,
            },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);
    
    res.json({
      status: 'success',
      data: users,
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
 * Get user by ID
 */
export const getUserById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            transactions: true,
          },
        },
      },
    });
    
    if (!user) {
      throw new AppError('User not found', 404);
    }
    
    res.json({
      status: 'success',
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create new user (ADMIN only)
 */
export const createUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password, name, role = 'OPERATOR', isActive = true } = req.body;
    
    // Validation
    if (!email || !password || !name) {
      throw new AppError('Email, password, and name are required', 400);
    }
    
    if (password.length < 6) {
      throw new AppError('Password must be at least 6 characters', 400);
    }
    
    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
    
    if (existingUser) {
      throw new AppError('Email already registered', 400);
    }
    
    // Valid roles
    const validRoles = ['ADMIN', 'WAREHOUSE_MANAGER', 'OPERATOR', 'VIEWER'];
    if (!validRoles.includes(role)) {
      throw new AppError('Invalid role', 400);
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role,
        isActive,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    
    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: req.user?.userId,
        action: 'CREATE',
        entity: 'User',
        entityId: user.id,
        newValue: {
          email: user.email,
          name: user.name,
          role: user.role,
        },
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      },
    });
    
    res.status(201).json({
      status: 'success',
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update user (ADMIN only)
 */
export const updateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { email, password, name, role, isActive } = req.body;
    
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });
    
    if (!existingUser) {
      throw new AppError('User not found', 404);
    }
    
    // Prepare update data
    const updateData: any = {};
    
    if (email && email !== existingUser.email) {
      // Check if new email already exists
      const emailExists = await prisma.user.findUnique({
        where: { email },
      });
      if (emailExists) {
        throw new AppError('Email already in use', 400);
      }
      updateData.email = email;
    }
    
    if (name) updateData.name = name;
    if (role) {
      const validRoles = ['ADMIN', 'WAREHOUSE_MANAGER', 'OPERATOR', 'VIEWER'];
      if (!validRoles.includes(role)) {
        throw new AppError('Invalid role', 400);
      }
      updateData.role = role;
    }
    if (isActive !== undefined) updateData.isActive = isActive;
    
    if (password) {
      if (password.length < 6) {
        throw new AppError('Password must be at least 6 characters', 400);
      }
      updateData.password = await bcrypt.hash(password, 12);
    }
    
    // Update user
    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    
    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: req.user?.userId,
        action: 'UPDATE',
        entity: 'User',
        entityId: user.id,
        oldValue: {
          email: existingUser.email,
          name: existingUser.name,
          role: existingUser.role,
          isActive: existingUser.isActive,
        },
        newValue: {
          email: user.email,
          name: user.name,
          role: user.role,
          isActive: user.isActive,
        },
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      },
    });
    
    res.json({
      status: 'success',
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete user (ADMIN only)
 * Soft delete by setting isActive to false
 */
export const deleteUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });
    
    if (!existingUser) {
      throw new AppError('User not found', 404);
    }
    
    // Prevent self-deletion
    if (req.user?.userId === id) {
      throw new AppError('You cannot delete your own account', 400);
    }
    
    // Soft delete - set isActive to false
    const user = await prisma.user.update({
      where: { id },
      data: { isActive: false },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
      },
    });
    
    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: req.user?.userId,
        action: 'DELETE',
        entity: 'User',
        entityId: user.id,
        oldValue: {
          email: existingUser.email,
          name: existingUser.name,
          role: existingUser.role,
          isActive: existingUser.isActive,
        },
        newValue: {
          isActive: false,
        },
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      },
    });
    
    res.json({
      status: 'success',
      message: 'User deactivated successfully',
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Change own password
 */
export const changePassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user?.userId;
    
    if (!currentPassword || !newPassword) {
      throw new AppError('Current password and new password are required', 400);
    }
    
    if (newPassword.length < 6) {
      throw new AppError('New password must be at least 6 characters', 400);
    }
    
    // Get user
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    
    if (!user) {
      throw new AppError('User not found', 404);
    }
    
    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      throw new AppError('Current password is incorrect', 400);
    }
    
    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    
    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });
    
    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId,
        action: 'UPDATE',
        entity: 'User',
        entityId: userId!,
        oldValue: { action: 'password_change' },
        newValue: { action: 'password_changed' },
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      },
    });
    
    res.json({
      status: 'success',
      message: 'Password changed successfully',
    });
  } catch (error) {
    next(error);
  }
};
