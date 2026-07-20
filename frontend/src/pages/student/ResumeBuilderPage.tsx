import { useState } from 'react'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/services/api'
import { FileText, Download, Eye, Palette } from 'lucide-react'

const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } }
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } }

const templateInfo: Record<string, { name: string; desc: string; color: string }> = {
  modern: { name: 'Modern Professional', desc: 'Two-column layout with vibrant accents', color: 'from-brand-500/20 border-brand-500/30' },
  minimal: { name: 'Minimal Clean', desc: 'Single-column with elegant simplicity', color: 'from-slate-500/20 border-slate-500/30' },
  executive: { name: 'Executive Dark', desc: 'Bold dark theme for senior roles', color: 'from-violet-500/20 border-violet-500/30' },
  academic: { name: 'Academic LaTeX', desc: 'Classic serif typography', color: 'from-cyan-500/20 border-cyan-500/30' },
}

export default function ResumeBuilderPage() {
  const [selectedTemplate, setSelectedTemplate] = useState('modern')
  const [previewHtml, setPreviewHtml] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handlePreview = async () => {
    setLoading(true)
    try {
      const res = await api.get(`/portfolio/resume/generate?template=${selectedTemplate}`)
      setPreviewHtml(res.data.data?.html || null)
    } catch {
      setPreviewHtml('<p style="color:red;padding:20px;">Failed to generate preview. Make sure your profile has data.</p>')
    }
    setLoading(false)
  }

  const handleDownload = async () => {
    try {
      const res = await api.get(`/portfolio/resume/pdf?template=${selectedTemplate}`, { responseType: 'blob' })
      const blob = new Blob([res.data], { type: 'text/html' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `Resume_${selectedTemplate}.html`
      a.click()
      window.URL.revokeObjectURL(url)
    } catch {
      alert('Failed to download resume')
    }
  }

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={fadeUp}>
        <h1 className="section-title">Resume Builder</h1>
        <p className="section-sub">Generate ATS-optimized resumes from your portfolio data</p>
      </motion.div>

      {/* Template Selector */}
      <motion.div variants={fadeUp} className="glass-card p-5">
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <Palette className="w-4 h-4 text-brand-400" /> Choose Template
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {Object.entries(templateInfo).map(([key, info]) => (
            <button
              key={key}
              onClick={() => setSelectedTemplate(key)}
              className={`p-4 rounded-xl border bg-gradient-to-br text-left transition-all ${info.color} ${
                selectedTemplate === key
                  ? 'ring-2 ring-brand-500 ring-offset-2 ring-offset-surface'
                  : 'opacity-70 hover:opacity-100'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4 text-white" />
                <span className="text-xs font-semibold text-white">{info.name}</span>
              </div>
              <p className="text-[10px] text-slate-400">{info.desc}</p>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Actions */}
      <motion.div variants={fadeUp} className="flex gap-3">
        <button onClick={handlePreview} disabled={loading} className="btn-primary">
          <Eye className="w-4 h-4" />
          {loading ? 'Generating...' : 'Preview Resume'}
        </button>
        <button onClick={handleDownload} className="btn-secondary">
          <Download className="w-4 h-4" /> Download HTML
        </button>
      </motion.div>

      {/* Live Preview */}
      {previewHtml && (
        <motion.div
          variants={fadeUp}
          className="glass-card overflow-hidden"
        >
          <div className="p-3 border-b border-surface-border flex items-center justify-between">
            <h3 className="text-xs font-semibold text-white flex items-center gap-2">
              <Eye className="w-3.5 h-3.5 text-brand-400" /> Resume Preview — {templateInfo[selectedTemplate]?.name}
            </h3>
            <span className="badge-info text-[10px]">ATS Optimized</span>
          </div>
          <div className="bg-white">
            <iframe
              srcDoc={previewHtml}
              className="w-full border-0"
              style={{ minHeight: '800px' }}
              title="Resume Preview"
            />
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
