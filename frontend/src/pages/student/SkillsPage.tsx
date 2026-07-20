import { useState } from 'react'
import { motion } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { studentApi } from '../../../services/endpoints'
import { Code2, Plus, Award, Loader2 } from 'lucide-react'

const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } }
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } }

const categories = ['Web Development', 'Backend', 'AI & Data Science', 'Core CS', 'Mobile', 'Cloud & DevOps', 'Soft Skills']

export default function SkillsPage() {
  const queryClient = useQueryClient()
  const { data, isLoading } = useQuery({
    queryKey: ['studentProfile'],
    queryFn: () => studentApi.getProfile().then((r) => r.data.data?.profile),
  })

  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', category: 'Web Development', proficiency: 3 })

  const addMutation = useMutation({
    mutationFn: (d: typeof form) => studentApi.addSkill(d),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['studentProfile'] })
      setShowForm(false)
      setForm({ name: '', category: 'Web Development', proficiency: 3 })
    },
  })

  const skills = data?.studentSkills || []
  const grouped = skills.reduce((acc: Record<string, any[]>, s: any) => {
    const cat = s.skill.category || 'Other'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(s)
    return acc
  }, {})

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
          <h1 className="section-title">Skills</h1>
          <p className="section-sub">Track and showcase your technical & soft skill proficiency</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          <Plus className="w-4 h-4" /> Add Skill
        </button>
      </motion.div>

      {showForm && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="glass-card p-5">
          <form onSubmit={(e) => { e.preventDefault(); addMutation.mutate(form) }} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Skill Name (e.g. React.js)" className="input-field" required />
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="input-field">
                {categories.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <div>
                <label className="text-[10px] text-slate-500 mb-1 block">Proficiency: {form.proficiency}/5</label>
                <input type="range" min="1" max="5" value={form.proficiency} onChange={(e) => setForm({ ...form, proficiency: parseInt(e.target.value) })} className="w-full accent-brand-500" />
              </div>
            </div>
            <div className="flex gap-2">
              <button type="submit" disabled={addMutation.isPending} className="btn-primary">
                {addMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Add Skill
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Grouped Skills */}
      {Object.entries(grouped).map(([category, categorySkills]) => (
        <motion.div key={category} variants={fadeUp} className="glass-card p-5">
          <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <Code2 className="w-4 h-4 text-brand-400" /> {category}
          </h3>
          <div className="grid gap-2">
            {(categorySkills as any[]).map((s: any) => (
              <div key={s.id} className="flex items-center justify-between p-3 rounded-xl bg-surface hover:bg-surface-hover transition-colors">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-white">{s.skill.name}</span>
                  {s.verifiedByFaculty && (
                    <span className="badge-success text-[10px]">
                      <Award className="w-2.5 h-2.5" /> Verified
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div
                        key={level}
                        className={`w-5 h-1.5 rounded-full transition-colors ${
                          level <= s.proficiency ? 'bg-brand-500' : 'bg-surface-border'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-[10px] text-slate-500 w-6 text-right">{s.proficiency}/5</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      ))}

      {skills.length === 0 && !showForm && (
        <div className="glass-card p-10 text-center">
          <Code2 className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-sm text-slate-400">No skills added yet. Start by adding your core competencies.</p>
        </div>
      )}
    </motion.div>
  )
}
