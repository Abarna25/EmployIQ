import { Router } from 'express';
import { StudentController } from '../controllers/student.controller';
import { authenticateJWT } from '../middleware/auth';

const router = Router();

router.use(authenticateJWT);

router.get('/profile', StudentController.getProfile);
router.put('/profile', StudentController.updateProfile);
router.post('/projects', StudentController.addProject);
router.delete('/projects/:id', StudentController.deleteProject);
router.post('/skills', StudentController.addSkill);
router.post('/coding-profile', StudentController.addCodingProfile);

export default router;
