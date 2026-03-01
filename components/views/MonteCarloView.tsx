'use client'

import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Play, RefreshCw, TrendingUp, BarChart2, Info } from 'lucide-react'
import { electionData } from '@/src/lib/data'
import { computeResults, TARGET_PARTY, fmt } from '@/lib/election'
import { useStore } from '@/lib/store'

interface MonteCarloResult {
  runs: number
  meanSeats: number
  stdDev: number
  minSeats: number
  maxSeats: number
  probabilities: { threshold: number; prob: number }[]
  distribution: { seats: number; count: number }[]
}

function runMonteCarlo(province: string | null, iterations: number = 1000): MonteCarloResult {
  if (!province) {
    return { runs: 0, meanSeats: 0, stdDev: 0, minSeats: 0, maxSeats: 0, probabilities: [], distribution: [] }
  }

  const districts = electionData[province] || []
  if (!districts.length) {
    return { runs: 0, meanSeats: 0, stdDev: 0, minSeats: 0, maxSeats: 0, probabilities: [], distribution: [] }
  }

  const seatResults: number[] = []

  for (let i = 0; i < iterations; i++) {
    // Generate random transfer configuration
    const config: Record<string, number> = {}
    const parties = new Set<string>()
    districts.forEach((d) => Object.keys(d.party_votes).forEach((p) => {
      if (p !== TARGET_PARTY) parties.add(p)
    }))

    parties.forEach((party) => {
      // Random transfer between 0-60%
      config[party] = Math.random() * 0.6
    })

    const { seatCount } = computeResults(districts, config)
    seatResults.push(seatCount)
  }

  const mean = seatResults.reduce((s, v) => s + v, 0) / iterations
  const variance = seatResults.reduce((s, v) => s + (v - mean) ** 2, 0) / iterations
  const stdDev = Math.sqrt(variance)
  const min = Math.min(...seatResults)
  const max = Math.max(...seatResults)

  const maxDistricts = districts.length
  const thresholds = [0.25, 0.5, 0.75, 1.0].map((frac) => ({
    threshold: Math.round(frac * maxDistricts),
    prob: seatResults.filter((s) => s >= Math.round(frac * maxDistricts)).length / iterations,
  }))

  // Distribution: bin by seat count
  const counts: Record<number, number> = {}
  seatResults.forEach((s) => { counts[s] = (counts[s] || 0) + 1 })
  const distribution = Object.entries(counts)
    .map(([seats, count]) => ({ seats: parseInt(seats), count }))
    .sort((a, b) => a.seats - b.seats)

  return { runs: iterations, meanSeats: mean, stdDev, minSeats: min, maxSeats: max, probabilities: thresholds, distribution }
}

