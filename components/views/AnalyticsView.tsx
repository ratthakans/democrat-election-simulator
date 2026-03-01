'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { electionData } from '@/src/lib/data'
import { computeResults, TARGET_PARTY, fmt } from '@/lib/election'
import { BarChart2, TrendingUp, Map, Award } from 'lucide-react'

// Compute national analytics once
function useNationalAnalytics() {
  return useMemo(() => {
    const provinceStats: {
      province: string
      totalDistricts: number
      demSeats: number
      topParty: string
      topPartySeats: number
    }[] = []

    const globalPartySeats: Record<string, number> = {}

    Object.entries(electionData).forEach(([province, districts]) => {
      const res = computeResults(districts, {})
      const partySeats: Record<string, number> = {}

      res.rows.forEach((row) => {
        partySeats[row.newWinner] = (partySeats[row.newWinner] || 0) + 1
        globalPartySeats[row.newWinner] = (globalPartySeats[row.newWinner] || 0) + 1
      })

      const topEntry = Object.entries(partySeats).sort(([, a], [, b]) => b - a)[0]

      provinceStats.push({
        province,
        totalDistricts: districts.length,
        demSeats: partySeats[TARGET_PARTY] || 0,
        topParty: topEntry?.[0] || '-',
        topPartySeats: topEntry?.[1] || 0,
      })
    })

    const sortedParties = Object.entries(globalPartySeats)
      .sort(([, a], [, b]) => b - a)

    const demByProvince = provinceStats
      .filter((p) => p.demSeats > 0)
      .sort((a, b) => b.demSeats - a.demSeats)
      .slice(0, 10)

    const strongholds = provinceStats
      .filter((p) => p.topParty === TARGET_PARTY)
      .sort((a, b) => b.topPartySeats - a.topPartySeats)

    return { sortedParties, demByProvince, strongholds, provinceStats, globalPartySeats }
  }, [])
}

const PARTY_COLORS: Record<string, string> = {
  'ก้าวไกล': '#F47932',
  'เพื่อไทย': '#ED2828',
  'ภูมิใจไทย': '#0F1599',
  'พลังประชารัฐ': '#026634',
  'รวมไทยสร้างชาติ': '#2B3080',
  'ประชาธิปัตย์': '#24A0DE',
  'ชาติพัฒนากล้า': '#F9B539',
  'ชาติไทยพัฒนา': '#E83196',
}

export default function AnalyticsView() {
  const { sortedParties, demByProvince, strongholds, globalPartySeats } = useNationalAnalytics()

  const totalSeats = Object.values(globalPartySeats).reduce((s, v) => s + v, 0)
  const top10 = sortedParties.slice(0, 10)
  const maxSeats = top10[0]?.[1] || 1

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">วิเคราะห์เชิงลึก</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          สถิติและการวิเคราะห์ผลการเลือกตั้ง 2566 ทั่วประเทศ
        </p>
      </div>

      {/* National Party Distribution */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="glass-card"
      >
        <div className="flex items-center gap-2 mb-5">
          <BarChart2 className="w-5 h-5 text-brand-500" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">ที่นั่ง ส.ส.เขต 2566 ทั่วประเทศ (10 อันดับ)</h3>
        </div>
        <div className="space-y-3">
          {top10.map(([party, seats], i) => {
            const color = PARTY_COLORS[party] || '#6b7280'
            const pct = ((seats / totalSeats) * 100).toFixed(1)
            return (
              <motion.div
                key={party}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + i * 0.05 }}
                className="flex items-center gap-3"
              >
                <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-white text-[10px] font-black"
                  style={{ backgroundColor: color }}>
                  {i + 1}
                </div>
                <div className="w-28 flex-shrink-0">
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">{party}</p>
                </div>
                <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(seats / maxSeats) * 100}%` }}
                    transition={{ delay: 0.3 + i * 0.05, duration: 0.5, ease: 'easeOut' }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: color }}
                  />
                </div>
                <div className="text-right w-20 flex-shrink-0">
                  <span className="text-sm font-bold text-slate-900 dark:text-white">{seats}</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 ml-1">({pct}%)</span>
                </div>
              </motion.div>
            )
          })}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Democrat strongholds */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card"
        >
          <div className="flex items-center gap-2 mb-5">
            <Award className="w-5 h-5 text-brand-500" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">จังหวัดที่ ปชป. ครองที่นั่งสูงสุด</h3>
          </div>

          {strongholds.length === 0 ? (
            <div className="text-center py-8 text-slate-400 dark:text-slate-500">
              <p className="text-sm">ปชป. ไม่ครองที่นั่งสูงสุดในจังหวัดใด</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {strongholds.slice(0, 8).map((p, i) => (
                <motion.div
                  key={p.province}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.25 + i * 0.04 }}
                  className="flex items-center gap-3 py-2 border-b border-slate-100 dark:border-slate-800 last:border-0"
                >
                  <span className="text-xs font-bold text-slate-400 w-5">{i + 1}</span>
                  <Map className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <p className="text-sm text-slate-700 dark:text-slate-300 flex-1">{p.province}</p>
                  <div className="text-right">
                    <span className="text-sm font-bold text-sky-600 dark:text-sky-400">
                      {p.topPartySeats}/{p.totalDistricts}
                    </span>
                    <span className="text-xs text-slate-400 ml-1">เขต</span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Democrat performance by province */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="glass-card"
        >
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp className="w-5 h-5 text-brand-500" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">จังหวัดที่ ปชป. ชนะมากสุด</h3>
          </div>

          {demByProvince.length === 0 ? (
            <div className="text-center py-8 text-slate-400 dark:text-slate-500">
              <p className="text-sm">ยังไม่มีข้อมูล</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {demByProvince.map((p, i) => (
                <motion.div
                  key={p.province}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.04 }}
                  className="flex items-center gap-3 py-2 border-b border-slate-100 dark:border-slate-800 last:border-0"
                >
                  <span className="text-xs font-bold text-slate-400 w-5">{i + 1}</span>
                  <Map className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <p className="text-sm text-slate-700 dark:text-slate-300 flex-1">{p.province}</p>
                  <div className="flex items-center gap-2">
                    <div className="h-2 rounded-full bg-sky-200 dark:bg-sky-900 overflow-hidden" style={{ width: '60px' }}>
                      <div
                        className="h-full bg-sky-500 rounded-full"
                        style={{ width: `${(p.demSeats / p.totalDistricts) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-bold text-sky-600 dark:text-sky-400 text-right">
                      {p.demSeats}/{p.totalDistricts}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
