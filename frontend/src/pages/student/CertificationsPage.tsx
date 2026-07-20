import { useState } from 'react'
import { motion } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/services/api'
import { Award, Plus, Trash2, Calendar, ExternalLink, Loader2 } from 'lucide-react'

const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } }
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } }

export default function CertificationsPage() {
  const queryClient = useQueryClient()
  const { data: certifications, isLoading } = useQuery({
    queryKey: ['studentCertifications'],
    queryFn: () => api.get('/portfolio/certifications').then((r: any) => r.data.data?.certifications || []),
  })

  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', issuer: '', issueDate: '', expiryDate: '', credentialUrl: '' })

  const addMutation = useMutation({
    mutationFn: (d: typeof form) => api.post('/portfolio/certifications', d),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['studentCertifications'] })
      setShowForm(false)
      setForm({ title: '', issuer: '', issueDate: '', expiryDate: '', credentialUrl: '' })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/portfolio/certifications/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['studentCertifications'] }),
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
          <h1 className="section-title">Certifications</h1>
          <p className="section-sub">Showcase your verified professional certifications</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          <Plus className="w-4 h-4" /> Add Certification
        </button>
      </motion.div>

      {showForm && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="glass-card p-5">
          <form onSubmit={(e) => { e.preventDefault(); addMutation.mutate(form) }} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Certification Title</label>
                <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input-field" placeholder="e.g. AWS Certified Solutions Architect" required />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Issuing Organization</label>
                <input type="text" value={form.issuer} onChange={(e) => setForm({ ...form, issuer: e.target.value })} className="input-field" placeholder="e.g. Amazon Web Services" required />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Issue Date</label>
                <input type="month" value={form.issueDate} onChange={(e) => setForm({ ...form, issueDate: e.target.value })} className="input-field" required />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Expiry Date (Optional)</label>
                <input type="month" value={form.expiryDate} onChange={(e) => setForm({ ...form, expiryDate: e.target.value })} className="input-field" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Credential URL</label>
              <input type="url" value={form.credentialUrl} onChange={(e) => setForm({ ...form, credentialUrl: e.target.value })} className="input-field" placeholder="https://..." />
            </div>

            <div className="flex gap-2">
              <button type="submit" disabled={addMutation.isPending} className="btn-primary">
                {addMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Save Certification
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
            </div>
          </form>
        </motion.div>
      )}

      <motion.div variants={fadeUp} className="grid gap-4 md:grid-cols-2">
        {certifications.map((cert: any) => (
          <div key={cert.id} className="glass-card p-5 group">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center">
                  <Award className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white leading-tight">{cert.title}</h3>
                  <p className="text-xs text-slate-400">{cert.issuer}</p>
                </div>
              </div>
              <button
                onClick={() => deleteMutation.mutate(cert.id)}
                className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex items-center gap-4 text-xs text-slate-400 mb-4">
              <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Issued: {new Date(cert.issueDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
              {cert.expiryDate && (
                <span className="flex items-center gap-1">Expires: {new Date(cert.expiryDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
              )}
            </div>

            {cert.credentialUrl && (
              <a href={cert.credentialUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-xs text-brand-400 hover:text-brand-300 font-medium transition-colors">
                Verify Credential <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        ))}
      </motion.div>

      {certifications.length === 0 && !showForm && (
        <div className="glass-card p-10 text-center">
          <Award className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-sm text-slate-400">No certifications added yet.</p>
        </div>
      )}
    </motion.div>
  )
}
