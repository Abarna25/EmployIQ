import { useState } from 'react'
import { motion } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/services/api'
import { Briefcase, Plus, Trash2, Calendar, MapPin, Loader2, Building2 } from 'lucide-react'

const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } }
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } }

export default function ExperiencesPage() {
  const queryClient = useQueryClient()
  const { data: experiences, isLoading } = useQuery({
    queryKey: ['studentExperiences'],
    queryFn: () => api.get('/portfolio/experiences').then((r: any) => r.data.data?.experiences || []),
  })

  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ companyName: '', role: '', type: 'Internship', startDate: '', endDate: '', description: '' })

  const addMutation = useMutation({
    mutationFn: (d: typeof form) => api.post('/portfolio/experiences', d),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['studentExperiences'] })
      setShowForm(false)
      setForm({ companyName: '', role: '', type: 'Internship', startDate: '', endDate: '', description: '' })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/portfolio/experiences/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['studentExperiences'] }),
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={fadeUp} className="flex items-center justify-between">
        <div>
          <h1 className="section-title">Experience</h1>
          <p className="section-sub">Add your internships, full-time roles, and freelance work</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          <Plus className="w-4 h-4" /> Add Experience
        </button>
      </motion.div>

      {showForm && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="glass-card p-5">
          <form onSubmit={(e) => { e.preventDefault(); addMutation.mutate(form) }} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Company Name</label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input type="text" value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} className="input-field pl-10" required />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Role / Title</label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input type="text" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="input-field pl-10" required />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Type</label>
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="input-field">
                  <option>Internship</option>
                  <option>Full-time</option>
                  <option>Part-time</option>
                  <option>Freelance</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Start Date</label>
                  <input type="month" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className="input-field" required />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">End Date</label>
                  <input type="month" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} className="input-field" />
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Description (Responsibilities & Achievements)</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={4} className="input-field resize-none" required />
            </div>

            <div className="flex gap-2">
              <button type="submit" disabled={addMutation.isPending} className="btn-primary">
                {addMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Save Experience
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
            </div>
          </form>
        </motion.div>
      )}

      <motion.div variants={fadeUp} className="space-y-4">
        {experiences.map((exp: any) => (
          <div key={exp.id} className="glass-card p-5 group">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-500/15 flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-brand-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">{exp.role}</h3>
                  <p className="text-sm text-brand-300 font-medium">{exp.companyName}</p>
                </div>
              </div>
              <button
                onClick={() => deleteMutation.mutate(exp.id)}
                className="opacity-0 group-hover:opacity-100 p-2 rounded-lg text-rose-400 hover:bg-rose-500/10 transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex flex-wrap gap-4 mt-3 mb-4 text-xs text-slate-400">
              <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {new Date(exp.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} - {exp.endDate ? new Date(exp.endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Present'}</span>
              <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {exp.type}</span>
            </div>

            <p className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">{exp.description}</p>
          </div>
        ))}
      </motion.div>

      {experiences.length === 0 && !showForm && (
        <div className="glass-card p-10 text-center">
          <Briefcase className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-sm text-slate-400">No experience added yet. Internships and jobs will appear here.</p>
        </div>
      )}
    </motion.div>
  )
}
