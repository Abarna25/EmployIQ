import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/services/api'
import StatCard from '../../components/ui/StatCard'
import { Check, X } from 'lucide-react'
import {
  LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts'
import { Users, CheckCircle, AlertTriangle, BookOpen, TrendingUp, Award } from 'lucide-react'

const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } }
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } }

const skillValidations = [
  { month: 'Jan', validated: 12 }, { month: 'Feb', validated: 18 },
  { month: 'Mar', validated: 24 }, { month: 'Apr', validated: 16 },
  { month: 'May', validated: 31 }, { month: 'Jun', validated: 22 },
]

export default function FacultyDashboard() {
  const location = useLocation()
  const [activeTab, setActiveTab] = useState<'overview' | 'approvals'>('overview')

  useEffect(() => {
    if (location.pathname.includes('approvals')) {
      setActiveTab('approvals')
    } else {
      setActiveTab('overview')
    }
  }, [location.pathname])

  const queryClient = useQueryClient()

  const { data: metrics } = useQuery({
    queryKey: ['facultyMetrics'],
    queryFn: () => api.get('/faculty/metrics').then(r => r.data.data)
  })

  const { data: mentees, isLoading: menteesLoading } = useQuery({
    queryKey: ['facultyMentees'],
    queryFn: () => api.get('/faculty/mentees').then(r => r.data.data)
  })

  const { data: pendingSkills, isLoading: skillsLoading } = useQuery({
    queryKey: ['facultyPendingSkills'],
    queryFn: () => api.get('/faculty/skills/pending').then(r => r.data.data)
  })

  const verifyMutation = useMutation({
    mutationFn: ({ id, status }: { id: string, status: string }) => api.post(`/faculty/skills/${id}/verify`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['facultyPendingSkills'] })
      queryClient.invalidateQueries({ queryKey: ['facultyMetrics'] })
    }
  })

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={fadeUp} className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="section-title">Faculty Dashboard</h1>
          <p className="section-sub">Mentorship overview and skill validation center</p>
        </div>
        <div className="flex bg-surface p-1 rounded-xl border border-surface-border">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'overview' ? 'bg-brand-500 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            Overview
          </button>
          <button 
            onClick={() => setActiveTab('approvals')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === 'approvals' ? 'bg-brand-500 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            Approvals
            {metrics?.pendingVerifications > 0 && (
              <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] flex items-center justify-center font-bold">
                {metrics.pendingVerifications}
              </span>
            )}
          </button>
        </div>
      </motion.div>

      <motion.div variants={fadeUp} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Mentees" value={metrics?.totalMentees || 0} subtitle="Assigned students" icon={<Users className="w-5 h-5" />} color="brand" />
        <StatCard title="Skills Validated" value={143} subtitle="This semester (simulated)" icon={<CheckCircle className="w-5 h-5" />} color="emerald" />
        <StatCard title="Pending Approvals" value={metrics?.pendingVerifications || 0} subtitle="Skill verifications" icon={<AlertTriangle className="w-5 h-5" />} color="amber" />
        <StatCard title="Avg Mentee ATS" value="78%" subtitle="+5% from last month" icon={<Award className="w-5 h-5" />} color="cyan" />
      </motion.div>

      {activeTab === 'overview' ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid lg:grid-cols-2 gap-4">
          <div className="glass-card p-5">
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-brand-400" /> Skill Validations Over Time (Simulated)
            </h3>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={skillValidations}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#16162a', border: '1px solid #2a2a45', borderRadius: 12, fontSize: 12 }} />
                <Line type="monotone" dataKey="validated" stroke="#10b981" strokeWidth={2.5} dot={{ fill: '#10b981', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="glass-card p-5">
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-violet-400" /> Mentee Performance
            </h3>
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
              {menteesLoading ? (
                <div className="text-center text-slate-500 py-4">Loading mentees...</div>
              ) : mentees?.length === 0 ? (
                <div className="text-center text-slate-500 py-4">No mentees assigned.</div>
              ) : (
                mentees?.map((m: any) => (
                  <div key={m.id} className="flex items-center justify-between p-3 rounded-xl bg-surface hover:bg-surface-hover transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-brand flex items-center justify-center text-xs font-bold text-white">
                        {m.user.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{m.user.name}</p>
                        <p className="text-[10px] text-slate-500">CGPA: {m.currentCgpa}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`badge ${m.tierCategory === 'Tier 1' ? 'badge-success' : m.tierCategory === 'Tier 2' ? 'badge-info' : 'badge-warning'}`}>
                        {m.tierCategory || 'Unassigned'}
                      </span>
                      <span className="text-xs text-slate-400">{m.atsScore || 0}% ATS</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-5">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" /> Pending Skill Verifications
          </h3>
          
          <div className="space-y-4">
            {skillsLoading ? (
              <div className="text-center text-slate-500 py-10">Loading pending skills...</div>
            ) : pendingSkills?.length === 0 ? (
              <div className="text-center text-slate-500 py-10">No pending skills to verify.</div>
            ) : (
              pendingSkills?.map((ps: any) => (
                <div key={ps.id} className="p-4 bg-surface border border-surface-border rounded-xl flex flex-col md:flex-row gap-4 justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-brand-500/10 flex items-center justify-center text-brand-400 font-bold">
                      {ps.studentProfile.user.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{ps.studentProfile.user.name}</p>
                      <p className="text-xs text-slate-400">Claims proficiency in <strong className="text-white">{ps.skill.name}</strong> (Level {ps.proficiency})</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => verifyMutation.mutate({ id: ps.id, status: 'REJECT' })}
                      disabled={verifyMutation.isPending}
                      className="btn-secondary !text-rose-400 hover:!bg-rose-500/10 !border-rose-500/20"
                    >
                      <X className="w-4 h-4" /> Reject
                    </button>
                    <button 
                      onClick={() => verifyMutation.mutate({ id: ps.id, status: 'APPROVE' })}
                      disabled={verifyMutation.isPending}
                      className="btn-primary !bg-emerald-500 hover:!bg-emerald-600 shadow-lg shadow-emerald-500/20"
                    >
                      <Check className="w-4 h-4" /> Approve
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
