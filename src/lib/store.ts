import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface TransferConfig {
  [party: string]: number
}

interface Scenario {
  id: string
  name: string
  notes: string
  province: string
  transferConfig: TransferConfig
  createdAt: string
}

interface AppState {
  theme: 'light' | 'dark'
  currentView: string
  selectedProvince: string | null
  transferConfig: TransferConfig
  scenarios: Scenario[]
  
  setTheme: (theme: 'light' | 'dark') => void
  setView: (view: string) => void
  setProvince: (province: string | null) => void
  updateTransfer: (party: string, value: number) => void
  resetTransfer: () => void
  saveScenario: (name: string, notes: string) => void
  loadScenario: (id: string) => void
  deleteScenario: (id: string) => void
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      theme: 'light',
      currentView: 'dashboard',
      selectedProvince: null,
      transferConfig: {},
      scenarios: [],
      
      setTheme: (theme: 'light' | 'dark') => {
        set({ theme })
        document.documentElement.classList.toggle('dark', theme === 'dark')
      },
      
      setView: (view: string) => set({ currentView: view }),
      setProvince: (province: string | null) => set({ selectedProvince: province }),
      
      updateTransfer: (party: string, value: number) => set((state) => ({
        transferConfig: { ...state.transferConfig, [party]: value }
      })),
      
      resetTransfer: () => set({ transferConfig: {} }),
      
      saveScenario: (name: string, notes: string) => {
        const state = get()
        if (!state.selectedProvince) return
        
        const scenario: Scenario = {
          id: Date.now().toString(36),
          name,
          notes,
          province: state.selectedProvince,
          transferConfig: { ...state.transferConfig },
          createdAt: new Date().toISOString()
        }
        
        set({ scenarios: [...state.scenarios, scenario] })
      },
      
      loadScenario: (id: string) => {
        const scenario = get().scenarios.find(s => s.id === id)
        if (!scenario) return
        
        set({
          selectedProvince: scenario.province,
          transferConfig: { ...scenario.transferConfig },
          currentView: 'simulation'
        })
      },
      
      deleteScenario: (id: string) => set((state) => ({
        scenarios: state.scenarios.filter(s => s.id !== id)
      }))
    }),
    {
      name: 'election-analytics-storage',
      partialize: (state) => ({
        theme: state.theme,
        scenarios: state.scenarios
      })
    }
  )
)
