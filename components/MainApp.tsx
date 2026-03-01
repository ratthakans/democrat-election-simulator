'use client'

import { Suspense, lazy } from 'react'
import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
import { useStore } from '@/lib/store'

const DashboardView = lazy(() => import('@/components/views/DashboardView'))
const Results2569View = lazy(() => import('@/components/views/Results2569View'))
const CoalitionBuilderView = lazy(() => import('@/components/views/CoalitionBuilderView'))
const SimulationView = lazy(() => import('@/components/views/SimulationView'))
const ScenariosView = lazy(() => import('@/components/views/ScenariosView'))
const AnalyticsView = lazy(() => import('@/components/views/AnalyticsView'))
const MonteCarloView = lazy(() => import('@/components/views/MonteCarloView'))

function LoadingFallback() {
  return (
    <div className="flex h-64 w-full items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#0078b8] border-t-transparent" />
        <p className="text-sm text-slate-400 font-medium">กำลังโหลด...</p>
      </div>
    </div>
  )
}

// ─── View Registry (Controller-level routing) ──────────────────────────────────

const VIEW_MAP = {
  dashboard: DashboardView,
  results2569: Results2569View,
  'coalition-builder': CoalitionBuilderView,
  simulation: SimulationView,
  scenarios: ScenariosView,
  analytics: AnalyticsView,
  'monte-carlo': MonteCarloView,
} as const

// ─── Main Layout Component ─────────────────────────────────────────────────────

export default function MainApp() {
  const { currentView } = useStore()
  const ViewComponent = VIEW_MAP[currentView as keyof typeof VIEW_MAP] ?? DashboardView

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <div className="flex max-w-[1800px] mx-auto pt-16">
        <Sidebar />
        {/* ml-64 matches sidebar w-64 */}
        <main className="flex-1 min-w-0 ml-64 p-6 pb-12">
          <Suspense fallback={<LoadingFallback />}>
            <ViewComponent />
          </Suspense>
        </main>
      </div>
    </div>
  )
}
