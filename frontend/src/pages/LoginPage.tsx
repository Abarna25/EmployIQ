import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuthStore } from '../../store/authStore'
import { BrainCircuit, Mail, Lock, Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react'

export default function LoginPage() {
  const navigate = useNavigate()
  const { login, isLoading } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      await login(email, password)
      navigate('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Login failed')
    }
  }

  return (
    <div className="min-h-screen flex bg-surface bg-gradient-hero">
      {/* Left Panel — Branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-center px-16 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-20 w-72 h-72 bg-brand-500 rounded-full blur-[120px]" />
          <div className="absolute bottom-32 right-20 w-60 h-60 bg-accent-violet rounded-full blur-[100px]" />
        </div>
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10"
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-gradient-brand flex items-center justify-center">
              <BrainCircuit className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">EmployIQ</h1>
              <p className="text-xs text-slate-400">Predictive Intelligence Platform</p>
            </div>
          </div>
          <h2 className="text-4xl font-bold text-white leading-tight mb-4">
            AI-Powered<br />
            <span className="text-gradient">Employability</span><br />
            Intelligence
          </h2>
          <p className="text-slate-400 text-sm max-w-md leading-relaxed">
            Compile your academic portfolio, track coding achievements, build ATS-ready resumes, 
            and receive AI-driven employability predictions powered by machine learning models.
          </p>
          <div className="flex gap-6 mt-10">
            {[
              { label: 'Students Placed', val: '2,400+' },
              { label: 'Partner Companies', val: '180+' },
              { label: 'Avg. ATS Score', val: '87%' },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-xl font-bold text-white">{s.val}</p>
                <p className="text-[10px] text-slate-500 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Right Panel — Login Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-10 justify-center">
            <div className="w-10 h-10 rounded-xl bg-gradient-brand flex items-center justify-center">
              <BrainCircuit className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-white">EmployIQ</h1>
          </div>

          <div className="glass-card p-8">
            <h3 className="text-xl font-bold text-white mb-1">Welcome back</h3>
            <p className="text-sm text-slate-400 mb-6">Sign in to access your dashboard</p>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
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
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="input-field pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full justify-center mt-2"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><span>Sign In</span><ArrowRight className="w-4 h-4" /></>}
              </button>
            </form>

            {/* Demo Accounts */}
            <div className="mt-6 pt-5 border-t border-surface-border">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-3">Quick Demo Access</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'Student', email: 'student@employiq.ai' },
                  { label: 'Faculty', email: 'faculty@employiq.ai' },
                  { label: 'Recruiter', email: 'recruiter@employiq.ai' },
                  { label: 'Admin', email: 'admin@employiq.ai' },
                ].map((demo) => (
                  <button
                    key={demo.email}
                    type="button"
                    onClick={() => {
                      setEmail(demo.email)
                      setPassword('password123')
                    }}
                    className="text-[11px] py-1.5 px-2 rounded-lg border border-surface-border text-slate-400 hover:border-brand-500 hover:text-white transition-colors"
                  >
                    {demo.label}
                  </button>
                ))}
              </div>
            </div>

            <p className="text-center text-xs text-slate-500 mt-6">
              Don't have an account?{' '}
              <Link to="/register" className="text-brand-400 hover:text-brand-300 font-medium">
                Create one
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
