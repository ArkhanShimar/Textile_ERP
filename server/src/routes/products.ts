import { Router } from 'express';
import { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct } from '../controllers/productController';
import { authenticate, authorize } from '../middlewares/auth';
import { validateProduct } from '../middlewares/validation';

const router = Router();

router.get('/', authenticate, getAllProducts);
router.get('/:id', authenticate, getProductById);
router.post('/', authenticate, authorize('ADMIN', 'OFFICE_STAFF'), validateProduct, createProduct);
router.put('/:id', authenticate, authorize('ADMIN', 'OFFICE_STAFF'), updateProduct);
router.delete('/:id', authenticate, authorize('ADMIN'), deleteProduct);

export default router;
