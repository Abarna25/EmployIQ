import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { studentApi } from '../../services/endpoints'
import StatCard from '../../components/ui/StatCard'
import ProgressRing from '../../components/ui/ProgressRing'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, Radar, PieChart, Pie, Cell,
} from 'recharts'
import { GraduationCap, Code2, FolderGit2, Award, TrendingUp, Target, Zap, Star, ArrowUpRight, BookOpen, Clock, CheckCircle2, Circle } from 'lucide-react'
import AchievementShowcase from '../../components/gamification/AchievementShowcase'
import { api } from '@/services/api'

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
}
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

export default function StudentDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['studentProfile'],
    queryFn: () => studentApi.getProfile().then((r: any) => r.data.data?.profile),
  })

  const { data: achievements } = useQuery({
    queryKey: ['achievements'],
    queryFn: () => api.get('/gamification/achievements').then((r: any) => r.data.data),
  })

  const { data: goals } = useQuery({
    queryKey: ['goals'],
    queryFn: () => api.get('/gamification/goals').then((r: any) => r.data.data),
  })

  const profile = data
  const score = profile?.employabilityScores?.[0]
  const gap = profile?.skillGaps?.[0]

  const radarData = [
    { subject: 'Academic', A: score?.academicScore || 78 },
    { subject: 'Technical', A: score?.technicalScore || 82 },
    { subject: 'Projects', A: score?.projectScore || 70 },
    { subject: 'Coding', A: score?.codingScore || 85 },
    { subject: 'Communication', A: 72 },
  ]

  const semGpa = profile?.academicRecords?.length
    ? profile.academicRecords.map((r: any) => ({ semester: `S${r.semester}`, gpa: r.sgpa }))
    : [
        { semester: 'S1', gpa: 8.2 }, { semester: 'S2', gpa: 8.5 },
        { semester: 'S3', gpa: 8.8 }, { semester: 'S4', gpa: 9.0 },
        { semester: 'S5', gpa: 8.7 }, { semester: 'S6', gpa: 9.1 },
      ]

  const tierColors = ['#6366f1', '#8b5cf6', '#06b6d4', '#f59e0b']
  const tierData = [
    { name: 'Tier 1', value: 35 }, { name: 'Tier 2', value: 30 },
    { name: 'Mass', value: 25 }, { name: 'Upskill', value: 10 },
  ]

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6">
      {/* Header */}
      <motion.div variants={fadeUp}>
        <h1 className="section-title">Student Dashboard</h1>
        <p className="section-sub">
          Your personalized employability intelligence overview
        </p>
      </motion.div>

      {/* Stats Row */}
      <motion.div variants={fadeUp} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="CGPA"
          value={profile?.currentCgpa?.toFixed(2) || '8.85'}
          subtitle={profile?.department || 'CSE'}
          icon={<GraduationCap className="w-5 h-5" />}
          color="brand"
          trend={{ value: '+0.15 from last sem', positive: true }}
        />
        <StatCard
          title="ATS Score"
          value={`${score?.overallScore || profile?.atsScore || 88}%`}
          subtitle="Resume Readiness"
          icon={<Target className="w-5 h-5" />}
          color="emerald"
        />
        <StatCard
          title="Projects"
          value={profile?.projects?.length || 2}
          subtitle={`${profile?.codingProfiles?.reduce((a: any, c: any) => a + c.problemsSolved, 0) || 710}+ problems solved`}
          icon={<FolderGit2 className="w-5 h-5" />}
          color="cyan"
        />
        <StatCard
          title="Predicted Tier"
          value={score?.predictedTier?.split(' ')[0] + ' ' + (score?.predictedTier?.split(' ')[1] || '') || 'Tier 1'}
          subtitle="Top 12% of batch"
          icon={<Zap className="w-5 h-5" />}
          color="amber"
        />
      </motion.div>

      {/* Gamification Row */}
      <motion.div variants={fadeUp} className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <AchievementShowcase achievements={achievements} />
        </div>
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Target className="w-4 h-4 text-emerald-400" /> Daily Goals
            </h3>
            <span className="text-xs text-slate-400">
              {goals?.filter((g: any) => g.isCompleted).length || 0}/{goals?.length || 0}
            </span>
          </div>
          <div className="space-y-3">
            {goals?.slice(0, 4).map((goal: any) => (
              <div key={goal.id} className="flex items-center gap-3">
                {goal.isCompleted ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                ) : (
                  <Circle className="w-4 h-4 text-slate-600 shrink-0" />
                )}
                <div>
                  <p className={`text-sm ${goal.isCompleted ? 'text-slate-500 line-through' : 'text-slate-300'}`}>
                    {goal.title}
                  </p>
                  <p className="text-[10px] text-slate-500">{goal.type}</p>
                </div>
              </div>
            ))}
            {(!goals || goals.length === 0) && (
              <p className="text-sm text-slate-500">No active goals today. Time to rest!</p>
            )}
          </div>
        </div>
      </motion.div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Employability Radar */}
        <motion.div variants={fadeUp} className="glass-card p-5 lg:col-span-1">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-brand-400" /> Skill Competency Radar
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="rgba(255,255,255,0.08)" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <Radar
                dataKey="A"
                stroke="#6366f1"
                fill="#6366f1"
                fillOpacity={0.25}
                strokeWidth={2}
              />
            </RadarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Semester GPA Trend */}
        <motion.div variants={fadeUp} className="glass-card p-5 lg:col-span-1">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-cyan-400" /> Semester GPA Trend
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={semGpa}>
              <XAxis dataKey="semester" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis domain={[6, 10]} tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#16162a', border: '1px solid #2a2a45', borderRadius: 12, fontSize: 12 }}
                labelStyle={{ color: '#fff' }}
              />
              <Bar dataKey="gpa" radius={[6, 6, 0, 0]} fill="url(#barGrad)" />
              <defs>
                <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Employability Score Ring */}
        <motion.div variants={fadeUp} className="glass-card p-5 flex flex-col items-center justify-center">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Star className="w-4 h-4 text-amber-400" /> Employability Index
          </h3>
          <ProgressRing
            value={score?.overallScore || 86}
            size={140}
            strokeWidth={10}
            label="Score"
            color="#6366f1"
          />
          <p className="text-xs text-slate-400 mt-3">
            {score?.predictedTier || 'Tier 1 (Core Product)'}
          </p>
        </motion.div>
      </div>

      {/* Bottom Row: Skills + SHAP Factors */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Top Skills */}
        <motion.div variants={fadeUp} className="glass-card p-5">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Code2 className="w-4 h-4 text-violet-400" /> Your Skills
          </h3>
          <div className="flex flex-wrap gap-2">
            {(profile?.studentSkills?.length
              ? profile.studentSkills.map((s: any) => ({
                  name: s.skill.name,
                  level: s.proficiency,
                  verified: s.verifiedByFaculty,
                }))
              : [
                  { name: 'React.js', level: 5, verified: true },
                  { name: 'Node.js', level: 4, verified: true },
                  { name: 'Python & FastAPI', level: 4, verified: false },
                  { name: 'PostgreSQL', level: 4, verified: true },
                  { name: 'Docker', level: 3, verified: false },
                ]
            ).map((s: any) => (
              <span
                key={s.name}
                className={`badge ${s.verified ? 'badge-success' : 'badge-brand'}`}
              >
                {s.name} · {s.level}/5
                {s.verified && <Award className="w-3 h-3 ml-0.5" />}
              </span>
            ))}
          </div>
        </motion.div>

        {/* AI Insights */}
        <motion.div variants={fadeUp} className="glass-card p-5">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" /> AI-Powered Insights
          </h3>
          <div className="space-y-2">
            {(score?.shapFactors?.positive_factors || [
              'Strong Academic Record (CGPA 8.85) +12.5%',
              'High Competitive Coding Rating (1850) +15.0%',
              'Solid Practical Portfolio (2 projects) +10.0%',
            ]).map((f: any, i: any) => (
              <div key={i} className="flex items-start gap-2 text-xs">
                <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span className="text-slate-300">{f}</span>
              </div>
            ))}
            {(score?.shapFactors?.negative_factors || [
              'No industry internship recorded -8.0%',
            ]).map((f: any, i: any) => (
              <div key={i} className="flex items-start gap-2 text-xs">
                <ArrowUpRight className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5 rotate-180" />
                <span className="text-slate-300">{f}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
