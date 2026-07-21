import { Router } from 'express';
import authRoutes from './auth.routes';
import studentRoutes from './student.routes';
import recruiterRoutes from './recruiter.routes';
import analyticsRoutes from './analytics.routes';
import portfolioRoutes from './portfolio.routes';
import aiRoutes from './ai.routes';
import intelligenceRoutes from './intelligence.routes';
import { authenticateJWT } from '../middleware/auth';
import { CodingProfileController } from '../controllers/codingProfile.controller';
import gamificationRoutes from './gamification.routes';
import adminRoutes from './admin.routes';
import facultyRoutes from './faculty.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/students', studentRoutes);
router.use('/recruiters', recruiterRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/portfolio', portfolioRoutes);
router.use('/ai', aiRoutes);
router.use('/admin', adminRoutes);
router.use('/faculty', facultyRoutes);
router.use('/gamification', gamificationRoutes);
router.use('/intelligence', intelligenceRoutes);

// Coding Profile Sync
router.post('/coding-profiles/sync', authenticateJWT, CodingProfileController.fetchAndSync);
router.get('/coding-profiles/platforms', CodingProfileController.getSupportedPlatforms);

export default router;
