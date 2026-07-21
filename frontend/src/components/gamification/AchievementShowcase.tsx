import { motion } from 'framer-motion'
import { Award, Star, Zap, Code2, FolderGit2, Trophy } from 'lucide-react'

interface Achievement {
  id: string
  badgeName: string
  description: string
  icon: string
  earnedAt: string
}

interface AchievementShowcaseProps {
  achievements: Achievement[]
}

const getIcon = (iconStr: string, className: string) => {
  switch (iconStr) {
    case 'Star': return <Star className={className} />
    case 'Zap': return <Zap className={className} />
    case 'Code2': return <Code2 className={className} />
    case 'FolderGit2': return <FolderGit2 className={className} />
    case 'Trophy': return <Trophy className={className} />
    default: return <Award className={className} />
  }
}

export default function AchievementShowcase({ achievements }: AchievementShowcaseProps) {
  if (!achievements || achievements.length === 0) return null

  return (
    <div className="glass-card p-5">
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="w-5 h-5 text-amber-400" />
        <h3 className="text-sm font-semibold text-white">Your Achievements</h3>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-2 custom-scrollbar">
        {achievements.map((ach) => (
          <motion.div 
            key={ach.id} 
            whileHover={{ scale: 1.05 }}
            className="flex-shrink-0 w-32 p-4 rounded-2xl bg-surface border border-surface-border flex flex-col items-center justify-center gap-3 relative overflow-hidden group"
          >
            {/* Glow effect */}
            <div className="absolute inset-0 bg-brand-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <div className="w-12 h-12 rounded-full bg-brand-500/20 flex items-center justify-center text-brand-400 border border-brand-500/30 z-10 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
              {getIcon(ach.icon, "w-6 h-6")}
            </div>
            
            <div className="text-center z-10">
              <h4 className="text-xs font-bold text-white mb-1 line-clamp-2 leading-tight">{ach.badgeName}</h4>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
