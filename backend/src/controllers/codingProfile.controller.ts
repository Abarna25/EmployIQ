import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { prisma } from '../config/db';
import { adapterRegistry } from '../services/codingProfileAdapters';

export class CodingProfileController {
  static async fetchAndSync(req: AuthRequest, res: Response) {
    const userId = req.user?.id;
    const { platform, username } = req.body;

    const student = await prisma.studentProfile.findUnique({ where: { userId } });
    if (!student) return res.status(404).json({ success: false, message: 'Student profile not found' });

    try {
      const profileData = await adapterRegistry.fetchProfile(platform, username);

      const codingProfile = await prisma.codingProfile.upsert({
        where: {
          studentProfileId_platform: {
            studentProfileId: student.id,
            platform: profileData.platform,
          },
        },
        update: {
          username: profileData.username,
          rating: profileData.rating,
          globalRank: profileData.globalRank,
          problemsSolved: profileData.problemsSolved,
          streak: profileData.streak,
          verifiedAt: new Date(),
        },
        create: {
          studentProfileId: student.id,
          platform: profileData.platform,
          username: profileData.username,
          rating: profileData.rating,
          globalRank: profileData.globalRank,
          problemsSolved: profileData.problemsSolved,
          streak: profileData.streak,
        },
      });

      return res.json({
        success: true,
        message: `${platform} profile synced successfully`,
        data: { codingProfile, fetchedData: profileData },
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message || `Failed to fetch ${platform} profile`,
      });
    }
  }

  static async getSupportedPlatforms(req: Request, res: Response) {
    return res.json({
      success: true,
      data: {
        platforms: adapterRegistry.getSupportedPlatforms(),
      },
    });
  }
}
