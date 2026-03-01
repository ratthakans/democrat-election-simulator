'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, XCircle, ChevronDown, ChevronUp, Info } from 'lucide-react'
import { election2569Results, election2569Meta, getCoalitionStatus } from '@/lib/data2569'
import { fmt } from '@/lib/election'

function PartyCard({ party, rank, delay }: { party: typeof election2569Results[0]; rank: number; delay: number }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, type: 'spring', stiffness: 250, damping: 20 }}
      className={`glass-card border-l-4 transition-all duration-200 ${
        party.isGovParty ? 'border-emerald-500' : 'border-rose-400'
      }`}
    >
      <div className="flex items-center gap-4">
        {/* Rank */}
        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
          <span className="text-sm font-bold text-slate-500 dark:text-slate-400">#{rank}</span>
        </div>

        {/* Party Color / Name */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div
            className="w-4 h-10 rounded-sm flex-shrink-0"
            style={{ backgroundColor: party.color }}
          />
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-bold text-slate-900 dark:text-white text-sm">{party.name}</p>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">({party.abbrev})</span>
              {party.isGovParty ? (
                <span className="badge bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
                  รัฐบาล
                </span>
              ) : (
                <span className="badge bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400">
                  ฝ่ายค้าน
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">{party.leader}</p>
          </div>
        </div>

        {/* Seats */}
        <div className="text-right flex-shrink-0">
          <p className="text-2xl font-black text-slate-900 dark:text-white" style={{ color: party.color }}>
            {party.totalSeats}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">ที่นั่ง</p>
        </div>

        {/* Expand button */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-400"
        >
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Seat bar */}
      <div className="mt-3 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${(party.totalSeats / 200) * 100}%` }}
          transition={{ delay: delay + 0.2, duration: 0.6, ease: 'easeOut' }}
          className="h-full rounded-full"
          style={{ backgroundColor: party.color }}
        />
      </div>

      {/* Expanded details */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">เขต</p>
                <p className="text-lg font-bold text-slate-900 dark:text-white">{party.constituencySeats}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">บัญชีรายชื่อ</p>
                <p className="text-lg font-bold text-slate-900 dark:text-white">{party.partyListSeats}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">คะแนนเสียง</p>
                <p className="text-lg font-bold text-slate-900 dark:text-white">{fmt(party.popularVote)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">% คะแนน</p>
                <p className="text-lg font-bold text-slate-900 dark:text-white">{party.popularVotePct}%</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default function Results2569View() {
  const [showGovOnly, setShowGovOnly] = useState<'all' | 'gov' | 'opp'>('all')

  const { govSeats, oppSeats, hasGovMajority } = getCoalitionStatus(election2569Results)

  const filteredParties = election2569Results.filter((p) => {
    if (showGovOnly === 'gov') return p.isGovParty
    if (showGovOnly === 'opp') return !p.isGovParty
    return true
  })

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            ผลการเลือกตั้ง 2569
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {election2569Meta.electionDate} | {election2569Meta.source}
          </p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-full">
          <Info className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
          <span className="text-xs font-semibold text-amber-700 dark:text-amber-400">ผลไม่เป็นทางการ</span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'ที่นั่งรวม', value: election2569Meta.totalSeats, color: 'bg-slate-700 dark:bg-slate-600' },
          { label: 'เกณฑ์รัฐบาล', value: election2569Meta.majorityThreshold, color: 'bg-brand-600' },
          { label: 'ที่นั่งรัฐบาล', value: govSeats, color: 'bg-emerald-600' },
          { label: 'ที่นั่งฝ่ายค้าน', value: oppSeats, color: 'bg-rose-600' },
        ].map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.07 }}
            className="glass-card text-center"
          >
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{item.label}</p>
            <p className={`text-3xl font-black mt-1 ${item.color.replace('bg-', 'text-')}`}>{item.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Coalition Bar */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-slate-900 dark:text-white">รัฐสภา {election2569Meta.electionDate}</h3>
          <div className="flex items-center gap-1.5">
            {hasGovMajority ? (
              <CheckCircle className="w-4 h-4 text-emerald-500" />
            ) : (
              <XCircle className="w-4 h-4 text-red-500" />
            )}
            <span className={`text-sm font-semibold ${hasGovMajority ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
              {hasGovMajority ? 'รัฐบาลเกินกึ่งหนึ่ง' : 'รัฐบาลไม่ถึงกึ่งหนึ่ง'}
            </span>
          </div>
        </div>

        {/* Visual Parliament bar */}
        <div className="h-10 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 flex relative">
          {election2569Results.filter(p => p.totalSeats > 0).map((party, i) => (
            <div
              key={party.name}
              title={`${party.name}: ${party.totalSeats} ที่นั่ง`}
              className="h-full transition-all duration-500 cursor-pointer hover:opacity-80"
              style={{
                width: `${(party.totalSeats / election2569Meta.totalSeats) * 100}%`,
                backgroundColor: party.color,
                minWidth: party.totalSeats > 5 ? undefined : '2px',
              }}
            />
          ))}
          {/* Majority marker */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-white dark:bg-slate-900 shadow-sm z-10"
            style={{ left: `${(election2569Meta.majorityThreshold / election2569Meta.totalSeats) * 100}%` }}
          />
        </div>

        <div className="flex items-center justify-between mt-3 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>รัฐบาล {govSeats} ที่นั่ง</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-rose-500" />
              <span>ฝ่ายค้าน {oppSeats} ที่นั่ง</span>
            </div>
          </div>
          <span>เส้นกึ่งหนึ่ง: {election2569Meta.majorityThreshold}</span>
        </div>
      </motion.div>

      {/* Filter */}
      <div className="flex items-center gap-2">
        {([
          { value: 'all', label: 'ทุกพรรค' },
          { value: 'gov', label: 'ฝ่ายรัฐบาล' },
          { value: 'opp', label: 'ฝ่ายค้าน' },
        ] as const).map((filter) => (
          <button
            key={filter.value}
            onClick={() => setShowGovOnly(filter.value)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
              showGovOnly === filter.value
                ? 'bg-brand-600 text-white shadow-md shadow-brand-600/20'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}
          >
            {filter.label}
          </button>
        ))}
        <p className="text-xs text-slate-400 dark:text-slate-500 ml-2">
          แสดง {filteredParties.length} พรรค
        </p>
      </div>

      {/* Party List */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {filteredParties.map((party, i) => (
            <PartyCard
              key={party.name}
              party={party}
              rank={i + 1}
              delay={i * 0.04}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Source note */}
      <p className="text-xs text-slate-400 dark:text-slate-500 text-center pb-4">
        ข้อมูลจาก {election2569Meta.source} | ผลการเลือกตั้งอย่างไม่เป็นทางการ กกต. จะประกาศผลอย่างเป็นทางการภายใน 60 วัน
      </p>
    </div>
  )
}
