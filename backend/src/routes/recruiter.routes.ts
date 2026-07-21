import { Router } from 'express';
import { RecruiterController } from '../controllers/recruiter.controller';
import { authenticateJWT } from '../middleware/auth';
import { authorizeRoles } from '../middleware/rbac';

const router = Router();

router.use(authenticateJWT);

router.get('/candidates', authorizeRoles('RECRUITER', 'PLACEMENT_OFFICER', 'ADMIN'), RecruiterController.searchCandidates);
router.post('/jobs', authorizeRoles('RECRUITER', 'ADMIN'), RecruiterController.createJobPosting);
router.get('/jobs', RecruiterController.getJobPostings);
router.get('/jobs/:jobId/ranked-candidates', authorizeRoles('RECRUITER', 'ADMIN'), RecruiterController.getRankedCandidates);
router.patch('/jobs/:jobId/candidates/:candidateId/status', authorizeRoles('RECRUITER', 'ADMIN'), RecruiterController.updateApplicationStatus);

export default router;
