import { Router } from 'express';
import { getAllDeliveryOrders, getDeliveryOrderById, createDeliveryOrder, updateDeliveryOrder, deleteDeliveryOrder } from '../controllers/deliveryOrderController';
import { authenticate, authorize } from '../middlewares/auth';

const router = Router();

router.get('/', authenticate, getAllDeliveryOrders);
router.get('/:id', authenticate, getDeliveryOrderById);
router.post('/', authenticate, authorize('ADMIN', 'OFFICE_STAFF'), createDeliveryOrder);
router.put('/:id', authenticate, authorize('ADMIN', 'OFFICE_STAFF'), updateDeliveryOrder);
router.delete('/:id', authenticate, authorize('ADMIN'), deleteDeliveryOrder);

export default router;
