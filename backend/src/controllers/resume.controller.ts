import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { prisma } from '../config/db';

const resumeTemplates = {
  modern: {
    name: 'Modern Professional',
    fontFamily: "'Inter', sans-serif",
    primaryColor: '#6366f1',
    accentColor: '#8b5cf6',
    layout: 'two-column',
  },
  minimal: {
    name: 'Minimal Clean',
    fontFamily: "'Inter', sans-serif",
    primaryColor: '#1e293b',
    accentColor: '#475569',
    layout: 'single-column',
  },
  executive: {
    name: 'Executive Dark',
    fontFamily: "'Inter', sans-serif",
    primaryColor: '#0f172a',
    accentColor: '#6366f1',
    layout: 'two-column',
  },
  academic: {
    name: 'Academic LaTeX',
    fontFamily: "'Georgia', serif",
    primaryColor: '#000000',
    accentColor: '#1e40af',
    layout: 'single-column',
  },
};

function generateResumeHTML(profile: any, template: keyof typeof resumeTemplates): string {
  const t = resumeTemplates[template] || resumeTemplates.modern;
  const skills = profile.studentSkills?.map((s: any) => s.skill.name).join(' · ') || '';
  const projects = profile.projects || [];
  const experiences = profile.experiences || [];
  const certifications = profile.certifications || [];
  const codingProfiles = profile.codingProfiles || [];

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: ${t.fontFamily}; font-size: 11px; line-height: 1.5; color: #1e293b; padding: 40px; max-width: 800px; margin: 0 auto; }
    h1 { font-size: 22px; color: ${t.primaryColor}; margin-bottom: 2px; }
    h2 { font-size: 13px; color: ${t.primaryColor}; text-transform: uppercase; letter-spacing: 1.5px; border-bottom: 2px solid ${t.accentColor}; padding-bottom: 4px; margin: 16px 0 8px; }
    h3 { font-size: 12px; color: #334155; margin-bottom: 2px; }
    .contact { font-size: 10px; color: #64748b; margin-bottom: 12px; }
    .contact a { color: ${t.accentColor}; text-decoration: none; }
    .entry { margin-bottom: 10px; }
    .entry-header { display: flex; justify-content: space-between; align-items: baseline; }
    .entry-date { font-size: 10px; color: #94a3b8; }
    .skills-list { display: flex; flex-wrap: wrap; gap: 6px; }
    .skill-tag { background: ${t.accentColor}15; color: ${t.accentColor}; padding: 2px 8px; border-radius: 4px; font-size: 10px; font-weight: 500; }
    .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    ul { padding-left: 16px; }
    li { margin-bottom: 3px; }
  </style>
</head>
<body>
  <h1>${profile.user?.name || 'Student Name'}</h1>
  <div class="contact">
    ${profile.user?.email || ''} ${profile.linkedinUrl ? ` · <a href="${profile.linkedinUrl}">LinkedIn</a>` : ''}${profile.githubUrl ? ` · <a href="${profile.githubUrl}">GitHub</a>` : ''}${profile.portfolioUrl ? ` · <a href="${profile.portfolioUrl}">Portfolio</a>` : ''}
    <br>${profile.department || 'Computer Science'} · Batch ${profile.batchYear || '2026'} · CGPA: ${profile.currentCgpa || 'N/A'}
  </div>

  ${profile.bio ? `<h2>Summary</h2><p>${profile.bio}</p>` : ''}

  <h2>Technical Skills</h2>
  <div class="skills-list">${skills.split(' · ').map((s: string) => `<span class="skill-tag">${s}</span>`).join('')}</div>

  ${experiences.length ? `
  <h2>Experience</h2>
  ${experiences.map((e: any) => `
  <div class="entry">
    <div class="entry-header">
      <h3>${e.role} — ${e.companyName}</h3>
      <span class="entry-date">${new Date(e.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} – ${e.endDate ? new Date(e.endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Present'}</span>
    </div>
    <p>${e.description}</p>
  </div>`).join('')}` : ''}

  ${projects.length ? `
  <h2>Projects</h2>
  ${projects.map((p: any) => `
  <div class="entry">
    <div class="entry-header">
      <h3>${p.title}</h3>
      <span class="entry-date">${p.techStack?.join(', ') || ''}</span>
    </div>
    <p>${p.description}</p>
    ${p.repoUrl ? `<a href="${p.repoUrl}" style="font-size:10px;color:${t.accentColor}">View Repository →</a>` : ''}
  </div>`).join('')}` : ''}

  ${certifications.length ? `
  <h2>Certifications</h2>
  <ul>${certifications.map((c: any) => `<li><strong>${c.title}</strong> — ${c.issuer} (${new Date(c.issueDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })})</li>`).join('')}</ul>` : ''}

  ${codingProfiles.length ? `
  <h2>Competitive Programming</h2>
  <div class="two-col">${codingProfiles.map((c: any) => `<div><strong>${c.platform}</strong>: Rating ${c.rating} · ${c.problemsSolved} solved</div>`).join('')}</div>` : ''}
</body>
</html>`;
}

export class ResumeController {
  static async getTemplates(req: Request, res: Response) {
    return res.json({
      success: true,
      data: {
        templates: Object.entries(resumeTemplates).map(([key, val]) => ({
          id: key,
          ...val,
        })),
      },
    });
  }

  static async generateResume(req: AuthRequest, res: Response) {
    const userId = req.user?.id;
    const template = (req.query.template as string) || 'modern';

    const student = await prisma.studentProfile.findUnique({
      where: { userId },
      include: {
        user: { select: { name: true, email: true } },
        studentSkills: { include: { skill: true } },
        projects: { orderBy: { createdAt: 'desc' } },
        experiences: { orderBy: { startDate: 'desc' } },
        certifications: { orderBy: { issueDate: 'desc' } },
        codingProfiles: true,
      },
    });

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }

    const html = generateResumeHTML(student, template as keyof typeof resumeTemplates);

    return res.json({
      success: true,
      data: {
        html,
        template,
        studentName: student.user.name,
      },
    });
  }

  static async generatePDF(req: AuthRequest, res: Response) {
    // PDF generation endpoint — returns HTML for now (Puppeteer can be added)
    const userId = req.user?.id;
    const template = (req.query.template as string) || 'modern';

    const student = await prisma.studentProfile.findUnique({
      where: { userId },
      include: {
        user: { select: { name: true, email: true } },
        studentSkills: { include: { skill: true } },
        projects: { orderBy: { createdAt: 'desc' } },
        experiences: { orderBy: { startDate: 'desc' } },
        certifications: { orderBy: { issueDate: 'desc' } },
        codingProfiles: true,
      },
    });

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }

    const html = generateResumeHTML(student, template as keyof typeof resumeTemplates);

    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Content-Disposition', `inline; filename="${student.user.name.replace(/\s+/g, '_')}_Resume.html"`);
    return res.send(html);
  }
}
