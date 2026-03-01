'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CheckCircle,
  XCircle,
  Building2,
  Users,
  AlertTriangle,
  RotateCcw,
  GripVertical,
  ArrowLeftRight,
  Info,
} from 'lucide-react'
import { election2569Results, election2569Meta, Party2569 } from '@/lib/data2569'
import { fmt } from '@/lib/election'

type CoalitionRole = 'government' | 'opposition' | 'unassigned'

interface PartyAssignment {
  party: Party2569
  role: CoalitionRole
}

function CoalitionStats({ assignments }: { assignments: PartyAssignment[] }) {
  const govSeats = assignments.filter(a => a.role === 'government').reduce((s, a) => s + a.party.totalSeats, 0)
  const oppSeats = assignments.filter(a => a.role === 'opposition').reduce((s, a) => s + a.party.totalSeats, 0)
  const unassigned = assignments.filter(a => a.role === 'unassigned').length
  const total = election2569Meta.totalSeats
  const threshold = election2569Meta.majorityThreshold
  const govPct = ((govSeats / total) * 100).toFixed(1)
  const oppPct = ((oppSeats / total) * 100).toFixed(1)
  const hasMajority = govSeats >= threshold
  const needsMore = threshold - govSeats

  return (
    <div className="space-y-4">
      {/* Status banner */}
      <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border font-semibold text-sm ${
        hasMajority
          ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
          : govSeats > 0
          ? 'bg-amber-50 border-amber-200 text-amber-800'
          : 'bg-slate-50 border-slate-200 text-slate-600'
      }`}>
        {hasMajority ? (
          <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
        ) : govSeats > 0 ? (
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
        ) : (
          <XCircle className="w-5 h-5 text-slate-400 flex-shrink-0" />
        )}
        <span>
          {hasMajority
            ? `✅ รัฐบาลผ่านเกณฑ์เกินกึ่งหนึ่ง (${govSeats} เสียง)`
            : govSeats > 0
            ? `⚠️ รัฐบาลยังขาดอีก ${needsMore} เสียง จะถึง ${threshold}`
            : 'เลือกพรรคร่วมรัฐบาลด้านล่าง'}
        </span>
        {unassigned > 0 && (
          <span className="ml-auto text-xs font-normal opacity-70">ยังไม่ได้จัด {unassigned} พรรค</span>
        )}
      </div>

      {/* Seat counts */}
      <div className="grid grid-cols-3 gap-3">
        <div className="text-center p-4 rounded-xl bg-emerald-50 border border-emerald-100">
          <p className="text-3xl font-black text-emerald-700">{govSeats}</p>
          <p className="text-xs font-semibold text-emerald-600 mt-1">ฝ่ายรัฐบาล</p>
          <p className="text-[10px] text-emerald-500">{govPct}%</p>
        </div>
        <div className="text-center p-4 rounded-xl bg-slate-50 border border-slate-200">
          <p className="text-3xl font-black text-slate-500">{threshold}</p>
          <p className="text-xs font-semibold text-slate-500 mt-1">เกณฑ์กึ่งหนึ่ง</p>
          <p className="text-[10px] text-slate-400">จาก {total} ที่นั่ง</p>
        </div>
        <div className="text-center p-4 rounded-xl bg-rose-50 border border-rose-100">
          <p className="text-3xl font-black text-rose-700">{oppSeats}</p>
          <p className="text-xs font-semibold text-rose-600 mt-1">ฝ่ายค้าน</p>
          <p className="text-[10px] text-rose-500">{oppPct}%</p>
        </div>
      </div>

      {/* Parliament bar */}
      <div>
        <div className="h-8 rounded-lg overflow-hidden bg-slate-100 flex">
          {/* Government segment */}
          {assignments
            .filter(a => a.role === 'government' && a.party.totalSeats > 0)
            .map(a => (
              <motion.div
                key={a.party.name}
                layout
                initial={{ width: 0 }}
                animate={{ width: `${(a.party.totalSeats / total) * 100}%` }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="h-full relative group cursor-default flex-shrink-0"
                style={{ backgroundColor: a.party.color }}
                title={`${a.party.name}: ${a.party.totalSeats} ที่นั่ง`}
              >
                {a.party.totalSeats >= 15 && (
                  <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-white/90 overflow-hidden">
                    {a.party.abbrev}
                  </span>
                )}
              </motion.div>
            ))}
          {/* Threshold marker */}
          <div
            className="absolute top-0 h-8 w-0.5 bg-white z-10 pointer-events-none"
            style={{
              left: `${(threshold / total) * 100}%`,
              position: 'absolute',
              marginLeft: '-2px',
            }}
          />
          {/* Unassigned (grey) */}
          {(() => {
            const unassignedSeats = assignments.filter(a => a.role === 'unassigned').reduce((s, a) => s + a.party.totalSeats, 0)
            if (unassignedSeats === 0) return null
            return (
              <div
                className="h-full bg-slate-300 flex-shrink-0"
                style={{ width: `${(unassignedSeats / total) * 100}%` }}
                title={`ยังไม่ได้จัด: ${unassignedSeats} ที่นั่ง`}
              />
            )
          })()}
          {/* Opposition segment */}
          {assignments
            .filter(a => a.role === 'opposition' && a.party.totalSeats > 0)
            .map(a => (
              <motion.div
                key={a.party.name}
                layout
                initial={{ width: 0 }}
                animate={{ width: `${(a.party.totalSeats / total) * 100}%` }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="h-full relative cursor-default flex-shrink-0 opacity-60"
                style={{ backgroundColor: a.party.color }}
                title={`${a.party.name}: ${a.party.totalSeats} ที่นั่ง (ฝ่ายค้าน)`}
              >
                {a.party.totalSeats >= 15 && (
                  <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-white/90">
                    {a.party.abbrev}
                  </span>
                )}
              </motion.div>
            ))}
        </div>
        <div className="flex justify-between text-[10px] text-slate-400 mt-1.5">
          <div className="flex gap-3">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />รัฐบาล {govSeats}
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-slate-300 inline-block" />ยังไม่จัด
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-rose-400 inline-block" />ฝ่ายค้าน {oppSeats}
            </span>
          </div>
          <span>เส้นกึ่งหนึ่ง: {threshold}</span>
        </div>
      </div>
    </div>
  )
}

function PartyCard({
  assignment,
  onSetRole,
  delay,
}: {
  assignment: PartyAssignment
  onSetRole: (role: CoalitionRole) => void
  delay: number
}) {
  const { party, role } = assignment
  const roleColors = {
    government: 'border-emerald-300 bg-emerald-50',
    opposition: 'border-rose-300 bg-rose-50',
    unassigned: 'border-slate-200 bg-white',
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, type: 'spring', stiffness: 300, damping: 24 }}
      className={`border-2 rounded-xl p-4 transition-all duration-200 ${roleColors[role]}`}
    >
      {/* Party info */}
      <div className="flex items-center gap-3 mb-3">
        <div
          className="w-1.5 h-10 rounded-full flex-shrink-0"
          style={{ backgroundColor: party.color }}
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-bold text-slate-900 truncate">{party.name}</span>
            <span className="text-xs text-slate-400 font-mono">({party.abbrev})</span>
          </div>
          <p className="text-[10px] text-slate-500 truncate">{party.leader}</p>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-xl font-black" style={{ color: party.color }}>
            {party.totalSeats}
          </p>
          <p className="text-[10px] text-slate-400">ที่นั่ง</p>
        </div>
      </div>

      {/* Sub-stats */}
      <div className="flex gap-2 text-[10px] text-slate-500 mb-3">
        <span className="bg-slate-100 rounded px-1.5 py-0.5">เขต {party.constituencySeats}</span>
        <span className="bg-slate-100 rounded px-1.5 py-0.5">บัญชี {party.partyListSeats}</span>
        <span className="bg-slate-100 rounded px-1.5 py-0.5">{party.popularVotePct}%</span>
      </div>

      {/* Role buttons */}
      <div className="flex gap-1.5">
        <button
          onClick={() => onSetRole(role === 'government' ? 'unassigned' : 'government')}
          className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
            role === 'government'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-white border border-emerald-200 text-emerald-700 hover:bg-emerald-50'
          }`}
        >
          {role === 'government' ? '✅ ร่วมรัฐบาล' : 'ร่วมรัฐบาล'}
        </button>
        <button
          onClick={() => onSetRole(role === 'opposition' ? 'unassigned' : 'opposition')}
          className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
            role === 'opposition'
              ? 'bg-rose-600 text-white shadow-sm'
              : 'bg-white border border-rose-200 text-rose-700 hover:bg-rose-50'
          }`}
        >
          {role === 'opposition' ? '❌ ฝ่ายค้าน' : 'ฝ่ายค้าน'}
        </button>
      </div>
    </motion.div>
  )
}

// Preset coalitions
type PresetKey = 'current' | 'bigTent' | 'opposition' | 'ptp_pch'

const PRESETS: Record<PresetKey, { label: string; emoji: string; desc: string; gov: string[] }> = {
  current: {
    label: 'รัฐบาลปัจจุบัน',
    emoji: '🏛️',
    desc: 'ตามผลการจัดตั้งจริง',
    gov: ['เพื่อไทย', 'ภูมิใจไทย', 'รวมไทยสร้างชาติ', 'พลังประชารัฐ', 'กล้าธรรม', 'เศรษฐกิจ'],
  },
  bigTent: {
    label: 'รัฐบาลแห่งชาติ',
    emoji: '🤝',
    desc: 'รวมทุกพรรคใหญ่',
    gov: ['เพื่อไทย', 'ประชาชน', 'ภูมิใจไทย', 'รวมไทยสร้างชาติ', 'ประชาธิปัตย์'],
  },
  opposition: {
    label: 'ฝ่ายค้านรวมพลัง',
    emoji: '⚡',
    desc: 'ฝ่ายค้านจัดตั้งรัฐบาลแทน',
    gov: ['ประชาชน', 'ประชาธิปัตย์', 'ไทยก้าวใหม่', 'ประชาชาติ', 'ไทยสร้างไทย', 'เสรีรวมไทย', 'รักชาติ', 'ไทยภักดี', 'ทางเลือกใหม่'],
  },
  ptp_pch: {
    label: 'พท + ปช',
    emoji: '🔴🟠',
    desc: 'สองพรรคใหญ่ผนึกกัน',
    gov: ['เพื่อไทย', 'ประชาชน', 'ภูมิใจไทย'],
  },
}

export default function CoalitionBuilderView() {
  const initialAssignments = useMemo(
    () =>
      election2569Results.map((party) => ({
        party,
        role: 'unassigned' as CoalitionRole,
      })),
    []
  )

  const [assignments, setAssignments] = useState<PartyAssignment[]>(initialAssignments)
  const [activeFilter, setActiveFilter] = useState<CoalitionRole | 'all'>('all')

  const setRole = (partyName: string, role: CoalitionRole) => {
    setAssignments((prev) =>
      prev.map((a) => (a.party.name === partyName ? { ...a, role } : a))
    )
  }

  const applyPreset = (presetKey: PresetKey) => {
    const preset = PRESETS[presetKey]
    setAssignments((prev) =>
      prev.map((a) => ({
        ...a,
        role: preset.gov.includes(a.party.name)
          ? 'government'
          : a.party.name === 'พรรคอื่นๆ'
          ? 'unassigned'
          : 'opposition',
      }))
    )
  }

  const reset = () => setAssignments(initialAssignments)

  const filteredAssignments = assignments.filter((a) =>
    activeFilter === 'all' ? true : a.role === activeFilter
  )

  const govCount = assignments.filter(a => a.role === 'government').length
  const oppCount = assignments.filter(a => a.role === 'opposition').length

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
            <Building2 className="w-6 h-6 text-[#0078b8]" />
            จำลองจัดตั้งรัฐบาล 2569
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            เลือกว่าพรรคไหนจะร่วมรัฐบาล และพรรคไหนเป็นฝ่ายค้าน จาก {election2569Meta.electionDate}
          </p>
        </div>
        <button
          onClick={reset}
          className="btn-secondary text-xs"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          รีเซ็ต
        </button>
      </div>

      {/* Info */}
      <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl border border-blue-100 text-sm text-blue-700">
        <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
        <span>
          กด <strong>ร่วมรัฐบาล</strong> หรือ <strong>ฝ่ายค้าน</strong> บนการ์ดแต่ละพรรค
          หรือเลือก Preset สำเร็จรูปด้านล่าง เพื่อดูสมการที่นั่งทันที
        </span>
      </div>

      {/* Coalition stats */}
      <div className="glass-card">
        <CoalitionStats assignments={assignments} />
      </div>

      {/* Presets */}
      <div>
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
          สูตรสำเร็จ
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {(Object.keys(PRESETS) as PresetKey[]).map((key) => {
            const preset = PRESETS[key]
            return (
              <button
                key={key}
                onClick={() => applyPreset(key)}
                className="glass-card text-left p-4 hover:shadow-md hover:border-[#0078b8]/30 hover:-translate-y-0.5 transition-all duration-200 border-2 border-transparent"
              >
                <div className="text-2xl mb-2">{preset.emoji}</div>
                <p className="font-bold text-slate-900 text-sm leading-tight">{preset.label}</p>
                <p className="text-[11px] text-slate-500 mt-1">{preset.desc}</p>
                <p className="text-[10px] text-[#0078b8] font-semibold mt-2">
                  {preset.gov.length} พรรคร่วมรัฐบาล
                </p>
              </button>
            )
          })}
        </div>
      </div>

      {/* Party grid */}
      <div>
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            จัดพรรคการเมือง ({election2569Results.length} พรรค)
          </h3>
          {/* Filter tabs */}
          <div className="flex gap-1.5">
            {([
              { id: 'all' as const, label: 'ทั้งหมด' },
              { id: 'government' as const, label: `รัฐบาล (${govCount})` },
              { id: 'opposition' as const, label: `ฝ่ายค้าน (${oppCount})` },
              { id: 'unassigned' as const, label: 'ยังไม่จัด' },
            ]).map((f) => (
              <button
                key={f.id}
                onClick={() => setActiveFilter(f.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeFilter === f.id
                    ? 'bg-[#0078b8] text-white shadow-sm'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {filteredAssignments.map((a, i) => (
              <PartyCard
                key={a.party.name}
                assignment={a}
                onSetRole={(role) => setRole(a.party.name, role)}
                delay={i * 0.03}
              />
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Government summary table */}
      {assignments.some(a => a.role === 'government') && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card overflow-hidden p-0"
        >
          <div className="px-5 py-4 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-600" />
              สรุปพรรคร่วมรัฐบาล
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 text-left">
                  <th className="table-header">พรรค</th>
                  <th className="table-header text-right">ที่นั่งรวม</th>
                  <th className="table-header text-right">เขต</th>
                  <th className="table-header text-right">บัญชี</th>
                  <th className="table-header text-right">% คะแนน</th>
                  <th className="table-header">หัวหน้า</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {assignments
                  .filter(a => a.role === 'government')
                  .sort((a, b) => b.party.totalSeats - a.party.totalSeats)
                  .map((a) => (
                    <tr key={a.party.name} className="hover:bg-slate-50 transition-colors">
                      <td className="table-cell">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: a.party.color }} />
                          <span className="font-medium text-slate-900">{a.party.name}</span>
                          <span className="text-xs text-slate-400">({a.party.abbrev})</span>
                        </div>
                      </td>
                      <td className="table-cell text-right font-bold" style={{ color: a.party.color }}>
                        {a.party.totalSeats}
                      </td>
                      <td className="table-cell text-right text-slate-500">{a.party.constituencySeats}</td>
                      <td className="table-cell text-right text-slate-500">{a.party.partyListSeats}</td>
                      <td className="table-cell text-right text-slate-500">{a.party.popularVotePct}%</td>
                      <td className="table-cell text-xs text-slate-500 truncate max-w-[160px]">{a.party.leader}</td>
                    </tr>
                  ))}
                {/* Total row */}
                <tr className="bg-emerald-50 font-bold">
                  <td className="table-cell text-emerald-800">รวม</td>
                  <td className="table-cell text-right text-emerald-800 text-lg">
                    {assignments.filter(a => a.role === 'government').reduce((s, a) => s + a.party.totalSeats, 0)}
                  </td>
                  <td className="table-cell text-right text-emerald-700">
                    {assignments.filter(a => a.role === 'government').reduce((s, a) => s + a.party.constituencySeats, 0)}
                  </td>
                  <td className="table-cell text-right text-emerald-700">
                    {assignments.filter(a => a.role === 'government').reduce((s, a) => s + a.party.partyListSeats, 0)}
                  </td>
                  <td className="table-cell text-right text-emerald-700">
                    {assignments.filter(a => a.role === 'government').reduce((s, a) => s + a.party.popularVotePct, 0).toFixed(1)}%
                  </td>
                  <td className="table-cell" />
                </tr>
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Opposition summary */}
      {assignments.some(a => a.role === 'opposition') && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card overflow-hidden p-0"
        >
          <div className="px-5 py-4 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <XCircle className="w-4 h-4 text-rose-500" />
              สรุปพรรคฝ่ายค้าน
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 text-left">
                  <th className="table-header">พรรค</th>
                  <th className="table-header text-right">ที่นั่งรวม</th>
                  <th className="table-header text-right">เขต</th>
                  <th className="table-header text-right">บัญชี</th>
                  <th className="table-header text-right">% คะแนน</th>
                  <th className="table-header">หัวหน้า</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {assignments
                  .filter(a => a.role === 'opposition')
                  .sort((a, b) => b.party.totalSeats - a.party.totalSeats)
                  .map((a) => (
                    <tr key={a.party.name} className="hover:bg-rose-50/30 transition-colors">
                      <td className="table-cell">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: a.party.color }} />
                          <span className="font-medium text-slate-900">{a.party.name}</span>
                          <span className="text-xs text-slate-400">({a.party.abbrev})</span>
                        </div>
                      </td>
                      <td className="table-cell text-right font-bold text-rose-600">
                        {a.party.totalSeats}
                      </td>
                      <td className="table-cell text-right text-slate-500">{a.party.constituencySeats}</td>
                      <td className="table-cell text-right text-slate-500">{a.party.partyListSeats}</td>
                      <td className="table-cell text-right text-slate-500">{a.party.popularVotePct}%</td>
                      <td className="table-cell text-xs text-slate-500 truncate max-w-[160px]">{a.party.leader}</td>
                    </tr>
                  ))}
                {/* Total row */}
                <tr className="bg-rose-50 font-bold">
                  <td className="table-cell text-rose-800">รวม</td>
                  <td className="table-cell text-right text-rose-800 text-lg">
                    {assignments.filter(a => a.role === 'opposition').reduce((s, a) => s + a.party.totalSeats, 0)}
                  </td>
                  <td className="table-cell text-right text-rose-700">
                    {assignments.filter(a => a.role === 'opposition').reduce((s, a) => s + a.party.constituencySeats, 0)}
                  </td>
                  <td className="table-cell text-right text-rose-700">
                    {assignments.filter(a => a.role === 'opposition').reduce((s, a) => s + a.party.partyListSeats, 0)}
                  </td>
                  <td className="table-cell text-right text-rose-700">
                    {assignments.filter(a => a.role === 'opposition').reduce((s, a) => s + a.party.popularVotePct, 0).toFixed(1)}%
                  </td>
                  <td className="table-cell" />
                </tr>
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      <p className="text-xs text-slate-400 text-center pb-4">
        ข้อมูลจาก {election2569Meta.source} | ผลไม่เป็นทางการ
      </p>
    </div>
  )
}
