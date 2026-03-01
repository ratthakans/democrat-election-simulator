import { useMemo } from 'react'
import { electionData } from '@/lib/data'
import { computeResults, TARGET_PARTY } from '@/lib/election'
import { useStore } from '@/lib/store'

export function useElectionStats() {
  const { transferConfig } = useStore()

  return useMemo(() => {
    let democratSeats = 0
    let flipCount = 0
    const partySeats: Record<string, number> = {}
    let totalDistricts = 0

    Object.values(electionData).forEach(districts => {
      const res = computeResults(districts, transferConfig)
      democratSeats += res.seatCount
      flipCount += res.flipCount
      totalDistricts += districts.length

      res.rows.forEach(row => {
        partySeats[row.newWinner] = (partySeats[row.newWinner] || 0) + 1
      })
    })

    const sortedParties = Object.entries(partySeats)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)

    const democratRank = Object.keys(partySeats)
      .sort((a, b) => partySeats[b] - partySeats[a])
      .indexOf(TARGET_PARTY) + 1

    return {
      democratSeats,
      flipCount,
      partySeats,
      totalDistricts,
      sortedParties,
      democratRank: democratRank > 0 ? democratRank : '-',
      chartLabels: sortedParties.map(([p]) => p),
      chartData: sortedParties.map(([, s]) => s)
    }
  }, [transferConfig])
}
