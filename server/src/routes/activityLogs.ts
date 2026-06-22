import { Router } from 'express';
import { getAllActivityLogs, getActivityLogById } from '../controllers/activityLogController';
import { authenticate, authorize } from '../middlewares/auth';

const router = Router();

router.get('/', authenticate, authorize('ADMIN'), getAllActivityLogs);
router.get('/:id', authenticate, authorize('ADMIN'), getActivityLogById);

export default router;
