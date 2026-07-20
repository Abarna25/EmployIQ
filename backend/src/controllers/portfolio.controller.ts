import { Request, Response } from 'express';
import { prisma } from '../config/db';
import { AuthRequest } from '../middleware/auth';

export class ExperienceController {
  static async list(req: AuthRequest, res: Response) {
    const userId = req.user?.id;
    const student = await prisma.studentProfile.findUnique({ where: { userId } });
    if (!student) return res.status(404).json({ success: false, message: 'Student profile not found' });

    const experiences = await prisma.experience.findMany({
      where: { studentProfileId: student.id },
      orderBy: { startDate: 'desc' },
    });
    return res.json({ success: true, data: { experiences } });
  }

  static async create(req: AuthRequest, res: Response) {
    const userId = req.user?.id;
    const student = await prisma.studentProfile.findUnique({ where: { userId } });
    if (!student) return res.status(404).json({ success: false, message: 'Student profile not found' });

    const { companyName, role, type, startDate, endDate, description } = req.body;
    const experience = await prisma.experience.create({
      data: {
        studentProfileId: student.id,
        companyName,
        role,
        type,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        description,
      },
    });
    return res.status(201).json({ success: true, data: { experience } });
  }

  static async update(req: AuthRequest, res: Response) {
    const { id } = req.params;
    const { companyName, role, type, startDate, endDate, description } = req.body;
    const experience = await prisma.experience.update({
      where: { id },
      data: {
        companyName,
        role,
        type,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : null,
        description,
      },
    });
    return res.json({ success: true, data: { experience } });
  }

  static async remove(req: AuthRequest, res: Response) {
    const { id } = req.params;
    await prisma.experience.delete({ where: { id } });
    return res.json({ success: true, message: 'Experience removed successfully' });
  }
}

export class CertificationController {
  static async list(req: AuthRequest, res: Response) {
    const userId = req.user?.id;
    const student = await prisma.studentProfile.findUnique({ where: { userId } });
    if (!student) return res.status(404).json({ success: false, message: 'Student profile not found' });

    const certifications = await prisma.certification.findMany({
      where: { studentProfileId: student.id },
      orderBy: { issueDate: 'desc' },
    });
    return res.json({ success: true, data: { certifications } });
  }

  static async create(req: AuthRequest, res: Response) {
    const userId = req.user?.id;
    const student = await prisma.studentProfile.findUnique({ where: { userId } });
    if (!student) return res.status(404).json({ success: false, message: 'Student profile not found' });

    const { title, issuer, issueDate, expiryDate, credentialUrl } = req.body;
    const certification = await prisma.certification.create({
      data: {
        studentProfileId: student.id,
        title,
        issuer,
        issueDate: new Date(issueDate),
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        credentialUrl,
      },
    });
    return res.status(201).json({ success: true, data: { certification } });
  }

  static async remove(req: AuthRequest, res: Response) {
    const { id } = req.params;
    await prisma.certification.delete({ where: { id } });
    return res.json({ success: true, message: 'Certification removed successfully' });
  }
}

export class AcademicController {
  static async list(req: AuthRequest, res: Response) {
    const userId = req.user?.id;
    const student = await prisma.studentProfile.findUnique({ where: { userId } });
    if (!student) return res.status(404).json({ success: false, message: 'Student profile not found' });

    const records = await prisma.academicRecord.findMany({
      where: { studentProfileId: student.id },
      orderBy: { semester: 'asc' },
    });
    return res.json({ success: true, data: { records } });
  }

  static async upsert(req: AuthRequest, res: Response) {
    const userId = req.user?.id;
    const student = await prisma.studentProfile.findUnique({ where: { userId } });
    if (!student) return res.status(404).json({ success: false, message: 'Student profile not found' });

    const { semester, sgpa, backlogCount } = req.body;
    const record = await prisma.academicRecord.upsert({
      where: {
        studentProfileId_semester: {
          studentProfileId: student.id,
          semester: parseInt(semester, 10),
        },
      },
      update: { sgpa: parseFloat(sgpa), backlogCount: parseInt(backlogCount || '0', 10) },
      create: {
        studentProfileId: student.id,
        semester: parseInt(semester, 10),
        sgpa: parseFloat(sgpa),
        backlogCount: parseInt(backlogCount || '0', 10),
      },
    });

    // Recalculate CGPA
    const allRecords = await prisma.academicRecord.findMany({
      where: { studentProfileId: student.id },
    });
    const avgCgpa = allRecords.reduce((sum, r) => sum + r.sgpa, 0) / allRecords.length;
    await prisma.studentProfile.update({
      where: { id: student.id },
      data: { currentCgpa: parseFloat(avgCgpa.toFixed(2)) },
    });

    return res.json({ success: true, data: { record } });
  }
}
