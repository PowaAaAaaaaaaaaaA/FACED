/**
 * app/api/generate-pdf/[cardId]/route.ts
 *
 * Fetches a FACED card from Supabase and fills the blank PDF template
 * with the family's data at exact field coordinates.
 *
 * Usage: GET /api/generate-pdf/FC-00001
 */

import { NextRequest, NextResponse } from 'next/server'
import { PDFDocument, PDFPage, PDFFont, rgb, StandardFonts } from 'pdf-lib'
import { supabaseAdmin } from '@/lib/supabase-server'
import * as fs from 'fs'
import * as path from 'path'

// ─── Types ───────────────────────────────────────────────────────────────────
interface FamilyMember {
  full_name: string
  relation_to_head: string
  birthdate: string
  age: string
  sex: string
  highest_educational_attainment: string
  occupation: string
  type_of_vulnerability: string
}

interface AccountInfo {
  bank_name: string
  ewallet_name: string
  account_name: string
  account_type: string
  account_number: string
}

interface FamilyHead {
  last_name: string
  first_name: string
  middle_name: string
  name_extension: string
  birthdate: string
  age: string
  birthplace: string
  sex: string
  civil_status: string
  mothers_maiden_name: string
  religion: string
  occupation: string
  monthly_family_net_income: string
  id_card_presented: string
  id_card_number: string
  contact_primary: string
  contact_alternate: string
  permanent_address: string
  account_info: AccountInfo
}

interface EnrichedCard {
  id: string
  serial_number: string
  psgc_code: string
  evacuation_center_site: string
  house_ownership: string
  shelter_damage: string
  is_4ps_beneficiary: boolean
  is_indigenous_people: boolean
  ip_ethnicity: string
  date_registered: string
  region_name: string
  province_name: string
  municipality_name: string
  district: string
  barangay_name: string
  family_heads: FamilyHead
  family_members: FamilyMember[]
}

// ─── PDF Page Dimensions ────────────────────────────────────────────────────
// Page: 963.84 x 612.12 pt  (landscape, two cards side by side)
// Left card  (Beneficiary):   x: 0   → 481.9
// Right card (Social Worker): x: 481.9 → 963.84
// pdfplumber y=0 is TOP, pdf-lib y=0 is BOTTOM
// Conversion: pdf_lib_y = page_height - pdfplumber_y

const PAGE_HEIGHT = 612.12
const RIGHT_OFFSET = 481.92 // x offset for Social Worker copy

const toY = (plumberY: number) => PAGE_HEIGHT - plumberY

// ─── Field Coordinate Map ───────────────────────────────────────────────────
// Each field: { x, y } where x/y are for the LEFT (Beneficiary) card
// Right card = x + RIGHT_OFFSET, same y

const FIELDS = {
  serial_number: { x: 403, y: toY(56), size: 7 },
  region: { x: 137, y: toY(83), size: 7 },
  district: { x: 354, y: toY(82), size: 7 },
  province: { x: 138, y: toY(92), size: 7 },
  barangay: { x: 354, y: toY(91), size: 7 },
  city_municipality: { x: 139, y: toY(102), size: 7 },
  evacuation_center: { x: 355, y: toY(102), size: 7 },
  last_name: { x: 115, y: toY(127), size: 7 },
  first_name: { x: 114, y: toY(138), size: 7 },
  middle_name: { x: 114, y: toY(147), size: 7 },
  name_extension: { x: 114, y: toY(161), size: 7 },
  birthdate: { x: 114, y: toY(177), size: 7 },
  age: { x: 115, y: toY(191), size: 7 },
  birthplace: { x: 115, y: toY(202), size: 7 },
  civil_status: { x: 354, y: toY(127), size: 7 },
  mothers_maiden_name: { x: 354, y: toY(137), size: 7 },
  religion: { x: 354, y: toY(147), size: 7 },
  occupation: { x: 354, y: toY(157), size: 7 },
  monthly_income: { x: 354, y: toY(174), size: 7 },
  id_card_presented: { x: 354, y: toY(191), size: 7 },
  id_card_number: { x: 354, y: toY(202), size: 7 },
  sex_male_x: 83,
  sex_male_y: toY(217),
  sex_female_x: 147,
  sex_female_y: toY(218),
  contact_primary: { x: 313, y: toY(219), size: 7 },
  contact_alternate: { x: 382, y: toY(220), size: 7 },
  permanent_address: { x: 118, y: toY(236), size: 7 },
  fourps_x: 101,
  fourps_y: toY(269),
  ip_x: 193,
  ip_y: toY(270),
  ip_ethnicity: { x: 281, y: toY(269), size: 7 },

  // ACCOUNT
  bank_ewallet: { x: 127, y: toY(436), size: 7 },
  account_type: { x: 330, y: toY(436), size: 7 },
  account_name: { x: 127, y: toY(445), size: 7 },
  account_number: { x: 330, y: toY(446), size: 7 },

  // HOUSE OWNERSHIP
  house_owner_x: 36,
  house_owner_y: toY(473),
  house_renter_x: 100,
  house_renter_y: toY(472),
  house_sharer_x: 165,
  house_sharer_y: toY(472),
  //Shelter
  shelter_partial_x: 248,
  shelter_partial_y: toY(472),
  shelter_total_x: 361,
  shelter_total_y: toY(473),
  date_registered: { x: 142, y: toY(519), size: 7 },
  serial_number_back: { x: 436, y: toY(31), size: 7 },
}

