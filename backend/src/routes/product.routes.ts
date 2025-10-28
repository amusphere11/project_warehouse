import { Router } from 'express';
import * as productController from '../controllers/product.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, productController.getAllProducts);
router.get('/:id', authenticate, productController.getProductById);
router.post('/', authenticate, authorize('ADMIN', 'WAREHOUSE_MANAGER'), productController.createProduct);
router.put('/:id', authenticate, authorize('ADMIN', 'WAREHOUSE_MANAGER'), productController.updateProduct);
router.delete('/:id', authenticate, authorize('ADMIN'), productController.deleteProduct);

export default router;
