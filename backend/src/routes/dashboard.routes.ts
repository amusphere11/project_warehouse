import { Router } from 'express';
import * as dashboardController from '../controllers/dashboard.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

/**
 * @swagger
 * /api/dashboard/stats:
 *   get:
 *     summary: Get dashboard statistics
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [today, week, month, year]
 *     responses:
 *       200:
 *         description: Dashboard statistics
 */
router.get('/stats', authenticate, dashboardController.getDashboardStats);

/**
 * @swagger
 * /api/dashboard/weekly-chart:
 *   get:
 *     summary: Get weekly transaction chart data
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Weekly chart data for last 7 days
 */
router.get('/weekly-chart', authenticate, dashboardController.getWeeklyChartData);

/**
 * @swagger
 * /api/dashboard/recent-transactions:
 *   get:
 *     summary: Get recent transactions
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Recent transactions
 */
router.get('/recent-transactions', authenticate, dashboardController.getRecentTransactions);

/**
 * @swagger
 * /api/dashboard/low-stock:
 *   get:
 *     summary: Get low stock items
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Low stock items
 */
router.get('/low-stock', authenticate, dashboardController.getLowStockItems);

export default router;
