import { motion } from 'framer-motion'

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: React.ReactNode
  trend?: { value: string; positive: boolean }
  color?: 'brand' | 'cyan' | 'amber' | 'rose' | 'emerald'
}

const colorMap = {
  brand:   'from-brand-500/20 to-brand-600/5 border-brand-500/30',
  cyan:    'from-cyan-500/20 to-cyan-600/5 border-cyan-500/30',
  amber:   'from-amber-500/20 to-amber-600/5 border-amber-500/30',
  rose:    'from-rose-500/20 to-rose-600/5 border-rose-500/30',
  emerald: 'from-emerald-500/20 to-emerald-600/5 border-emerald-500/30',
}

const iconBg = {
  brand:   'bg-brand-500/20 text-brand-400',
  cyan:    'bg-cyan-500/20 text-cyan-400',
  amber:   'bg-amber-500/20 text-amber-400',
  rose:    'bg-rose-500/20 text-rose-400',
  emerald: 'bg-emerald-500/20 text-emerald-400',
}

export default function StatCard({ title, value, subtitle, icon, trend, color = 'brand' }: StatCardProps) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className={`rounded-2xl border bg-gradient-to-br p-5 ${colorMap[color]} transition-shadow hover:shadow-glow-sm`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{title}</p>
          <p className="text-2xl font-bold text-white mt-1.5">{value}</p>
          {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
          {trend && (
            <p className={`text-xs mt-2 font-medium ${trend.positive ? 'text-emerald-400' : 'text-rose-400'}`}>
              {trend.positive ? '↑' : '↓'} {trend.value}
            </p>
          )}
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconBg[color]}`}>
          {icon}
        </div>
      </div>
    </motion.div>
  )
}
