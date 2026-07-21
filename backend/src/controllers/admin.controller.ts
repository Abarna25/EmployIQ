import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { prisma } from '../config/db';
import { logger } from '../config/logger';

export class AdminController {
  static async getUsers(req: AuthRequest, res: Response) {
    try {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isActive: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' }
      });
      res.json({ success: true, data: users });
    } catch (error: any) {
      logger.error(`[AdminController] getUsers error: ${error.message}`);
      res.status(500).json({ success: false, message: 'Failed to fetch users' });
    }
  }

  static async updateUserRole(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { role } = req.body;

      if (!role) {
        return res.status(400).json({ success: false, message: 'Role is required' });
      }

      const user = await prisma.user.update({
        where: { id },
        data: { role },
        select: { id: true, name: true, role: true }
      });

      // Log the action
      await prisma.auditLog.create({
        data: {
          userId: req.user!.id,
          action: 'Role Changed',
          entity: 'User',
          details: `Changed role of user ${user.id} to ${role}`,
          ipAddress: req.ip,
        }
      });

      res.json({ success: true, data: user });
    } catch (error: any) {
      logger.error(`[AdminController] updateUserRole error: ${error.message}`);
      res.status(500).json({ success: false, message: 'Failed to update user role' });
    }
  }

  static async toggleUserStatus(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { isActive } = req.body;

      const user = await prisma.user.update({
        where: { id },
        data: { isActive },
        select: { id: true, name: true, isActive: true }
      });

      await prisma.auditLog.create({
        data: {
          userId: req.user!.id,
          action: isActive ? 'User Activated' : 'User Deactivated',
          entity: 'User',
          details: `Updated active status of user ${user.id} to ${isActive}`,
          ipAddress: req.ip,
        }
      });

      res.json({ success: true, data: user });
    } catch (error: any) {
      logger.error(`[AdminController] toggleUserStatus error: ${error.message}`);
      res.status(500).json({ success: false, message: 'Failed to toggle user status' });
    }
  }

  static async getAuditLogs(req: AuthRequest, res: Response) {
    try {
      const logs = await prisma.auditLog.findMany({
        include: {
          user: { select: { name: true, email: true } }
        },
        orderBy: { createdAt: 'desc' },
        take: 50
      });
      res.json({ success: true, data: logs });
    } catch (error: any) {
      logger.error(`[AdminController] getAuditLogs error: ${error.message}`);
      res.status(500).json({ success: false, message: 'Failed to fetch audit logs' });
    }
  }

  static async getSystemMetrics(req: AuthRequest, res: Response) {
    try {
      const totalUsers = await prisma.user.count();
      const roleBreakdown = await prisma.user.groupBy({
        by: ['role'],
        _count: { id: true }
      });
      
      const activeDrives = await prisma.placementDrive.count({
        where: { status: { in: ['UPCOMING', 'ONGOING'] } }
      });

      const totalJobs = await prisma.jobPosting.count({
        where: { status: 'OPEN' }
      });

      // Some mocked performance stats for now
      const systemHealth = 'Optimal';
      const uptimeSeconds = Math.floor(process.uptime());

      res.json({
        success: true,
        data: {
          totalUsers,
          roleBreakdown,
          activeDrives,
          totalJobs,
          systemHealth,
          uptimeSeconds
        }
      });
    } catch (error: any) {
      logger.error(`[AdminController] getSystemMetrics error: ${error.message}`);
      res.status(500).json({ success: false, message: 'Failed to fetch metrics' });
    }
  }
}
