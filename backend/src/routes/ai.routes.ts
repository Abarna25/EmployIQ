import { Router } from 'express';
import { authenticateJWT } from '../middleware/auth';
import { AIController } from '../controllers/ai.controller';

const router = Router();

router.use(authenticateJWT);

router.post('/predict-employability', AIController.analyzeEmployability);
router.post('/skill-gap', AIController.analyzeSkillGap);

export default router;
