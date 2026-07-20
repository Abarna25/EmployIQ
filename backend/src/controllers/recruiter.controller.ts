import { Response } from 'express';
import { prisma } from '../config/db';
import { AuthRequest } from '../middleware/auth';

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
}
