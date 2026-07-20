import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { studentApi } from '@/services/endpoints'
import { User, Linkedin, Github, Globe, BookOpen, Save, Loader2, MapPin, GraduationCap } from 'lucide-react'

const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } }
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } }

export default function ProfilePage() {
  const queryClient = useQueryClient()
  const { data, isLoading } = useQuery({
    queryKey: ['studentProfile'],
    queryFn: () => studentApi.getProfile().then((r: any) => r.data.data?.profile),
  })

  const [form, setForm] = useState({
    bio: '',
    linkedinUrl: '',
    githubUrl: '',
    portfolioUrl: '',
    department: '',
    batchYear: 2026,
  })

  useEffect(() => {
    if (data) {
      setForm({
        bio: data.bio || '',
        linkedinUrl: data.linkedinUrl || '',
        githubUrl: data.githubUrl || '',
        portfolioUrl: data.portfolioUrl || '',
        department: data.department || '',
        batchYear: data.batchYear || 2026,
      })
    }
  }, [data])

  const mutation = useMutation({
    mutationFn: (d: typeof form) => studentApi.updateProfile(d),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['studentProfile'] })
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    mutation.mutate(form)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6 max-w-3xl">
      <motion.div variants={fadeUp}>
        <h1 className="section-title">My Profile</h1>
        <p className="section-sub">Manage your personal information and academic details</p>
      </motion.div>

      {/* Profile Header Card */}
      <motion.div variants={fadeUp} className="glass-card p-6">
        <div className="flex items-start gap-5">
          <div className="w-20 h-20 rounded-2xl bg-gradient-brand flex items-center justify-center text-2xl font-bold text-white shrink-0">
            {data?.user?.name?.charAt(0) || 'S'}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-white">{data?.user?.name || 'Student'}</h2>
            <p className="text-sm text-slate-400">{data?.user?.email}</p>
            <div className="flex flex-wrap gap-3 mt-3">
              <span className="badge-brand">
                <GraduationCap className="w-3 h-3" /> {data?.registerNumber}
              </span>
              <span className="badge-info">
                <MapPin className="w-3 h-3" /> {data?.department}
              </span>
              <span className="badge-success">
                CGPA {data?.currentCgpa?.toFixed(2)}
              </span>
              {data?.tierCategory && (
                <span className="badge-warning">{data.tierCategory}</span>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Edit Form */}
      <motion.div variants={fadeUp} className="glass-card p-6">
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <User className="w-4 h-4 text-brand-400" /> Edit Profile
        </h3>

        {mutation.isSuccess && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs">
            ✓ Profile updated successfully!
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Bio / Summary</label>
            <textarea
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              rows={3}
              className="input-field resize-none"
              placeholder="Write a short professional summary..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Department</label>
              <div className="relative">
                <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={form.department}
                  onChange={(e) => setForm({ ...form, department: e.target.value })}
                  className="input-field pl-10"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Batch Year</label>
              <input
                type="number"
                value={form.batchYear}
                onChange={(e) => setForm({ ...form, batchYear: parseInt(e.target.value) })}
                className="input-field"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">LinkedIn URL</label>
              <div className="relative">
                <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input type="url" value={form.linkedinUrl} onChange={(e) => setForm({ ...form, linkedinUrl: e.target.value })} className="input-field pl-10" placeholder="https://linkedin.com/in/..." />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">GitHub URL</label>
              <div className="relative">
                <Github className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input type="url" value={form.githubUrl} onChange={(e) => setForm({ ...form, githubUrl: e.target.value })} className="input-field pl-10" placeholder="https://github.com/..." />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Portfolio URL</label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input type="url" value={form.portfolioUrl} onChange={(e) => setForm({ ...form, portfolioUrl: e.target.value })} className="input-field pl-10" placeholder="https://your-site.dev" />
              </div>
            </div>
          </div>

          <button type="submit" disabled={mutation.isPending} className="btn-primary">
            {mutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Save Changes</span>
          </button>
        </form>
      </motion.div>

      {/* Quick Stats */}
      <motion.div variants={fadeUp} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: '10th Marks', value: data?.tenthMarks ? `${data.tenthMarks}%` : 'N/A' },
          { label: '12th Marks', value: data?.twelfthMarks ? `${data.twelfthMarks}%` : 'N/A' },
          { label: 'ATS Score', value: data?.atsScore ? `${data.atsScore}%` : 'N/A' },
          { label: 'Skills Count', value: data?.studentSkills?.length || 0 },
        ].map((s: any) => (
          <div key={s.label} className="glass-card p-4 text-center">
            <p className="text-lg font-bold text-white">{s.value}</p>
            <p className="text-[10px] text-slate-500">{s.label}</p>
          </div>
        ))}
      </motion.div>
    </motion.div>
  )
}
