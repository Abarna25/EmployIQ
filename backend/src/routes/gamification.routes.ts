import { Router } from 'express';
import { GamificationController } from '../controllers/gamification.controller';
import { authenticateJWT } from '../middleware/auth';
import { authorizeRoles } from '../middleware/rbac';

const router = Router();

router.use(authenticateJWT);
router.use(authorizeRoles('STUDENT'));

router.get('/achievements', GamificationController.getAchievements);
router.get('/goals', GamificationController.getGoals);
router.get('/timeline', GamificationController.getTimeline);
router.post('/seed', GamificationController.seedMockGamification);

export default router;
