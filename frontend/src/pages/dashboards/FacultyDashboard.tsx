import { motion } from 'framer-motion'
import StatCard from '../../components/ui/StatCard'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid,
} from 'recharts'
import { Users, CheckCircle, AlertTriangle, BookOpen, TrendingUp, Award } from 'lucide-react'

const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } }
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } }

const menteePerformance = [
  { name: 'Alex R.', cgpa: 8.85, ats: 88, tier: 'Tier 1' },
  { name: 'Priya S.', cgpa: 9.12, ats: 92, tier: 'Tier 1' },
  { name: 'Rohan K.', cgpa: 7.6, ats: 65, tier: 'Tier 2' },
  { name: 'Meera D.', cgpa: 8.0, ats: 74, tier: 'Tier 2' },
  { name: 'Vikram P.', cgpa: 6.8, ats: 55, tier: 'Mass' },
]

const skillValidations = [
  { month: 'Jan', validated: 12 }, { month: 'Feb', validated: 18 },
  { month: 'Mar', validated: 24 }, { month: 'Apr', validated: 16 },
  { month: 'May', validated: 31 }, { month: 'Jun', validated: 22 },
]

export default function FacultyDashboard() {
  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={fadeUp}>
        <h1 className="section-title">Faculty Dashboard</h1>
        <p className="section-sub">Mentorship overview and skill validation center</p>
      </motion.div>

      <motion.div variants={fadeUp} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Mentees" value={24} subtitle="CSE 2026 Batch" icon={<Users className="w-5 h-5" />} color="brand" />
        <StatCard title="Skills Validated" value={143} subtitle="This semester" icon={<CheckCircle className="w-5 h-5" />} color="emerald" />
        <StatCard title="Pending Approvals" value={7} subtitle="Skill verifications" icon={<AlertTriangle className="w-5 h-5" />} color="amber" />
        <StatCard title="Avg Mentee ATS" value="78%" subtitle="+5% from last month" icon={<Award className="w-5 h-5" />} color="cyan" />
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-4">
        <motion.div variants={fadeUp} className="glass-card p-5">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-brand-400" /> Skill Validations Over Time
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
        </motion.div>

        <motion.div variants={fadeUp} className="glass-card p-5">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-violet-400" /> Mentee Performance
          </h3>
          <div className="space-y-3">
            {menteePerformance.map((m) => (
              <div key={m.name} className="flex items-center justify-between p-3 rounded-xl bg-surface hover:bg-surface-hover transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-brand flex items-center justify-center text-xs font-bold text-white">
                    {m.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{m.name}</p>
                    <p className="text-[10px] text-slate-500">CGPA: {m.cgpa}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`badge ${m.tier === 'Tier 1' ? 'badge-success' : m.tier === 'Tier 2' ? 'badge-info' : 'badge-warning'}`}>
                    {m.tier}
                  </span>
                  <span className="text-xs text-slate-400">{m.ats}% ATS</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
