import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'

import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardLayout from './components/DashboardLayout'
import ProtectedRoute from './components/ProtectedRoute'

import StudentDashboard from './pages/dashboards/StudentDashboard'
import FacultyDashboard from './pages/dashboards/FacultyDashboard'
import RecruiterDashboard from './pages/dashboards/RecruiterDashboard'
import PlacementOfficerDashboard from './pages/dashboards/PlacementOfficerDashboard'
import AdminDashboard from './pages/dashboards/AdminDashboard'

import ProfilePage from './pages/student/ProfilePage'
import ExperiencesPage from './pages/student/ExperiencesPage'
import ProjectsPage from './pages/student/ProjectsPage'
import SkillsPage from './pages/student/SkillsPage'
import CertificationsPage from './pages/student/CertificationsPage'
import CodingProfilesPage from './pages/student/CodingProfilesPage'
import ResumeBuilderPage from './pages/student/ResumeBuilderPage'
import EmployabilityPage from './pages/student/EmployabilityPage'
import CareerSimulatorDashboard from './pages/dashboards/CareerSimulatorDashboard'
import LearningRoadmap from './pages/dashboards/LearningRoadmap'
import InterviewReadiness from './pages/dashboards/InterviewReadiness'

function DashboardRouter() {
  const { user } = useAuthStore()
  switch (user?.role) {
    case 'STUDENT':           return <StudentDashboard />
    case 'FACULTY':           return <FacultyDashboard />
    case 'RECRUITER':         return <RecruiterDashboard />
    case 'PLACEMENT_OFFICER': return <PlacementOfficerDashboard />
    case 'ADMIN':             return <AdminDashboard />
    default:                  return <StudentDashboard />
  }
}

function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface">
      <div className="glass-card p-10 text-center max-w-sm">
        <p className="text-4xl mb-3">🚫</p>
        <h2 className="text-xl font-bold text-white mb-2">Access Denied</h2>
        <p className="text-sm text-slate-400 mb-4">You don't have permission to view this page.</p>
        <a href="/dashboard" className="btn-primary inline-flex">Go to Dashboard</a>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Auth Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />

        {/* Protected Dashboard Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<DashboardRouter />} />

            {/* Student-specific sub-pages */}
            <Route path="/dashboard/profile" element={<ProfilePage />} />
            <Route path="/dashboard/experiences" element={<ExperiencesPage />} />
            <Route path="/dashboard/projects" element={<ProjectsPage />} />
            <Route path="/dashboard/skills" element={<SkillsPage />} />
            <Route path="/dashboard/certifications" element={<CertificationsPage />} />
            <Route path="/dashboard/coding-profiles" element={<CodingProfilesPage />} />
            <Route path="/dashboard/employability" element={<EmployabilityPage />} />
            <Route path="/dashboard/simulator" element={<CareerSimulatorDashboard />} />
            <Route path="/dashboard/roadmap" element={<LearningRoadmap />} />
            <Route path="/dashboard/resume" element={<ResumeBuilderPage />} />
            <Route path="/dashboard/interviews" element={<InterviewReadiness />} />

            {/* Faculty sub-pages */}
            <Route path="/dashboard/students" element={<FacultyDashboard />} />
            <Route path="/dashboard/approvals" element={<FacultyDashboard />} />
            <Route path="/dashboard/analytics" element={<FacultyDashboard />} />

            {/* Recruiter sub-pages */}
            <Route path="/dashboard/talent-search" element={<RecruiterDashboard />} />
            <Route path="/dashboard/job-postings" element={<RecruiterDashboard />} />
            <Route path="/dashboard/shortlisted" element={<RecruiterDashboard />} />

            {/* Placement Officer sub-pages */}
            <Route path="/dashboard/placement-analytics" element={<PlacementOfficerDashboard />} />
            <Route path="/dashboard/drives" element={<PlacementOfficerDashboard />} />
            <Route path="/dashboard/companies" element={<PlacementOfficerDashboard />} />

            {/* Admin sub-pages */}
            <Route path="/dashboard/users" element={<AdminDashboard />} />
            <Route path="/dashboard/audit-logs" element={<AdminDashboard />} />
            <Route path="/dashboard/settings" element={<AdminDashboard />} />
          </Route>
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
