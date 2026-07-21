import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { prisma } from '../config/db';
import { logger } from '../config/logger';

export class GamificationController {
  static async getAchievements(req: AuthRequest, res: Response) {
    try {
      const achievements = await prisma.studentAchievement.findMany({
        where: { studentProfile: { userId: req.user!.id } },
        orderBy: { earnedAt: 'desc' }
      });
      res.json({ success: true, data: achievements });
    } catch (error: any) {
      logger.error(`[GamificationController] getAchievements error: ${error.message}`);
      res.status(500).json({ success: false, message: 'Failed to fetch achievements' });
    }
  }

  static async getGoals(req: AuthRequest, res: Response) {
    try {
      const goals = await prisma.studentGoal.findMany({
        where: { studentProfile: { userId: req.user!.id } },
        orderBy: { createdAt: 'desc' }
      });
      res.json({ success: true, data: goals });
    } catch (error: any) {
      logger.error(`[GamificationController] getGoals error: ${error.message}`);
      res.status(500).json({ success: false, message: 'Failed to fetch goals' });
    }
  }

  static async getTimeline(req: AuthRequest, res: Response) {
    try {
      const activities = await prisma.studentActivity.findMany({
        where: { studentProfile: { userId: req.user!.id } },
        orderBy: { createdAt: 'desc' },
        take: 20
      });
      res.json({ success: true, data: activities });
    } catch (error: any) {
      logger.error(`[GamificationController] getTimeline error: ${error.message}`);
      res.status(500).json({ success: false, message: 'Failed to fetch timeline' });
    }
  }

  static async seedMockGamification(req: AuthRequest, res: Response) {
    // Utility to mock some data since we don't have triggers yet
    try {
      const profile = await prisma.studentProfile.findUnique({
        where: { userId: req.user!.id }
      });

      if (!profile) return res.status(404).json({ success: false, message: 'Profile not found' });

      // Seed Achievements
      await prisma.studentAchievement.createMany({
        data: [
          { studentProfileId: profile.id, badgeName: 'First Project', description: 'Added your first project to the portfolio.', icon: 'FolderGit2' },
          { studentProfileId: profile.id, badgeName: 'Top 10% ATS', description: 'Achieved an ATS score in the top 10% of your batch.', icon: 'Star' },
          { studentProfileId: profile.id, badgeName: 'Code Warrior', description: 'Reached a 1500+ rating on LeetCode.', icon: 'Code2' },
        ],
        skipDuplicates: true,
      });

      // Seed Goals
      await prisma.studentGoal.createMany({
        data: [
          { studentProfileId: profile.id, title: 'Solve 2 DSA problems', type: 'DAILY', isCompleted: true },
          { studentProfileId: profile.id, title: 'Apply to 3 frontend roles', type: 'WEEKLY', isCompleted: false },
          { studentProfileId: profile.id, title: 'Complete Mock Interview', type: 'WEEKLY', isCompleted: false },
        ],
        skipDuplicates: true,
      });

      // Seed Timeline
      await prisma.studentActivity.createMany({
        data: [
          { studentProfileId: profile.id, title: 'Applied to Google', description: 'Software Engineering Intern', type: 'JOB_APPLIED' },
          { studentProfileId: profile.id, title: 'Earned Badge: Code Warrior', description: 'Hit 1500 rating on LeetCode', type: 'BADGE_EARNED' },
          { studentProfileId: profile.id, title: 'ATS Score Improved', description: 'Score went from 75 to 88', type: 'ATS_IMPROVED' },
        ],
        skipDuplicates: true,
      });

      res.json({ success: true, message: 'Mock gamification data seeded' });
    } catch (error: any) {
      logger.error(`[GamificationController] seed error: ${error.message}`);
      res.status(500).json({ success: false, message: 'Failed to seed mock data' });
    }
  }
}
