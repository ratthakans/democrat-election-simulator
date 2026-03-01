'use client'

import Image from 'next/image'
import { useStore } from '@/lib/store'
import { ChevronRight } from 'lucide-react'

export default function Header() {
  const { currentView } = useStore()

  const viewLabels: Record<string, string> = {
    dashboard: 'ภาพรวม',
    results2569: 'ผลเลือกตั้ง 2569',
    'coalition-builder': 'จำลองจัดตั้งรัฐบาล',
    simulation: 'จำลองสถานการณ์',
    scenarios: 'สถานการณ์บันทึกไว้',
    analytics: 'วิเคราะห์เชิงลึก',
    'monte-carlo': 'Monte Carlo',
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-[1800px] mx-auto h-full px-6 flex items-center justify-between">
        {/* Left: Logo + breadcrumb */}
        <div className="flex items-center gap-5">
          {/* Democrat Party Logo */}
          <a href="https://www.democrat.or.th" target="_blank" rel="noopener noreferrer" className="flex-shrink-0">
            <img
              src="https://uploads.democrat.or.th/uploads/2025/12/main-logo_1.svg"
              alt="พรรคประชาธิปัตย์"
              className="h-8 w-auto"
            />
          </a>

          {/* Divider + breadcrumb */}
          <div className="flex items-center gap-1.5 pl-5 border-l border-slate-200">
            <span className="text-xs text-slate-400">หน้า</span>
            <ChevronRight className="w-3 h-3 text-slate-300" />
            <span className="text-xs font-semibold text-slate-700">
              {viewLabels[currentView] || 'ภาพรวม'}
            </span>
          </div>
        </div>

        {/* Right: Status badge */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-sky-50 border border-sky-200">
          <div className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse" />
          <span className="text-xs font-semibold text-sky-700">
            ข้อมูล Election 2569
          </span>
        </div>
      </div>
    </header>
  )
}