// Family members table
// Columns x positions (start of each cell)
const FM_COLS = {
  full_name:    32,
  relation:     107,
  birthdate:    156,
  age:          216,
  sex:          243,
  education:    266,
  occupation:   327,
  vulnerability:387,
}

const FM_ROWS = [319, 328, 339, 349, 359, 369, 380, 390]
  .map(y => toY(y - 8))

// ─── Display value reverse maps ─────────────────────────────────────────────
const SHELTER_DISPLAY: Record<string, string> = {
  partially_damaged: 'Partially Damaged',
  totally_damaged:   'Totally Damaged',
}
const HOUSE_DISPLAY: Record<string, string> = {
  owner: 'Owner', renter: 'Renter', sharer: 'Sharer',
}
const SEX_DISPLAY: Record<string, string> = {
  male: 'Male', female: 'Female',
}
const CIVIL_STATUS_DISPLAY: Record<string, string> = {
  single: 'Single', married: 'Married', widowed: 'Widowed',
  separated: 'Separated', annulled: 'Annulled', live_in: 'Live-in',
}
const ACCOUNT_TYPE_DISPLAY: Record<string, string> = {
  savings: 'Savings', current: 'Current', e_wallet: 'E-Wallet',
}
const BANK_DISPLAY: Record<string, string> = {
  landbank: 'Landbank', dbp: 'DBP', bdo: 'BDO', bpi: 'BPI',
  metrobank: 'Metrobank', pnb: 'PNB', unionbank: 'UnionBank',
  rcbc: 'RCBC', other_bank: 'Others',
}
const EWALLET_DISPLAY: Record<string, string> = {
  gcash: 'GCash', maya: 'Maya', shopeepay: 'ShopeePay',
  seabank: 'SeaBank', other_ewallet: 'Others',
}

// ─── Helper: draw text on a page ────────────────────────────────────────────
function drawText(
    page: PDFPage,
    text: string,
    x: number,
    y: number,
    size: number,
    font: PDFFont,
    maxWidth = 200
    ) {
    if (!text) return

    page.drawText(String(text), {
        x,
        y,
        size,
        font,
        color: rgb(0, 0, 0),
        maxWidth,
    })
    }

// ─── Helper: draw checkbox mark ─────────────────────────────────────────────
function drawCheckbox(
  page: PDFPage,
  x: number,
  y: number,
  checked: boolean,
  font: PDFFont,
  maxWidth = 300
) {
  if (!checked) return

  page.drawText('X', {
    x: x + 1.5,
    y: y - 2,
    size: 8,
    font,
    color: rgb(0, 0, 0),
  })
}

function drawDebugPoint(page: PDFPage, x: number, y: number) {
  page.drawCircle({
    x,
    y,
    size: 2,
    color: rgb(1, 0, 0),
  })
}

