import { Router } from 'express';
import { getAllInvoices, getInvoiceById, createInvoice, updateInvoice, deleteInvoice } from '../controllers/invoiceController';
import { authenticate, authorize } from '../middlewares/auth';

const router = Router();

router.get('/', authenticate, getAllInvoices);
router.get('/:id', authenticate, getInvoiceById);
router.post('/', authenticate, authorize('ADMIN', 'OFFICE_STAFF'), createInvoice);
router.put('/:id', authenticate, authorize('ADMIN', 'OFFICE_STAFF'), updateInvoice);
router.delete('/:id', authenticate, authorize('ADMIN'), deleteInvoice);

export default router;
