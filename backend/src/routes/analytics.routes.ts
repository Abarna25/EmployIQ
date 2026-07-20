import { Router } from 'express';
import { AnalyticsController } from '../controllers/analytics.controller';
import { authenticateJWT } from '../middleware/auth';
import { authorizeRoles } from '../middleware/rbac';

const router = Router();

router.use(authenticateJWT);

router.get('/placement', authorizeRoles('PLACEMENT_OFFICER', 'ADMIN', 'FACULTY'), AnalyticsController.getPlacementStats);
router.get('/system', authorizeRoles('ADMIN'), AnalyticsController.getSystemMetrics);

export default router;
