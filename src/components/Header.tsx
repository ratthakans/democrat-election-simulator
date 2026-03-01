
import { useEffect } from 'react'
import { useStore } from '@/lib/store'
import { Moon, Sun } from 'lucide-react'
import { motion } from 'framer-motion'

export default function Header() {
  const { theme, setTheme } = useStore()
  
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])
  
  return (
    <header className="fixed top-0 left-0 right-0 z-50 p-4">
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="glass rounded-2xl p-4 max-w-[1568px] mx-auto"
      >
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-4">
            <img
              src="https://uploads.democrat.or.th/uploads/2025/12/main-logo_1.svg"
              alt="พรรคประชาธิปัตย์"
              className="h-12 w-auto"
            />
            <div>
              <h1 className="text-xl font-bold text-gradient">
                ระบบวิเคราะห์การเลือกตั้ง
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Election Analytics Platform
              </p>
            </div>
          </div>
          
          {/* Controls */}
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              className="glass-button p-3 rounded-xl"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? (
                <Moon className="w-5 h-5 text-blue-600" />
              ) : (
                <Sun className="w-5 h-5 text-yellow-400" />
              )}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </header>
  )
}
