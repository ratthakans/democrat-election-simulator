
import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'

interface StatCardProps {
  label: string
  value: string | number
  change?: string
  icon: LucideIcon
  variant?: 'primary' | 'success' | 'warning' | 'info'
}

const variants = {
  primary: 'from-blue-500/20 to-indigo-500/20 border-blue-500/30',
  success: 'from-green-500/20 to-emerald-500/20 border-green-500/30',
  warning: 'from-amber-500/20 to-orange-500/20 border-amber-500/30',
  info: 'from-purple-500/20 to-pink-500/20 border-purple-500/30',
}

const iconColors = {
  primary: 'text-blue-600 dark:text-blue-400',
  success: 'text-green-600 dark:text-green-400',
  warning: 'text-amber-600 dark:text-amber-400',
  info: 'text-purple-600 dark:text-purple-400',
}

export default function StatCard({ 
  label, 
  value, 
  change, 
  icon: Icon, 
  variant = 'primary' 
}: StatCardProps) {
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      className={`glass-card bg-gradient-to-br ${variants[variant]} relative overflow-hidden group`}
    >
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent 
        opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="relative flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
            {label}
          </p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {value}
          </p>
          {change && (
            <p className="text-sm font-semibold text-green-600 dark:text-green-400">
              {change}
            </p>
          )}
        </div>
        
        <div className={`p-3 rounded-xl bg-white/20 dark:bg-black/20 ${iconColors[variant]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </motion.div>
  )
}
