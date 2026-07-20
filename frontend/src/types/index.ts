export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl?: string;
  studentProfileId?: string;
  createdAt?: string;
}

export type UserRole = 'STUDENT' | 'FACULTY' | 'RECRUITER' | 'PLACEMENT_OFFICER' | 'ADMIN';

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  setUser: (user: User, accessToken: string, refreshToken: string) => void;
  refreshAccessToken: () => Promise<void>;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  role?: UserRole;
  registerNumber?: string;
  department?: string;
  batchYear?: number;
}

export interface StudentProfile {
  id: string;
  userId: string;
  registerNumber: string;
  department: string;
  batchYear: number;
  currentCgpa: number;
  tenthMarks?: number;
  twelfthMarks?: number;
  bio?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  resumeUrl?: string;
  atsScore?: number;
  tierCategory?: string;
  user: Pick<User, 'name' | 'email' | 'avatarUrl'>;
  studentSkills?: StudentSkill[];
  projects?: Project[];
  experiences?: Experience[];
  certifications?: Certification[];
  codingProfiles?: CodingProfile[];
  employabilityScores?: EmployabilityScore[];
  skillGaps?: SkillGapAnalysis[];
  academicRecords?: AcademicRecord[];
}

export interface StudentSkill {
  id: string;
  proficiency: number;
  verifiedByFaculty: boolean;
  skill: { id: string; name: string; category: string; demandLevel: string };
}

export interface Project {
  id: string;
  title: string;
  description: string;
  techStack: string[];
  repoUrl?: string;
  liveUrl?: string;
  starsCount: number;
  createdAt: string;
}

export interface Experience {
  id: string;
  companyName: string;
  role: string;
  type: string;
  startDate: string;
  endDate?: string;
  description: string;
}

export interface Certification {
  id: string;
  title: string;
  issuer: string;
  issueDate: string;
  credentialUrl?: string;
}

export interface CodingProfile {
  id: string;
  platform: string;
  username: string;
  rating: number;
  globalRank: number;
  problemsSolved: number;
  streak: number;
}

export interface AcademicRecord {
  id: string;
  semester: number;
  sgpa: number;
  backlogCount: number;
}

export interface EmployabilityScore {
  id: string;
  overallScore: number;
  technicalScore: number;
  projectScore: number;
  codingScore: number;
  academicScore: number;
  predictedTier: string;
  shapFactors: {
    positive_factors: string[];
    negative_factors: string[];
  };
  generatedAt: string;
}

export interface SkillGapAnalysis {
  id: string;
  targetRole: string;
  matchingPercentage: number;
  missingSkills: string[];
  recommendedCourses: Array<{ title: string; provider: string; estimated_hours: number }>;
  generatedAt: string;
}

export interface PlacementStats {
  totalStudents: number;
  placedStudents: number;
  placementRate: string;
  activeDrives: number;
  tierDistribution: Array<{ name: string; count: number }>;
  topSkills: Array<{ skill: string; count: number }>;
}

export interface JobPosting {
  id: string;
  title: string;
  companyName: string;
  description: string;
  requiredSkills: string[];
  minCgpa: number;
  maxBacklogs: number;
  salaryRange: string;
  location: string;
  status: 'DRAFT' | 'OPEN' | 'CLOSED';
  createdAt: string;
  recruiter: { name: string; email: string };
  _count?: { applications: number };
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Array<{ field: string; message: string }>;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: {
    candidates?: T[];
    pagination: { total: number; page: number; pages: number };
  };
}
