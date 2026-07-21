import { Router } from 'express';
import { FacultyController } from '../controllers/faculty.controller';
import { authenticateJWT } from '../middleware/auth';
import { authorizeRoles } from '../middleware/rbac';

const router = Router();

router.use(authenticateJWT);
router.use(authorizeRoles('FACULTY', 'ADMIN'));

router.get('/metrics', FacultyController.getFacultyMetrics);
router.get('/mentees', FacultyController.getMentees);
router.get('/skills/pending', FacultyController.getPendingSkills);
router.post('/skills/:id/verify', FacultyController.verifySkill);

export default router;
