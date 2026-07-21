import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery, useMutation } from '@tanstack/react-query'
import { api } from '@/services/api'
import { BookOpen, Loader2, PlayCircle, CheckCircle2, Circle } from 'lucide-react'

export default function LearningRoadmap() {
  const roadmapMutation = useMutation({
    mutationFn: () => api.get('/intelligence/roadmap').then(r => r.data.data),
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="section-title">AI Learning Roadmap</h1>
          <p className="section-sub">Personalized upskilling path based on your skill gaps</p>
        </div>
        <button
          onClick={() => roadmapMutation.mutate()}
          disabled={roadmapMutation.isPending}
          className="btn-primary"
        >
          {roadmapMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <BookOpen className="w-4 h-4" />}
          Generate Roadmap
        </button>
      </div>

      <div className="glass-card p-6">
        {!roadmapMutation.data && !roadmapMutation.isPending && (
           <div className="py-20 text-center text-slate-500">
             <BookOpen className="w-12 h-12 text-slate-700 mx-auto mb-4" />
             <p>Generate a roadmap to see your personalized 4-week upskilling plan</p>
           </div>
        )}

        {roadmapMutation.isPending && (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-brand-500 mb-4" />
            <p>AI is analyzing your skill gaps and crafting a roadmap...</p>
          </div>
        )}

        {roadmapMutation.data && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
            <div className="flex items-center justify-between bg-brand-500/10 border border-brand-500/20 rounded-xl p-4">
               <div>
                 <p className="text-xs text-brand-400 font-bold uppercase">Target Role</p>
                 <p className="text-lg font-bold text-white">{roadmapMutation.data.targetRole}</p>
               </div>
               <div className="text-right">
                 <p className="text-xs text-slate-400 uppercase">Progress</p>
                 <p className="text-lg font-bold text-white">{roadmapMutation.data.progress}%</p>
               </div>
            </div>

            <div className="relative border-l border-surface-border ml-4 space-y-8 pb-4">
              {roadmapMutation.data.roadmapSteps.map((step: any, index: number) => (
                 <div key={index} className="relative pl-8">
                   <div className={`absolute -left-3 top-1 bg-background rounded-full p-1 border-2 ${step.status === 'completed' ? 'border-emerald-500 text-emerald-500' : 'border-surface-border text-slate-500'}`}>
                      {step.status === 'completed' ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                   </div>
                   
                   <h3 className="text-sm font-bold text-brand-400 mb-1">Week {step.week}</h3>
                   <div className="bg-surface border border-surface-border rounded-xl p-4">
                      <p className="text-white font-medium mb-3">{step.topic}</p>
                      
                      <button className="text-xs flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors">
                        <PlayCircle className="w-4 h-4 text-brand-500" /> Start Module
                      </button>
                   </div>
                 </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
