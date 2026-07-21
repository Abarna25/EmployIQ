import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '../store/authStore'
import {
  LayoutDashboard, User, FolderGit2, Award, Code2, BrainCircuit,
  BarChart3, Users, Briefcase, FileText, Bell, Settings, LogOut,
  ChevronLeft, ChevronRight, Shield, GraduationCap, Building2, Menu, X,
  Compass, Map, MessageSquare
} from 'lucide-react'

const roleNavMap: Record<string, Array<{ to: string; icon: any; label: string }>> = {
  STUDENT: [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/dashboard/profile', icon: User, label: 'My Profile' },
    { to: '/dashboard/experiences', icon: Briefcase, label: 'Experiences' },
    { to: '/dashboard/projects', icon: FolderGit2, label: 'Projects' },
    { to: '/dashboard/skills', icon: Code2, label: 'Skills' },
    { to: '/dashboard/certifications', icon: Award, label: 'Certifications' },
    { to: '/dashboard/coding-profiles', icon: Code2, label: 'Coding Profiles' },
    { to: '/dashboard/employability', icon: BrainCircuit, label: 'AI Employability' },
    { to: '/dashboard/simulator', icon: Compass, label: 'Career Simulator' },
    { to: '/dashboard/roadmap', icon: Map, label: 'Learning Roadmap' },
    { to: '/dashboard/interviews', icon: MessageSquare, label: 'Interview Readiness' },
    { to: '/dashboard/resume', icon: FileText, label: 'Resume Builder' },
  ],
  FACULTY: [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/dashboard/students', icon: Users, label: 'My Students' },
    { to: '/dashboard/approvals', icon: Shield, label: 'Approvals' },
    { to: '/dashboard/analytics', icon: BarChart3, label: 'Analytics' },
  ],
  RECRUITER: [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/dashboard/talent-search', icon: Users, label: 'Talent Search' },
    { to: '/dashboard/job-postings', icon: Briefcase, label: 'Job Postings' },
    { to: '/dashboard/shortlisted', icon: Award, label: 'Shortlisted' },
  ],
  PLACEMENT_OFFICER: [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/dashboard/placement-analytics', icon: BarChart3, label: 'Placement Analytics' },
    { to: '/dashboard/drives', icon: Building2, label: 'Placement Drives' },
    { to: '/dashboard/students', icon: GraduationCap, label: 'Student Pool' },
    { to: '/dashboard/companies', icon: Building2, label: 'Companies' },
  ],
  ADMIN: [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/dashboard/users', icon: Users, label: 'User Management' },
    { to: '/dashboard/analytics', icon: BarChart3, label: 'System Analytics' },
    { to: '/dashboard/audit-logs', icon: Shield, label: 'Audit Logs' },
    { to: '/dashboard/settings', icon: Settings, label: 'Platform Settings' },
  ],
}

const roleLabels: Record<string, string> = {
  STUDENT: 'Student Portal',
  FACULTY: 'Faculty Panel',
  RECRUITER: 'Recruiter Hub',
  PLACEMENT_OFFICER: 'Placement Office',
  ADMIN: 'Admin Console',
}

export default function DashboardLayout() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const role = user?.role || 'STUDENT'
  const navItems = roleNavMap[role] || roleNavMap.STUDENT

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const sidebarWidth = collapsed ? 'w-[72px]' : 'w-64'

  return (
    <div className="flex h-screen overflow-hidden bg-surface">
      {/* Mobile Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-40 lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static z-50 h-full flex flex-col border-r border-surface-border bg-surface-card
          transition-all duration-300 ease-in-out
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${sidebarWidth}
        `}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 h-16 border-b border-surface-border shrink-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-brand flex items-center justify-center shrink-0">
            <BrainCircuit className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="overflow-hidden">
              <h1 className="text-sm font-bold text-white tracking-tight">EmployIQ</h1>
              <p className="text-[10px] text-slate-500 -mt-0.5">{roleLabels[role]}</p>
            </motion.div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/dashboard'}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'active' : ''} ${collapsed ? 'justify-center px-2' : ''}`
              }
            >
              <item.icon className="w-[18px] h-[18px] shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="border-t border-surface-border p-3 shrink-0 space-y-1">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="sidebar-link w-full hidden lg:flex"
          >
            {collapsed ? <ChevronRight className="w-[18px] h-[18px]" /> : <ChevronLeft className="w-[18px] h-[18px]" />}
            {!collapsed && <span>Collapse</span>}
          </button>
          <button onClick={handleLogout} className="sidebar-link w-full text-rose-400 hover:text-rose-300">
            <LogOut className="w-[18px] h-[18px] shrink-0" />
            {!collapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Bar */}
        <header className="h-16 flex items-center justify-between px-4 lg:px-6 border-b border-surface-border bg-surface-card/60 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileOpen(true)} className="lg:hidden text-slate-400 hover:text-white">
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="text-sm font-semibold text-slate-300 hidden sm:block">
              Welcome back, <span className="text-white">{user?.name?.split(' ')[0] || 'User'}</span>
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-xl text-slate-400 hover:text-white hover:bg-surface-hover transition-colors">
              <Bell className="w-[18px] h-[18px]" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-accent-rose" />
            </button>
            <div className="flex items-center gap-2 pl-3 border-l border-surface-border">
              <div className="w-8 h-8 rounded-full bg-gradient-brand flex items-center justify-center text-xs font-bold text-white">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div className="hidden sm:block">
                <p className="text-xs font-medium text-white">{user?.name || 'User'}</p>
                <p className="text-[10px] text-slate-500">{role.replace('_', ' ')}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  )
}