// ─── Fill one card (left or right) ──────────────────────────────────────────
async function fillCard(
  page: PDFPage,
  data: EnrichedCard,
  xOffset: number,
  font: PDFFont,
  fields: typeof FIELDS
) {
  const head = data.family_heads
  const account = head?.account_info
  const members = data.family_members ?? []

  const f = (
    field: { x: number; y: number; size: number },
    text: string,
    maxWidth = 200
    ) => {

    // DEBUG RED DOT
    drawDebugPoint(page, field.x + xOffset, field.y)

    // DRAW TEXT
    drawText(
        page,
        text,
        field.x + xOffset,
        field.y,
        field.size,
        font,
        maxWidth
    )
    }

  f(fields.serial_number, data.serial_number ?? '')
  f(fields.region,            data.region_name ?? '')
  f(fields.district,          data.district ?? '')
  f(fields.province,          data.province_name ?? '')
  f(fields.barangay,          data.barangay_name ?? '')
  f(fields.city_municipality, data.municipality_name ?? '')
  f(fields.evacuation_center, data.evacuation_center_site ?? '', 300)
  f(fields.last_name,           head?.last_name ?? '')
  f(fields.first_name,          head?.first_name ?? '')
  f(fields.middle_name,         head?.middle_name ?? '')
  f(fields.name_extension,      head?.name_extension ?? '')
  f(fields.birthdate,           head?.birthdate ?? '')
  f(fields.age,                 head?.age ?? '')
  f(fields.birthplace,          head?.birthplace ?? '')
  f(fields.civil_status,        CIVIL_STATUS_DISPLAY[head?.civil_status] ?? '')
  f(fields.mothers_maiden_name, head?.mothers_maiden_name ?? '')
  f(fields.religion,            head?.religion ?? '')
  f(fields.occupation,          head?.occupation ?? '')
  f(fields.monthly_income,      head?.monthly_family_net_income ?? '')
  f(fields.id_card_presented,   head?.id_card_presented ?? '')
  f(fields.id_card_number,      head?.id_card_number ?? '')

  // Sex checkboxes
  const sex = head?.sex ?? ''
  drawCheckbox(page, fields.sex_male_x + xOffset,   fields.sex_male_y, sex === 'male',   font)
  drawCheckbox(page, fields.sex_female_x + xOffset, fields.sex_female_y, sex === 'female', font)

  f(fields.contact_primary,   head?.contact_primary ?? '')
  f(fields.contact_alternate, head?.contact_alternate ?? '')
  f(fields.permanent_address, head?.permanent_address ?? '', 500)

  drawCheckbox(page, fields.fourps_x + xOffset, fields.fourps_y, data.is_4ps_beneficiary, font)
  drawCheckbox(page, fields.ip_x + xOffset,     fields.ip_y,     data.is_indigenous_people, font)
  if (data.is_indigenous_people && data.ip_ethnicity) {
    f(fields.ip_ethnicity, data.ip_ethnicity)
  }

  // Family members
  members.slice(0, 8).forEach((member: FamilyMember, i: number) => {
    const rowY = FM_ROWS[i]
    const rowSize = 6
    drawText(page, member.full_name ?? '',                      FM_COLS.full_name    + xOffset, rowY, rowSize, font)
    drawText(page, member.relation_to_head ?? '',               FM_COLS.relation     + xOffset, rowY, rowSize, font)
    drawText(page, member.birthdate ?? '',                      FM_COLS.birthdate    + xOffset, rowY, rowSize, font)
    drawText(page, String(member.age ?? ''),                    FM_COLS.age          + xOffset, rowY, rowSize, font)
    drawText(page, SEX_DISPLAY[member.sex] ?? '',               FM_COLS.sex          + xOffset, rowY, rowSize, font)
    drawText(page, member.highest_educational_attainment ?? '', FM_COLS.education    + xOffset, rowY, rowSize, font)
    drawText(page, member.occupation ?? '',                     FM_COLS.occupation   + xOffset, rowY, rowSize, font)
    drawText(page, member.type_of_vulnerability ?? '',          FM_COLS.vulnerability + xOffset, rowY, rowSize, font)
  })

  const bankName = account?.bank_name
    ? BANK_DISPLAY[account.bank_name] ?? account.bank_name
    : account?.ewallet_name
    ? EWALLET_DISPLAY[account.ewallet_name] ?? account.ewallet_name
    : ''

  f(fields.bank_ewallet,   bankName)
  f(fields.account_type,   ACCOUNT_TYPE_DISPLAY[account?.account_type] ?? '')
  f(fields.account_name,   account?.account_name ?? '')
  f(fields.account_number, account?.account_number ?? '')

  const ownership = data.house_ownership
  drawCheckbox(page, fields.house_owner_x  + xOffset, fields.house_owner_y, ownership === 'owner',  font)
  drawCheckbox(page, fields.house_renter_x + xOffset, fields.house_renter_y, ownership === 'renter', font)
  drawCheckbox(page, fields.house_sharer_x + xOffset, fields.house_sharer_y, ownership === 'sharer', font)

  const shelter = data.shelter_damage
  drawCheckbox(page, fields.shelter_partial_x + xOffset, fields.shelter_partial_y, shelter === 'partially_damaged', font)
  drawCheckbox(page, fields.shelter_total_x   + xOffset, fields.shelter_total_y, shelter === 'totally_damaged',   font)

  f(fields.date_registered, data.date_registered ?? '')
}

