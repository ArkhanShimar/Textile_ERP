import { Router } from 'express';
import { getDashboardStats, getMonthlySalesData, getTopProducts, getTopCustomers } from '../controllers/dashboardController';
import { authenticate } from '../middlewares/auth';

const router = Router();

router.get('/stats', authenticate, getDashboardStats);
router.get('/monthly-sales', authenticate, getMonthlySalesData);
router.get('/top-products', authenticate, getTopProducts);
router.get('/top-customers', authenticate, getTopCustomers);

export default router;
