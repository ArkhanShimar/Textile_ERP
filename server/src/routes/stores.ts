import { Router } from 'express';
import { getAllStores, getStoreById, createStore, updateStore, deleteStore } from '../controllers/storeController';
import { authenticate, authorize } from '../middlewares/auth';
import { validateStore } from '../middlewares/validation';

const router = Router();

router.get('/', authenticate, getAllStores);
router.get('/:id', authenticate, getStoreById);
router.post('/', authenticate, authorize('ADMIN'), validateStore, createStore);
router.put('/:id', authenticate, authorize('ADMIN'), updateStore);
router.delete('/:id', authenticate, authorize('ADMIN'), deleteStore);

export default router;
