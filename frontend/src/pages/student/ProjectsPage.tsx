import { useState } from 'react'
import { motion } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { studentApi } from '@/services/endpoints'
import { FolderGit2, Plus, Trash2, ExternalLink, Github, Star, Loader2 } from 'lucide-react'

const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } }
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } }

export default function ProjectsPage() {
  const queryClient = useQueryClient()
  const { data, isLoading } = useQuery({
    queryKey: ['studentProfile'],
    queryFn: () => studentApi.getProfile().then((r: any) => r.data.data?.profile),
  })

  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', techStack: '', repoUrl: '', liveUrl: '' })

  const addMutation = useMutation({
    mutationFn: (d: typeof form) =>
      studentApi.addProject({ ...d, techStack: d.techStack.split(',').map((s: any) => s.trim()) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['studentProfile'] })
      setShowForm(false)
      setForm({ title: '', description: '', techStack: '', repoUrl: '', liveUrl: '' })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => studentApi.deleteProject(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['studentProfile'] }),
  })

  const projects = data?.projects || []

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
          <h1 className="section-title">Projects</h1>
          <p className="section-sub">Showcase your technical projects and contributions</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          <Plus className="w-4 h-4" /> Add Project
        </button>
      </motion.div>

      {/* Add Form */}
      {showForm && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="glass-card p-5">
          <h3 className="text-sm font-semibold text-white mb-4">New Project</h3>
          <form
            onSubmit={(e) => { e.preventDefault(); addMutation.mutate(form) }}
            className="space-y-3"
          >
            <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Project Title" className="input-field" required />
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Describe what you built, the problem it solves, and your role..." rows={3} className="input-field resize-none" required />
            <input type="text" value={form.techStack} onChange={(e) => setForm({ ...form, techStack: e.target.value })} placeholder="Tech Stack (comma-separated): React, Node.js, PostgreSQL" className="input-field" required />
            <div className="grid grid-cols-2 gap-3">
              <input type="url" value={form.repoUrl} onChange={(e) => setForm({ ...form, repoUrl: e.target.value })} placeholder="GitHub Repo URL" className="input-field" />
              <input type="url" value={form.liveUrl} onChange={(e) => setForm({ ...form, liveUrl: e.target.value })} placeholder="Live Demo URL" className="input-field" />
            </div>
            <div className="flex gap-2">
              <button type="submit" disabled={addMutation.isPending} className="btn-primary">
                {addMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Save Project
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Projects Grid */}
      <motion.div variants={fadeUp} className="grid gap-4 md:grid-cols-2">
        {projects.map((project: any) => (
          <motion.div
            key={project.id}
            whileHover={{ y: -2 }}
            className="glass-card p-5 group"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-brand-500/15 flex items-center justify-center">
                  <FolderGit2 className="w-4 h-4 text-brand-400" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">{project.title}</h3>
                  {project.starsCount > 0 && (
                    <span className="text-[10px] text-amber-400 flex items-center gap-0.5">
                      <Star className="w-2.5 h-2.5" /> {project.starsCount}
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => deleteMutation.mutate(project.id)}
                className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

            <p className="text-xs text-slate-400 mb-3 line-clamp-2">{project.description}</p>

            <div className="flex flex-wrap gap-1.5 mb-3">
              {project.techStack?.map((tech: string) => (
                <span key={tech} className="badge-brand text-[10px]">{tech}</span>
              ))}
            </div>

            <div className="flex gap-2">
              {project.repoUrl && (
                <a href={project.repoUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-brand-400 transition-colors">
                  <Github className="w-3 h-3" /> Repository
                </a>
              )}
              {project.liveUrl && (
                <a href={project.liveUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-cyan-400 transition-colors">
                  <ExternalLink className="w-3 h-3" /> Live Demo
                </a>
              )}
            </div>
          </motion.div>
        ))}
      </motion.div>

      {projects.length === 0 && !showForm && (
        <div className="glass-card p-10 text-center">
          <FolderGit2 className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-sm text-slate-400">No projects yet. Click "Add Project" to get started.</p>
        </div>
      )}
    </motion.div>
  )
}
