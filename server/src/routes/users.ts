import { Router } from 'express';
import { getAllUsers, getUserById, createUser, updateUser, deleteUser, changePassword } from '../controllers/userController';
import { authenticate, authorize } from '../middlewares/auth';
import { validateUser } from '../middlewares/validation';

const router = Router();

router.get('/', authenticate, authorize('ADMIN'), getAllUsers);
router.get('/:id', authenticate, getUserById);
router.post('/', authenticate, authorize('ADMIN'), validateUser, createUser);
router.put('/:id', authenticate, authorize('ADMIN'), updateUser);
router.delete('/:id', authenticate, authorize('ADMIN'), deleteUser);
router.post('/change-password', authenticate, changePassword);

export default router;
