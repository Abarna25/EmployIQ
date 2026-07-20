import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuthStore } from '@/store/authStore'
import { UserRole } from '@/types'
import { BrainCircuit, Mail, Lock, User, ArrowRight, Loader2, GraduationCap, Building2, Briefcase, Shield } from 'lucide-react'

const roles: Array<{ value: UserRole; label: string; icon: any; desc: string }> = [
  { value: 'STUDENT', label: 'Student', icon: GraduationCap, desc: 'Build your portfolio & track employability' },
  { value: 'FACULTY', label: 'Faculty', icon: User, desc: 'Mentor students & validate skills' },
  { value: 'RECRUITER', label: 'Recruiter', icon: Briefcase, desc: 'Discover & shortlist top talent' },
  { value: 'PLACEMENT_OFFICER', label: 'Placement Officer', icon: Building2, desc: 'Manage campus placement drives' },
  { value: 'ADMIN', label: 'Administrator', icon: Shield, desc: 'System-wide configuration & analytics' },
]

export default function RegisterPage() {
  const navigate = useNavigate()
  const { register, isLoading } = useAuthStore()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [selectedRole, setSelectedRole] = useState<UserRole>('STUDENT')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      await register({ name, email, password, role: selectedRole })
      navigate('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Registration failed')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface bg-gradient-hero px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg"
      >
        <div className="flex items-center gap-3 mb-8 justify-center">
          <div className="w-10 h-10 rounded-xl bg-gradient-brand flex items-center justify-center">
            <BrainCircuit className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-bold text-white">EmployIQ</h1>
        </div>

        <div className="glass-card p-8">
          <h3 className="text-xl font-bold text-white mb-1">Create your account</h3>
          <p className="text-sm text-slate-400 mb-6">Join the AI-powered employability platform</p>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Role Selector */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-2">Select your role</label>
              <div className="grid grid-cols-2 gap-2">
                {roles.map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setSelectedRole(r.value)}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all text-xs ${
                      selectedRole === r.value
                        ? 'border-brand-500 bg-brand-500/10 text-white'
                        : 'border-surface-border text-slate-400 hover:border-surface-hover'
                    }`}
                  >
                    <r.icon className="w-4 h-4 shrink-0" />
                    <span className="font-medium">{r.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Alex Rivera"
                  className="input-field pl-10"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@university.edu"
                  className="input-field pl-10"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  className="input-field pl-10"
                  minLength={6}
                  required
                />
              </div>
            </div>

            <button type="submit" disabled={isLoading} className="btn-primary w-full justify-center mt-2">
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-xs text-slate-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-400 hover:text-brand-300 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
