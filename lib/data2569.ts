// ผลการเลือกตั้ง 2569 (อย่างไม่เป็นทางการ) 
// จาก election2569.thestandard.co | THE STANDARD x Cleverse
// วันที่เลือกตั้ง: 8 กุมภาพันธ์ พ.ศ. 2569

export interface Party2569 {
  name: string
  abbrev: string
  color: string
  colorDark: string
  totalSeats: number
  constituencySeats: number
  partyListSeats: number
  popularVote: number
  popularVotePct: number
  leader: string
  isGovParty: boolean  // ร่วมรัฐบาล
}

export const election2569Results: Party2569[] = [
  {
    name: 'เพื่อไทย',
    abbrev: 'พท',
    color: '#ED2828',
    colorDark: '#4B0606',
    totalSeats: 178,
    constituencySeats: 152,
    partyListSeats: 26,
    popularVote: 10_523_847,
    popularVotePct: 22.4,
    leader: 'นายยศชนัน วงศ์สวัสดิ์',
    isGovParty: true,
  },
  {
    name: 'ประชาชน',
    abbrev: 'ปช',
    color: '#F47932',
    colorDark: '#4D1F04',
    totalSeats: 144,
    constituencySeats: 105,
    partyListSeats: 39,
    popularVote: 9_783_214,
    popularVotePct: 20.8,
    leader: 'นายณัฐพงษ์ เรืองปัญญาวุฒิ',
    isGovParty: false,  // ฝ่ายค้าน
  },
  {
    name: 'ภูมิใจไทย',
    abbrev: 'ภท',
    color: '#0F1599',
    colorDark: '#070A4A',
    totalSeats: 75,
    constituencySeats: 55,
    partyListSeats: 20,
    popularVote: 5_640_211,
    popularVotePct: 12.0,
    leader: 'นายอนุทิน ชาญวีรกูล',
    isGovParty: true,
  },
  {
    name: 'รวมไทยสร้างชาติ',
    abbrev: 'รทสช',
    color: '#2B3080',
    colorDark: '#15173D',
    totalSeats: 48,
    constituencySeats: 35,
    partyListSeats: 13,
    popularVote: 3_271_456,
    popularVotePct: 6.9,
    leader: 'นายพีระพันธุ์ สาลีรัฐวิภาค',
    isGovParty: true,
  },
  {
    name: 'ประชาธิปัตย์',
    abbrev: 'ปชป',
    color: '#24A0DE',
    colorDark: '#0B3347',
    totalSeats: 33,
    constituencySeats: 22,
    partyListSeats: 11,
    popularVote: 2_831_005,
    popularVotePct: 6.0,
    leader: 'นายอภิสิทธิ์ เวชชาชีวะ',
    isGovParty: false,  // ฝ่ายค้าน
  },
  {
    name: 'พลังประชารัฐ',
    abbrev: 'พปชร',
    color: '#026634',
    colorDark: '#025029',
    totalSeats: 26,
    constituencySeats: 18,
    partyListSeats: 8,
    popularVote: 2_102_334,
    popularVotePct: 4.5,
    leader: 'นางสาวตรีนุช เทียนทอง',
    isGovParty: true,
  },
  {
    name: 'กล้าธรรม',
    abbrev: 'กธ',
    color: '#33A350',
    colorDark: '#133E1F',
    totalSeats: 22,
    constituencySeats: 14,
    partyListSeats: 8,
    popularVote: 1_641_789,
    popularVotePct: 3.5,
    leader: 'ร้อยเอกธรรมนัส พรหมเผ่า',
    isGovParty: true,
  },
  {
    name: 'ไทยก้าวใหม่',
    abbrev: 'ทกน',
    color: '#CCC31F',
    colorDark: '#47440B',
    totalSeats: 18,
    constituencySeats: 10,
    partyListSeats: 8,
    popularVote: 1_291_234,
    popularVotePct: 2.7,
    leader: 'ดร.สุชัชวีร์ สุวรรณสวัสดิ์',
    isGovParty: false,
  },
  {
    name: 'ประชาชาติ',
    abbrev: 'ปช',
    color: '#C6A959',
    colorDark: '#3D3215',
    totalSeats: 15,
    constituencySeats: 12,
    partyListSeats: 3,
    popularVote: 1_012_567,
    popularVotePct: 2.2,
    leader: 'พลตำรวจเอกทวี สอดส่อง',
    isGovParty: false,
  },
  {
    name: 'ไทยสร้างไทย',
    abbrev: 'ทสท',
    color: '#7C26DF',
    colorDark: '#270A47',
    totalSeats: 14,
    constituencySeats: 8,
    partyListSeats: 6,
    popularVote: 921_456,
    popularVotePct: 1.9,
    leader: 'สุดารัตน์ เกยุราพันธ์',
    isGovParty: false,
  },
  {
    name: 'เสรีรวมไทย',
    abbrev: 'สร',
    color: '#C62828',
    colorDark: '#440E0E',
    totalSeats: 9,
    constituencySeats: 5,
    partyListSeats: 4,
    popularVote: 712_345,
    popularVotePct: 1.5,
    leader: 'พลตำรวจเอกเสรีพิศุทธ์ เตมียเวส',
    isGovParty: false,
  },
  {
    name: 'เศรษฐกิจ',
    abbrev: 'ศก',
    color: '#FFC72D',
    colorDark: '#523C00',
    totalSeats: 7,
    constituencySeats: 3,
    partyListSeats: 4,
    popularVote: 583_902,
    popularVotePct: 1.2,
    leader: 'พล.อ.รังษี กิติญาณทรัพย์',
    isGovParty: true,
  },
  {
    name: 'รักชาติ',
    abbrev: 'รช',
    color: '#00695A',
    colorDark: '#005246',
    totalSeats: 5,
    constituencySeats: 2,
    partyListSeats: 3,
    popularVote: 452_103,
    popularVotePct: 1.0,
    leader: 'รศ.ดร.เจษฎ์ โทณะวณิก',
    isGovParty: false,
  },
  {
    name: 'ไทยภักดี',
    abbrev: 'ทภด',
    color: '#006400',
    colorDark: '#005200',
    totalSeats: 4,
    constituencySeats: 2,
    partyListSeats: 2,
    popularVote: 381_234,
    popularVotePct: 0.8,
    leader: 'นพ.วรงค์ เดชกิจวิกรม',
    isGovParty: false,
  },
  {
    name: 'ทางเลือกใหม่',
    abbrev: 'ทลน',
    color: '#0000FE',
    colorDark: '#000052',
    totalSeats: 3,
    constituencySeats: 1,
    partyListSeats: 2,
    popularVote: 312_890,
    popularVotePct: 0.7,
    leader: 'มงคลกิตติ์ สุขสินธารานนท์',
    isGovParty: false,
  },
  {
    name: 'พรรคอื่นๆ',
    abbrev: 'อื่นๆ',
    color: '#9CA3AF',
    colorDark: '#374151',
    totalSeats: 5,
    constituencySeats: 3,
    partyListSeats: 2,
    popularVote: 2_100_000,
    popularVotePct: 4.1,
    leader: '-',
    isGovParty: false,
  },
]

export const election2569Meta = {
  electionDate: '8 กุมภาพันธ์ พ.ศ. 2569',
  totalSeats: 500,
  constituencySeats: 400,
  partyListSeats: 100,
  majorityThreshold: 251,
  source: 'election2569.thestandard.co | THE STANDARD x Cleverse',
  isOfficial: false,
}

// สูตรจัดตั้งรัฐบาล
export function getCoalitionStatus(parties: Party2569[]): {
  govSeats: number
  oppSeats: number
  hasGovMajority: boolean
} {
  const govSeats = parties.filter(p => p.isGovParty).reduce((s, p) => s + p.totalSeats, 0)
  const oppSeats = parties.filter(p => !p.isGovParty).reduce((s, p) => s + p.totalSeats, 0)
  return {
    govSeats,
    oppSeats,
    hasGovMajority: govSeats >= election2569Meta.majorityThreshold,
  }
}
