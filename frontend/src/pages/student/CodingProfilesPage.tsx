import { useState } from 'react'
import { motion } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/services/api'
import { Code2, Plus, RefreshCw, Trophy, Hash, Flame, Loader2 } from 'lucide-react'

const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } }
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } }

const platformMeta: Record<string, { color: string; icon: string }> = {
  LeetCode: { color: 'from-amber-500/20 to-amber-600/5 border-amber-500/30', icon: '🟠' },
  Codeforces: { color: 'from-blue-500/20 to-blue-600/5 border-blue-500/30', icon: '🔵' },
  GitHub: { color: 'from-slate-500/20 to-slate-600/5 border-slate-500/30', icon: '⬛' },
  CodeChef: { color: 'from-amber-700/20 to-amber-800/5 border-amber-700/30', icon: '🟤' },
  HackerRank: { color: 'from-emerald-500/20 to-emerald-600/5 border-emerald-500/30', icon: '🟢' },
  GeeksforGeeks: { color: 'from-green-500/20 to-green-600/5 border-green-500/30', icon: '🟩' },
}

export default function CodingProfilesPage() {
  const queryClient = useQueryClient()
  const { data, isLoading } = useQuery({
    queryKey: ['studentProfile'],
    queryFn: () => api.get('/students/profile').then((r: any) => r.data.data?.profile),
  })

  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ platform: 'LeetCode', username: '' })
  const [syncResult, setSyncResult] = useState<string | null>(null)

  const syncMutation = useMutation({
    mutationFn: (d: typeof form) => api.post('/coding-profiles/sync', d),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['studentProfile'] })
      setSyncResult(`✓ ${res.data.message}`)
      setShowForm(false)
      setForm({ platform: 'LeetCode', username: '' })
    },
    onError: (err: any) => {
      setSyncResult(`✗ ${err.response?.data?.message || 'Sync failed'}`)
    },
  })

  const profiles = data?.codingProfiles || []

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
          <h1 className="section-title">Coding Profiles</h1>
          <p className="section-sub">Connect your competitive programming & GitHub accounts</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          <Plus className="w-4 h-4" /> Connect Platform
        </button>
      </motion.div>

      {syncResult && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className={`p-3 rounded-xl text-xs border ${syncResult.startsWith('✓') ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-rose-500/10 border-rose-500/30 text-rose-400'}`}
        >
          {syncResult}
        </motion.div>
      )}

      {showForm && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="glass-card p-5">
          <form onSubmit={(e) => { e.preventDefault(); syncMutation.mutate(form) }} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <select value={form.platform} onChange={(e) => setForm({ ...form, platform: e.target.value })} className="input-field">
                {['LeetCode', 'Codeforces', 'GitHub', 'CodeChef', 'HackerRank', 'GeeksforGeeks'].map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
              <input type="text" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} placeholder="Your username on the platform" className="input-field" required />
            </div>
            <div className="flex gap-2">
              <button type="submit" disabled={syncMutation.isPending} className="btn-primary">
                {syncMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                Fetch & Sync
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Profile Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {profiles.map((profile: any) => {
          const meta = platformMeta[profile.platform] || platformMeta.LeetCode
          return (
            <motion.div
              key={profile.id}
              variants={fadeUp}
              whileHover={{ y: -2 }}
              className={`rounded-2xl border bg-gradient-to-br p-5 ${meta.color} transition-shadow hover:shadow-glow-sm`}
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">{meta.icon}</span>
                <div>
                  <h3 className="text-sm font-bold text-white">{profile.platform}</h3>
                  <p className="text-[10px] text-slate-400">@{profile.username}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2">
                  <Trophy className="w-3.5 h-3.5 text-amber-400" />
                  <div>
                    <p className="text-sm font-bold text-white">{profile.rating}</p>
                    <p className="text-[10px] text-slate-500">Rating</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Hash className="w-3.5 h-3.5 text-cyan-400" />
                  <div>
                    <p className="text-sm font-bold text-white">{profile.problemsSolved}</p>
                    <p className="text-[10px] text-slate-500">Solved</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Code2 className="w-3.5 h-3.5 text-brand-400" />
                  <div>
                    <p className="text-sm font-bold text-white">{profile.globalRank || '—'}</p>
                    <p className="text-[10px] text-slate-500">Rank</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Flame className="w-3.5 h-3.5 text-rose-400" />
                  <div>
                    <p className="text-sm font-bold text-white">{profile.streak || 0}</p>
                    <p className="text-[10px] text-slate-500">Streak</p>
                  </div>
                </div>
              </div>

              <p className="text-[9px] text-slate-500 mt-3">
                Last synced: {new Date(profile.verifiedAt).toLocaleDateString()}
              </p>
            </motion.div>
          )
        })}
      </div>

      {profiles.length === 0 && !showForm && (
        <div className="glass-card p-10 text-center">
          <Code2 className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-sm text-slate-400">No coding profiles connected. Link your competitive programming accounts to boost your employability score.</p>
        </div>
      )}
    </motion.div>
  )
}
