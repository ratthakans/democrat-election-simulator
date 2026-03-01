import { useEffect, Suspense, lazy } from 'react'
import { useStore } from '@/lib/store'
import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
import { ErrorBoundary } from '@/components/ErrorBoundary'

// Lazy loaded views for better performance
const DashboardView = lazy(() => import('@/components/views/DashboardView'))
const SimulationView = lazy(() => import('@/components/views/SimulationView'))
const ScenariosView = lazy(() => import('@/components/views/ScenariosView'))
const AnalyticsView = lazy(() => import('@/components/views/AnalyticsView'))
const MonteCarloView = lazy(() => import('@/components/views/MonteCarloView'))

const LoadingFallback = () => (
  <div className="flex h-96 w-full items-center justify-center">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
  </div>
)

const ViewComponents: { [key: string]: React.LazyExoticComponent<React.ComponentType> } = {
  dashboard: DashboardView,
  simulation: SimulationView,
  scenarios: ScenariosView,
  analytics: AnalyticsView,
  'monte-carlo': MonteCarloView,
}

function App() {
  const { currentView, theme } = useStore()
  
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])
  
  const ViewComponent = ViewComponents[currentView] || DashboardView
  
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <Header />
        
        <div className="flex max-w-[1600px] mx-auto pt-24">
          <Sidebar />
          
          <main className="flex-1 ml-72 mr-4 mb-8 p-6 transition-all duration-300">
            <Suspense fallback={<LoadingFallback />}>
              <ViewComponent />
            </Suspense>
          </main>
        </div>
      </div>
    </ErrorBoundary>
  )
}

export default App
