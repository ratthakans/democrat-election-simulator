'use client'

import { useStore } from '@/lib/store'
import { ChevronRight } from 'lucide-react'

// ─── Constants ────────────────────────────────────────────────────────────────

const LOGO_URL = 'https://uploads.democrat.or.th/uploads/2025/12/main-logo_1.svg'

const VIEW_LABELS: Record<string, string> = {
  dashboard: 'ภาพรวม',
  results2569: 'ผลเลือกตั้ง 2569',
  'coalition-builder': 'จำลองจัดตั้งรัฐบาล',
  simulation: 'จำลองโอนคะแนน',
  scenarios: 'สถานการณ์ที่บันทึกไว้',
  analytics: 'วิเคราะห์เชิงลึก',
  'monte-carlo': 'Monte Carlo',
}

// ─── Component ─────────────────────────────────────────────────────────────────

export default function Header() {
  const { currentView } = useStore()
  const currentLabel = VIEW_LABELS[currentView] ?? 'ภาพรวม'

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-[1800px] mx-auto h-full px-6 flex items-center justify-between">

        {/* Left: Logo + App name + breadcrumb */}
        <div className="flex items-center gap-4">
          {/* Democrat Party Logo — single instance, contained to header only */}
          <a
            href="https://www.democrat.or.th"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0 flex items-center"
            title="พรรคประชาธิปัตย์"
          >
            <img
              src={LOGO_URL}
              alt="พรรคประชาธิปัตย์"
              className="h-9 w-auto object-contain"
              style={{ maxWidth: '140px' }}
            />
          </a>

          {/* Divider */}
          <div className="h-6 w-px bg-slate-200 flex-shrink-0" />

          {/* App name */}
          <span className="text-sm font-semibold text-slate-700 whitespace-nowrap">
            Election Simulator
          </span>

          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 pl-4 border-l border-slate-200">
            <span className="text-xs text-slate-400">หน้า</span>
            <ChevronRight className="w-3 h-3 text-slate-300" />
            <span className="text-xs font-semibold text-slate-700">{currentLabel}</span>
          </div>
        </div>

        {/* Right: Live data badge */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-sky-50 border border-sky-200">
          <div className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse" />
          <span className="text-xs font-semibold text-sky-700">ข้อมูล 2569</span>
        </div>
      </div>
    </header>
  )
}
