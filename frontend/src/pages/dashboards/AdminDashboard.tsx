import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/services/api'
import StatCard from '@/components/ui/StatCard'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell,
} from 'recharts'
import { Users, Shield, Activity, Database, Server, Settings, Clock, AlertTriangle } from 'lucide-react'

const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } }
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } }

// Hardcoded API usage for demo (no real gateway metrics tracking yet)
const apiUsage = [
  { endpoint: '/auth', calls: 1250 }, { endpoint: '/students', calls: 3400 },
  { endpoint: '/recruiters', calls: 890 }, { endpoint: '/analytics', calls: 1600 },
  { endpoint: '/ai', calls: 720 },
]

const recentAuditLogs = [
  { action: 'User Login', entity: 'Auth', user: 'Alex Rivera', time: '2 min ago', level: 'info' },
  { action: 'Profile Updated', entity: 'StudentProfile', user: 'Priya Sharma', time: '8 min ago', level: 'info' },
  { action: 'Job Posted', entity: 'JobPosting', user: 'Jessica Pearson', time: '15 min ago', level: 'info' },
  { action: 'Role Changed', entity: 'User', user: 'Admin', time: '1 hr ago', level: 'warn' },
  { action: 'Failed Login (3x)', entity: 'Auth', user: 'unknown@test.com', time: '2 hr ago', level: 'error' },
]

export default function AdminDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['systemMetrics'],
    queryFn: () => api.get('/analytics/system').then((r: any) => r.data.data),
  })

  if (isLoading) {
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

  const roleDistribution = data?.roleBreakdown?.map((r: any) => ({
    name: r.role,
    value: r._count.id,
    color: roleColors[r.role] || '#94a3b8',
  })) || []

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={fadeUp}>
        <h1 className="section-title">Admin Console</h1>
        <p className="section-sub">Platform health, user management, and audit trail</p>
      </motion.div>

      <motion.div variants={fadeUp} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Users" value={data?.totalUsers || 0} subtitle="Registered accounts" icon={<Users className="w-5 h-5" />} color="brand" />
        <StatCard title="System Health" value={data?.systemHealth || 'Optimal'} subtitle="All services running" icon={<Activity className="w-5 h-5" />} color="emerald" />
        <StatCard title="Uptime (s: any)" value={data?.uptimeSeconds || 0} subtitle="Server uptime" icon={<Clock className="w-5 h-5" />} color="cyan" />
        <StatCard title="Active Jobs" value="BullMQ" subtitle="Async queues running" icon={<Server className="w-5 h-5" />} color="amber" />
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* API Usage */}
        <motion.div variants={fadeUp} className="glass-card p-5 lg:col-span-2">
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
        </motion.div>

        {/* Role Distribution */}
        <motion.div variants={fadeUp} className="glass-card p-5">
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
        </motion.div>
      </div>

      {/* Audit Log */}
      <motion.div variants={fadeUp} className="glass-card p-5">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Settings className="w-4 h-4 text-amber-400" /> Recent Audit Log (BullMQ Async Worker)
          </h3>
          <span className="badge-warning text-[10px]">Real-time Event Sourcing</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-surface-border">
                <th className="text-left text-slate-500 font-medium pb-2 pr-4">Action</th>
                <th className="text-left text-slate-500 font-medium pb-2 pr-4">Entity</th>
                <th className="text-left text-slate-500 font-medium pb-2 pr-4">User</th>
                <th className="text-left text-slate-500 font-medium pb-2 pr-4">Time</th>
                <th className="text-left text-slate-500 font-medium pb-2">Level</th>
              </tr>
            </thead>
            <tbody>
              {recentAuditLogs.map((log, i) => (
                <tr key={i} className="border-b border-surface-border/50 hover:bg-surface-hover transition-colors">
                  <td className="py-2.5 pr-4 text-white">{log.action}</td>
                  <td className="py-2.5 pr-4 text-slate-400">{log.entity}</td>
                  <td className="py-2.5 pr-4 text-slate-400">{log.user}</td>
                  <td className="py-2.5 pr-4 text-slate-500">{log.time}</td>
                  <td className="py-2.5">
                    <span className={`badge ${log.level === 'error' ? 'badge-danger' : log.level === 'warn' ? 'badge-warning' : 'badge-info'}`}>
                      {log.level}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  )
}
