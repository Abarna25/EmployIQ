import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery, useMutation } from '@tanstack/react-query'
import { api } from '@/services/api'
import { BrainCircuit, Loader2, DollarSign, Target, Sparkles, Building2, Briefcase } from 'lucide-react'

export default function CareerSimulatorDashboard() {
  const [targetCompany, setTargetCompany] = useState('Google')

  // Fetch predicted salary and company eligibility
  const salaryMutation = useMutation({
    mutationFn: () => api.get('/intelligence/salary').then(r => r.data.data),
  })

  const eligibilityMutation = useMutation({
    mutationFn: () => api.get('/intelligence/eligibility').then(r => r.data.data),
  })

  const handleSimulate = () => {
    salaryMutation.mutate()
    eligibilityMutation.mutate()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="section-title">Career Growth Simulator</h1>
          <p className="section-sub">Predict salary and company eligibility based on your current skills</p>
        </div>
        <button
          onClick={handleSimulate}
          disabled={salaryMutation.isPending || eligibilityMutation.isPending}
          className="btn-primary"
        >
          {(salaryMutation.isPending || eligibilityMutation.isPending) ? <Loader2 className="w-4 h-4 animate-spin" /> : <BrainCircuit className="w-4 h-4" />}
          Run Simulation
        </button>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Salary Prediction Card */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-400" />
            Salary Prediction
          </h2>
          
          {salaryMutation.isPending ? (
             <div className="h-40 flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-brand-500" /></div>
          ) : salaryMutation.data ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
               <div className="p-6 bg-surface rounded-xl border border-emerald-500/20 text-center">
                 <p className="text-sm text-slate-400 uppercase tracking-widest mb-2">Estimated Package</p>
                 <div className="text-4xl font-bold text-white mb-2 flex items-center justify-center gap-2">
                   ₹{(salaryMutation.data.predictedMin / 100000).toFixed(1)}L - ₹{(salaryMutation.data.predictedMax / 100000).toFixed(1)}L
                 </div>
                 <p className="text-sm text-emerald-400">Confidence Score: {(salaryMutation.data.confidenceScore * 100).toFixed(0)}%</p>
               </div>
               
               <div>
                  <h3 className="text-sm font-semibold text-slate-300 mb-2">Key Factors</h3>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(salaryMutation.data.factors).map(([k, v]) => (
                       <span key={k} className="px-3 py-1 rounded-full bg-slate-800 text-xs text-slate-300 border border-slate-700 capitalize">
                         {k.replace('_', ' ')}: <span className="text-white font-bold">{v as string}</span>
                       </span>
                    ))}
                  </div>
               </div>
            </motion.div>
          ) : (
            <div className="h-40 flex items-center justify-center text-slate-500">
              Run simulation to see your predicted salary range
            </div>
          )}
        </div>

        {/* Company Eligibility Engine */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-brand-400" />
            Company Eligibility Engine
          </h2>
          
          {eligibilityMutation.isPending ? (
             <div className="h-40 flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-brand-500" /></div>
          ) : eligibilityMutation.data ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
               <div>
                  <h3 className="text-sm font-semibold text-emerald-400 mb-2">Eligible Companies</h3>
                  <div className="grid grid-cols-2 gap-3">
                     {eligibilityMutation.data.eligible_companies.map((c: any) => (
                        <div key={c.name} className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center gap-2">
                          <Target className="w-4 h-4 text-emerald-500" />
                          <span className="text-sm text-white font-medium">{c.name}</span>
                        </div>
                     ))}
                     {eligibilityMutation.data.eligible_companies.length === 0 && (
                        <p className="text-sm text-slate-500">No eligible companies found in this tier.</p>
                     )}
                  </div>
               </div>

               <div className="pt-2">
                  <h3 className="text-sm font-semibold text-rose-400 mb-2">Needs Improvement</h3>
                  <div className="space-y-2">
                     {eligibilityMutation.data.ineligible_companies.map((c: any) => (
                        <div key={c.name} className="p-3 bg-surface border border-rose-500/20 rounded-lg flex flex-col gap-1">
                          <span className="text-sm text-white font-medium">{c.name}</span>
                          <span className="text-xs text-rose-400">Missing skills: {c.missing_skills?.join(', ') || 'CGPA requirement not met'}</span>
                        </div>
                     ))}
                  </div>
               </div>
            </motion.div>
          ) : (
            <div className="h-40 flex items-center justify-center text-slate-500">
              Run simulation to see which companies you're eligible for
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
