import { Router } from 'express';
import { 
  getAllPurchaseOrders, 
  getPurchaseOrderById, 
  createPurchaseOrder, 
  approvePurchaseOrder, 
  estimatePurchaseOrder, 
  confirmPurchaseOrder, 
  markAsPacked,
  recordCustomerResponse,
  generateEstimationPDF,
  cancelPurchaseOrder,
  updatePurchaseOrder
} from '../controllers/purchaseOrderController';
import { authenticate, authorize } from '../middlewares/auth';
import { validatePurchaseOrder } from '../middlewares/validation';

const router = Router();

router.get('/', authenticate, getAllPurchaseOrders);
router.get('/:id', authenticate, getPurchaseOrderById);
router.post('/', authenticate, authorize('ADMIN', 'OFFICE_STAFF'), validatePurchaseOrder, createPurchaseOrder);
router.put('/:id', authenticate, authorize('ADMIN', 'OFFICE_STAFF'), updatePurchaseOrder);
router.post('/:id/approve', authenticate, authorize('ADMIN'), approvePurchaseOrder);
router.post('/:id/estimate', authenticate, authorize('ADMIN'), estimatePurchaseOrder);
router.post('/:id/confirm', authenticate, authorize('ADMIN', 'OFFICE_STAFF'), confirmPurchaseOrder);
router.post('/:id/pack', authenticate, authorize('ADMIN', 'OFFICE_STAFF'), markAsPacked);
router.post('/:id/customer-response', authenticate, authorize('ADMIN', 'OFFICE_STAFF'), recordCustomerResponse);
router.get('/:id/estimation-pdf', authenticate, authorize('ADMIN', 'OFFICE_STAFF'), generateEstimationPDF);
router.post('/:id/cancel', authenticate, authorize('ADMIN'), cancelPurchaseOrder);

export default router;
