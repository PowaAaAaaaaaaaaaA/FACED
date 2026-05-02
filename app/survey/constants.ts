export const STEPS = [
  { id: 1, title: 'Location of the Affected Family' },
  { id: 2, title: 'Head of the Family' },
  { id: 3, title: 'Family Information' },
  { id: 4, title: 'Account Information' },
  { id: 5, title: 'Confirmation' }
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
  // Spouse
  'Husband',
  'Wife',

  // Children
  'Son',
  'Daughter',

  // Parents
  'Father',
  'Mother',

  // Siblings
  'Brother',
  'Sister',

  // Grandchildren
  'Grandson',
  'Granddaughter',

  // Grandparents
  'Grandfather',
  'Grandmother',

  // Extended Family
  'Nephew',
  'Niece',
  'Uncle',
  'Aunt',
  'Cousin',

  // In-laws
  'Father-in-law',
  'Mother-in-law',
  'Brother-in-law',
  'Sister-in-law',
  'Son-in-law',
  'Daughter-in-law',

  // Other household members
  'Stepfather',
  'Stepmother',
  'Stepson',
  'Stepdaughter',
  'Foster Child',
  'Guardian',
  'Ward',
  'Househelp / Kasambahay',
  'Boarder',
  'Other Relative',
  'Non-relative',
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

export const ACCOUNT_TYPE_OPTIONS = [
  'Savings',
  'Current',
  'E-Wallet',
]

export const HOUSE_OWNERSHIP = [
  'Owner',
  'Renter',
  'Sharer'
]

export const SHELTER_DMG_CLASSIFICATION = [
  'Partially Damaged',
  'Totally Damaged'
]

export const PROVINCE_DISTRICTS: Record<string, string[]> = {
  '0307700000': ['Lone District'],
  '0300800000': ['1st District', '2nd District', '3rd District'],
  '0301400000': ['1st District', '2nd District', '3rd District', '4th District', '5th District', '6th District'],
  '0304900000': ['1st District', '2nd District', '3rd District', '4th District'],
  '0305400000': ['1st District', '2nd District', '3rd District', '4th District'],
  '0306900000': ['1st District', '2nd District', '3rd District'],
  '0307100000': ['1st District', '2nd District'],
}

export const MUNICIPALITY_DISTRICT: Record<string, string> = {

  // ── Aurora ──────────────────────────────
  '0307701000': '1st District', // Baler
  '0307702000': '2nd District', // Casiguran
  '0307703000': '1st District', // Dilasag
  '0307704000': '2nd District', // Dinalungan
  '0307705000': '2nd District', // Dingalan
  '0307706000': '1st District', // Dipaculao
  '0307707000': '1st District', // Maria Aurora
  '0307708000': '1st District', // San Luis

  // ── Bataan ──────────────────────────────
  '0300801000': '1st District', // Abucay
  '0300802000': '2nd District', // Bagac
  '0300803000': '1st District', // City of Balanga
  '0300804000': '2nd District', // Dinalupihan
  '0300805000': '1st District', // Hermosa
  '0300806000': '1st District', // Limay
  '0300807000': '2nd District', // Mariveles
  '0300808000': '2nd District', // Morong
  '0300809000': '1st District', // Orani
  '0300810000': '1st District', // Orion
  '0300811000': '1st District', // Pilar
  '0300812000': '1st District', // Samal

  // ── Bulacan ─────────────────────────────
  '0301401000': '3rd District', // Angat
  '0301402000': '1st District', // Balagtas
  '0301403000': '3rd District', // City of Baliwag
  '0301404000': '1st District', // Bocaue
  '0301405000': '1st District', // Bulacan
  '0301406000': '3rd District', // Bustos
  '0301407000': '2nd District', // Calumpit
  '0301408000': '1st District', // Guiguinto
  '0301409000': '2nd District', // Hagonoy
  '0301410000': '2nd District', // City of Malolos
  '0301411000': '1st District', // Marilao
  '0301412000': '1st District', // City of Meycauayan
  '0301413000': '3rd District', // Norzagaray
  '0301414000': '2nd District', // Obando
  '0301415000': '2nd District', // Pandi
  '0301416000': '2nd District', // Paombong
  '0301417000': '2nd District', // Plaridel
  '0301418000': '2nd District', // Pulilan
  '0301419000': '3rd District', // San Ildefonso
  '0301420000': '4th District', // City of San Jose Del Monte
  '0301421000': '3rd District', // San Miguel
  '0301422000': '3rd District', // San Rafael
  '0301423000': '1st District', // Santa Maria
  '0301424000': '3rd District', // Doña Remedios Trinidad

  // ── Nueva Ecija ─────────────────────────
  '0304901000': '2nd District', // Aliaga
  '0304902000': '4th District', // Bongabon
  '0304903000': '2nd District', // City of Cabanatuan
  '0304904000': '1st District', // Cabiao
  '0304905000': '3rd District', // Carranglan
  '0304906000': '1st District', // Cuyapo
  '0304907000': '4th District', // Gabaldon
  '0304908000': '2nd District', // City of Gapan
  '0304909000': '3rd District', // General Mamerto Natividad
  '0304910000': '2nd District', // General Tinio
  '0304911000': '1st District', // Guimba
  '0304912000': '2nd District', // Jaen
  '0304913000': '4th District', // Laur
  '0304914000': '2nd District', // Licab
  '0304915000': '3rd District', // Llanera
  '0304916000': '3rd District', // Lupao
  '0304917000': '1st District', // Science City of Muñoz
  '0304918000': '1st District', // Nampicuan
  '0304919000': '3rd District', // City of Palayan
  '0304920000': '3rd District', // Pantabangan
  '0304921000': '2nd District', // Peñaranda
  '0304922000': '3rd District', // Quezon
  '0304923000': '4th District', // Rizal
  '0304924000': '1st District', // San Antonio
  '0304925000': '2nd District', // San Isidro
  '0304926000': '3rd District', // San Jose City
  '0304927000': '2nd District', // San Leonardo
  '0304928000': '2nd District', // Santa Rosa
  '0304929000': '2nd District', // Santo Domingo
  '0304930000': '1st District', // Talavera
  '0304931000': '3rd District', // Talugtug
  '0304932000': '2nd District', // Zaragoza

  // ── Pampanga ────────────────────────────
  '0305402000': '2nd District', // Apalit
  '0305403000': '2nd District', // Arayat
  '0305404000': '1st District', // Bacolor
  '0305405000': '2nd District', // Candaba
  '0305406000': '1st District', // Floridablanca
  '0305407000': '1st District', // Guagua
  '0305408000': '1st District', // Lubao
  '0305409000': '2nd District', // Mabalacat City
  '0305410000': '1st District', // Macabebe
  '0305411000': '2nd District', // Magalang
  '0305412000': '1st District', // Masantol
  '0305413000': '2nd District', // Mexico
  '0305414000': '1st District', // Minalin
  '0305415000': '1st District', // Porac
  '0305416000': '2nd District', // City of San Fernando
  '0305417000': '1st District', // San Luis
  '0305418000': '1st District', // San Simon
  '0305419000': '2nd District', // Santa Ana
  '0305420000': '1st District', // Santa Rita
  '0305421000': '1st District', // Sto. Tomas
  '0305422000': '1st District', // Sasmuan

  // ── Tarlac ──────────────────────────────
  '0306901000': '1st District', // Anao
  '0306902000': '2nd District', // Bamban
  '0306903000': '1st District', // Camiling
  '0306904000': '2nd District', // Capas
  '0306905000': '3rd District', // Concepcion
  '0306906000': '2nd District', // Gerona
  '0306907000': '3rd District', // La Paz
  '0306908000': '1st District', // Mayantoc
  '0306909000': '1st District', // Moncada
  '0306910000': '1st District', // Paniqui
  '0306911000': '1st District', // Pura
  '0306912000': '1st District', // Ramos
  '0306913000': '1st District', // San Clemente
  '0306914000': '1st District', // San Manuel
  '0306915000': '1st District', // Santa Ignacia
  '0306916000': '2nd District', // City of Tarlac
  '0306917000': '3rd District', // Victoria
  '0306918000': '3rd District', // San Jose

  // ── Zambales ────────────────────────────
  '0307101000': '2nd District', // Botolan
  '0307102000': '2nd District', // Cabangan
  '0307103000': '1st District', // Candelaria
  '0307104000': '1st District', // Castillejos
  '0307105000': '2nd District', // Iba
  '0307106000': '2nd District', // Masinloc
  '0307108000': '2nd District', // Palauig
  '0307109000': '1st District', // San Antonio
  '0307110000': '2nd District', // San Felipe
  '0307111000': '1st District', // San Marcelino
  '0307112000': '2nd District', // San Narciso
  '0307113000': '2nd District', // Santa Cruz
  '0307114000': '1st District', // Subic

  // ── Independent Cities ──────────────────
  '0330100000': '1st District', // City of Angeles (Pampanga)
  '0331400000': '1st District', // City of Olongapo (Zambales)
}