import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type ViewId =
  | 'dashboard'
  | 'results2569'
  | 'coalition-builder'
  | 'simulation'
  | 'scenarios'
  | 'analytics'
  | 'monte-carlo'

export type ElectionYear = '2566' | '2569'

export interface TransferConfig {
  [party: string]: number
}

export interface Scenario {
  id: string
  name: string
  notes: string
  province: string
  transferConfig: TransferConfig
  createdAt: string
}

export interface AppState {
  currentView: ViewId
  selectedProvince: string | null
  selectedYear: ElectionYear
  transferConfig: TransferConfig
  scenarios: Scenario[]
  sidebarOpen: boolean

  setView: (view: ViewId) => void
  setProvince: (province: string | null) => void
  setYear: (year: ElectionYear) => void
  updateTransfer: (party: string, value: number) => void
  resetTransfer: () => void
  saveScenario: (name: string, notes: string) => void
  loadScenario: (id: string) => void
  deleteScenario: (id: string) => void
  toggleSidebar: () => void
  setSidebar: (open: boolean) => void
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentView: 'dashboard',
      selectedProvince: null,
      selectedYear: '2566',
      transferConfig: {},
      scenarios: [],
      sidebarOpen: true,

      setView: (view) => set({ currentView: view }),
      setProvince: (province) => set({ selectedProvince: province }),
      setYear: (year) => set({ selectedYear: year }),

      updateTransfer: (party, value) =>
        set((state) => ({
          transferConfig: { ...state.transferConfig, [party]: value },
        })),

      resetTransfer: () => set({ transferConfig: {} }),

      saveScenario: (name, notes) => {
        const state = get()
        if (!state.selectedProvince) return

        const scenario: Scenario = {
          id: Date.now().toString(36),
          name,
          notes,
          province: state.selectedProvince,
          transferConfig: { ...state.transferConfig },
          createdAt: new Date().toLocaleString('th-TH'),
        }

        set({ scenarios: [...state.scenarios, scenario] })
      },

      loadScenario: (id) => {
        const scenario = get().scenarios.find((s) => s.id === id)
        if (!scenario) return

        set({
          selectedProvince: scenario.province,
          transferConfig: { ...scenario.transferConfig },
          currentView: 'simulation',
        })
      },

      deleteScenario: (id) =>
        set((state) => ({
          scenarios: state.scenarios.filter((s) => s.id !== id),
        })),

      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setSidebar: (open) => set({ sidebarOpen: open }),
    }),
    {
      name: 'election-simulator-v3',
      partialize: (state) => ({
        scenarios: state.scenarios,
        selectedYear: state.selectedYear,
      }),
    }
  )
)
