
import { useStore } from '@/lib/store'
import { motion } from 'framer-motion'
import { 
  LayoutDashboard, 
  Sparkles, 
  BookmarkCheck, 
  TrendingUp, 
  Dices,
  LucideIcon
} from 'lucide-react'

interface NavItem {
  id: string
  label: string
  icon: LucideIcon
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'ภาพรวม', icon: LayoutDashboard },
  { id: 'simulation', label: 'จำลองสถานการณ์', icon: Sparkles },
  { id: 'scenarios', label: 'สถานการณ์ที่บันทึก', icon: BookmarkCheck },
  { id: 'analytics', label: 'วิเคราะห์', icon: TrendingUp },
  { id: 'monte-carlo', label: 'Monte Carlo', icon: Dices },
]

export default function Sidebar() {
  const { currentView, setView } = useStore()
  
  return (
    <aside className="sticky top-24 h-[calc(100vh-8rem)] w-64 glass rounded-2xl p-4 flex flex-col gap-2 overflow-y-auto">
      {navItems.map((item, i) => {
        const Icon = item.icon
        const isActive = currentView === item.id
        
        return (
          <motion.button
            key={item.id}
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ x: 4, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setView(item.id)}
            className={`
              relative flex items-center gap-3 px-4 py-3 rounded-xl
              font-semibold text-sm transition-all duration-300
              ${isActive 
                ? 'bg-gradient-to-r from-democrat-600 to-democrat-500 text-white shadow-lg shadow-democrat-500/30' 
                : 'text-gray-700 dark:text-gray-300 hover:bg-white/20 dark:hover:bg-white/5'
              }
            `}
          >
            <Icon className="w-5 h-5" />
            <span>{item.label}</span>
            
            {isActive && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 bg-gradient-to-r from-democrat-600 to-democrat-500 rounded-xl -z-10"
                transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
              />
            )}
          </motion.button>
        )
      })}
      
      <div className="mt-auto pt-4 border-t border-white/20 dark:border-white/10">
        <div className="text-xs text-center text-gray-500 dark:text-gray-400 font-semibold">
          v2.0 Professional
        </div>
      </div>
    </aside>
  )
}
