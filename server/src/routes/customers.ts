import { Router } from 'express';
import { getAllCustomers, getCustomerById, createCustomer, updateCustomer, deleteCustomer } from '../controllers/customerController';
import { authenticate, authorize } from '../middlewares/auth';
import { validateCustomer } from '../middlewares/validation';

const router = Router();

router.get('/', authenticate, getAllCustomers);
router.get('/:id', authenticate, getCustomerById);
router.post('/', authenticate, authorize('ADMIN', 'OFFICE_STAFF'), validateCustomer, createCustomer);
router.put('/:id', authenticate, authorize('ADMIN', 'OFFICE_STAFF'), updateCustomer);
router.delete('/:id', authenticate, authorize('ADMIN'), deleteCustomer);

export default router;
