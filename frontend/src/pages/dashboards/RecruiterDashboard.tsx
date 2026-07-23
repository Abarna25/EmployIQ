import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/services/api'
import { Users, Search, Briefcase, Building2, Star, Sparkles, MapPin, ChevronDown, MessageSquare, Target, Plus, X } from 'lucide-react'
import ProgressRing from '@/components/ui/ProgressRing'

const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } }
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } }

export default function RecruiterDashboard() {
  const location = useLocation()
  const [activeTab, setActiveTab] = useState<'talent' | 'jobs' | 'shortlisted'>('talent')

  useEffect(() => {
    if (location.pathname.includes('job-postings')) {
      setActiveTab('jobs')
    } else if (location.pathname.includes('shortlisted')) {
      setActiveTab('shortlisted')
    } else {
      setActiveTab('talent')
    }
  }, [location.pathname])
  
  // Talent Search State
  const [searchTerm, setSearchTerm] = useState('')
  const [minCgpa, setMinCgpa] = useState('')
  const [tierFilter, setTierFilter] = useState('')
  const [useSemanticSearch, setUseSemanticSearch] = useState(false)
  const [semanticResults, setSemanticResults] = useState<any[]>([])

  // Fetch standard candidates
  const { data: standardCandidatesData, isLoading: isLoadingStandard } = useQuery({
    queryKey: ['candidates', searchTerm, minCgpa, tierFilter],
    queryFn: () => 
      api.get('/recruiters/candidates', {
        params: { search: searchTerm, minCgpa, tierCategory: tierFilter }
      }).then((r: any) => r.data.data),
    enabled: !useSemanticSearch
  })

  // Semantic search mutation
  const semanticMutation = useMutation({
    mutationFn: (query: string) => api.post('/intelligence/semantic-search', { query }).then(r => r.data.data.results),
    onSuccess: (data) => setSemanticResults(data)
  })

  const handleSemanticSearch = () => {
    if (searchTerm) semanticMutation.mutate(searchTerm)
  }

  // Jobs state
  const [selectedJob, setSelectedJob] = useState<string | null>(null)
  const [showPostJob, setShowPostJob] = useState(false)
  const [viewProfileId, setViewProfileId] = useState<string | null>(null)
  
  // Job Form State
  const [jobForm, setJobForm] = useState({
    title: '', companyName: '', description: '', requiredSkills: '', minCgpa: '6.0', maxBacklogs: '0', salaryRange: '', location: ''
  })
  
  const queryClient = useQueryClient()
  
  const { data: jobsData } = useQuery({
    queryKey: ['jobs'],
    queryFn: () => api.get('/recruiters/jobs').then((r: any) => r.data.data.jobs),
    enabled: activeTab === 'jobs'
  })

  const { data: rankedCandidates, isLoading: isLoadingRanked } = useQuery({
    queryKey: ['rankedCandidates', selectedJob],
    queryFn: () => api.get(`/recruiters/jobs/${selectedJob}/ranked-candidates`).then((r: any) => r.data.data.rankedCandidates),
    enabled: !!selectedJob
  })

  const createJobMutation = useMutation({
    mutationFn: (data: any) => api.post('/recruiters/jobs', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] })
      setShowPostJob(false)
      setJobForm({ title: '', companyName: '', description: '', requiredSkills: '', minCgpa: '6.0', maxBacklogs: '0', salaryRange: '', location: '' })
    }
  })

  const shortlistMutation = useMutation({
    mutationFn: ({ jobId, candidateId }: { jobId: string, candidateId: string }) => 
      api.patch(`/recruiters/jobs/${jobId}/candidates/${candidateId}/status`, { status: 'SHORTLISTED' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rankedCandidates', selectedJob] })
    }
  })

  const candidatesToDisplay = useSemanticSearch 
    ? semanticResults.map(r => ({ ...standardCandidatesData?.candidates?.find((c: any) => c.id === r.candidateId), semanticScore: r.semanticScore, reason: r.reason })).filter(c => c.id)
    : (standardCandidatesData?.candidates || [])

  const handleCreateJob = (e: React.FormEvent) => {
    e.preventDefault()
    createJobMutation.mutate(jobForm)
  }

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={fadeUp} className="flex flex-col sm:flex-row justify-between sm:items-end gap-4">
        <div>
          <h1 className="section-title">Recruiter Hub</h1>
          <p className="section-sub">AI-powered talent discovery and job management</p>
        </div>
        <div className="flex bg-surface p-1 rounded-xl border border-surface-border">
          <button 
            onClick={() => setActiveTab('talent')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'talent' ? 'bg-brand-500 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            Talent Search
          </button>
          <button 
            onClick={() => setActiveTab('jobs')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'jobs' ? 'bg-brand-500 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            Job Postings
          </button>
          <button 
            onClick={() => setActiveTab('shortlisted')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'shortlisted' ? 'bg-brand-500 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            Shortlisted
          </button>
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {activeTab === 'talent' ? (
          <motion.div key="talent" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
            {/* Filters */}
            <div className="glass-card p-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                <div className="relative md:col-span-2 flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input 
                      type="text" 
                      placeholder={useSemanticSearch ? "E.g., Looking for a frontend dev with React..." : "Search by name, skill..."}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && useSemanticSearch && handleSemanticSearch()}
                      className="input-field pl-10" 
                    />
                  </div>
                  <button 
                    onClick={() => setUseSemanticSearch(!useSemanticSearch)}
                    className={`px-3 py-2 rounded-xl border flex items-center gap-2 text-sm transition-colors shrink-0 ${useSemanticSearch ? 'bg-violet-500/10 border-violet-500/30 text-violet-400' : 'bg-surface border-surface-border text-slate-400'}`}
                  >
                    <Sparkles className="w-4 h-4" /> AI Search
                  </button>
                </div>
                {!useSemanticSearch && (
                  <>
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
                        type="number" placeholder="Min CGPA" value={minCgpa}
                        onChange={(e) => setMinCgpa(e.target.value)} step="0.1" max="10" className="input-field" 
                      />
                    </div>
                  </>
                )}
              </div>
              {useSemanticSearch && (
                <div className="mt-3 flex justify-end">
                   <button onClick={handleSemanticSearch} className="btn-primary" disabled={semanticMutation.isPending}>
                     {semanticMutation.isPending ? 'Searching...' : 'Search with AI'}
                   </button>
                </div>
              )}
            </div>

            {/* Candidates List */}
            <div className="grid gap-4">
              {(isLoadingStandard || semanticMutation.isPending) ? (
                <div className="flex justify-center py-10"><div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" /></div>
              ) : candidatesToDisplay.length === 0 ? (
                <div className="glass-card p-10 text-center text-slate-400">No candidates found.</div>
              ) : (
                candidatesToDisplay.map((candidate: any) => (
                  <div key={candidate.id} className="glass-card p-5 flex flex-col md:flex-row gap-6">
                    <div className="flex-1 flex gap-5">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-brand flex items-center justify-center text-xl font-bold text-white shrink-0 shadow-lg shadow-brand-500/20">
                        {candidate.user?.name?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-bold text-white">{candidate.user?.name}</h3>
                          {useSemanticSearch && candidate.semanticScore > 0 && (
                            <span className="badge bg-violet-500/10 text-violet-400 border border-violet-500/20">
                              <Sparkles className="w-3 h-3 inline mr-1" /> {candidate.semanticScore} AI Match
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-slate-400 mb-3">{candidate.department} · {candidate.batchYear}</p>
                        <div className="flex flex-wrap gap-2">
                          {useSemanticSearch && candidate.reason && (
                             <p className="text-xs text-slate-500 mt-2">💡 {candidate.reason}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => setViewProfileId(candidate.id)} 
                          className="btn-secondary !py-2 text-sm whitespace-nowrap"
                        >
                          View Profile
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div key="jobs" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
            <div className="flex justify-end">
              <button onClick={() => setShowPostJob(true)} className="btn-primary">
                <Plus className="w-4 h-4" /> Post New Job
              </button>
            </div>
            <div className="grid lg:grid-cols-3 gap-6">
               <div className="lg:col-span-1 space-y-4">
                 <h2 className="text-lg font-bold text-white">Your Job Postings</h2>
                 {jobsData?.map((job: any) => (
                    <div 
                      key={job.id} 
                      onClick={() => setSelectedJob(job.id)}
                      className={`p-4 rounded-xl cursor-pointer border transition-colors ${selectedJob === job.id ? 'bg-brand-500/10 border-brand-500/30' : 'bg-surface border-surface-border hover:border-slate-700'}`}
                    >
                      <h3 className="text-md font-semibold text-white">{job.title}</h3>
                      <p className="text-xs text-slate-400 mb-2">{job.companyName}</p>
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span>{job._count?.applications || 0} Applicants</span>
                        <span className="text-emerald-400">{job.status}</span>
                      </div>
                    </div>
                 ))}
               </div>
               
               <div className="lg:col-span-2 glass-card p-6 min-h-[400px]">
                 {!selectedJob ? (
                    <div className="h-full flex items-center justify-center text-slate-500">
                      Select a job posting to view AI ranked candidates
                    </div>
                 ) : isLoadingRanked ? (
                    <div className="h-full flex items-center justify-center"><div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" /></div>
                 ) : rankedCandidates?.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-slate-500">No applicants yet.</div>
                 ) : (
                    <div className="space-y-4">
                      <h3 className="text-md font-bold text-white flex items-center gap-2 mb-4">
                        <Sparkles className="w-5 h-5 text-violet-400" /> AI Ranked Candidates
                      </h3>
                      {rankedCandidates.map((rc: any) => (
                         <div key={rc.candidateId} className="p-4 bg-surface border border-surface-border rounded-xl flex items-center justify-between">
                            <div>
                               <h4 className="text-sm font-bold text-white">{rc.candidate?.user?.name}</h4>
                               <p className="text-xs text-slate-400 mt-1">{rc.reason}</p>
                            </div>
                            <div className="text-right">
                               <div className="text-lg font-bold text-emerald-400">{rc.matchPercentage.toFixed(0)}% Match</div>
                               {rc.applicationStatus === 'SHORTLISTED' ? (
                                 <div className="text-xs text-brand-400 uppercase tracking-widest font-bold mt-1">SHORTLISTED</div>
                               ) : (
                                 <button 
                                   onClick={() => shortlistMutation.mutate({ jobId: selectedJob!, candidateId: rc.candidateId })}
                                   disabled={shortlistMutation.isPending}
                                   className="mt-2 text-xs px-3 py-1.5 rounded-lg bg-surface border border-surface-border text-white hover:bg-brand-500 hover:border-brand-500 transition-colors"
                                 >
                                   Shortlist
                                 </button>
                               )}
                            </div>
                         </div>
                      ))}
                    </div>
                 )}
               </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'shortlisted' && (
          <motion.div key="shortlisted" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
            <div className="glass-card p-8 text-center min-h-[400px] flex flex-col items-center justify-center border-emerald-500/20 bg-gradient-to-b from-surface to-emerald-500/5">
              <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center mb-6 border border-emerald-500/20 shadow-lg shadow-emerald-500/10">
                <Target className="w-10 h-10 text-emerald-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Shortlisted Talent Pool</h2>
              <p className="text-slate-400 max-w-lg mb-6">
                All candidates you have shortlisted across various job postings will appear here. Our backend system is synchronizing this global view. For now, view shortlisted candidates directly within individual Job Postings.
              </p>
              <button onClick={() => setActiveTab('jobs')} className="btn-primary !bg-emerald-500 hover:!bg-emerald-600">
                Go to Job Postings
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Post Job Modal */}
      <AnimatePresence>
        {showPostJob && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-background border border-surface-border p-6 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Post New Job</h2>
                <button onClick={() => setShowPostJob(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleCreateJob} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-slate-400 mb-1 block">Job Title</label>
                    <input required type="text" className="input-field w-full" value={jobForm.title} onChange={e => setJobForm({...jobForm, title: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-400 mb-1 block">Company Name</label>
                    <input required type="text" className="input-field w-full" value={jobForm.companyName} onChange={e => setJobForm({...jobForm, companyName: e.target.value})} />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-400 mb-1 block">Description</label>
                  <textarea required className="input-field w-full h-24" value={jobForm.description} onChange={e => setJobForm({...jobForm, description: e.target.value})} />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-400 mb-1 block">Required Skills (comma separated)</label>
                  <input required type="text" placeholder="React, Node.js, Typescript" className="input-field w-full" value={jobForm.requiredSkills} onChange={e => setJobForm({...jobForm, requiredSkills: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-slate-400 mb-1 block">Min CGPA</label>
                    <input required type="number" step="0.1" className="input-field w-full" value={jobForm.minCgpa} onChange={e => setJobForm({...jobForm, minCgpa: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-400 mb-1 block">Location</label>
                    <input required type="text" className="input-field w-full" value={jobForm.location} onChange={e => setJobForm({...jobForm, location: e.target.value})} />
                  </div>
                </div>
                <div className="pt-4 flex justify-end gap-3">
                  <button type="button" onClick={() => setShowPostJob(false)} className="px-4 py-2 text-sm text-slate-400 hover:text-white">Cancel</button>
                  <button type="submit" disabled={createJobMutation.isPending} className="btn-primary">
                    {createJobMutation.isPending ? 'Posting...' : 'Post Job'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* View Profile Modal */}
      <AnimatePresence>
        {viewProfileId && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-background border border-surface-border p-6 rounded-2xl w-full max-w-lg"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Candidate Profile</h2>
                <button onClick={() => setViewProfileId(null)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
              </div>
              
              {(() => {
                const candidate = candidatesToDisplay.find((c: any) => c.id === viewProfileId)
                if (!candidate) return <p>Candidate not found.</p>
                return (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 border-b border-surface-border pb-4">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-brand flex items-center justify-center text-2xl font-bold text-white">
                        {candidate.user?.name?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white">{candidate.user?.name}</h3>
                        <p className="text-sm text-slate-400">{candidate.department} · {candidate.batchYear}</p>
                        <p className="text-sm text-slate-400">{candidate.user?.email}</p>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wide">Academics</h4>
                      <p className="text-sm text-white">CGPA: <span className="font-bold">{candidate.currentCgpa}</span></p>
                      <p className="text-sm text-white">Tier: <span className="badge bg-surface mt-1">{candidate.tierCategory || 'N/A'}</span></p>
                    </div>

                    <div>
                      <h4 className="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wide">Skills</h4>
                      <div className="flex flex-wrap gap-2">
                        {candidate.studentSkills?.map((sk: any) => (
                          <span key={sk.id} className="px-2 py-1 bg-brand-500/10 border border-brand-500/20 text-brand-400 rounded text-xs">
                            {sk.skill?.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )
              })()}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
