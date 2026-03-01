import { useState, useCallback } from 'react'
import { useStore } from '@/lib/store'
import { computeResults, fmt } from '@/lib/election'
import { electionData } from '@/lib/data'
import { motion, AnimatePresence } from 'framer-motion'
import { Dices, PlayCircle, RotateCcw } from 'lucide-react'
import BarChart from '@/components/charts/BarChart'

interface SimulationResults {
  mean: number
  median: number
  ciLow: number
  ciHigh: number
  probMajority: number
  histogram: number[]
  labels: string[]
}

export default function MonteCarloView() {
  const { selectedProvince, transferConfig } = useStore()
  
  const [iterations, setIterations] = useState(1000)
  const [stdDev, setStdDev] = useState(3) // 3%
  const [isRunning, setIsRunning] = useState(false)
  const [progress, setProgress] = useState(0)
  const [results, setResults] = useState<SimulationResults | null>(null)

  const finishSimulation = useCallback((data: number[]) => {
    data.sort((a, b) => a - b)
    
    // Stats
    const mean = data.reduce((a, b) => a + b, 0) / data.length
    const median = data[Math.floor(data.length / 2)]
    const ciLow = data[Math.floor(data.length * 0.025)] || data[0]
    const ciHigh = data[Math.floor(data.length * 0.975)] || data[data.length - 1]
    const probMajority = data.filter(r => r > (data.length / 2)).length / data.length

    // Histogram
    const min = data[0]
    const max = data[data.length - 1]
    const bins = 10
    const binSize = Math.max(1, Math.ceil((max - min + 1) / bins))
    
    const histogram = new Array(bins).fill(0)
    data.forEach(v => {
      const idx = Math.min(bins - 1, Math.floor((v - min) / binSize))
      histogram[idx]++
    })

    const labels = Array.from({ length: bins }, (_, i) => 
      `${Math.floor(min + i * binSize)}`
    )

    setResults({
      mean,
      median,
      ciLow,
      ciHigh,
      probMajority,
      histogram,
      labels
    })
    setIsRunning(false)
  }, [])

  const runSimulation = useCallback(() => {
    if (!selectedProvince) return
    setIsRunning(true)
    setProgress(0)
    setResults(null)

    const districts = electionData[selectedProvince] || []
    const simResults: number[] = []
    
    // Non-blocking loop using setTimeout
    const batchSize = 100
    let currentIter = 0
    const totalIterations = iterations 

    const processBatch = () => {
      for (let i = 0; i < batchSize && currentIter < totalIterations; i++) {
        // Create variations
        const variedConfig: { [key: string]: number } = {}
        Object.entries(transferConfig).forEach(([party, pct]) => {
          const noise = (Math.random() - 0.5) * 2 * (stdDev / 100)
          variedConfig[party] = Math.max(0, Math.min(1, pct + noise))
        })

        const res = computeResults(districts, variedConfig)
        simResults.push(res.seatCount)
        currentIter++
      }

      setProgress(Math.round((currentIter / totalIterations) * 100))

      if (currentIter < totalIterations) {
        setTimeout(processBatch, 0)
      } else {
        finishSimulation(simResults)
      }
    }

    setTimeout(processBatch, 0)
  }, [selectedProvince, iterations, stdDev, transferConfig, finishSimulation])

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Monte Carlo Simulation
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          จำลองสถานการณ์ที่มีความไม่แน่นอน (Uncertainty) ตามหลักสถิติ
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Settings Panel */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-card space-y-6">
            <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Dices className="w-5 h-5 text-democrat-500" />
              ตั้งค่าการจำลอง
            </h3>

            {!selectedProvince && (
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/10 text-yellow-800 dark:text-yellow-200 text-sm rounded-lg">
                กรุณาเลือกจังหวัดในหน้า "จำลองสถานการณ์" ก่อน
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2">
                จำนวนรอบ (Iterations): <span className="text-democrat-600 font-bold">{fmt(iterations)}</span>
              </label>
              <input
                type="range"
                min="100"
                max="10000"
                step="100"
                value={iterations}
                onChange={(e) => setIterations(parseInt(e.target.value))}
                className="w-full accent-democrat-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                ค่าเบี่ยงเบนมาตรฐาน (Std Dev): <span className="text-democrat-600 font-bold">{stdDev}%</span>
              </label>
              <input
                type="range"
                min="1"
                max="20"
                step="0.5"
                value={stdDev}
                onChange={(e) => setStdDev(parseFloat(e.target.value))}
                className="w-full accent-democrat-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                ยิ่งค่าสูง ผลลัพธ์จะยิ่งกระจายตัวมาก
              </p>
            </div>

            <button
              onClick={runSimulation}
              disabled={isRunning || !selectedProvince}
              className={`
                w-full py-3 rounded-xl font-bold text-white shadow-lg transition-all
                ${isRunning 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-democrat-600 to-democrat-500 hover:from-democrat-500 hover:to-democrat-400 active:scale-95 shadow-democrat-500/30'
                }
              `}
            >
              {isRunning ? (
                <span className="flex items-center justify-center gap-2">
                  <RotateCcw className="w-5 h-5 animate-spin" />
                  กำลังประมวลผล {progress}%...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <PlayCircle className="w-5 h-5" />
                  เริ่มการจำลอง
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-8 space-y-6">
          <AnimatePresence mode="wait">
            {results ? (
              <motion.div
                key="results"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="space-y-6"
              >
                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: "ค่าเฉลี่ย (Mean)", value: results.mean.toFixed(1) },
                    { label: "มัธยฐาน (Median)", value: results.median },
                    { label: "95% CI", value: `${results.ciLow} - ${results.ciHigh}` },
                    { label: "ความน่าเชื่อถือ", value: "95%" },
                  ].map((stat, i) => (
                    <div key={i} className="glass-card bg-white/50 dark:bg-white/5 p-4 text-center">
                      <p className="text-xs text-gray-500 mb-1">{stat.label}</p>
                      <p className="text-xl font-bold text-democrat-600 dark:text-white">
                        {stat.value}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Chart */}
                <div className="glass-card p-6">
                  <h3 className="font-bold text-gray-900 dark:text-white mb-4">
                    การกระจายตัวของจำนวนที่นั่ง (Distribution)
                  </h3>
                  <div className="h-[300px]">
                    <BarChart
                      data={{
                        labels: results.labels,
                        datasets: [{
                          label: 'ความถี่',
                          data: results.histogram,
                          backgroundColor: 'rgba(59, 130, 246, 0.6)'
                        }]
                      }}
                      options={{ maintainAspectRatio: false }}
                    />
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="glass-card h-full flex items-center justify-center text-gray-400 p-12 min-h-[400px]"
              >
                <div className="text-center">
                  <Dices className="w-16 h-16 mx-auto mb-4 opacity-20" />
                  <p>กดปุ่ม "เริ่มการจำลอง" เพื่อดูผลลัพธ์</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
