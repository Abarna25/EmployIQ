import { api } from './api';
import { ApiResponse, StudentProfile, PlacementStats, JobPosting } from '../types';

export const studentApi = {
  getProfile: () => api.get<ApiResponse<{ profile: StudentProfile }>>('/students/profile'),
  updateProfile: (data: Partial<StudentProfile>) => api.put<ApiResponse<{ profile: StudentProfile }>>('/students/profile', data),
  addProject: (data: object) => api.post('/students/projects', data),
  deleteProject: (id: string) => api.delete(`/students/projects/${id}`),
  addSkill: (data: object) => api.post('/students/skills', data),
  addCodingProfile: (data: object) => api.post('/students/coding-profile', data),
};

export const analyticsApi = {
  getPlacementStats: () => api.get<ApiResponse<PlacementStats>>('/analytics/placement'),
  getSystemMetrics: () => api.get('/analytics/system'),
};

export const recruiterApi = {
  searchCandidates: (params: object) => api.get('/recruiters/candidates', { params }),
  createJob: (data: object) => api.post('/recruiters/jobs', data),
  getJobs: () => api.get<ApiResponse<{ jobs: JobPosting[] }>>('/recruiters/jobs'),
};

export const aiApi = {
  predictEmployability: (data: object) => api.post('/ai/predict', data),
  analyzeSkillGap: (data: object) => api.post('/ai/skill-gap', data),
};
