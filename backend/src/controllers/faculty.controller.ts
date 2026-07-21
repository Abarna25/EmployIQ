import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { prisma } from '../config/db';
import { logger } from '../config/logger';

export class FacultyController {
  static async getMentees(req: AuthRequest, res: Response) {
    try {
      const mentees = await prisma.studentProfile.findMany({
        where: { mentorId: req.user!.id },
        include: {
          user: { select: { name: true, email: true, avatarUrl: true } },
          studentSkills: {
            include: { skill: true }
          },
          jobApplications: {
            select: { status: true }
          }
        }
      });

      res.json({ success: true, data: mentees });
    } catch (error: any) {
      logger.error(`[FacultyController] getMentees error: ${error.message}`);
      res.status(500).json({ success: false, message: 'Failed to fetch mentees' });
    }
  }

  static async getPendingSkills(req: AuthRequest, res: Response) {
    try {
      const pendingSkills = await prisma.studentSkill.findMany({
        where: {
          verifiedByFaculty: false,
          studentProfile: { mentorId: req.user!.id }
        },
        include: {
          skill: true,
          studentProfile: {
            include: { user: { select: { name: true, email: true } } }
          }
        },
        orderBy: { createdAt: 'asc' }
      });

      res.json({ success: true, data: pendingSkills });
    } catch (error: any) {
      logger.error(`[FacultyController] getPendingSkills error: ${error.message}`);
      res.status(500).json({ success: false, message: 'Failed to fetch pending skills' });
    }
  }

  static async verifySkill(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { status } = req.body; // 'APPROVE' or 'REJECT'

      const skill = await prisma.studentSkill.findUnique({
        where: { id },
        include: { studentProfile: true }
      });

      if (!skill) {
        return res.status(404).json({ success: false, message: 'Student skill not found' });
      }

      if (skill.studentProfile.mentorId !== req.user!.id) {
        return res.status(403).json({ success: false, message: 'Not authorized to verify this mentee\'s skill' });
      }

      if (status === 'APPROVE') {
        await prisma.studentSkill.update({
          where: { id },
          data: { verifiedByFaculty: true }
        });
        
        // Log action
        await prisma.auditLog.create({
          data: {
            userId: req.user!.id,
            action: 'Skill Approved',
            entity: 'StudentSkill',
            details: `Approved skill ${skill.skillId} for student ${skill.studentProfileId}`,
            ipAddress: req.ip,
          }
        });

      } else if (status === 'REJECT') {
        await prisma.studentSkill.delete({ where: { id } });
        
        // Log action
        await prisma.auditLog.create({
          data: {
            userId: req.user!.id,
            action: 'Skill Rejected',
            entity: 'StudentSkill',
            details: `Rejected skill ${skill.skillId} for student ${skill.studentProfileId}`,
            ipAddress: req.ip,
          }
        });
      }

      res.json({ success: true, message: `Skill ${status.toLowerCase()}d successfully` });
    } catch (error: any) {
      logger.error(`[FacultyController] verifySkill error: ${error.message}`);
      res.status(500).json({ success: false, message: 'Failed to verify skill' });
    }
  }

  static async getFacultyMetrics(req: AuthRequest, res: Response) {
    try {
      const totalMentees = await prisma.studentProfile.count({
        where: { mentorId: req.user!.id }
      });

      const pendingVerifications = await prisma.studentSkill.count({
        where: {
          verifiedByFaculty: false,
          studentProfile: { mentorId: req.user!.id }
        }
      });

      res.json({
        success: true,
        data: {
          totalMentees,
          pendingVerifications
        }
      });
    } catch (error: any) {
      logger.error(`[FacultyController] getFacultyMetrics error: ${error.message}`);
      res.status(500).json({ success: false, message: 'Failed to fetch metrics' });
    }
  }
}
