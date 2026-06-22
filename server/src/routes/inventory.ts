import { Router } from 'express';
import { getAllInventory, getInventoryById, adjustInventory, getInventoryTransactions } from '../controllers/inventoryController';
import { authenticate, authorize } from '../middlewares/auth';

const router = Router();

router.get('/', authenticate, getAllInventory);
router.get('/transactions', authenticate, getInventoryTransactions);
router.get('/:id', authenticate, getInventoryById);
router.post('/adjust', authenticate, authorize('ADMIN', 'OFFICE_STAFF'), adjustInventory);

export default router;
