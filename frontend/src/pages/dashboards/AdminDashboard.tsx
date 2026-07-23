import { motion, AnimatePresence } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/services/api'
import StatCard from '@/components/ui/StatCard'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell,
} from 'recharts'
import { Users, Shield, Activity, Database, Server, Settings, Clock, AlertTriangle } from 'lucide-react'

import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } }
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } }

// Hardcoded API usage for demo (no real gateway metrics tracking yet)
const apiUsage = [
  { endpoint: '/auth', calls: 1250 }, { endpoint: '/students', calls: 3400 },
  { endpoint: '/recruiters', calls: 890 }, { endpoint: '/analytics', calls: 1600 },
  { endpoint: '/ai', calls: 720 },
]

export default function AdminDashboard() {
  const location = useLocation()
  const [activeTab, setActiveTab] = useState<'metrics' | 'users' | 'audit' | 'settings'>('metrics')

  useEffect(() => {
    if (location.pathname.includes('users')) {
      setActiveTab('users')
    } else if (location.pathname.includes('audit-logs')) {
      setActiveTab('audit')
    } else if (location.pathname.includes('settings')) {
      setActiveTab('settings')
    } else {
      setActiveTab('metrics')
    }
  }, [location.pathname])

  const queryClient = useQueryClient()
  const { data: metricsData, isLoading: metricsLoading } = useQuery({
    queryKey: ['systemMetrics'],
    queryFn: () => api.get('/admin/metrics').then((r: any) => r.data.data),
  })

  const { data: usersData, isLoading: usersLoading, refetch: refetchUsers } = useQuery({
    queryKey: ['adminUsers'],
    queryFn: () => api.get('/admin/users').then((r: any) => r.data.data),
    enabled: activeTab === 'users'
  })

  const { data: auditData, isLoading: auditLoading } = useQuery({
    queryKey: ['adminAuditLogs'],
    queryFn: () => api.get('/admin/audit-logs').then((r: any) => r.data.data),
    enabled: activeTab === 'audit' || activeTab === 'metrics'
  })

  const handleRoleChange = async (id: string, role: string) => {
    try {
      await api.patch(`/admin/users/${id}/role`, { role })
      refetchUsers()
    } catch (e) {
      console.error(e)
    }
  }

  const handleStatusToggle = async (id: string, isActive: boolean) => {
    try {
      await api.patch(`/admin/users/${id}/status`, { isActive })
      refetchUsers()
    } catch (e) {
      console.error(e)
    }
  }

  if (metricsLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const roleColors: Record<string, string> = {
    STUDENT: '#6366f1',
    FACULTY: '#8b5cf6',
    RECRUITER: '#06b6d4',
    PLACEMENT_OFFICER: '#10b981',
    ADMIN: '#f59e0b',
  }

  const roleDistribution = metricsData?.roleBreakdown?.map((r: any) => ({
    name: r.role,
    value: r._count.id,
    color: roleColors[r.role] || '#94a3b8',
  })) || []

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={fadeUp} className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="section-title">Admin Console</h1>
          <p className="section-sub">Platform health, user management, and audit trail</p>
        </div>
        <div className="flex bg-surface p-1 rounded-xl border border-surface-border">
          <button 
            onClick={() => setActiveTab('metrics')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'metrics' ? 'bg-brand-500 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            Metrics
          </button>
          <button 
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'users' ? 'bg-brand-500 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            User Management
          </button>
          <button 
            onClick={() => setActiveTab('audit')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'audit' ? 'bg-brand-500 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            Audit Logs
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'settings' ? 'bg-brand-500 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            Settings
          </button>
        </div>
      </motion.div>

      {activeTab === 'metrics' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Total Users" value={metricsData?.totalUsers || 0} subtitle="Registered accounts" icon={<Users className="w-5 h-5" />} color="brand" />
            <StatCard title="System Health" value={metricsData?.systemHealth || 'Optimal'} subtitle="All services running" icon={<Activity className="w-5 h-5" />} color="emerald" />
            <StatCard title="Uptime (s)" value={metricsData?.uptimeSeconds || 0} subtitle="Server uptime" icon={<Clock className="w-5 h-5" />} color="cyan" />
            <StatCard title="Active Drives" value={metricsData?.activeDrives || 0} subtitle="Ongoing drives" icon={<Server className="w-5 h-5" />} color="amber" />
          </div>

          <div className="grid lg:grid-cols-3 gap-4">
            {/* API Usage */}
            <div className="glass-card p-5 lg:col-span-2">
              <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                <Database className="w-4 h-4 text-brand-400" /> API Endpoint Usage (Simulated)
              </h3>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={apiUsage} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} />
                  <YAxis type="category" dataKey="endpoint" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} width={80} />
                  <Tooltip contentStyle={{ backgroundColor: '#16162a', border: '1px solid #2a2a45', borderRadius: 12, fontSize: 12 }} />
                  <Bar dataKey="calls" radius={[0, 6, 6, 0]} fill="url(#horizGrad)" />
                  <defs>
                    <linearGradient id="horizGrad" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#6366f1" />
                      <stop offset="100%" stopColor="#06b6d4" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Role Distribution */}
            <div className="glass-card p-5">
              <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                <Shield className="w-4 h-4 text-violet-400" /> User Roles
              </h3>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={roleDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={72}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {roleDistribution.map((entry: any) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#16162a', border: '1px solid #2a2a45', borderRadius: 12, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5 mt-2">
                {roleDistribution.map((r: any) => (
                  <div key={r.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: r.color }} />
                      <span className="text-slate-400">{r.name}</span>
                    </div>
                    <span className="text-white font-medium">{r.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {activeTab === 'users' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-5">
          <h3 className="text-lg font-bold text-white mb-4">User Management</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-border text-slate-500">
                  <th className="text-left py-3 font-medium">Name</th>
                  <th className="text-left py-3 font-medium">Email</th>
                  <th className="text-left py-3 font-medium">Role</th>
                  <th className="text-left py-3 font-medium">Status</th>
                  <th className="text-left py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {usersLoading ? (
                  <tr><td colSpan={5} className="text-center py-4 text-slate-500">Loading users...</td></tr>
                ) : usersData?.map((user: any) => (
                  <tr key={user.id} className="border-b border-surface-border/50">
                    <td className="py-3 text-white font-medium">{user.name}</td>
                    <td className="py-3 text-slate-400">{user.email}</td>
                    <td className="py-3">
                      <select 
                        value={user.role} 
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        className="bg-surface border border-surface-border rounded p-1 text-xs text-white outline-none"
                      >
                        <option value="STUDENT">STUDENT</option>
                        <option value="FACULTY">FACULTY</option>
                        <option value="RECRUITER">RECRUITER</option>
                        <option value="PLACEMENT_OFFICER">PLACEMENT_OFFICER</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    </td>
                    <td className="py-3">
                      <span className={`badge ${user.isActive ? 'badge-success' : 'badge-danger'}`}>
                        {user.isActive ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td className="py-3">
                      <button 
                        onClick={() => handleStatusToggle(user.id, !user.isActive)}
                        className={`text-xs px-2 py-1 rounded transition-colors ${user.isActive ? 'bg-rose-500/10 text-rose-400 hover:bg-rose-500/20' : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'}`}
                      >
                        {user.isActive ? 'Disable' : 'Enable'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {activeTab === 'audit' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Settings className="w-4 h-4 text-amber-400" /> Recent Audit Log
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-surface-border">
                  <th className="text-left text-slate-500 font-medium pb-2 pr-4">Action</th>
                  <th className="text-left text-slate-500 font-medium pb-2 pr-4">Entity</th>
                  <th className="text-left text-slate-500 font-medium pb-2 pr-4">Details</th>
                  <th className="text-left text-slate-500 font-medium pb-2 pr-4">User</th>
                  <th className="text-left text-slate-500 font-medium pb-2 pr-4">Time</th>
                </tr>
              </thead>
              <tbody>
                {auditLoading ? (
                  <tr><td colSpan={5} className="text-center py-4 text-slate-500">Loading logs...</td></tr>
                ) : auditData?.map((log: any) => (
                  <tr key={log.id} className="border-b border-surface-border/50 hover:bg-surface-hover transition-colors">
                    <td className="py-2.5 pr-4 text-white font-medium">{log.action}</td>
                    <td className="py-2.5 pr-4 text-slate-400">{log.entity}</td>
                    <td className="py-2.5 pr-4 text-slate-400 truncate max-w-[200px]" title={log.details}>{log.details}</td>
                    <td className="py-2.5 pr-4 text-slate-400">{log.user?.name || 'System'}</td>
                    <td className="py-2.5 pr-4 text-slate-500">{new Date(log.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {activeTab === 'settings' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <div className="glass-card p-6 text-center py-20 border-brand-500/20 bg-gradient-to-b from-surface to-brand-500/5">
            <div className="w-16 h-16 rounded-full bg-brand-500/10 mx-auto flex items-center justify-center mb-4">
              <Settings className="w-8 h-8 text-brand-400 animate-spin-slow" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Platform Settings</h2>
            <p className="text-slate-400 max-w-md mx-auto">
              Global platform configurations, environment variables, and system preferences can be managed here.
            </p>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
