import { motion } from 'framer-motion'
import { TrendingUp, Activity, BarChart2 } from 'lucide-react'
import BarChart from '@/components/charts/BarChart'

export default function AnalyticsView() {
  // Mock data for trends
  const trendData = {
    labels: ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.'],
    datasets: [
      {
        label: 'ความนิยมพรรคประชาธิปัตย์',
        data: [12, 14, 13, 15, 18, 22],
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        borderColor: '#3b82f6',
        borderWidth: 2,
        tension: 0.4
      }
    ]
  }

  const swingData = {
    labels: ['เพื่อไทย', 'ก้าวไกล', 'ภูมิใจไทย', 'พปชร.', 'อื่นๆ'],
    datasets: [
      {
        label: 'โอกาส Swing Vote (%)',
        data: [15, 25, 10, 5, 45],
        backgroundColor: [
          'rgba(239, 68, 68, 0.7)',
          'rgba(249, 115, 22, 0.7)',
          'rgba(34, 197, 94, 0.7)',
          'rgba(59, 130, 246, 0.7)',
          'rgba(148, 163, 184, 0.7)',
        ]
      }
    ]
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          วิเคราะห์แนวโน้ม (Analytics)
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          ข้อมูลเชิงลึกและการวิเคราะห์ Swing Vote รายพื้นที่
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-gray-900 dark:text-white">
              แนวโน้มคะแนนนิยม (Trend Analysis)
            </h3>
          </div>
          <div className="h-[300px]">
            <BarChart data={trendData} options={{ maintainAspectRatio: false }} />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg text-orange-600">
              <Activity className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-gray-900 dark:text-white">
              การวิเคราะห์ Swing Vote
            </h3>
          </div>
          <div className="h-[300px]">
            <BarChart 
              data={swingData} 
              options={{ 
                maintainAspectRatio: false, 
                indexAxis: 'y' as const 
              }} 
            />
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-card"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg text-purple-600">
            <BarChart2 className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-gray-900 dark:text-white">
            พื้นที่ที่มีการแข่งขันสูง (High Competitive Districts)
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-gray-500 bg-gray-50 dark:bg-white/5">
              <tr>
                <th className="px-4 py-3 rounded-tl-lg">จังหวัด</th>
                <th className="px-4 py-3">เขต</th>
                <th className="px-4 py-3">ความต่างคะแนน</th>
                <th className="px-4 py-3">โอกาสพลิก</th>
                <th className="px-4 py-3 rounded-tr-lg text-right">คู่แข่งสำคัญ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
              {[1, 2, 3, 4, 5].map((i) => (
                <tr key={i} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3">กรุงเทพมหานคร</td>
                  <td className="px-4 py-3">เขต {i * 3}</td>
                  <td className="px-4 py-3 text-red-500">-{i * 150}</td>
                  <td className="px-4 py-3">
                    <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-yellow-500" style={{ width: `${80 - i * 10}%` }} />
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right text-orange-500">ก้าวไกล</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  )
}
