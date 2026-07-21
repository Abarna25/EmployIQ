import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller';
import { authenticateJWT } from '../middleware/auth';
import { authorizeRoles } from '../middleware/rbac';

const router = Router();

router.use(authenticateJWT);
router.use(authorizeRoles('ADMIN'));

router.get('/users', AdminController.getUsers);
router.patch('/users/:id/role', AdminController.updateUserRole);
router.patch('/users/:id/status', AdminController.toggleUserStatus);
router.get('/audit-logs', AdminController.getAuditLogs);
router.get('/metrics', AdminController.getSystemMetrics);

export default router;
