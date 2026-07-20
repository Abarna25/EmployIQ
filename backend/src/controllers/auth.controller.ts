import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from '../config/db';
import { env } from '../config/env';
import { AuthRequest } from '../middleware/auth';
import { QueueService } from '../services/queue.service';
export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
  role: z.enum(['STUDENT', 'FACULTY', 'RECRUITER', 'PLACEMENT_OFFICER', 'ADMIN']).default('STUDENT'),
  registerNumber: z.string().optional(),
  department: z.string().optional(),
  batchYear: z.number().optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string(),
});

export class AuthController {
  static async register(req: Request, res: Response) {
    const { email, password, name, role, registerNumber, department, batchYear } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email address is already registered.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.$transaction(async (tx) => {
      const createdUser = await tx.user.create({
        data: {
          email,
          passwordHash,
          name,
          role,
          isVerified: true,
        },
      });

      if (role === 'STUDENT') {
        const regNo = registerNumber || `REG${Math.floor(100000 + Math.random() * 900000)}`;
        const dept = department || 'Computer Science & Engineering';
        const batch = batchYear || 2026;

        await tx.studentProfile.create({
          data: {
            userId: createdUser.id,
            registerNumber: regNo,
            department: dept,
            batchYear: batch,
            currentCgpa: 8.5,
          },
        });
      }

      return createdUser;
    });

    const accessToken = jwt.sign({ userId: user.id, role: user.role }, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN as any,
    });

    const refreshToken = jwt.sign({ userId: user.id }, env.JWT_REFRESH_SECRET, {
      expiresIn: env.JWT_REFRESH_EXPIRES_IN as any,
    });

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: { id: user.id, email: user.email, name: user.name, role: user.role },
        accessToken,
        refreshToken,
      },
    });
  }

  static async login(req: Request, res: Response) {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
      include: { studentProfile: true },
    });

    if (!user || !user.passwordHash) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Account is deactivated. Contact admin.' });
    }

    const accessToken = jwt.sign({ userId: user.id, role: user.role }, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN as any,
    });

    const refreshToken = jwt.sign({ userId: user.id }, env.JWT_REFRESH_SECRET, {
      expiresIn: env.JWT_REFRESH_EXPIRES_IN as any,
    });

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    await QueueService.enqueueAudit(user.id, 'User Login', 'Auth', 'info', `User logged in with email: ${email}`);

    return res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          studentProfileId: user.studentProfile?.id,
        },
        accessToken,
        refreshToken,
      },
    });
  }

  static async refreshToken(req: Request, res: Response) {
    const { refreshToken } = req.body;

    try {
      const decoded = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as { userId: string };

      const storedToken = await prisma.refreshToken.findFirst({
        where: { token: refreshToken, userId: decoded.userId, revokedAt: null },
      });

      if (!storedToken || storedToken.expiresAt < new Date()) {
        return res.status(401).json({ success: false, message: 'Invalid or expired refresh token.' });
      }

      const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
      if (!user) {
        return res.status(401).json({ success: false, message: 'User not found.' });
      }

      const newAccessToken = jwt.sign({ userId: user.id, role: user.role }, env.JWT_SECRET, {
        expiresIn: env.JWT_EXPIRES_IN as any,
      });

      return res.json({
        success: true,
        data: { accessToken: newAccessToken },
      });
    } catch (error) {
      return res.status(401).json({ success: false, message: 'Invalid refresh token.' });
    }
  }

  static async logout(req: Request, res: Response) {
    const { refreshToken } = req.body;
    if (refreshToken) {
      await prisma.refreshToken.updateMany({
        where: { token: refreshToken },
        data: { revokedAt: new Date() },
      });
    }
    return res.json({ success: true, message: 'Logged out successfully.' });
  }

  static async getMe(req: AuthRequest, res: Response) {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatarUrl: true,
        createdAt: true,
        studentProfile: {
          select: {
            id: true,
            registerNumber: true,
            department: true,
            batchYear: true,
            currentCgpa: true,
            atsScore: true,
            tierCategory: true,
          },
        },
      },
    });

    return res.json({ success: true, data: { user } });
  }
}
