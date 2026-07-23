import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery, useMutation } from '@tanstack/react-query'
import { api } from '@/services/api'
import { BookOpen, Loader2, PlayCircle, CheckCircle2, Circle, X, Play } from 'lucide-react'

export default function LearningRoadmap() {
  const [activeModule, setActiveModule] = useState<any>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [completedStepIds, setCompletedStepIds] = useState<Set<number>>(new Set())

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
              {roadmapMutation.data.roadmapSteps.map((step: any, index: number) => {
                 const isCompleted = step.isCompleted || completedStepIds.has(step.id);
                 return (
                 <div key={index} className="relative pl-8">
                   <div className={`absolute -left-3 top-1 bg-background rounded-full p-1 border-2 ${isCompleted ? 'border-emerald-500 text-emerald-500' : 'border-surface-border text-slate-500'}`}>
                      {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                   </div>
                   
                   <h3 className="text-sm font-bold text-brand-400 mb-1">Week {index + 1}</h3>
                   <div className="bg-surface border border-surface-border rounded-xl p-4">
                      <p className="text-white font-medium mb-1">{step.title}</p>
                      <p className="text-sm text-slate-400 mb-3">{step.description}</p>
                      
                      <button 
                        onClick={() => { setActiveModule(step); setIsPlaying(false); }}
                        className="text-xs flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors"
                      >
                        <PlayCircle className="w-4 h-4 text-brand-500" /> Start Module
                      </button>
                   </div>
                 </div>
                 );
              })}
            </div>
          </motion.div>
        )}
      </div>

      {/* Module Player Modal */}
      <AnimatePresence>
        {activeModule && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-surface border border-surface-border p-6 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-white">{activeModule.title}</h2>
                  <p className="text-sm text-slate-400">{activeModule.description}</p>
                </div>
                <button onClick={() => setActiveModule(null)} className="p-2 rounded-lg bg-surface-hover text-slate-400 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              {/* Video Player */}
              <div className="w-full aspect-video bg-black border border-surface-border rounded-xl flex flex-col items-center justify-center relative overflow-hidden group mb-4">
                {isPlaying ? (
                  <iframe 
                    className="w-full h-full"
                    src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1" 
                    title="Interactive Video Lesson" 
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen
                  />
                ) : (
                  <>
                    <div className="absolute inset-0 bg-gradient-brand opacity-10 group-hover:opacity-20 transition-opacity" />
                    <button 
                      onClick={() => setIsPlaying(true)}
                      className="w-16 h-16 rounded-full bg-brand-500/20 text-brand-500 flex items-center justify-center mb-2 hover:scale-110 hover:bg-brand-500 hover:text-white transition-all shadow-lg shadow-brand-500/20 border border-brand-500/30"
                    >
                      <Play className="w-8 h-8 ml-1" />
                    </button>
                    <p className="text-slate-400 text-sm font-medium">Interactive AI Lesson Module</p>
                  </>
                )}
              </div>

              <div className="flex justify-end gap-3">
                <button onClick={() => setActiveModule(null)} className="btn-secondary">Close</button>
                <button 
                  onClick={() => {
                    setCompletedStepIds(prev => new Set(prev).add(activeModule.id));
                    setActiveModule(null);
                  }} 
                  className="btn-primary flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" /> Mark as Completed
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
