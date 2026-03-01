'use client'

import { useStore, ViewId } from '@/lib/store'
import { motion } from 'framer-motion'
import {
  LayoutDashboard,
  Sparkles,
  BookmarkCheck,
  TrendingUp,
  Dices,
  Trophy,
  Building2,
  LucideIcon,
  ChevronRight,
} from 'lucide-react'

interface NavItem {
  id: ViewId
  label: string
  icon: LucideIcon
  badge?: string
  badgeColor?: string
  dividerBefore?: boolean
}

const navItems: NavItem[] = [
  {
    id: 'dashboard',
    label: 'ภาพรวม',
    icon: LayoutDashboard,
  },
  {
    id: 'results2569',
    label: 'ผลเลือกตั้ง 2569',
    icon: Trophy,
    badge: 'ใหม่',
    badgeColor: 'bg-amber-500',
  },
  {
    id: 'coalition-builder',
    label: 'จำลองจัดตั้งรัฐบาล',
    icon: Building2,
    badge: 'HOT',
    badgeColor: 'bg-rose-500',
    dividerBefore: true,
  },
  {
    id: 'simulation',
    label: 'จำลองโอนคะแนน',
    icon: Sparkles,
    dividerBefore: true,
  },
  {
    id: 'scenarios',
    label: 'สถานการณ์บันทึกไว้',
    icon: BookmarkCheck,
  },
  {
    id: 'analytics',
    label: 'วิเคราะห์เชิงลึก',
    icon: TrendingUp,
  },
  {
    id: 'monte-carlo',
    label: 'Monte Carlo',
    icon: Dices,
  },
]

export default function Sidebar() {
  const { currentView, setView } = useStore()

  return (
    <aside className="fixed top-16 left-0 h-[calc(100vh-4rem)] w-72 bg-white border-r border-slate-200 flex flex-col overflow-y-auto z-40">
      {/* Logo area */}
      <div className="px-5 py-5 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <img
            src="https://uploads.democrat.or.th/uploads/2025/12/main-logo_1.svg"
            alt="พรรคประชาธิปัตย์"
            className="h-7 w-auto"
          />
        </div>
        <p className="text-[10px] text-slate-400 mt-2 font-medium tracking-wide uppercase">
          Election Simulator Pro v2.0
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4">
        {navItems.map((item, i) => {
          const Icon = item.icon
          const isActive = currentView === item.id

          return (
            <div key={item.id}>
              {item.dividerBefore && (
                <div className="border-t border-slate-100 my-2" />
              )}
              <motion.button
                initial={{ x: -12, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: i * 0.05, type: 'spring', stiffness: 300 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setView(item.id)}
                className={`
                  relative flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 mb-0.5
                  ${isActive
                    ? 'bg-[#0078b8] text-white shadow-md shadow-[#0078b8]/25'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }
                `}
              >
                <Icon
                  size={17}
                  className={`flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`}
                />
                <span className="flex-1 text-left truncate">{item.label}</span>

                {item.badge && (
                  <span className={`text-[9px] font-bold text-white px-1.5 py-0.5 rounded-full leading-none ${item.badgeColor || 'bg-[#0078b8]'}`}>
                    {item.badge}
                  </span>
                )}

                {isActive && (
                  <ChevronRight className="w-3.5 h-3.5 text-white/70 flex-shrink-0" />
                )}
              </motion.button>
            </div>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-slate-100">
        <div className="px-4 py-3 rounded-xl bg-slate-50">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">แหล่งข้อมูล</p>
          <p className="text-xs text-slate-500">ผลเลือกตั้ง 2566: กกต.</p>
          <p className="text-xs text-slate-500">ผลเลือกตั้ง 2569: TheStandard</p>
        </div>
      </div>
    </aside>
  )
}
