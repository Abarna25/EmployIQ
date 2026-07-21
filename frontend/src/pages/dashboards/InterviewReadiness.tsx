import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/services/api'
import { MessageSquare, Zap, Star, ShieldAlert, CheckCircle2, PlayCircle, AlertTriangle } from 'lucide-react'
import ProgressRing from '@/components/ui/ProgressRing'

const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } }
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } }

export default function InterviewReadiness() {
  const { data, isLoading } = useQuery({
    queryKey: ['interviewReadiness'],
    queryFn: () => api.get('/intelligence/interview-readiness').then((r: any) => r.data.data),
  })

  if (isLoading) {
    return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" /></div>
  }

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={fadeUp} className="flex flex-col sm:flex-row justify-between sm:items-end gap-4">
        <div>
          <h1 className="section-title">Interview Readiness</h1>
          <p className="section-sub">AI-driven insights and customized mock interview prep</p>
        </div>
        <button className="btn-primary animate-pulse shadow-[0_0_15px_rgba(99,102,241,0.5)]">
          <PlayCircle className="w-4 h-4" /> Start Mock Interview
        </button>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Score Overview */}
        <motion.div variants={fadeUp} className="glass-card p-6 flex flex-col items-center justify-center text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4">
            <Zap className="w-6 h-6 text-brand-500/20" />
          </div>
          <h2 className="text-sm font-semibold text-white mb-6 uppercase tracking-wider">Overall Readiness</h2>
          <ProgressRing 
            value={data?.readinessScore || 0} 
            size={160} 
            strokeWidth={12} 
            label="Score" 
            color={data?.readinessScore >= 80 ? '#10b981' : data?.readinessScore >= 60 ? '#f59e0b' : '#f43f5e'} 
          />
          <p className="text-xs text-slate-400 mt-4">
            Based on your projects, skills, and coding consistency
          </p>
        </motion.div>

        {/* Strengths and Improvements */}
        <motion.div variants={fadeUp} className="lg:col-span-2 grid sm:grid-cols-2 gap-4">
          <div className="glass-card p-5 border-t-2 border-t-emerald-500">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" /> Key Strengths
            </h3>
            <ul className="space-y-3">
              {data?.strengths?.map((s: string, i: number) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                  <Star className="w-4 h-4 text-emerald-500/50 shrink-0 mt-0.5" />
                  {s}
                </li>
              ))}
            </ul>
          </div>
          
          <div className="glass-card p-5 border-t-2 border-t-rose-500">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-400" /> Focus Areas
            </h3>
            <ul className="space-y-3">
              {data?.improvementAreas?.map((s: string, i: number) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                  <AlertTriangle className="w-4 h-4 text-rose-500/50 shrink-0 mt-0.5" />
                  {s}
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      </div>

      {/* Recommended Mock Questions */}
      <motion.div variants={fadeUp} className="glass-card p-6">
        <h2 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-brand-400" /> AI Generated Mock Questions
        </h2>
        <p className="text-sm text-slate-400 mb-6">Tailored to your target role and current skill gaps</p>
        
        <div className="space-y-4">
          {data?.mockQuestions?.map((mq: any, i: number) => (
            <div key={i} className="p-4 bg-surface border border-surface-border rounded-xl hover:border-brand-500/30 transition-colors">
              <span className="badge badge-brand mb-2">{mq.topic}</span>
              <p className="text-sm text-white font-medium">{mq.question}</p>
            </div>
          ))}
          {(!data?.mockQuestions || data.mockQuestions.length === 0) && (
            <p className="text-slate-500 text-sm italic">No specific questions generated at this time.</p>
          )}
        </div>
      </motion.div>

    </motion.div>
  )
}
