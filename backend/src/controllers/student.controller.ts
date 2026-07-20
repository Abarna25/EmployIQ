import { Response } from 'express';
import { prisma } from '../config/db';
import { AuthRequest } from '../middleware/auth';

export class StudentController {
  static async getProfile(req: AuthRequest, res: Response) {
    const userId = req.user?.id;
    let student = await prisma.studentProfile.findUnique({
      where: { userId },
      include: {
        user: { select: { id: true, email: true, name: true, avatarUrl: true } },
        academicRecords: { orderBy: { semester: 'asc' } },
        studentSkills: { include: { skill: true } },
        projects: { orderBy: { createdAt: 'desc' } },
        experiences: { orderBy: { startDate: 'desc' } },
        certifications: { orderBy: { issueDate: 'desc' } },
        codingProfiles: true,
        employabilityScores: { orderBy: { generatedAt: 'desc' }, take: 1 },
        skillGaps: { orderBy: { generatedAt: 'desc' }, take: 1 },
      },
    });

    if (!student && req.user?.role === 'STUDENT') {
      student = await prisma.studentProfile.create({
        data: {
          userId: userId!,
          registerNumber: `REG${Math.floor(100000 + Math.random() * 900000)}`,
          department: 'Computer Science & Engineering',
          batchYear: 2026,
          currentCgpa: 8.5,
        },
        include: {
          user: { select: { id: true, email: true, name: true, avatarUrl: true } },
          academicRecords: true,
          studentSkills: { include: { skill: true } },
          projects: true,
          experiences: true,
          certifications: true,
          codingProfiles: true,
          employabilityScores: true,
          skillGaps: true,
        },
      });
    }

    return res.json({ success: true, data: { profile: student } });
  }

  static async updateProfile(req: AuthRequest, res: Response) {
    const userId = req.user?.id;
    const { bio, linkedinUrl, githubUrl, portfolioUrl, department, batchYear } = req.body;

    const updated = await prisma.studentProfile.update({
      where: { userId },
      data: {
        bio,
        linkedinUrl,
        githubUrl,
        portfolioUrl,
        department,
        batchYear,
      },
    });

    return res.json({ success: true, message: 'Profile updated successfully', data: { profile: updated } });
  }

  static async addProject(req: AuthRequest, res: Response) {
    const userId = req.user?.id;
    const { title, description, techStack, repoUrl, liveUrl } = req.body;

    const student = await prisma.studentProfile.findUnique({ where: { userId } });
    if (!student) return res.status(404).json({ success: false, message: 'Student profile not found' });

    const project = await prisma.project.create({
      data: {
        studentProfileId: student.id,
        title,
        description,
        techStack: Array.isArray(techStack) ? techStack : techStack.split(',').map((s: string) => s.trim()),
        repoUrl,
        liveUrl,
      },
    });

    return res.status(201).json({ success: true, data: { project } });
  }

  static async deleteProject(req: AuthRequest, res: Response) {
    const { id } = req.params;
    await prisma.project.delete({ where: { id } });
    return res.json({ success: true, message: 'Project removed successfully' });
  }

  static async addSkill(req: AuthRequest, res: Response) {
    const userId = req.user?.id;
    const { name, category, proficiency } = req.body;

    const student = await prisma.studentProfile.findUnique({ where: { userId } });
    if (!student) return res.status(404).json({ success: false, message: 'Student profile not found' });

    let skill = await prisma.skill.findUnique({ where: { name } });
    if (!skill) {
      skill = await prisma.skill.create({
        data: {
          name,
          category: category || 'Web',
          demandLevel: 'High',
        },
      });
    }

    const studentSkill = await prisma.studentSkill.upsert({
      where: {
        studentProfileId_skillId: {
          studentProfileId: student.id,
          skillId: skill.id,
        },
      },
      update: { proficiency: proficiency || 3 },
      create: {
        studentProfileId: student.id,
        skillId: skill.id,
        proficiency: proficiency || 3,
      },
      include: { skill: true },
    });

    return res.json({ success: true, data: { studentSkill } });
  }

  static async addCodingProfile(req: AuthRequest, res: Response) {
    const userId = req.user?.id;
    const { platform, username, rating, globalRank, problemsSolved } = req.body;

    const student = await prisma.studentProfile.findUnique({ where: { userId } });
    if (!student) return res.status(404).json({ success: false, message: 'Student profile not found' });

    const profile = await prisma.codingProfile.upsert({
      where: {
        studentProfileId_platform: {
          studentProfileId: student.id,
          platform,
        },
      },
      update: {
        username,
        rating: rating || 0,
        globalRank: globalRank || 0,
        problemsSolved: problemsSolved || 0,
        verifiedAt: new Date(),
      },
      create: {
        studentProfileId: student.id,
        platform,
        username,
        rating: rating || 0,
        globalRank: globalRank || 0,
        problemsSolved: problemsSolved || 0,
      },
    });

    return res.json({ success: true, data: { codingProfile: profile } });
  }
}
