import { Response } from 'express';
import { prisma } from '../config/db';
import { AuthRequest } from '../middleware/auth';
import { env } from '../config/env';
import { logger } from '../config/logger';

export class RecruiterController {
  static async searchCandidates(req: AuthRequest, res: Response) {
    const { minCgpa, skill, tierCategory, search, page = '1', limit = '10' } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const whereClause: any = {};

    if (minCgpa) {
      whereClause.currentCgpa = { gte: parseFloat(minCgpa as string) };
    }

    if (tierCategory) {
      whereClause.tierCategory = tierCategory as string;
    }

    if (search) {
      whereClause.OR = [
        { user: { name: { contains: search as string, mode: 'insensitive' } } },
        { user: { email: { contains: search as string, mode: 'insensitive' } } },
        { registerNumber: { contains: search as string, mode: 'insensitive' } },
        { department: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    if (skill) {
      whereClause.studentSkills = {
        some: {
          skill: {
            name: { contains: skill as string, mode: 'insensitive' },
          },
        },
      };
    }

    const [candidates, total] = await Promise.all([
      prisma.studentProfile.findMany({
        where: whereClause,
        skip,
        take: limitNum,
        include: {
          user: { select: { name: true, email: true, avatarUrl: true } },
          studentSkills: { include: { skill: true } },
          employabilityScores: { orderBy: { generatedAt: 'desc' }, take: 1 },
          codingProfiles: true,
        },
      }),
      prisma.studentProfile.count({ where: whereClause }),
    ]);

    return res.json({
      success: true,
      data: {
        candidates,
        pagination: {
          total,
          page: pageNum,
          pages: Math.ceil(total / limitNum),
        },
      },
    });
  }

  static async createJobPosting(req: AuthRequest, res: Response) {
    const userId = req.user?.id;
    const { title, companyName, description, requiredSkills, minCgpa, maxBacklogs, salaryRange, location } = req.body;

    const job = await prisma.jobPosting.create({
      data: {
        recruiterId: userId!,
        title,
        companyName,
        description,
        requiredSkills: Array.isArray(requiredSkills)
          ? requiredSkills
          : requiredSkills.split(',').map((s: string) => s.trim()),
        minCgpa: parseFloat(minCgpa || '6.0'),
        maxBacklogs: parseInt(maxBacklogs || '0', 10),
        salaryRange,
        location,
      },
    });

    return res.status(201).json({ success: true, data: { job } });
  }

  static async getJobPostings(req: AuthRequest, res: Response) {
    const jobs = await prisma.jobPosting.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        recruiter: { select: { name: true, email: true } },
        _count: { select: { applications: true } },
      },
    });

    return res.json({ success: true, data: { jobs } });
  }

  static async getRankedCandidates(req: AuthRequest, res: Response) {
    try {
      const { jobId } = req.params;

      const job = await prisma.jobPosting.findUnique({
        where: { id: jobId },
      });

      if (!job) {
        return res.status(404).json({ success: false, message: 'Job not found' });
      }

      // Fetch all applicants for this job
      const applications = await prisma.jobApplication.findMany({
        where: { jobPostingId: jobId },
        include: {
          studentProfile: {
            include: {
              user: { select: { name: true, email: true, avatarUrl: true } },
              studentSkills: { include: { skill: true } },
            }
          }
        }
      });

      if (applications.length === 0) {
        return res.json({ success: true, data: { rankedCandidates: [] } });
      }

      const candidates = applications.map(app => app.studentProfile);

      // Call AI Service to rank
      const aiResponse = await fetch(`${env.AI_SERVICE_URL}/predict/rank-candidates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requiredSkills: job.requiredSkills, candidates }),
      });

      if (!aiResponse.ok) {
        throw new Error('AI Service rank candidates failed');
      }

      const rankData = await aiResponse.json();
      
      // Update aiMatchScore in DB for caching
      for (const result of rankData.rankedResults) {
        await prisma.jobApplication.update({
          where: {
            jobPostingId_studentProfileId: {
              jobPostingId: jobId,
              studentProfileId: result.candidateId
            }
          },
          data: { aiMatchScore: result.matchPercentage }
        });
      }

      // Combine application data with AI results
      const rankedCandidates = rankData.rankedResults.map((result: any) => {
        const app = applications.find(a => a.studentProfileId === result.candidateId);
        return {
          ...result,
          applicationStatus: app?.status,
          candidate: candidates.find(c => c.id === result.candidateId)
        };
      });

      res.json({ success: true, data: { rankedCandidates } });
    } catch (error: any) {
      logger.error(`[RecruiterController] getRankedCandidates error: ${error.message}`);
      res.status(500).json({ success: false, message: 'Failed to rank candidates' });
    }
  }

  static async updateApplicationStatus(req: AuthRequest, res: Response) {
    try {
      const { jobId, candidateId } = req.params;
      const { status } = req.body;

      const application = await prisma.jobApplication.update({
        where: {
          jobPostingId_studentProfileId: {
            jobPostingId: jobId,
            studentProfileId: candidateId
          }
        },
        data: { status }
      });
      
      // Log action
      await prisma.auditLog.create({
        data: {
          userId: req.user!.id,
          action: 'Candidate Shortlisted',
          entity: 'JobApplication',
          details: `Updated application for candidate ${candidateId} to ${status} for job ${jobId}`,
          ipAddress: req.ip,
        }
      });

      res.json({ success: true, data: application });
    } catch (error: any) {
      logger.error(`[RecruiterController] updateApplicationStatus error: ${error.message}`);
      res.status(500).json({ success: false, message: 'Failed to update status' });
    }
  }
}
