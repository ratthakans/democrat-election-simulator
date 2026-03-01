import { useState, useMemo } from 'react'
import { useStore } from '@/lib/store'
import { electionData } from '@/lib/data'
import { computeResults, fmt, SimulationResult, TARGET_PARTY } from '@/lib/election'
import TransferSlider from '@/components/TransferSlider'
import { motion, AnimatePresence } from 'framer-motion'
import { Save, RefreshCw, Search, Trophy, AlertCircle, Map as MapIcon } from 'lucide-react'

type FilterType = 'all' | 'win' | 'lose' | 'close'

export default function SimulationView() {
  const { 
    selectedProvince, 
    setProvince, 
    transferConfig, 
    updateTransfer, 
    resetTransfer,
    saveScenario 
  } = useStore()

  const [filter, setFilter] = useState<FilterType>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [scenarioName, setScenarioName] = useState('')

  // Get available parties in the selected province
  const availableParties = useMemo(() => {
    if (!selectedProvince) return []
    const parties = new Set<string>()
    electionData[selectedProvince]?.forEach(d => {
      Object.keys(d.party_votes).forEach(p => {
        if (p !== TARGET_PARTY) parties.add(p)
      })
    })
    return Array.from(parties).sort((a, b) => a.localeCompare(b, 'th'))
  }, [selectedProvince])

  // Compute results
  const results = useMemo(() => {
    if (!selectedProvince) return null
    const districts = electionData[selectedProvince] || []
    return computeResults(districts, transferConfig)
  }, [selectedProvince, transferConfig])

  // Filter rows
  const filteredRows = useMemo(() => {
    if (!results) return []
    return results.rows.filter((r: SimulationResult) => {
      const matchesFilter = 
        filter === 'all' ? true :
        filter === 'win' ? r.status === 'win' :
        filter === 'lose' ? r.status === 'lose' :
        filter === 'close' ? r.isClose : true
      
      const matchesSearch = searchTerm 
        ? r.district.toString().includes(searchTerm) 
        : true
        
      return matchesFilter && matchesSearch
    })
  }, [results, filter, searchTerm])

  const handleSave = () => {
    if (!scenarioName.trim()) return
    saveScenario(scenarioName, `บันทึกเมื่อ ${new Date().toLocaleString('th-TH')}`)
    setShowSaveModal(false)
    setScenarioName('')
  }

  const provinces = useMemo(() => 
    Object.keys(electionData).sort((a, b) => a.localeCompare(b, 'th')), 
  [])

  return (
    <div className="space-y-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center"
      >
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            จำลองสถานการณ์
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            ปรับแต่งการโอนคะแนนจากพรรคอื่นมายังพรรคประชาธิปัตย์เพื่อดูผลลัพธ์
          </p>
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={() => setShowSaveModal(true)}
            disabled={!selectedProvince}
            className="glass-button flex items-center gap-2 text-democrat-600 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            บันทึก
          </button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Controls Panel */}
        <div className="lg:col-span-4 space-y-6">
          {/* Province Selection */}
          <div className="glass-card">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              เลือกจังหวัด
            </label>
            <div className="relative">
              <MapIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                value={selectedProvince || ''}
                onChange={(e) => {
                  setProvince(e.target.value || null)
                  resetTransfer()
                }}
                className="w-full glass-input bg-transparent pl-10 appearance-none"
              >
                <option value="">-- เลือกจังหวัด --</option>
                {provinces.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Transfer Sliders */}
          <AnimatePresence>
            {selectedProvince && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="glass-card space-y-4"
              >
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    โอนคะแนน (Transfer Votes)
                  </h3>
                  <button 
                    onClick={resetTransfer}
                    className="text-xs text-gray-500 hover:text-red-500 flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" /> รีเซ็ต
                  </button>
                </div>
                
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {availableParties.map(party => (
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

        {/* Results Panel */}
        <div className="lg:col-span-8 space-y-6">
          {selectedProvince && results ? (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-2 gap-4">
                <div className="glass-card bg-gradient-to-br from-blue-500/10 to-indigo-500/10 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">ที่นั่งที่ได้</p>
                    <p className="text-3xl font-bold text-democrat-600">{results.seatCount}</p>
                  </div>
                  <Trophy className="w-8 h-8 text-democrat-500 opacity-50" />
                </div>
                <div className="glass-card bg-gradient-to-br from-emerald-500/10 to-teal-500/10 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">พลิกชนะ</p>
                    <p className="text-3xl font-bold text-emerald-600">{results.flipCount}</p>
                  </div>
                  <RefreshCw className="w-8 h-8 text-emerald-500 opacity-50" />
                </div>
              </div>

              {/* District Table */}
              <div className="glass-card overflow-hidden">
                <div className="flex justify-between items-center mb-4 gap-4 flex-wrap">
                  <div className="flex gap-2">
                    {(['all', 'win', 'lose', 'close'] as FilterType[]).map((f) => (
                      <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`
                          px-3 py-1.5 rounded-lg text-sm transition-all
                          ${filter === f 
                            ? 'bg-democrat-600 text-white shadow-lg shadow-democrat-500/30' 
                            : 'hover:bg-gray-100 dark:hover:bg-white/10 text-gray-600 dark:text-gray-400'
                          }
                        `}
                      >
                        {f === 'all' ? 'ทั้งหมด' : 
                         f === 'win' ? 'ชนะ' :
                         f === 'lose' ? 'แพ้' : 'สูสี'}
                      </button>
                    ))}
                  </div>
                  
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="ค้นหาเขต..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="glass-input pl-9 py-1.5 text-sm w-40"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50/50 dark:bg-white/5 text-gray-500">
                      <tr>
                        <th className="px-4 py-3 rounded-tl-lg">เขต</th>
                        <th className="px-4 py-3">เดิม</th>
                        <th className="px-4 py-3 text-right">ปชป.เดิม</th>
                        <th className="px-4 py-3 text-right">ปชป.ใหม่</th>
                        <th className="px-4 py-3">ผู้ชนะใหม่</th>
                        <th className="px-4 py-3 text-center">สถานะ</th>
                        <th className="px-4 py-3 text-right rounded-tr-lg">ขาด</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-white/10">
                      {filteredRows.map((r) => (
                        <motion.tr 
                          key={r.district}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className={`
                            group hover:bg-white/10 transition-colors
                            ${r.status === 'win' ? 'bg-blue-50/30 dark:bg-blue-900/10' : ''}
                          `}
                        >
                          <td className="px-4 py-3 font-medium">{r.district}</td>
                          <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{r.originalWinner}</td>
                          <td className="px-4 py-3 text-right">{fmt(r.baseDem)}</td>
                          <td className="px-4 py-3 text-right font-semibold text-democrat-600 dark:text-blue-400">
                            {fmt(r.newDem)}
                          </td>
                          <td className="px-4 py-3">{r.newWinner}</td>
                          <td className="px-4 py-3 text-center">
                            <span className={`
                              inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                              ${r.status === 'win' 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                                : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                              }
                            `}>
                              {r.status === 'win' ? 'ชนะ' : 'แพ้'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right text-gray-500">
                            {r.votesNeeded ? fmt(r.votesNeeded) : '-'}
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                  
                  {filteredRows.length === 0 && (
                    <div className="p-8 text-center text-gray-400">
                      ไม่พบข้อมูล
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="glass-card h-full flex flex-col items-center justify-center text-center p-12 min-h-[400px]">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="w-8 h-8 text-democrat-500" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                ยังไม่ได้เลือกจังหวัด
              </h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-sm">
                กรุณาเลือกจังหวัดจากเมนูด้ายซ้ายเพื่อเริ่มการจำลองสถานการณ์และดูผลลัพธ์
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
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowSaveModal(false)}
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass relative bg-white dark:bg-gray-900 p-6 rounded-2xl w-full max-w-md shadow-2xl"
            >
              <h3 className="text-xl font-bold mb-4">บันทึกสถานการณ์</h3>
              <input
                type="text"
                placeholder="ตั้งชื่อสถานการณ์..."
                value={scenarioName}
                onChange={(e) => setScenarioName(e.target.value)}
                autoFocus
                className="w-full glass-input mb-6"
              />
              <div className="flex justify-end gap-2">
                <button 
                  onClick={() => setShowSaveModal(false)}
                  className="px-4 py-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                >
                  ยกเลิก
                </button>
                <button 
                  onClick={handleSave}
                  disabled={!scenarioName.trim()}
                  className="px-4 py-2 bg-democrat-600 text-white rounded-xl hover:bg-democrat-700 disabled:opacity-50 transition-colors shadow-lg shadow-democrat-500/30"
                >
                  บันทึกทันที
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
