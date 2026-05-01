export const STEPS = [
  { id: 1, title: 'Location of the Affected Family' },
  { id: 2, title: 'Head of the Family' },
  { id: 3, title: 'Family Information' },
  { id: 4, title: 'Account Information' },
]

export const CIVIL_STATUS_OPTIONS = [
  'Single', 'Married', 'Widowed', 'Separated', 'Annulled',
]

export const SEX_OPTIONS = ['Male', 'Female']

export const RELIGIONS = [
  // Christian
  'Roman Catholic',
  'Iglesia ni Cristo',
  'Born Again Christian',
  'Baptist',
  'Seventh-day Adventist',
  'United Church of Christ in the Philippines (UCCP)',
  'Anglican / Episcopalian',
  'Methodist',
  'Lutheran',
  'Presbyterian',
  'Pentecostal',
  'Jehovah\'s Witnesses',
  'Church of Jesus Christ of Latter-day Saints (Mormon)',
  'Aglipayan (Philippine Independent Church)',

  // Non-Christian
  'Islam',
  'Buddhism',
  'Hinduism',
  'Judaism',

  // Indigenous / Traditional
  'Indigenous Beliefs / Animism',

  // Other
  'Other',
  'None / No Religion',
  'Atheist',
  'Agnostic',
  'Prefer not to say',
]

export const VALID_IDS = [
  // Government-issued primary IDs
  'Philippine Passport',
  'SSS ID (Social Security System)',
  'GSIS ID (Government Service Insurance System)',
  'PhilHealth ID',
  'Pag-IBIG ID (HDMF)',
  'Philippine National ID (PhilSys)',
  'Voter\'s ID / Voter\'s Certification',
  'Driver\'s License (LTO)',
  'PRC ID (Professional Regulation Commission)',
  'NBI Clearance',
  'Police Clearance',
  'Postal ID',
  'Senior Citizen ID',
  'PWD ID (Person with Disability)',
  'Solo Parent ID',
  '4Ps / Pantawid Pamilya ID',
  'OFW ID / iDOLE Card',
  'Seaman\'s Book (MARINA)',
  'OWWA ID',
  'BIR ID (TIN Card)',
  'Barangay ID / Barangay Certification',
  'School ID (for minors)',

  // Other
  'Other Government-issued ID',
]

export const RELATION_FAMHEAD = [
  'Father', 'Mother', 'Daughter', 'Son'
]

// Must match DB CHECK constraint exactly
export const EDUCATIONAL_ATTAINMENT = [
  'No Formal Education', 'Elementary', 'High School',
  'Senior High School', 'Vocational', 'College', 'Post Graduate',
]

// 'None' is UI-only — filtered out before DB insert into family_vulnerabilities
export const VULNERABILITY_TYPES = [
  'PWD', 'Senior Citizen', 'Pregnant', 'Lactating Mother',
  'Solo Parent', 'Unaccompanied Minor', 'None',
]

export const INCOME_BRACKETS = [
  'Below ₱5,000', '₱5,000 – ₱9,999', '₱10,000 – ₱14,999',
  '₱15,000 – ₱19,999', '₱20,000 – ₱29,999', '₱30,000 and above',
]

// Income bracket label → numeric(10,2) for DB
export const INCOME_MAP: Record<string, number> = {
  'Below ₱5,000':       0,
  '₱5,000 – ₱9,999':   5000,
  '₱10,000 – ₱14,999': 10000,
  '₱15,000 – ₱19,999': 15000,
  '₱20,000 – ₱29,999': 20000,
  '₱30,000 and above':  30000,
}

export const BANK_EWALLET_OPTIONS = [
  'GCash', 'Maya (PayMaya)', 'BDO', 'BPI', 'Metrobank',
  'UnionBank', 'Landbank', 'DBP', 'RCBC', 'PNB', 'SeaBank', 'ShopeePay', 'Others',
]