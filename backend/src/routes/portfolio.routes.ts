import { Router } from 'express';
import { ExperienceController, CertificationController, AcademicController } from '../controllers/portfolio.controller';
import { ResumeController } from '../controllers/resume.controller';
import { authenticateJWT } from '../middleware/auth';

const router = Router();

router.use(authenticateJWT);

// Experience (Internships)
router.get('/experiences', ExperienceController.list);
router.post('/experiences', ExperienceController.create);
router.put('/experiences/:id', ExperienceController.update);
router.delete('/experiences/:id', ExperienceController.remove);

// Certifications
router.get('/certifications', CertificationController.list);
router.post('/certifications', CertificationController.create);
router.delete('/certifications/:id', CertificationController.remove);

// Academic Records
router.get('/academics', AcademicController.list);
router.post('/academics', AcademicController.upsert);

// Resume
router.get('/resume/templates', ResumeController.getTemplates);
router.get('/resume/generate', ResumeController.generateResume);
router.get('/resume/pdf', ResumeController.generatePDF);

export default router;
