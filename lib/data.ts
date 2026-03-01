// Election 2566 data is in src/lib/data.ts
// We import and re-export it here for use across the app
// This avoids duplicating the 270KB data file

export type { ElectionData, District, PartyVotes } from '@/lib/election'

// Direct re-export will be done in the component that needs it
// since the data file imports from a relative path we can't easily redirect
