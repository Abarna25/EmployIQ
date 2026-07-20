import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { prisma } from '../config/db';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000/api/v1/ai';

export class AIController {
  static async analyzeEmployability(req: AuthRequest, res: Response) {
    const userId = req.user?.id;
    const student = await prisma.studentProfile.findUnique({
      where: { userId },
      include: {
        projects: true,
        codingProfiles: true,
        studentSkills: true,
        experiences: true,
        academicRecords: true,
      },
    });

    if (!student) return res.status(404).json({ success: false, message: 'Student profile not found' });

    // Aggregate data for prediction
    const cgpa = student.currentCgpa || 0;
    const projects_count = student.projects.length;
    const skills_count = student.studentSkills.length;
    const internships_count = student.experiences.length;
    const coding_rating = student.codingProfiles.reduce((max, cp) => Math.max(max, cp.rating), 0);

    try {
      const response = await fetch(`${AI_SERVICE_URL}/predict-employability`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cgpa,
          projects_count,
          coding_rating,
          skills_count,
          internships_count,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get prediction from AI service');
      }

      const aiData = await response.json();

      // Create a new employability score entry in the database
      const score = await prisma.employabilityScore.create({
        data: {
          studentProfileId: student.id,
          overallScore: aiData.overall_score,
          academicScore: aiData.academic_score,
          projectScore: aiData.project_score,
          codingScore: aiData.coding_score,
          technicalScore: aiData.technical_score,
          predictedTier: aiData.predicted_tier,
          shapFactors: aiData.shap_factors,
        },
      });

      // Update the student profile with the new tier
      await prisma.studentProfile.update({
        where: { id: student.id },
        data: {
          atsScore: aiData.overall_score,
          tierCategory: aiData.predicted_tier,
        },
      });

      return res.json({ success: true, data: { score } });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  static async analyzeSkillGap(req: AuthRequest, res: Response) {
    const userId = req.user?.id;
    const { targetRole } = req.body;

    const student = await prisma.studentProfile.findUnique({
      where: { userId },
      include: {
        studentSkills: { include: { skill: true } },
      },
    });

    if (!student) return res.status(404).json({ success: false, message: 'Student profile not found' });

    const current_skills = student.studentSkills.map((ss) => ss.skill.name);

    try {
      const response = await fetch(`${AI_SERVICE_URL}/skill-gap`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          current_skills,
          target_role: targetRole || 'Software Engineer',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get skill gap analysis from AI service');
      }

      const aiData = await response.json();

      // Upsert the skill gap analysis in the database
      const gapAnalysis = await prisma.skillGapAnalysis.create({
        data: {
          studentProfileId: student.id,
          targetRole: targetRole || 'Software Engineer',
          matchingPercentage: aiData.match_percentage,
          missingSkills: aiData.missing_skills,
          recommendedCourses: aiData.recommended_courses,
        },
      });

      return res.json({ success: true, data: { gapAnalysis } });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}
