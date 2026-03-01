'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Users, Trophy, BarChart2, TrendingUp, Map, Sparkles } from 'lucide-react'
import { electionData } from '@/src/lib/data'
import { computeResults, TARGET_PARTY } from '@/lib/election'
import { useStore } from '@/lib/store'
import { election2569Results, election2569Meta } from '@/lib/data2569'

function useGlobalStats() {
  return useMemo(() => {
    let democratSeats = 0
    let flipCount = 0
    const partySeats: Record<string, number> = {}
    let totalDistricts = 0

    Object.values(electionData).forEach((districts) => {
      const res = computeResults(districts, {})
      democratSeats += res.seatCount
      flipCount += res.flipCount
      totalDistricts += districts.length
      res.rows.forEach((row) => {
        partySeats[row.newWinner] = (partySeats[row.newWinner] || 0) + 1
      })
    })

    const sorted = Object.entries(partySeats)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 8)

    const democratRank =
      Object.keys(partySeats)
        .sort((a, b) => partySeats[b] - partySeats[a])
        .indexOf(TARGET_PARTY) + 1

    return {
      democratSeats,
      flipCount,
      totalDistricts,
      sorted,
      democratRank: democratRank > 0 ? `#${democratRank}` : '-',
    }
  }, [])
}

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  color,
  delay,
}: {
  label: string
  value: string | number
  sub: string
  icon: any
  color: string
  delay: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, type: 'spring', stiffness: 300, damping: 24 }}
      className="glass-card group relative overflow-hidden"
    >
      {/* Background glow */}
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-300 ${color}`} />
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">{label}</p>
          <p className="text-3xl font-black text-slate-900 dark:text-white mt-1 tracking-tight">{value}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">{sub}</p>
        </div>
        <div className={`w-11 h-11 rounded-xl ${color} flex items-center justify-center flex-shrink-0 ml-3`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
    </motion.div>
  )
}

function SeatBarChart({ parties }: { parties: { name: string; seats: number; color: string }[] }) {
  const max = Math.max(...parties.map((p) => p.seats))
  return (
    <div className="space-y-3">
      {parties.map((p, i) => (
        <motion.div
          key={p.name}
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.05 }}
          className="flex items-center gap-3"
        >
          <div
            className="w-3 h-3 rounded-full flex-shrink-0"
            style={{ backgroundColor: p.color }}
          />
          <p className="text-sm text-slate-700 dark:text-slate-300 w-36 truncate flex-shrink-0">{p.name}</p>
          <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(p.seats / max) * 100}%` }}
              transition={{ delay: 0.2 + i * 0.05, duration: 0.5, ease: 'easeOut' }}
              className="h-full rounded-full"
              style={{ backgroundColor: p.color }}
            />
          </div>
          <p className="text-sm font-bold text-slate-900 dark:text-white w-12 text-right flex-shrink-0">
            {p.seats}
          </p>
        </motion.div>
      ))}
    </div>
  )
}

// Election 2566 party colors mapping
const PARTY_COLORS_2566: Record<string, string> = {
  'ก้าวไกล': '#F47932',
  'เพื่อไทย': '#ED2828',
  'ภูมิใจไทย': '#0F1599',
  'พลังประชารัฐ': '#026634',
  'รวมไทยสร้างชาติ': '#2B3080',
  'ประชาธิปัตย์': '#24A0DE',
  'ชาติพัฒนากล้า': '#F9B539',
  'ชาติไทยพัฒนา': '#E83196',
  'ประชาชาติ': '#C6A959',
  'ไทยสร้างไทย': '#7C26DF',
  'เสรีรวมไทย': '#C62828',
}

