import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/services/api'
import { BrainCircuit, Loader2, Target, TrendingUp, AlertTriangle, ArrowUpRight, Zap, Target as TargetIcon } from 'lucide-react'
import ProgressRing from '@/components/ui/ProgressRing'

const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } }
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } }

export default function EmployabilityPage() {
  const queryClient = useQueryClient()
  const [targetRole, setTargetRole] = useState('Software Engineer')

  const { data, isLoading } = useQuery({
    queryKey: ['studentProfile'],
    queryFn: () => api.get('/students/profile').then((r: any) => r.data.data?.profile),
  })

  const score = data?.employabilityScores?.[0]
  const gap = data?.skillGaps?.[0]

  const predictMutation = useMutation({
    mutationFn: () => api.post('/ai/predict-employability'),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['studentProfile'] }),
  })

  const gapMutation = useMutation({
    mutationFn: (role: string) => api.post('/ai/skill-gap', { targetRole: role }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['studentProfile'] }),
  })

  const handleAnalyze = () => {
    predictMutation.mutate()
    gapMutation.mutate(targetRole)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={fadeUp} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="section-title">AI Career Coach</h1>
          <p className="section-sub">XGBoost Employability Prediction & Skill Gap Analysis</p>
        </div>
        <div className="flex gap-2">
          <select value={targetRole} onChange={(e) => setTargetRole(e.target.value)} className="input-field py-2 text-sm w-48">
            <option>Software Engineer</option>
            <option>Data Scientist</option>
            <option>Frontend Developer</option>
            <option>Backend Developer</option>
            <option>Product Manager</option>
          </select>
          <button
            onClick={handleAnalyze}
            disabled={predictMutation.isPending || gapMutation.isPending}
            className="btn-primary"
          >
            {(predictMutation.isPending || gapMutation.isPending) ? <Loader2 className="w-4 h-4 animate-spin" /> : <BrainCircuit className="w-4 h-4" />}
            Analyze Profile
          </button>
        </div>
      </motion.div>

      {/* Main Analysis Area */}
      <AnimatePresence mode="wait">
        {!score ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="glass-card p-12 text-center"
          >
            <BrainCircuit className="w-12 h-12 text-brand-500 mx-auto mb-4 opacity-50" />
            <h2 className="text-xl font-bold text-white mb-2">No AI Analysis Found</h2>
            <p className="text-slate-400 max-w-md mx-auto mb-6">
              Run the AI Career Coach to analyze your portfolio across 5 dimensions (Academics, Projects, Coding, Skills, Internships) and predict your placement tier.
            </p>
            <button onClick={handleAnalyze} className="btn-primary mx-auto">Generate AI Report</button>
          </motion.div>
        ) : (
          <motion.div key="results" variants={stagger} initial="hidden" animate="show" className="grid lg:grid-cols-3 gap-6">
            
            {/* Employability Score Overview */}
            <motion.div variants={fadeUp} className="glass-card p-6 lg:col-span-1 flex flex-col items-center justify-center text-center">
              <h3 className="text-sm font-semibold text-white mb-6 w-full text-left flex items-center gap-2">
                <Target className="w-4 h-4 text-brand-400" /> Placement Prediction
              </h3>
              
              <ProgressRing
                value={score.overallScore}
                size={180}
                strokeWidth={14}
                label="ATS Score"
                color={score.overallScore >= 80 ? '#10b981' : score.overallScore >= 65 ? '#6366f1' : '#f59e0b'}
              />
              
              <div className="mt-6">
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Predicted Tier</p>
                <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-bold ${
                  score.overallScore >= 80 ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' :
                  score.overallScore >= 65 ? 'bg-brand-500/10 border-brand-500/30 text-brand-400' :
                  'bg-amber-500/10 border-amber-500/30 text-amber-400'
                }`}>
                  <Zap className="w-4 h-4" /> {score.predictedTier}
                </div>
              </div>
            </motion.div>

            {/* Dimension Breakdown & SHAP Insights */}
            <motion.div variants={fadeUp} className="glass-card p-6 lg:col-span-2 flex flex-col">
              <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-cyan-400" /> Model Explainability (SHAP)
              </h3>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                {[
                  { label: 'Academics', val: score.academicScore },
                  { label: 'Projects', val: score.projectScore },
                  { label: 'Coding', val: score.codingScore },
                  { label: 'Technical', val: score.technicalScore },
                ].map(d => (
                  <div key={d.label} className="p-3 rounded-xl bg-surface">
                    <p className="text-xs text-slate-500 mb-1">{d.label}</p>
                    <div className="flex items-end gap-2">
                      <span className="text-lg font-bold text-white">{d.val}</span>
                      <span className="text-[10px] text-slate-500 mb-1">/100</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex-1 bg-surface rounded-xl p-4 border border-surface-border space-y-4">
                <div>
                  <h4 className="text-xs font-semibold text-emerald-400 mb-2 uppercase tracking-wide">Positive Factors</h4>
                  <ul className="space-y-2">
                    {score.shapFactors?.positive_factors?.map((f: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
                        <ArrowUpRight className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" /> {f}
                      </li>
                    ))}
                  </ul>
                </div>
                {score.shapFactors?.negative_factors?.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-rose-400 mb-2 uppercase tracking-wide">Areas for Improvement</h4>
                    <ul className="space-y-2">
                      {score.shapFactors?.negative_factors?.map((f: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" /> {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Skill Gap Analysis */}
            {gap && (
              <motion.div variants={fadeUp} className="glass-card p-6 lg:col-span-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <TargetIcon className="w-4 h-4 text-violet-400" /> Skill Gap Analysis: {gap.targetRole}
                  </h3>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-400">Profile Match</span>
                    <div className="w-32 h-2 bg-surface rounded-full overflow-hidden">
                      <div className="h-full bg-violet-500 rounded-full" style={{ width: `${gap.matchPercentage}%` }} />
                    </div>
                    <span className="text-sm font-bold text-white">{gap.matchPercentage}%</span>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wide">Missing Core Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {gap.missingSkills?.map((skill: string) => (
                        <span key={skill} className="px-2.5 py-1 rounded-md bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wide">Recommended Courses</h4>
                    <div className="space-y-2">
                      {gap.recommendedCourses?.map((course: string, i: number) => (
                        <div key={i} className="p-3 rounded-lg bg-surface border border-surface-border text-xs text-slate-300 flex items-center justify-between group cursor-pointer hover:border-violet-500/50 transition-colors">
                          {course}
                          <ArrowUpRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-violet-400" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
