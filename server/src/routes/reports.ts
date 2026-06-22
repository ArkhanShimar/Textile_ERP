import { Router } from 'express';
import {
  getSalesReport,
  getInventoryReport,
  getOrderReport,
  getInvoiceReport,
  getDeliveryReport,
  getCancelledOrdersReport
} from '../controllers/reportController';
import { authenticate, authorize } from '../middlewares/auth';

const router = Router();

router.get('/sales', authenticate, getSalesReport);
router.get('/inventory', authenticate, getInventoryReport);
router.get('/orders', authenticate, getOrderReport);
router.get('/invoices', authenticate, getInvoiceReport);
router.get('/deliveries', authenticate, getDeliveryReport);
router.get('/cancelled-orders', authenticate, getCancelledOrdersReport);

export default router;
