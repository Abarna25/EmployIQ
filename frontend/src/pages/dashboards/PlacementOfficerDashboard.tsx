import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/services/api'
import StatCard from '@/components/ui/StatCard'
import ProgressRing from '@/components/ui/ProgressRing'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  AreaChart, Area,
} from 'recharts'
import { GraduationCap, Building2, TrendingUp, Users, CalendarDays, ArrowUpRight, Target, Download } from 'lucide-react'

const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } }
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } }

const departmentData = [
  { dept: 'CSE', placed: 42, total: 60 },
  { dept: 'IT', placed: 28, total: 45 },
  { dept: 'ECE', placed: 18, total: 35 },
  { dept: 'EEE', placed: 12, total: 30 },
  { dept: 'MECH', placed: 8, total: 25 },
]

const monthlyPlacements = [
  { month: 'Aug', placed: 5 }, { month: 'Sep', placed: 12 }, { month: 'Oct', placed: 25 },
  { month: 'Nov', placed: 18 }, { month: 'Dec', placed: 35 }, { month: 'Jan', placed: 28 },
  { month: 'Feb', placed: 42 }, { month: 'Mar', placed: 38 },
]

const upcomingDrives = [
  { company: 'Google India', date: '15 Sep 2026', minCgpa: 8.5, positions: 'SDE-1, SRE', tier: 'Tier 1' },
  { company: 'Microsoft', date: '22 Sep 2026', minCgpa: 8.0, positions: 'SDE, PM', tier: 'Tier 1' },
  { company: 'Infosys', date: '01 Oct 2026', minCgpa: 6.5, positions: 'System Engineer', tier: 'Mass' },
  { company: 'Zoho Corp', date: '10 Oct 2026', minCgpa: 7.0, positions: 'SDE, QA', tier: 'Tier 2' },
]

