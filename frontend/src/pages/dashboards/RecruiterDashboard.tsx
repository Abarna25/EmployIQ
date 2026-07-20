import { useState } from 'react'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/services/api'
import { Users, Search, Filter, Briefcase, Download, Building2, MapPin, Map, Globe, Shield, Star, AlertTriangle, MessageSquare } from 'lucide-react'
import ProgressRing from '@/components/ui/ProgressRing'

const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } }
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } }

export default function RecruiterDashboard() {
  const [searchTerm, setSearchTerm] = useState('')
  const [minCgpa, setMinCgpa] = useState('')
  const [tierFilter, setTierFilter] = useState('')
  
  // Real API fetching for recruiter candidate search
  const { data, isLoading } = useQuery({
    queryKey: ['candidates', searchTerm, minCgpa, tierFilter],
    queryFn: () => 
      api.get('/recruiters/candidates', {
        params: { search: searchTerm, minCgpa, tierCategory: tierFilter }
      }).then((r: any) => r.data.data),
  })

  const candidates = data?.candidates || []

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={fadeUp} className="flex flex-col sm:flex-row justify-between sm:items-end gap-4">
        <div>
          <h1 className="section-title">Talent Search</h1>
          <p className="section-sub">Discover and filter pre-verified, AI-ranked candidates</p>
        </div>
        <button className="btn-primary">
          <Briefcase className="w-4 h-4" /> Post New Job
        </button>
      </motion.div>

      {/* Filters */}
      <motion.div variants={fadeUp} className="glass-card p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search by name, register number, or skill..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10" 
            />
          </div>
          <div>
            <select value={tierFilter} onChange={(e) => setTierFilter(e.target.value)} className="input-field">
              <option value="">All Tiers</option>
              <option value="Tier 1 (Core Product)">Tier 1 (Product)</option>
              <option value="Tier 2 (Enterprise IT / Fintech)">Tier 2 (IT/Fintech)</option>
              <option value="Mass Recruiter">Mass Recruiter</option>
            </select>
          </div>
          <div>
            <input 
              type="number" 
              placeholder="Min CGPA" 
              value={minCgpa}
              onChange={(e) => setMinCgpa(e.target.value)}
              step="0.1"
              max="10"
              className="input-field" 
            />
          </div>
        </div>
      </motion.div>

      {/* Candidates List */}
      <motion.div variants={fadeUp} className="grid gap-4">
        {isLoading ? (
          <div className="flex justify-center py-10">
            <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : candidates.length === 0 ? (
          <div className="glass-card p-10 text-center text-slate-400">
            No candidates match your filters.
          </div>
        ) : (
          candidates.map((candidate: any) => (
            <div key={candidate.id} className="glass-card p-5 group flex flex-col md:flex-row gap-6">
              
              {/* Left Profile Info */}
              <div className="flex-1 flex gap-5">
                <div className="w-16 h-16 rounded-2xl bg-gradient-brand flex items-center justify-center text-xl font-bold text-white shrink-0 shadow-lg shadow-brand-500/20">
                  {candidate.user?.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-bold text-white leading-tight">{candidate.user?.name}</h3>
                    {candidate.atsScore >= 80 && (
                      <span className="badge-success text-[10px]"><Star className="w-3 h-3 inline mr-1" /> Top 10%</span>
                    )}
                  </div>
                  <p className="text-sm text-slate-400 mb-3">{candidate.department} · {candidate.batchYear}</p>
                  
                  <div className="flex flex-wrap gap-2">
                    {candidate.studentSkills?.slice(0, 5).map((sk: any) => (
                      <span key={sk.id} className="badge bg-surface text-slate-300 border border-surface-border">
                        {sk.skill?.name}
                      </span>
                    ))}
                    {candidate.studentSkills?.length > 5 && (
                      <span className="badge bg-surface-hover text-slate-400 border-none">
                        +{candidate.studentSkills.length - 5}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Middle Metrics */}
              <div className="hidden md:flex items-center gap-8 px-6 border-x border-surface-border">
                <div className="text-center">
                  <p className="text-xs text-slate-500 mb-1">CGPA</p>
                  <p className="text-xl font-bold text-white">{candidate.currentCgpa}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-slate-500 mb-1">Projects</p>
                  <p className="text-xl font-bold text-white">{(candidate as any)._count?.projects || 3}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-slate-500 mb-2">ATS Match</p>
                  <ProgressRing 
                    value={candidate.employabilityScores?.[0]?.overallScore || 0} 
                    size={48} 
                    strokeWidth={4} 
                    color={candidate.employabilityScores?.[0]?.overallScore >= 80 ? '#10b981' : '#f59e0b'} 
                  />
                </div>
              </div>

              {/* Right Actions */}
              <div className="flex md:flex-col justify-center gap-2 shrink-0">
                <button className="btn-primary flex-1 justify-center">View Profile</button>
                <button className="btn-secondary flex-1 justify-center">
                  <MessageSquare className="w-4 h-4" /> Message
                </button>
              </div>

            </div>
          ))
        )}
      </motion.div>
    </motion.div>
  )
}
