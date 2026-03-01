'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Save, RefreshCw, Search, Trophy, AlertCircle, MapPin, Filter } from 'lucide-react'
import { useStore } from '@/lib/store'
import { electionData } from '@/src/lib/data'
import { computeResults, fmt, SimulationResult, TARGET_PARTY } from '@/lib/election'

type FilterType = 'all' | 'win' | 'lose' | 'close'

function TransferSlider({
  party,
  value,
  onChange,
}: {
  party: string
  value: number
  onChange: (val: number) => void
}) {
  const pct = value
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate max-w-[160px]">{party}</span>
        <span
          className={`text-sm font-bold tabular-nums ${
            pct > 0 ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400'
          }`}
        >
          {pct}%
        </span>
      </div>
      <div className="relative">
        <input
          type="range"
          min={0}
          max={100}
          step={1}
          value={pct}
          onChange={(e) => onChange(parseInt(e.target.value))}
          className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-brand-600 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-sm"
          style={{
            background: `linear-gradient(to right, rgb(37,99,235) 0%, rgb(37,99,235) ${pct}%, rgb(226,232,240) ${pct}%)`,
          }}
        />
      </div>
    </div>
  )
}

export default function SimulationView() {
  const {
    selectedProvince,
    setProvince,
    transferConfig,
    updateTransfer,
    resetTransfer,
    saveScenario,
  } = useStore()

  const [filter, setFilter] = useState<FilterType>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [scenarioName, setScenarioName] = useState('')

  const provinces = useMemo(
    () => Object.keys(electionData).sort((a, b) => a.localeCompare(b, 'th')),
    []
  )

  const availableParties = useMemo(() => {
    if (!selectedProvince) return []
    const parties = new Set<string>()
    electionData[selectedProvince]?.forEach((d) => {
      Object.keys(d.party_votes).forEach((p) => {
        if (p !== TARGET_PARTY) parties.add(p)
      })
    })
    return Array.from(parties).sort((a, b) => {
      // Sort by total votes desc
      const getTotalVotes = (party: string) =>
        electionData[selectedProvince]?.reduce((sum, d) => sum + (d.party_votes[party] || 0), 0) || 0
      return getTotalVotes(b) - getTotalVotes(a)
    })
  }, [selectedProvince])

  const results = useMemo(() => {
    if (!selectedProvince) return null
    return computeResults(electionData[selectedProvince] || [], transferConfig)
  }, [selectedProvince, transferConfig])

  const filteredRows = useMemo(() => {
    if (!results) return []
    return results.rows.filter((r: SimulationResult) => {
      const matchFilter =
        filter === 'all' ||
        (filter === 'win' && r.status === 'win') ||
        (filter === 'lose' && r.status === 'lose') ||
        (filter === 'close' && r.isClose)
      const matchSearch = !searchTerm || r.district.toString().includes(searchTerm)
      return matchFilter && matchSearch
    })
  }, [results, filter, searchTerm])

  const handleSave = () => {
    if (!scenarioName.trim()) return
    saveScenario(scenarioName, `บันทึกเมื่อ ${new Date().toLocaleString('th-TH')}`)
    setShowSaveModal(false)
    setScenarioName('')
  }

  const activeTransfers = Object.values(transferConfig).filter((v) => v > 0).length

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            จำลองสถานการณ์
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            โอนคะแนนจากพรรคอื่นมายัง{TARGET_PARTY} เพื่อดูผลลัพธ์รายเขต
          </p>
        </div>
        <button
          onClick={() => setShowSaveModal(true)}
          disabled={!selectedProvince}
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="w-4 h-4" />
          บันทึก
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Controls — left panel */}
        <div className="xl:col-span-4 space-y-4">
          {/* Province selector */}
          <div className="glass-card">
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
              เลือกจังหวัด
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <select
                value={selectedProvince || ''}
                onChange={(e) => {
                  setProvince(e.target.value || null)
                  resetTransfer()
                }}
                className="input pl-9"
              >
                <option value="">-- เลือกจังหวัด --</option>
                {provinces.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Transfer sliders */}
          <AnimatePresence>
            {selectedProvince && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="glass-card"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">โอนคะแนน</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      ตั้งค่า% คะแนนที่โอนมา {TARGET_PARTY}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {activeTransfers > 0 && (
                      <span className="badge badge-blue">{activeTransfers} ใช้งาน</span>
                    )}
                    <button
                      onClick={resetTransfer}
                      className="btn-ghost text-xs"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      รีเซ็ต
                    </button>
                  </div>
                </div>

                <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1 custom-scrollbar">
                  {availableParties.map((party) => (
                    <TransferSlider
                      key={party}
                      party={party}
                      value={Math.round((transferConfig[party] || 0) * 100)}
                      onChange={(val) => updateTransfer(party, val / 100)}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Results — right panel */}
        <div className="xl:col-span-8 space-y-4">
          {selectedProvince && results ? (
            <>
              {/* Summary cards */}
              <div className="grid grid-cols-2 gap-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="glass-card bg-gradient-to-br from-brand-50 to-blue-50 dark:from-brand-900/20 dark:to-blue-900/20"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">ที่นั่งที่ชนะ</p>
                      <p className="text-4xl font-black text-brand-600 dark:text-brand-400 mt-1">{results.seatCount}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">จาก {results.rows.length} เขต</p>
                    </div>
                    <Trophy className="w-10 h-10 text-brand-400 opacity-40" />
                  </div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.05 }}
                  className="glass-card bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">พลิกชนะใหม่</p>
                      <p className="text-4xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{results.flipCount}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">เขตที่พลิกจากพรรคอื่น</p>
                    </div>
                    <RefreshCw className="w-10 h-10 text-emerald-400 opacity-40" />
                  </div>
                </motion.div>
              </div>

              {/* Results table */}
              <div className="glass-card overflow-hidden p-0">
                {/* Table controls */}
                <div className="flex items-center justify-between gap-3 flex-wrap p-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex gap-1.5">
                    {(['all', 'win', 'lose', 'close'] as FilterType[]).map((f) => (
                      <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                          filter === f
                            ? 'bg-brand-600 text-white shadow-sm shadow-brand-600/25'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        {f === 'all' ? 'ทั้งหมด' : f === 'win' ? '✅ ชนะ' : f === 'lose' ? '❌ แพ้' : '⚡ สูสี'}
                      </button>
                    ))}
                  </div>

                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="ค้นหาเขต..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="input pl-8 py-1.5 text-xs w-36"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-800/50">
                        <th className="table-header">เขต</th>
                        <th className="table-header">ผู้ชนะเดิม</th>
                        <th className="table-header text-right">ปชป.เดิม</th>
                        <th className="table-header text-right">ปชป.ใหม่</th>
                        <th className="table-header">ผู้ชนะใหม่</th>
                        <th className="table-header text-center">สถานะ</th>
                        <th className="table-header text-right">คะแนนที่ขาด</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      <AnimatePresence>
                        {filteredRows.map((r) => (
                          <motion.tr
                            key={r.district}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className={`hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors ${
                              r.status === 'win' ? 'bg-blue-50/40 dark:bg-blue-900/10' : ''
                            }`}
                          >
                            <td className="table-cell font-bold text-slate-900 dark:text-white">
                              เขต {r.district}
                            </td>
                            <td className="table-cell text-slate-500 dark:text-slate-400 text-xs">
                              {r.originalWinner}
                            </td>
                            <td className="table-cell text-right tabular-nums text-slate-500 dark:text-slate-400">
                              {fmt(r.baseDem)}
                            </td>
                            <td className="table-cell text-right tabular-nums font-semibold text-brand-600 dark:text-brand-400">
                              {fmt(r.newDem)}
                            </td>
                            <td className="table-cell text-xs">
                              {r.newWinner}
                            </td>
                            <td className="table-cell text-center">
                              <span
                                className={
                                  r.status === 'win'
                                    ? 'badge-win'
                                    : r.isClose
                                    ? 'badge-close'
                                    : 'badge-lose'
                                }
                              >
                                {r.status === 'win' ? 'ชนะ' : r.isClose ? 'สูสี' : 'แพ้'}
                              </span>
                            </td>
                            <td className="table-cell text-right tabular-nums text-slate-500 dark:text-slate-400">
                              {r.votesNeeded != null ? fmt(r.votesNeeded) : '—'}
                            </td>
                          </motion.tr>
                        ))}
                      </AnimatePresence>
                    </tbody>
                  </table>

                  {filteredRows.length === 0 && (
                    <div className="p-12 text-center text-slate-400 dark:text-slate-500">
                      <Filter className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">ไม่พบข้อมูลตามเงื่อนไขที่เลือก</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="glass-card flex flex-col items-center justify-center text-center p-16 min-h-[400px]">
              <div className="w-16 h-16 bg-brand-50 dark:bg-brand-900/20 rounded-2xl flex items-center justify-center mb-4">
                <AlertCircle className="w-8 h-8 text-brand-500" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                ยังไม่ได้เลือกจังหวัด
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs leading-relaxed">
                กรุณาเลือกจังหวัดจากเมนูด้านซ้าย เพื่อเริ่มจำลองสถานการณ์การโอนคะแนน
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Save Modal */}
      <AnimatePresence>
        {showSaveModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setShowSaveModal(false)}
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white dark:bg-slate-900 p-6 rounded-2xl w-full max-w-sm shadow-2xl border border-slate-200 dark:border-slate-800 z-10"
            >
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">บันทึกสถานการณ์</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">
                จังหวัด: {selectedProvince} | {activeTransfers} การตั้งค่า
              </p>
              <input
                type="text"
                placeholder="ตั้งชื่อสถานการณ์..."
                value={scenarioName}
                onChange={(e) => setScenarioName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                autoFocus
                className="input mb-4"
              />
              <div className="flex gap-2 justify-end">
                <button onClick={() => setShowSaveModal(false)} className="btn-secondary">
                  ยกเลิก
                </button>
                <button
                  onClick={handleSave}
                  disabled={!scenarioName.trim()}
                  className="btn-primary"
                >
                  บันทึก
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
