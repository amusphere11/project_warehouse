import { Router } from 'express';
import * as materialController from '../controllers/material.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

/**
 * @swagger
 * /api/materials:
 *   get:
 *     summary: Get all materials
 *     tags: [Materials]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of materials
 */
router.get('/', authenticate, materialController.getAllMaterials);

/**
 * @swagger
 * /api/materials/{id}:
 *   get:
 *     summary: Get material by ID
 *     tags: [Materials]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Material details
 */
router.get('/:id', authenticate, materialController.getMaterialById);

/**
 * @swagger
 * /api/materials:
 *   post:
 *     summary: Create new material
 *     tags: [Materials]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - barcode
 *               - name
 *               - unit
 *             properties:
 *               barcode:
 *                 type: string
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               unit:
 *                 type: string
 *               minStock:
 *                 type: number
 *     responses:
 *       201:
 *         description: Material created successfully
 */
router.post('/', authenticate, authorize('ADMIN', 'WAREHOUSE_MANAGER'), materialController.createMaterial);

/**
 * @swagger
 * /api/materials/{id}:
 *   put:
 *     summary: Update material
 *     tags: [Materials]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Material updated successfully
 */
router.put('/:id', authenticate, authorize('ADMIN', 'WAREHOUSE_MANAGER'), materialController.updateMaterial);

/**
 * @swagger
 * /api/materials/{id}:
 *   delete:
 *     summary: Delete material
 *     tags: [Materials]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Material deleted successfully
 */
router.delete('/:id', authenticate, authorize('ADMIN'), materialController.deleteMaterial);

export default router;
