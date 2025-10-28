import { Router } from 'express';
import * as inventoryController from '../controllers/inventory.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

/**
 * @swagger
 * /api/inventory/scan:
 *   post:
 *     summary: Scan barcode untuk transaksi inventory
 *     tags: [Inventory]
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
 *               - type
 *               - quantity
 *             properties:
 *               barcode:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [INBOUND, OUTBOUND]
 *               itemType:
 *                 type: string
 *                 enum: [MATERIAL, PRODUCT]
 *               quantity:
 *                 type: number
 *               initialWeight:
 *                 type: number
 *     responses:
 *       201:
 *         description: Transaction created successfully
 */
router.post('/scan', authenticate, inventoryController.scanBarcode);

/**
 * @swagger
 * /api/inventory/reweigh/{id}:
 *   put:
 *     summary: Re-weigh item dan update weight
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               currentWeight:
 *                 type: number
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Weight updated successfully
 */
router.put('/reweigh/:id', authenticate, inventoryController.reweighItem);

/**
 * @swagger
 * /api/inventory/transactions:
 *   get:
 *     summary: Get all transactions with pagination
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [INBOUND, OUTBOUND]
 *     responses:
 *       200:
 *         description: List of transactions
 */
router.get('/transactions', authenticate, inventoryController.getTransactions);

/**
 * @swagger
 * /api/inventory/transactions/{id}:
 *   get:
 *     summary: Get transaction by ID
 *     tags: [Inventory]
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
 *         description: Transaction details
 */
router.get('/transactions/:id', authenticate, inventoryController.getTransactionById);

/**
 * @swagger
 * /api/inventory/summary:
 *   get:
 *     summary: Get stock summary
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Stock summary
 */
router.get('/summary', authenticate, inventoryController.getStockSummary);

export default router;
