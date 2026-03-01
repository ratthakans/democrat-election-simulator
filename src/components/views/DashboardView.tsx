
import { motion } from 'framer-motion'
import { Users, Trophy, Zap, DollarSign } from 'lucide-react'
import { useElectionStats } from '@/hooks/useElectionStats'
import { fmt } from '@/lib/election'
import StatCard from '@/components/StatCard'
import BarChart from '@/components/charts/BarChart'
import DoughnutChart from '@/components/charts/DoughnutChart'

const COLORS = [
  '#3b82f6', // Democrat
  '#ef4444', // Pheu Thai
  '#f97316', // Move Forward
  '#22c55e', // Bhumjaithai
  '#a855f7', // Others
]

export default function DashboardView() {
  const stats = useElectionStats()

  const chartConfig = {
    labels: stats.chartLabels,
    datasets: [{
      label: 'จำนวนที่นั่ง',
      data: stats.chartData,
      backgroundColor: COLORS,
      borderWidth: 0
    }]
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          ภาพรวมการเลือกตั้ง
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          สรุปข้อมูลและสถิติการทำนายผลการเลือกตั้งทั่วประเทศ (ทั้งหมด {stats.totalDistricts} เขต)
        </p>
      </motion.div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          label="ที่นั่ง ปชป."
          value={stats.democratSeats}
          change={`จาก ${stats.totalDistricts} เขต`}
          icon={Users}
          variant="primary"
        />
        <StatCard 
          label="อันดับพรรค"
          value={stats.democratRank}
          change="ครองเสียงข้างมาก"
          icon={Trophy}
          variant="success"
        />
        <StatCard 
          label="เขตที่พลิกชนะ"
          value={stats.flipCount}
          change="เพิ่มขึ้นจากเดิม"
          icon={Zap}
          variant="warning"
        />
        <StatCard 
          label="งบประมาณ (ล้าน)"
          value={fmt(stats.democratSeats * 2.5)}
          change="คำนวณจาก 2.5 ล./เขต"
          icon={DollarSign}
          variant="info"
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="การกระจายที่นั่ง ส.ส. (5 อันดับแรก)" delay={0.2}>
          <BarChart data={chartConfig} />
        </ChartCard>
        
        <ChartCard title="สัดส่วนที่นั่งในสภา" delay={0.3}>
          <DoughnutChart data={chartConfig} />
        </ChartCard>
      </div>
    </div>
  )
}

function ChartCard({ children, title, delay }: { children: React.ReactNode, title: string, delay: number }) {
  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
      className="glass-card"
    >
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
        {title}
      </h3>
      <div className="h-64">
        {children}
      </div>
    </motion.div>
  )
}

