import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/services/api'
import { MessageSquare, Zap, Star, ShieldAlert, CheckCircle2, PlayCircle, AlertTriangle, X, Camera, Mic } from 'lucide-react'
import ProgressRing from '@/components/ui/ProgressRing'

const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } }
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } }

export default function InterviewReadiness() {
  const [showMockInterview, setShowMockInterview] = useState(false)
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0)
  const [timer, setTimer] = useState(0)
  const [isRecording, setIsRecording] = useState(false)
  const [interviewFinished, setInterviewFinished] = useState(false)

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isRecording) {
      interval = setInterval(() => setTimer(t => t + 1), 1000)
    }
    return () => clearInterval(interval)
  }, [isRecording])

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60)
    const s = secs % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }
  const { data, isLoading } = useQuery({
    queryKey: ['interviewReadiness'],
    queryFn: () => api.get('/intelligence/interview-readiness').then((r: any) => r.data.data),
  })

  if (isLoading) {
    return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" /></div>
  }

  return (
    <>
      <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={fadeUp} className="flex flex-col sm:flex-row justify-between sm:items-end gap-4">
        <div>
          <h1 className="section-title">Interview Readiness</h1>
          <p className="section-sub">AI-driven insights and customized mock interview prep</p>
        </div>
        <button 
          onClick={() => {
            setShowMockInterview(true);
            setCurrentQuestionIdx(0);
            setTimer(0);
            setIsRecording(false);
            setInterviewFinished(false);
          }}
          className="btn-primary animate-pulse shadow-[0_0_15px_rgba(99,102,241,0.5)]"
        >
          <PlayCircle className="w-4 h-4" /> Start Mock Interview
        </button>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Score Overview */}
        <motion.div variants={fadeUp} className="glass-card p-6 flex flex-col items-center justify-center text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4">
            <Zap className="w-6 h-6 text-brand-500/20" />
          </div>
          <h2 className="text-sm font-semibold text-white mb-6 uppercase tracking-wider">Overall Readiness</h2>
          <ProgressRing 
            value={data?.readinessScore || 0} 
            size={160} 
            strokeWidth={12} 
            label="Score" 
            color={data?.readinessScore >= 80 ? '#10b981' : data?.readinessScore >= 60 ? '#f59e0b' : '#f43f5e'} 
          />
          <p className="text-xs text-slate-400 mt-4">
            Based on your projects, skills, and coding consistency
          </p>
        </motion.div>

        {/* Strengths and Improvements */}
        <motion.div variants={fadeUp} className="lg:col-span-2 grid sm:grid-cols-2 gap-4">
          <div className="glass-card p-5 border-t-2 border-t-emerald-500">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" /> Key Strengths
            </h3>
            <ul className="space-y-3">
              {data?.strengths?.map((s: string, i: number) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                  <Star className="w-4 h-4 text-emerald-500/50 shrink-0 mt-0.5" />
                  {s}
                </li>
              ))}
            </ul>
          </div>
          
          <div className="glass-card p-5 border-t-2 border-t-rose-500">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-400" /> Focus Areas
            </h3>
            <ul className="space-y-3">
              {data?.improvementAreas?.map((s: string, i: number) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                  <AlertTriangle className="w-4 h-4 text-rose-500/50 shrink-0 mt-0.5" />
                  {s}
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      </div>

      {/* Recommended Mock Questions */}
      <motion.div variants={fadeUp} className="glass-card p-6">
        <h2 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-brand-400" /> AI Generated Mock Questions
        </h2>
        <p className="text-sm text-slate-400 mb-6">Tailored to your target role and current skill gaps</p>
        
        <div className="space-y-4">
          {data?.mockQuestions?.map((mq: any, i: number) => (
            <div key={i} className="p-4 bg-surface border border-surface-border rounded-xl hover:border-brand-500/30 transition-colors">
              <span className="badge badge-brand mb-2">{mq.topic}</span>
              <p className="text-sm text-white font-medium">{mq.question}</p>
            </div>
          ))}
          {(!data?.mockQuestions || data.mockQuestions.length === 0) && (
            <p className="text-slate-500 text-sm italic">No specific questions generated at this time.</p>
          )}
        </div>
      </motion.div>

      </motion.div>

      {/* Mock Interview Modal */}
      <AnimatePresence>
        {showMockInterview && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-surface border border-surface-border p-6 rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Zap className="w-5 h-5 text-brand-400" /> AI Mock Interview Session
                  </h2>
                  <p className="text-sm text-slate-400">Answer the questions as if you were in a real interview.</p>
                </div>
                <button onClick={() => setShowMockInterview(false)} className="p-2 rounded-lg bg-surface-hover text-slate-400 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {!interviewFinished ? (
                <div className="flex flex-col lg:flex-row gap-6 flex-1">
                  {/* Left: Webcam Placeholder */}
                  <div className="flex-1 bg-black border border-surface-border rounded-xl aspect-video flex flex-col items-center justify-center relative overflow-hidden">
                    <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                      <div className={`w-2.5 h-2.5 rounded-full ${isRecording ? 'bg-rose-500 animate-pulse' : 'bg-slate-500'}`} />
                      <span className="text-xs font-medium text-white">{isRecording ? formatTime(timer) : 'Ready'}</span>
                    </div>
                    
                    <Camera className="w-16 h-16 text-slate-700 mb-2 opacity-50" />
                    <p className="text-slate-500 text-sm">Camera Input (Simulated)</p>
                  </div>

                  {/* Right: Question & Controls */}
                  <div className="lg:w-1/3 flex flex-col space-y-4">
                    <div className="bg-surface-card border border-surface-border p-5 rounded-xl flex-1 flex flex-col">
                      <span className="text-xs text-brand-400 font-bold uppercase tracking-wider mb-2">Question {currentQuestionIdx + 1} of {data?.mockQuestions?.length || 3}</span>
                      <p className="text-lg text-white font-medium mb-4 flex-1">
                        {data?.mockQuestions?.[currentQuestionIdx]?.question || "Describe a challenging bug you faced and how you resolved it."}
                      </p>
                      
                      <div className="space-y-3">
                        <button 
                          onClick={() => setIsRecording(!isRecording)} 
                          className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors ${
                            isRecording ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30 hover:bg-rose-500/20' : 'bg-brand-500 text-white hover:bg-brand-600 shadow-glow'
                          }`}
                        >
                          {isRecording ? <><span className="w-2 h-2 rounded-sm bg-rose-400" /> Stop Recording</> : <><Mic className="w-4 h-4" /> Start Answer</>}
                        </button>
                        
                        <div className="flex gap-2">
                          <button 
                            disabled={isRecording}
                            onClick={() => {
                              if (currentQuestionIdx < (data?.mockQuestions?.length || 3) - 1) {
                                setCurrentQuestionIdx(prev => prev + 1);
                                setTimer(0);
                              } else {
                                setInterviewFinished(true);
                              }
                            }}
                            className="w-full btn-secondary disabled:opacity-50"
                          >
                            {currentQuestionIdx < (data?.mockQuestions?.length || 3) - 1 ? 'Next Question' : 'Finish Interview'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-20 flex flex-col items-center justify-center text-center">
                  <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center mb-6">
                    <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Interview Completed!</h3>
                  <p className="text-slate-400 max-w-md mx-auto mb-8">
                    Great job! Our AI is now analyzing your responses, facial expressions, and vocal tones to generate a detailed feedback report.
                  </p>
                  <button onClick={() => setShowMockInterview(false)} className="btn-primary">
                    Return to Dashboard
                  </button>
                </div>
              )}

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