export default function PlacementOfficerDashboard() {
  const location = useLocation()
  const [activeTab, setActiveTab] = useState<'analytics' | 'drives' | 'companies'>('analytics')

  useEffect(() => {
    if (location.pathname.includes('drives')) {
      setActiveTab('drives')
    } else if (location.pathname.includes('companies')) {
      setActiveTab('companies')
    } else {
      setActiveTab('analytics')
    }
  }, [location.pathname])

  const { data, isLoading } = useQuery({
    queryKey: ['placementStats'],
    queryFn: () => api.get('/analytics/placement').then((r: any) => r.data.data),
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const handleExport = async () => {
    try {
      const response = await api.get('/analytics/export/candidates', { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'candidates_export.csv')
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (error) {
      console.error("Export failed", error)
    }
  }

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={fadeUp} className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="section-title">Placement Command Center</h1>
          <p className="section-sub">College-wide placement readiness and drive management</p>
        </div>
        <div className="flex bg-surface p-1 rounded-xl border border-surface-border">
          <button 
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'analytics' ? 'bg-brand-500 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            Analytics
          </button>
          <button 
            onClick={() => setActiveTab('drives')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'drives' ? 'bg-brand-500 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            Drives
          </button>
          <button 
            onClick={() => setActiveTab('companies')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'companies' ? 'bg-brand-500 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            Companies
          </button>
        </div>
      </motion.div>

      {activeTab === 'analytics' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <div className="flex justify-end">
            <button onClick={handleExport} className="btn-secondary">
              <Download className="w-4 h-4" /> Export CSV Report
            </button>
          </div>

      <motion.div variants={fadeUp} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Students" value={data?.totalStudents || 0} subtitle="Eligible for placement" icon={<GraduationCap className="w-5 h-5" />} color="brand" />
        <StatCard title="Placed" value={data?.placedStudents || 0} subtitle={`${data?.placementRate || 0}% placement rate`} icon={<Target className="w-5 h-5" />} color="emerald" trend={{ value: '+12% YoY', positive: true }} />
        <StatCard title="Active Drives" value={data?.activeDrives || 0} subtitle="Ongoing & upcoming" icon={<Building2 className="w-5 h-5" />} color="cyan" />
        <StatCard title="Avg Package" value="₹12.4L" subtitle="LPA across placed" icon={<TrendingUp className="w-5 h-5" />} color="amber" trend={{ value: '+18% from last year', positive: true }} />
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Department Performance */}
        <motion.div variants={fadeUp} className="glass-card p-5 lg:col-span-2">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Users className="w-4 h-4 text-brand-400" /> Department-wise Placement
          </h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={departmentData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="dept" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} />
              <Tooltip contentStyle={{ backgroundColor: '#16162a', border: '1px solid #2a2a45', borderRadius: 12, fontSize: 12 }} />
              <Bar dataKey="total" radius={[4, 4, 0, 0]} fill="rgba(99,102,241,0.25)" name="Total" />
              <Bar dataKey="placed" radius={[4, 4, 0, 0]} fill="#6366f1" name="Placed" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Overall Readiness */}
        <motion.div variants={fadeUp} className="glass-card p-5 flex flex-col items-center justify-center">
          <h3 className="text-sm font-semibold text-white mb-4">College Readiness</h3>
          <ProgressRing value={parseFloat(data?.placementRate || '0')} size={140} strokeWidth={10} label="Placed" color="#10b981" />
          <div className="grid grid-cols-2 gap-3 mt-4 w-full">
            <div className="text-center p-2 rounded-lg bg-surface flex flex-col">
              <span className="text-lg font-bold text-white">{data?.tierDistribution?.[0]?.count || 0}</span>
              <span className="text-[10px] text-slate-500">Tier 1 Ready</span>
            </div>
            <div className="text-center p-2 rounded-lg bg-surface flex flex-col">
              <span className="text-lg font-bold text-white">{data?.tierDistribution?.[1]?.count || 0}</span>
              <span className="text-[10px] text-slate-500">Tier 2 Ready</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Monthly Trend + Upcoming Drives */}
      <div className="grid lg:grid-cols-2 gap-4">
        <motion.div variants={fadeUp} className="glass-card p-5">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" /> Monthly Placement Trend
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={monthlyPlacements}>
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} />
              <Tooltip contentStyle={{ backgroundColor: '#16162a', border: '1px solid #2a2a45', borderRadius: 12, fontSize: 12 }} />
              <Area type="monotone" dataKey="placed" stroke="#6366f1" fill="url(#areaGrad)" strokeWidth={2.5} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div variants={fadeUp} className="glass-card p-5">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-cyan-400" /> Upcoming Drives
          </h3>
          <div className="space-y-2">
            {upcomingDrives.map((d) => (
              <div key={d.company} className="flex items-center justify-between p-3 rounded-xl bg-surface hover:bg-surface-hover transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-brand-500/15 flex items-center justify-center">
                    <Building2 className="w-4 h-4 text-brand-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{d.company}</p>
                    <p className="text-[10px] text-slate-500">{d.date} · Min CGPA {d.minCgpa}</p>
                  </div>
                </div>
                <span className={`badge ${d.tier === 'Tier 1' ? 'badge-success' : d.tier === 'Tier 2' ? 'badge-info' : 'badge-warning'}`}>
                  {d.tier}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
      </motion.div>
      )}

      {activeTab === 'drives' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <div className="glass-card p-6">
            <h2 className="text-lg font-bold text-white mb-6">Manage Placement Drives</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {upcomingDrives.map((d) => (
                <div key={d.company} className="bg-surface border border-surface-border rounded-xl p-5 hover:border-brand-500/30 transition-colors">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 rounded-xl bg-brand-500/10 flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-brand-500" />
                    </div>
                    <span className={`badge ${d.tier === 'Tier 1' ? 'badge-success' : d.tier === 'Tier 2' ? 'badge-info' : 'badge-warning'}`}>
                      {d.tier}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-1">{d.company}</h3>
                  <p className="text-sm text-brand-400 font-medium mb-3">{d.positions}</p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <CalendarDays className="w-4 h-4" /> Date: <span className="text-white">{d.date}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <Target className="w-4 h-4" /> Min CGPA: <span className="text-white">{d.minCgpa}</span>
                    </div>
                  </div>
                  
                  <button className="w-full btn-secondary">View Details</button>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {activeTab === 'companies' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <div className="glass-card p-6 text-center py-20 border-violet-500/20 bg-gradient-to-b from-surface to-violet-500/5">
            <div className="w-16 h-16 rounded-full bg-violet-500/10 mx-auto flex items-center justify-center mb-4">
              <Building2 className="w-8 h-8 text-violet-400" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Partner Companies Directory</h2>
            <p className="text-slate-400 max-w-md mx-auto">
              Directory of all visiting companies and historical placement data is currently synchronizing.
            </p>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
