'use client'

import { useStore } from '@/lib/store'
import { motion, AnimatePresence } from 'framer-motion'
import { Trash2, Play, Calendar, MapPin, BookmarkX } from 'lucide-react'

export default function ScenariosView() {
  const { scenarios, loadScenario, deleteScenario } = useStore()

  return (
    <div className="space-y-8 animate-fadeIn">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          สถานการณ์บันทึกไว้
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          เรียกดูและจัดการสถานการณ์ที่คุณจำลองไว้ ({scenarios.length} รายการ)
        </p>
      </div>

      {scenarios.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card flex flex-col items-center justify-center text-center p-16 min-h-[400px]"
        >
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-4">
            <BookmarkX className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">ยังไม่มีสถานการณ์</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs leading-relaxed">
            ไปที่หน้า &ldquo;จำลองสถานการณ์&rdquo; เพื่อสร้างและบันทึกการตั้งค่าของคุณ
          </p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          <AnimatePresence mode="popLayout">
            {scenarios.map((scenario, i) => (
              <motion.div
                key={scenario.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: i * 0.05 }}
                className="glass-card group flex flex-col hover:shadow-md transition-all duration-200"
              >
                {/* Card Header */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="min-w-0">
                    <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors truncate">
                      {scenario.name}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-1">
                      <Calendar className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">{scenario.createdAt}</span>
                    </div>
                  </div>
                  <span className="badge badge-blue flex-shrink-0">
                    <MapPin className="w-2.5 h-2.5 mr-0.5" />
                    {scenario.province}
                  </span>
                </div>

                {/* Notes */}
                <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 flex-1 mb-4">
                  {scenario.notes || 'ไม่มีบันทึกเพิ่มเติม'}
                </p>

                {/* Transfer settings preview */}
                {Object.entries(scenario.transferConfig).filter(([, v]) => v > 0).length > 0 && (
                  <div className="mb-4 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl space-y-1.5">
                    {Object.entries(scenario.transferConfig)
                      .filter(([, v]) => v > 0)
                      .slice(0, 3)
                      .map(([party, val]) => (
                        <div key={party} className="flex items-center justify-between text-xs">
                          <span className="text-slate-600 dark:text-slate-400 truncate max-w-[120px]">{party}</span>
                          <span className="font-bold text-brand-600 dark:text-brand-400">
                            {Math.round(val * 100)}%
                          </span>
                        </div>
                      ))}
                    {Object.values(scenario.transferConfig).filter((v) => v > 0).length > 3 && (
                      <p className="text-xs text-slate-400 dark:text-slate-500">
                        +{Object.values(scenario.transferConfig).filter((v) => v > 0).length - 3} เพิ่มเติม
                      </p>
                    )}
                  </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-xs text-slate-400 dark:text-slate-500">
                    {Object.values(scenario.transferConfig).filter((v) => v > 0).length} การตั้งค่า
                  </span>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => deleteScenario(scenario.id)}
                      className="btn-danger p-2"
                      title="ลบสถานการณ์"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => loadScenario(scenario.id)}
                      className="btn-primary text-xs px-3 py-1.5"
                    >
                      <Play className="w-3.5 h-3.5" />
                      โหลด
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