export default function MonteCarloView() {
  const { selectedProvince, setView } = useStore()
  const [result, setResult] = useState<MonteCarloResult | null>(null)
  const [iterations, setIterations] = useState(500)
  const [isRunning, setIsRunning] = useState(false)

  const run = useCallback(async () => {
    if (!selectedProvince) return
    setIsRunning(true)
    await new Promise((resolve) => setTimeout(resolve, 50)) // Let UI update
    const res = runMonteCarlo(selectedProvince, iterations)
    setResult(res)
    setIsRunning(false)
  }, [selectedProvince, iterations])

  const maxCount = result?.distribution ? Math.max(...result.distribution.map((d) => d.count)) : 1

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Monte Carlo Simulation</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          วิเคราะห์ความน่าจะเป็นของการชนะโดยใช้การจำลองแบบสุ่ม
        </p>
      </div>

      {/* Info Banner */}
      <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
        <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-700 dark:text-blue-300 leading-relaxed">
          <strong>วิธีการทำงาน:</strong> ระบบจะสุ่มค่าการโอนคะแนน (0-60%) จากพรรคต่างๆ ไปยังประชาธิปัตย์ซ้ำหลายพันครั้ง
          เพื่อคำนวณความน่าจะเป็นของการได้ที่นั่งในแต่ละระดับ
        </div>
      </div>

      {/* Controls */}
      <div className="glass-card">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">ตั้งค่าการจำลอง</h3>
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">จังหวัด</label>
            {selectedProvince ? (
              <div className="px-4 py-2.5 bg-brand-50 dark:bg-brand-900/20 border border-brand-200 dark:border-brand-800 rounded-xl text-sm font-semibold text-brand-700 dark:text-brand-300">
                {selectedProvince}
              </div>
            ) : (
              <button
                onClick={() => setView('simulation')}
                className="btn-secondary"
              >
                เลือกจังหวัด
              </button>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
              จำนวนรอบ: <span className="text-brand-600 dark:text-brand-400">{iterations.toLocaleString()}</span>
            </label>
            <div className="flex gap-2">
              {[100, 500, 1000, 2000].map((n) => (
                <button
                  key={n}
                  onClick={() => setIterations(n)}
                  className={`px-3 py-2 rounded-xl text-sm font-semibold transition-all ${
                    iterations === n
                      ? 'bg-brand-600 text-white shadow-sm shadow-brand-600/25'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {n.toLocaleString()}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={run}
            disabled={!selectedProvince || isRunning}
            className="btn-primary"
          >
            {isRunning ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Play className="w-4 h-4" />
            )}
            {isRunning ? 'กำลังจำลอง...' : 'เริ่มจำลอง'}
          </button>
        </div>
      </div>

      {/* Results */}
      {result && result.runs > 0 && (
        <>
          {/* Key Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'ที่นั่งเฉลี่ย', value: result.meanSeats.toFixed(1), sub: 'จากการจำลอง', color: 'text-brand-600 dark:text-brand-400' },
              { label: 'ส่วนเบี่ยงเบน', value: result.stdDev.toFixed(1), sub: 'Standard Deviation', color: 'text-violet-600 dark:text-violet-400' },
              { label: 'น้อยสุด', value: result.minSeats, sub: 'ที่นั่ง', color: 'text-red-600 dark:text-red-400' },
              { label: 'มากสุด', value: result.maxSeats, sub: 'ที่นั่ง', color: 'text-emerald-600 dark:text-emerald-400' },
            ].map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.07 }}
                className="glass-card text-center"
              >
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{item.label}</p>
                <p className={`text-3xl font-black mt-1 ${item.color}`}>{item.value}</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{item.sub}</p>
              </motion.div>
            ))}
          </div>

          {/* Distribution Chart */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card"
          >
            <div className="flex items-center gap-2 mb-5">
              <BarChart2 className="w-5 h-5 text-brand-500" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">การกระจายที่นั่ง</h3>
              <span className="ml-auto text-xs text-slate-400">{result.runs.toLocaleString()} รอบ</span>
            </div>
            <div className="flex items-end gap-0.5 h-32">
              {result.distribution.map((point, i) => {
                const height = (point.count / maxCount) * 100
                return (
                  <div
                    key={point.seats}
                    className="flex-1 flex flex-col items-center group cursor-default"
                    title={`${point.seats} ที่นั่ง: ${point.count} ครั้ง (${((point.count / result.runs) * 100).toFixed(1)}%)`}
                  >
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${height}%` }}
                      transition={{ delay: 0.1 + i * 0.02, duration: 0.4, ease: 'easeOut' }}
                      className="w-full rounded-t-sm bg-brand-500 group-hover:bg-brand-400 transition-colors"
                    />
                  </div>
                )
              })}
            </div>
            <div className="flex justify-between text-xs text-slate-400 mt-2">
              <span>{result.minSeats} ที่นั่ง</span>
              <span className="text-brand-500 font-semibold">เฉลี่ย {result.meanSeats.toFixed(1)}</span>
              <span>{result.maxSeats} ที่นั่ง</span>
            </div>
          </motion.div>

          {/* Probability Table */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card"
          >
            <div className="flex items-center gap-2 mb-5">
              <TrendingUp className="w-5 h-5 text-brand-500" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">ความน่าจะเป็น</h3>
            </div>
            <div className="space-y-4">
              {result.probabilities.map((p, i) => (
                <motion.div
                  key={p.threshold}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.35 + i * 0.07 }}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      ได้อย่างน้อย <strong className="text-slate-900 dark:text-white">{p.threshold}</strong> ที่นั่ง
                    </span>
                    <span
                      className={`text-sm font-bold ${
                        p.prob >= 0.7 ? 'text-emerald-600 dark:text-emerald-400' :
                        p.prob >= 0.4 ? 'text-amber-600 dark:text-amber-400' :
                        'text-red-600 dark:text-red-400'
                      }`}
                    >
                      {(p.prob * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${p.prob * 100}%` }}
                      transition={{ delay: 0.4 + i * 0.07, duration: 0.5, ease: 'easeOut' }}
                      className={`h-full rounded-full ${
                        p.prob >= 0.7 ? 'bg-emerald-500' :
                        p.prob >= 0.4 ? 'bg-amber-500' :
                        'bg-red-500'
                      }`}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </div>
  )
}
