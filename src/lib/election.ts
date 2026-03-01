export interface PartyVotes {
  [party: string]: number
}

export interface District {
  district: number
  total_votes: number
  party_votes: PartyVotes
}

export interface ElectionData {
  [province: string]: District[]
}

export interface SimulationResult {
  district: number
  originalWinner: string
  originalWinnerVotes: number
  baseDem: number
  newDem: number
  newWinner: string
  status: 'win' | 'lose'
  votesNeeded: number | null
  margin: number
  isClose: boolean
}

export const TARGET_PARTY = 'ประชาธิปัตย์'

export const argmaxVote = (votesMap: PartyVotes) => {
  return Object.entries(votesMap).reduce(
    (best, [party, votes]) => votes > best.votes ? { party, votes } : best,
    { party: '', votes: -Infinity }
  )
}

export const computeResults = (
  districts: District[],
  transferConfig: { [party: string]: number }
): { seatCount: number; flipCount: number; rows: SimulationResult[] } => {
  let seatCount = 0, flipCount = 0
  
  const rows = districts.map(({ district, party_votes: originalVotes }) => {
    const newVotes = { ...originalVotes, [TARGET_PARTY]: originalVotes[TARGET_PARTY] || 0 }
    
    // Apply transfers
    Object.entries(transferConfig).forEach(([party, pct]) => {
      const delta = Math.round((originalVotes[party] || 0) * pct)
      newVotes[party] = (newVotes[party] || 0) - delta
      newVotes[TARGET_PARTY] += delta
    })
    
    const { party: originalWinner, votes: originalWinnerVotes } = argmaxVote(originalVotes)
    const { party: newWinner, votes: newWinnerVotes } = argmaxVote(newVotes)
    
    const status = newWinner === TARGET_PARTY ? 'win' : 'lose'
    if (status === 'win') {
      seatCount++
      if (originalWinner !== TARGET_PARTY) flipCount++
    }
    
    const topCompetitor = Math.max(...Object.entries(newVotes)
      .filter(([p]) => p !== TARGET_PARTY)
      .map(([, v]) => v))
    
    return {
      district,
      originalWinner,
      originalWinnerVotes,
      baseDem: originalVotes[TARGET_PARTY] || 0,
      newDem: newVotes[TARGET_PARTY],
      newWinner,
      status,
      votesNeeded: status === 'lose' ? topCompetitor - newVotes[TARGET_PARTY] + 1 : null,
      margin: newVotes[TARGET_PARTY] - (status === 'win' ? topCompetitor : newWinnerVotes),
      isClose: Math.abs(newVotes[TARGET_PARTY] - topCompetitor) < 5000
    } as SimulationResult
  })
  
  rows.sort((a, b) => {
    if (a.status !== b.status) return a.status === 'win' ? -1 : 1
    return a.status === 'win' 
      ? a.district - b.district 
      : (a.votesNeeded ?? 0) - (b.votesNeeded ?? 0)
  })
  
  return { seatCount, flipCount, rows }
}

export const fmt = (n: number) => n.toLocaleString('th-TH')
