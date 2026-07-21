import { Router } from 'express';
import { IntelligenceController } from '../controllers/intelligence.controller';
import { authenticateJWT } from '../middleware/auth';

const router = Router();

router.use(authenticateJWT);

router.get('/employability', IntelligenceController.getEmployability);
router.get('/eligibility', IntelligenceController.getEligibility);
router.get('/skill-gap', IntelligenceController.getSkillGap);
router.get('/roadmap', IntelligenceController.getRoadmap);
router.get('/salary', IntelligenceController.getSalaryPrediction);
router.get('/interview-readiness', IntelligenceController.getInterviewReadiness);
router.post('/semantic-search', IntelligenceController.semanticSearch);

export default router;