// ─── Route Handler ───────────────────────────────────────────────────────────
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ cardId: string }> }
) {
  try {  // ← add this back
    const { cardId } = await params

    // Dev tool — accept coord overrides via query string
    const url = new URL(req.url)
    const coordsParam = url.searchParams.get('coords')
    const coordOverrides = coordsParam ? JSON.parse(coordsParam) : null

    const fields = coordOverrides
      ? Object.fromEntries(
          Object.entries(FIELDS).map(([key, val]) => [
            key,
            coordOverrides[key]
              ? { ...(val as object), x: coordOverrides[key].x, y: PAGE_HEIGHT - coordOverrides[key].y }
              : val
          ])
        )
      : FIELDS

    // 1. Fetch card with all relations
    const { data: card, error } = await supabaseAdmin
      .from('faced_cards')
      .select(`
        *,
        family_heads (
          *,
          account_info (*)
        ),
        family_members (*)
      `)
      .eq('id', cardId)
      .single()

    console.log('cardId received:', cardId)
    console.log('card:', card)
    console.log('error:', error?.message)

    if (error || !card) {
      return NextResponse.json({ error: 'Card not found' }, { status: 404 })
    }

    // 2. Fetch location names from PSGC tables
    const [regionRes, provinceRes, munRes, barangayRes] = await Promise.all([
      supabaseAdmin.from('psgc_regions').select('name').eq('code', card.psgc_code?.substring(0, 2).padEnd(10, '0')).single(),
      supabaseAdmin.from('psgc_provinces').select('name').eq('code', card.psgc_code?.substring(0, 4).padEnd(10, '0')).single(),
      supabaseAdmin.from('psgc_municipalities').select('name, district').eq('code', card.psgc_code?.substring(0, 7).padEnd(10, '0')).single(),
      supabaseAdmin.from('psgc_barangays').select('name').eq('code', card.psgc_code).single(),
    ])

    const enrichedCard = {
      ...card,
      region_name:       regionRes.data?.name ?? '',
      province_name:     provinceRes.data?.name ?? '',
      municipality_name: munRes.data?.name ?? '',
      district:          munRes.data?.district ?? '',
      barangay_name:     barangayRes.data?.name ?? '',
    }

    // 3. Load blank PDF template
    const templatePath = path.join(process.cwd(), 'public', 'FACED_Form.pdf')
    const templateBytes = fs.readFileSync(templatePath)
    const pdfDoc = await PDFDocument.load(templateBytes)
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica)

    // 4. Fill page 1 (front of card - both copies)
    const page1 = pdfDoc.getPages()[0]
    await fillCard(page1, enrichedCard, 0,            font, fields as typeof FIELDS) // ← add 5th arg
    await fillCard(page1, enrichedCard, RIGHT_OFFSET, font, fields as typeof FIELDS) // ← add 5th arg

    // 5. Fill page 2 (back - serial number only, assistance records filled manually)
    const page2 = pdfDoc.getPages()[1]
    const backSerialY = toY(54.9) // same y as front serial
    const backSerialX_left  = 405
    const backSerialX_right = 405 + RIGHT_OFFSET

    page2.drawText(card.serial_number ?? '', {
      x: backSerialX_left, y: backSerialY, size: 7,
      font, color: rgb(0, 0, 0),
    })
    page2.drawText(card.serial_number ?? '', {
      x: backSerialX_right, y: backSerialY, size: 7,
      font, color: rgb(0, 0, 0),
    })

    // 6. Save and return PDF
    const pdfBytes = await pdfDoc.save()
    const buffer = Buffer.from(pdfBytes)

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type':        'application/pdf',
        'Content-Disposition': `attachment; filename="FACED-${card.serial_number}.pdf"`,
      },
    })

  } catch (err) {
    console.error('PDF generation error:', err)
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 })
  }
}