export default function DashboardView() {
  const { setView } = useStore()
  const stats = useGlobalStats()

  // Top 6 for 2566 from computed data
  const top6Parties2566 = stats.sorted.slice(0, 6).map(([name, seats]) => ({
    name,
    seats,
    color: PARTY_COLORS_2566[name] || '#6b7280',
  }))

  // Top 6 for 2569
  const top6Parties2569 = election2569Results.slice(0, 6).map((p) => ({
    name: p.name,
    seats: p.totalSeats,
    color: p.color,
  }))

  // Coalition 2569
  const govSeats = election2569Results.filter((p) => p.isGovParty).reduce((s, p) => s + p.totalSeats, 0)
  const oppSeats = election2569Results.filter((p) => !p.isGovParty).reduce((s, p) => s + p.totalSeats, 0)

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">ภาพรวม</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          สรุปสถานะการเลือกตั้งไทย 2566 และ 2569 ({stats.totalDistricts} เขตทั่วประเทศ)
        </p>
      </div>

      {/* Key Stats 2566 */}
      <div>
        <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-4">
          สถิติ เลือกตั้ง 2566
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="ที่นั่ง ปชป. 2566"
            value={stats.democratSeats}
            sub={`จาก ${stats.totalDistricts} เขต`}
            icon={Users}
            color="bg-sky-500"
            delay={0.05}
          />
          <StatCard
            label="อันดับ ปชป."
            value={stats.democratRank}
            sub="ในสภา 2566"
            icon={Trophy}
            color="bg-amber-500"
            delay={0.1}
          />
          <StatCard
            label="เขตทั้งหมด"
            value={stats.totalDistricts}
            sub="เขตเลือกตั้งทั่วประเทศ"
            icon={Map}
            color="bg-violet-500"
            delay={0.15}
          />
          <StatCard
            label="พรรคที่มีที่นั่ง"
            value={stats.sorted.length}
            sub="พรรคที่ได้ ส.ส. เขต"
            icon={BarChart2}
            color="bg-emerald-500"
            delay={0.2}
          />
        </div>
      </div>

      {/* Comparison Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 2566 Chart */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="glass-card"
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">ที่นั่ง ส.ส. เขต 2566</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">6 พรรคที่ได้ที่นั่งสูงสุด</p>
            </div>
            <span className="badge badge-blue">ผลจริง</span>
          </div>
          <SeatBarChart parties={top6Parties2566} />
        </motion.div>

        {/* 2569 Chart */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card"
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">ที่นั่ง ส.ส. รวม 2569</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">6 พรรคที่ได้ที่นั่งสูงสุด</p>
            </div>
            <span className="badge bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
              ไม่เป็นทางการ
            </span>
          </div>
          <SeatBarChart parties={top6Parties2569} />
        </motion.div>
      </div>

      {/* 2569 Coalition Status */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="glass-card"
      >
        <div className="flex items-start justify-between mb-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">สถานะจัดตั้งรัฐบาล 2569</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              ต้องการ {election2569Meta.majorityThreshold} เสียง จาก {election2569Meta.totalSeats} ที่นั่ง
            </p>
          </div>
          <button
            onClick={() => setView('results2569')}
            className="btn-secondary text-xs px-3 py-1.5"
          >
            ดูรายละเอียด
          </button>
        </div>

        {/* Parliament visualization */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">รัฐบาล</span>
            <span className="text-base font-black text-emerald-600 dark:text-emerald-400">{govSeats} เสียง</span>
            <span className="text-xs text-slate-400 ml-auto">
              {govSeats >= election2569Meta.majorityThreshold ? '✅ เกินกึ่งหนึ่ง' : '⚠️ ไม่ถึงเกณฑ์'}
            </span>
          </div>
          <div className="h-6 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 flex">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 flex items-center justify-end pr-2 transition-all duration-700"
              style={{ width: `${(govSeats / election2569Meta.totalSeats) * 100}%` }}
            >
              <span className="text-[10px] text-white font-bold">{govSeats}</span>
            </div>
            <div
              className="h-full bg-gradient-to-r from-rose-500 to-rose-600 flex items-center justify-start pl-2 transition-all duration-700"
              style={{ width: `${(oppSeats / election2569Meta.totalSeats) * 100}%` }}
            >
              <span className="text-[10px] text-white font-bold">{oppSeats}</span>
            </div>
          </div>
          <div className="flex items-center justify-between mt-2 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>ฝ่ายรัฐบาล ({govSeats})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-rose-500" />
              <span>ฝ่ายค้าน ({oppSeats})</span>
            </div>
          </div>
        </div>

        {/* Threshold line */}
        <p className="text-xs text-slate-400 dark:text-slate-500 text-center">
          เส้นแบ่งเกินกึ่งหนึ่ง: {election2569Meta.majorityThreshold} เสียง |
          แหล่งข้อมูล: {election2569Meta.source}
        </p>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-4"
      >
        {[
          { view: 'results2569' as const, title: 'ผลเลือกตั้ง 2569', desc: 'ดูผลอย่างละเอียด', icon: Trophy, color: 'from-amber-500 to-orange-500' },
          { view: 'simulation' as const, title: 'จำลองสถานการณ์', desc: 'โอนคะแนนรายจังหวัด', icon: Sparkles, color: 'from-violet-500 to-purple-600' },
          { view: 'monte-carlo' as const, title: 'Monte Carlo', desc: 'วิเคราะห์ความน่าจะเป็น', icon: TrendingUp, color: 'from-emerald-500 to-teal-600' },
        ].map((item) => {
          const Icon = item.icon
          return (
            <button
              key={item.view}
              onClick={() => setView(item.view)}
              className="group glass-card text-left hover:shadow-md transition-all duration-200"
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-3`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <p className="font-bold text-slate-900 dark:text-white text-sm">{item.title}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{item.desc}</p>
            </button>
          )
        })}
      </motion.div>
    </div>
  )
}
