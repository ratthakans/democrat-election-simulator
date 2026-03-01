
import { useStore } from '@/lib/store'
import { motion, AnimatePresence } from 'framer-motion'
import { Trash2, Play, Calendar, MapPin } from 'lucide-react'

export default function ScenariosView() {
  const { scenarios, loadScenario, deleteScenario } = useStore()

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          สถานการณ์ที่บันทึกไว้
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          เรียกดูและจัดการสถานการณ์ที่คุณได้ทำการจำลองไว้
        </p>
      </motion.div>

      {scenarios.length === 0 ? (
        <div className="glass-card flex flex-col items-center justify-center p-12 min-h-[400px] text-center">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
            <MapPin className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            ยังไม่มีข้อมูล
          </h3>
          <p className="text-gray-500 max-w-sm mx-auto">
            คุณสามารถสร้างและบันทึกสถานการณ์ได้จากหน้า "จำลองสถานการณ์"
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {scenarios.map((scenario) => (
              <motion.div
                key={scenario.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="glass-card group relative hover:border-democrat-500/50 transition-colors"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white group-hover:text-democrat-600 transition-colors">
                      {scenario.name}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                      <Calendar className="w-3 h-3" />
                      {scenario.createdAt}
                    </div>
                  </div>
                  <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-md">
                    {scenario.province}
                  </span>
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 line-clamp-2">
                  {scenario.notes || 'ไม่มีบันทึกเพิ่มเติม'}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-white/5">
                  <div className="text-xs text-gray-500">
                    {Object.keys(scenario.transferConfig).length} การตั้งค่าโอนคะแนน
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => deleteScenario(scenario.id)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors"
                      title="ลบ"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => loadScenario(scenario.id)}
                      className="flex items-center gap-2 px-3 py-1.5 bg-democrat-600 text-white rounded-lg hover:bg-democrat-700 shadow-lg shadow-democrat-500/20 active:scale-95 transition-all text-sm font-medium"
                    >
                      <Play className="w-3 h-3" />
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
