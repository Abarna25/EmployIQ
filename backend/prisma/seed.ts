import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting EmployIQ Database Seeding...');

  const passwordHash = await bcrypt.hash('password123', 10);

  // 1. Create Admin User
  const admin = await prisma.user.upsert({
    where: { email: 'admin@employiq.ai' },
    update: {},
    create: {
      email: 'admin@employiq.ai',
      passwordHash,
      name: 'Dr. Sarah Connor (System Admin)',
      role: Role.ADMIN,
      isVerified: true,
    },
  });

  // 2. Create Placement Officer User
  const officer = await prisma.user.upsert({
    where: { email: 'officer@employiq.ai' },
    update: {},
    create: {
      email: 'officer@employiq.ai',
      passwordHash,
      name: 'Prof. Robert Langdon (Director Placements)',
      role: Role.PLACEMENT_OFFICER,
      isVerified: true,
    },
  });

  // 3. Create Faculty User
  const faculty = await prisma.user.upsert({
    where: { email: 'faculty@employiq.ai' },
    update: {},
    create: {
      email: 'faculty@employiq.ai',
      passwordHash,
      name: 'Dr. Alan Turing (CSE HOD)',
      role: Role.FACULTY,
      isVerified: true,
    },
  });

  // 4. Create Recruiter User
  const recruiter = await prisma.user.upsert({
    where: { email: 'recruiter@employiq.ai' },
    update: {},
    create: {
      email: 'recruiter@employiq.ai',
      passwordHash,
      name: 'Jessica Pearson (Senior Tech Talent Partner)',
      role: Role.RECRUITER,
      isVerified: true,
    },
  });

  // 5. Create Sample Students
  const studentUser = await prisma.user.upsert({
    where: { email: 'student@employiq.ai' },
    update: {},
    create: {
      email: 'student@employiq.ai',
      passwordHash,
      name: 'Alex Rivera',
      role: Role.STUDENT,
      isVerified: true,
    },
  });

  const studentProfile = await prisma.studentProfile.upsert({
    where: { userId: studentUser.id },
    update: {},
    create: {
      userId: studentUser.id,
      registerNumber: '21CS042',
      department: 'Computer Science & Engineering',
      batchYear: 2026,
      currentCgpa: 8.85,
      tenthMarks: 94.5,
      twelfthMarks: 91.2,
      bio: 'Passionate Full Stack Developer & AI enthusiast focused on distributed systems and microservices.',
      linkedinUrl: 'https://linkedin.com/in/alex-rivera-dev',
      githubUrl: 'https://github.com/alexrivera-dev',
      portfolioUrl: 'https://alexrivera.dev',
      atsScore: 88.5,
      tierCategory: 'Tier 1',
    },
  });

  // Create Skills
  const reactSkill = await prisma.skill.upsert({
    where: { name: 'React.js' },
    update: {},
    create: { name: 'React.js', category: 'Web Development', demandLevel: 'High' },
  });

  const nodeSkill = await prisma.skill.upsert({
    where: { name: 'Node.js' },
    update: {},
    create: { name: 'Node.js', category: 'Backend', demandLevel: 'High' },
  });

  const pythonSkill = await prisma.skill.upsert({
    where: { name: 'Python & FastAPI' },
    update: {},
    create: { name: 'Python & FastAPI', category: 'AI & Data Science', demandLevel: 'High' },
  });

  // Attach skills to student
  await prisma.studentSkill.createMany({
    data: [
      { studentProfileId: studentProfile.id, skillId: reactSkill.id, proficiency: 5, verifiedByFaculty: true },
      { studentProfileId: studentProfile.id, skillId: nodeSkill.id, proficiency: 4, verifiedByFaculty: true },
      { studentProfileId: studentProfile.id, skillId: pythonSkill.id, proficiency: 4, verifiedByFaculty: false },
    ],
    skipDuplicates: true,
  });

  // Create Sample Project
  await prisma.project.createMany({
    data: [
      {
        studentProfileId: studentProfile.id,
        title: 'Distributed Real-Time Analytics Dashboard',
        description: 'Built a high-throughput metrics processor using Node.js, Kafka, and Redis.',
        techStack: ['React', 'Node.js', 'Redis', 'Kafka', 'PostgreSQL'],
        repoUrl: 'https://github.com/alexrivera-dev/distributed-analytics',
        starsCount: 14,
      },
      {
        studentProfileId: studentProfile.id,
        title: 'Employability Skill Gap Recommender Engine',
        description: 'Microservice delivering personalized learning paths using sentence-transformers.',
        techStack: ['Python', 'FastAPI', 'PyTorch', 'FAISS'],
        repoUrl: 'https://github.com/alexrivera-dev/skill-recommender',
        starsCount: 28,
      },
    ],
    skipDuplicates: true,
  });

  // Create Coding Profile
  await prisma.codingProfile.createMany({
    data: [
      {
        studentProfileId: studentProfile.id,
        platform: 'LeetCode',
        username: 'alex_coder99',
        rating: 1850,
        globalRank: 42000,
        problemsSolved: 480,
      },
      {
        studentProfileId: studentProfile.id,
        platform: 'Codeforces',
        username: 'alex_cf',
        rating: 1540,
        globalRank: 18500,
        problemsSolved: 230,
      },
    ],
    skipDuplicates: true,
  });

  // Create Job Postings
  await prisma.jobPosting.create({
    data: {
      recruiterId: recruiter.id,
      title: 'Full-Stack Software Engineer (SDE-1)',
      companyName: 'CloudScale Technologies',
      description: 'Looking for high-performing graduates skilled in React, Node.js, and Cloud Infrastructure.',
      requiredSkills: ['React.js', 'Node.js', 'PostgreSQL', 'Docker'],
      minCgpa: 8.0,
      maxBacklogs: 0,
      salaryRange: '₹14,000,000 - ₹18,000,000 LPA',
      location: 'Bengaluru / Hybrid',
    },
  });

  // Create Placement Drive
  await prisma.placementDrive.create({
    data: {
      title: 'Google Annual Campus Recruitment 2026',
      companyName: 'Google India',
      visitDate: new Date('2026-09-15'),
      minCgpa: 8.5,
      eligibleDepartments: ['Computer Science & Engineering', 'Information Technology', 'AI & Data Science'],
      status: 'UPCOMING',
      officerId: officer.id,
    },
  });

  console.log('✅ EmployIQ Database Seeding Complete!');
  console.log('Registered Test Users (Password: password123):');
  console.log(' - Student: student@employiq.ai');
  console.log(' - Faculty: faculty@employiq.ai');
  console.log(' - Recruiter: recruiter@employiq.ai');
  console.log(' - Officer: officer@employiq.ai');
  console.log(' - Admin: admin@employiq.ai');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
