"use client"
import { useState, useRef, useCallback } from "react"
import Draggable from "react-draggable"

// ─── Constants ────────────────────────────────────────────────────────────────
const PDF_WIDTH  = 963.84
const PDF_HEIGHT = 612.12
const PNG_WIDTH  = 2678
const PNG_HEIGHT = 1701

// PDF points → PNG pixels (y=0 at top in both)
const PT_TO_PX_X = PNG_WIDTH  / PDF_WIDTH   // ≈ 2.7785
const PT_TO_PX_Y = PNG_HEIGHT / PDF_HEIGHT  // ≈ 2.7785

// PDF pt → PNG px
const ptToPx = (ptX: number, ptY: number) => ({
  x: ptX * PT_TO_PX_X,
  y: ptY * PT_TO_PX_Y,
})

// PNG px → PDF pt
const pxToPt = (pxX: number, pxY: number) => ({
  x: Math.round(pxX / PT_TO_PX_X),
  y: Math.round(pxY / PT_TO_PX_Y),
})

// ─── Types ────────────────────────────────────────────────────────────────────
type FieldType = 'text' | 'checkbox'
type FieldGroup = 'serial' | 'location' | 'head' | 'family' | 'account' | 'shelter' | 'other'

interface FieldDef {
  // Stored in PNG pixels (NOT PDF points, NOT scaled canvas px)
  // This avoids the double-conversion bug in the draggable
  pxX: number
  pxY: number
  page: 1 | 2
  type: FieldType
  group: FieldGroup
  label?: string
}

// Helper to define a field from PDF points (convenience for INITIAL_FIELDS)
const pt = (ptX: number, ptY: number, page: 1 | 2, type: FieldType, group: FieldGroup, label?: string): FieldDef => ({
  pxX: ptX * PT_TO_PX_X,
  pxY: ptY * PT_TO_PX_Y,
  page, type, group, label,
})

// ─── Initial field definitions (in PDF points for readability) ────────────────
const INITIAL_FIELDS: Record<string, FieldDef> = {
  serial_number:        pt(400, 54,  1, 'text',     'serial'),

  region:               pt(128, 81,  1, 'text',     'location'),
  district:             pt(385, 86,  1, 'text',     'location'),
  province:             pt(128, 90,  1, 'text',     'location'),
  barangay:             pt(385, 99,  1, 'text',     'location'),
  city_municipality:    pt(128, 100, 1, 'text',     'location'),
  evacuation_center:    pt(385, 112, 1, 'text',     'location'),

  last_name:            pt(113, 127, 1, 'text',     'head'),
  first_name:           pt(113, 137, 1, 'text',     'head'),
  middle_name:          pt(113, 147, 1, 'text',     'head'),
  name_extension:       pt(113, 159, 1, 'text',     'head'),
  birthdate:            pt(112, 176, 1, 'text',     'head'),
  age:                  pt(113, 192, 1, 'text',     'head'),
  birthplace:           pt(113, 202, 1, 'text',     'head'),
  civil_status:         pt(354, 128, 1, 'text',     'head'),
  mothers_maiden_name:  pt(354, 137, 1, 'text',     'head'),
  religion:             pt(354, 147, 1, 'text',     'head'),
  occupation:           pt(354, 157, 1, 'text',     'head'),
  monthly_income:       pt(354, 174, 1, 'text',     'head'),
  id_card_presented:    pt(354, 192, 1, 'text',     'head'),
  id_card_number:       pt(354, 201, 1, 'text',     'head'),
  sex_male_x:           pt(82,  215, 1, 'checkbox', 'head', 'sex: male ☑'),
  sex_female_x:         pt(145, 216, 1, 'checkbox', 'head', 'sex: female ☑'),
  contact_primary:      pt(309, 218, 1, 'text',     'head'),
  contact_alternate:    pt(381, 218, 1, 'text',     'head'),
  permanent_address:    pt(112, 235, 1, 'text',     'head'),
  fourps_x:             pt(99,  267, 1, 'checkbox', 'head', '4Ps ☑'),
  ip_x:                 pt(192, 268, 1, 'checkbox', 'head', 'IP ☑'),
  ip_ethnicity:         pt(281, 268, 1, 'text',     'head'),

  fm_full_name_x:       pt(29,  316, 1, 'text',     'family', 'FM col: full_name'),
  fm_relation_x:        pt(107, 316, 1, 'text',     'family', 'FM col: relation'),
  fm_birthdate_x:       pt(155, 316, 1, 'text',     'family', 'FM col: birthdate'),
  fm_age_x:             pt(209, 316, 1, 'text',     'family', 'FM col: age'),
  fm_sex_x:             pt(237, 316, 1, 'text',     'family', 'FM col: sex'),
  fm_education_x:       pt(265, 316, 1, 'text',     'family', 'FM col: education'),
  fm_occupation_x:      pt(324, 316, 1, 'text',     'family', 'FM col: occupation'),
  fm_vulnerability_x:   pt(382, 316, 1, 'text',     'family', 'FM col: vulnerability'),
  fm_row1_y:            pt(29,  316, 1, 'text',     'family', 'FM row 1 ↕'),
  fm_row2_y:            pt(29,  326, 1, 'text',     'family', 'FM row 2 ↕'),
  fm_row3_y:            pt(29,  337, 1, 'text',     'family', 'FM row 3 ↕'),
  fm_row4_y:            pt(29,  348, 1, 'text',     'family', 'FM row 4 ↕'),
  fm_row5_y:            pt(29,  358, 1, 'text',     'family', 'FM row 5 ↕'),
  fm_row6_y:            pt(29,  368, 1, 'text',     'family', 'FM row 6 ↕'),
  fm_row7_y:            pt(29,  378, 1, 'text',     'family', 'FM row 7 ↕'),
  fm_row8_y:            pt(29,  389, 1, 'text',     'family', 'FM row 8 ↕'),

  bank_ewallet:         pt(126, 437, 1, 'text',     'account'),
  account_type:         pt(330, 437, 1, 'text',     'account'),
  account_name:         pt(126, 447, 1, 'text',     'account'),
  account_number:       pt(330, 447, 1, 'text',     'account'),

  house_owner_x:        pt(35,  471, 1, 'checkbox', 'shelter', 'Owner ☑'),
  house_renter_x:       pt(98,  471, 1, 'checkbox', 'shelter', 'Renter ☑'),
  house_sharer_x:       pt(162, 471, 1, 'checkbox', 'shelter', 'Sharer ☑'),
  shelter_partial_x:    pt(247, 471, 1, 'checkbox', 'shelter', 'Partial ☑'),
  shelter_total_x:      pt(359, 471, 1, 'checkbox', 'shelter', 'Total ☑'),

  date_registered:      pt(154, 516, 1, 'text',     'other'),

  serial_number_back:   pt(405, 55,  2, 'text',     'serial'),

  // ── Page 2 — Assistance Records ──────────────────────────────────────────
  // Columns — drag to align with each column header on page 2
  // Use row 1 y as reference (all col markers sit on the same row)
  ar_col_date:          pt(30,  100, 2, 'text', 'family', 'AR col: date'),
  ar_col_recipient:     pt(78,  100, 2, 'text', 'family', 'AR col: recipient'),
  ar_col_disaster:      pt(138, 100, 2, 'text', 'family', 'AR col: disaster_type'),
  ar_col_type:          pt(198, 100, 2, 'text', 'family', 'AR col: assistance_type'),
  ar_col_unit:          pt(268, 100, 2, 'text', 'family', 'AR col: unit'),
  ar_col_quantity:      pt(298, 100, 2, 'text', 'family', 'AR col: quantity'),
  ar_col_cost:          pt(328, 100, 2, 'text', 'family', 'AR col: cost'),
  ar_col_provider:      pt(368, 100, 2, 'text', 'family', 'AR col: provider'),

  // Rows — drag each to the correct row baseline on page 2
  ar_row1_y:            pt(30,  100, 2, 'text', 'other', 'AR row 1 ↕'),
  ar_row2_y:            pt(30,  111, 2, 'text', 'other', 'AR row 2 ↕'),
  ar_row3_y:            pt(30,  122, 2, 'text', 'other', 'AR row 3 ↕'),
  ar_row4_y:            pt(30,  133, 2, 'text', 'other', 'AR row 4 ↕'),
  ar_row5_y:            pt(30,  144, 2, 'text', 'other', 'AR row 5 ↕'),
  ar_row6_y:            pt(30,  155, 2, 'text', 'other', 'AR row 6 ↕'),
  ar_row7_y:            pt(30,  166, 2, 'text', 'other', 'AR row 7 ↕'),
  ar_row8_y:            pt(30,  177, 2, 'text', 'other', 'AR row 8 ↕'),
  ar_row9_y:            pt(30,  188, 2, 'text', 'other', 'AR row 9 ↕'),
  ar_row10_y:           pt(30,  199, 2, 'text', 'other', 'AR row 10 ↕'),
}

type Fields = typeof INITIAL_FIELDS

// ─── Group colors ─────────────────────────────────────────────────────────────
const GROUP_COLORS: Record<string, { border: string; dot: string }> = {
  serial:   { border: '#EAB308', dot: '#EAB308' },
  location: { border: '#3B82F6', dot: '#3B82F6' },
  head:     { border: '#22C55E', dot: '#22C55E' },
  family:   { border: '#A855F7', dot: '#A855F7' },
  account:  { border: '#F97316', dot: '#F97316' },
  shelter:  { border: '#EF4444', dot: '#EF4444' },
  other:    { border: '#94A3B8', dot: '#94A3B8' },
}

// ─── Code generator ───────────────────────────────────────────────────────────
const CHECKBOX_KEYS = new Set([
  'sex_male_x', 'sex_female_x', 'fourps_x', 'ip_x',
  'house_owner_x', 'house_renter_x', 'house_sharer_x',
  'shelter_partial_x', 'shelter_total_x',
])
const FM_COL_KEYS = new Set([
  'fm_full_name_x','fm_relation_x','fm_birthdate_x','fm_age_x',
  'fm_sex_x','fm_education_x','fm_occupation_x','fm_vulnerability_x',
])
const FM_ROW_KEYS = new Set([
  'fm_row1_y','fm_row2_y','fm_row3_y','fm_row4_y',
  'fm_row5_y','fm_row6_y','fm_row7_y','fm_row8_y',
])

function toPt(field: FieldDef) {
  return pxToPt(field.pxX, field.pxY)
}

function generateRouteCode(fields: Fields): string {
  const page1 = Object.entries(fields).filter(([, v]) => v.page === 1)
  const lines: string[] = []

  for (const [key, val] of page1) {
    if (FM_COL_KEYS.has(key) || FM_ROW_KEYS.has(key)) continue
    const { x, y } = toPt(val)
    if (CHECKBOX_KEYS.has(key)) {
      lines.push(`  ${key}: ${x},`)
      lines.push(`  ${key.replace('_x', '_y')}: toY(${y}),`)
    } else {
      lines.push(`  ${key}: { x: ${x}, y: toY(${y}), size: 7 },`)
    }
  }

  const fmRowYs = ['fm_row1_y','fm_row2_y','fm_row3_y','fm_row4_y',
                   'fm_row5_y','fm_row6_y','fm_row7_y','fm_row8_y']
    .map(k => toPt(fields[k]).y)

  const fmRowsCode = `const FM_ROWS = [${fmRowYs.join(', ')}]\n  .map(y => toY(y - 8))`

  const fmColNames = ['full_name','relation','birthdate','age','sex','education','occupation','vulnerability']
  const fmColKeys  = ['fm_full_name_x','fm_relation_x','fm_birthdate_x','fm_age_x',
                      'fm_sex_x','fm_education_x','fm_occupation_x','fm_vulnerability_x']
  const fmColLines = fmColNames.map((name, i) => `  ${name}: ${toPt(fields[fmColKeys[i]]).x},`)
  const fmColsCode = `const FM_COLS = {\n${fmColLines.join('\n')}\n}`

  const p2 = toPt(fields['serial_number_back'])
  const page2Code = `// Page 2 (back)\nconst BACK_SERIAL_X = ${p2.x}\nconst BACK_SERIAL_Y = toY(${p2.y})`

  // Assistance record rows
  const arRowKeys = ['ar_row1_y','ar_row2_y','ar_row3_y','ar_row4_y','ar_row5_y',
                     'ar_row6_y','ar_row7_y','ar_row8_y','ar_row9_y','ar_row10_y','ar_row11_y', 'ar_row12_y', 'ar_row13_y', 'ar_row14_y', 'ar_row15_y', 'ar_row16_y']
  const arRowYs = arRowKeys.map(k => toPt(fields[k]).y)
  const arRowsCode = `const ASSISTANCE_MAX_ROWS = ${arRowYs.length}\nconst ASSISTANCE_ROWS = [${arRowYs.join(', ')}].map(y => toY(y))`

  const arColMap: [string, string][] = [
    ['date',            'ar_col_date'],
    ['recipient',       'ar_col_recipient'],
    ['disaster_type',   'ar_col_disaster'],
    ['assistance_type', 'ar_col_type'],
    ['unit',            'ar_col_unit'],
    ['quantity',        'ar_col_quantity'],
    ['cost',            'ar_col_cost'],
    ['provider',        'ar_col_provider'],
  ]
  const arColLines = arColMap.map(([name, key]) => `  ${name}: ${toPt(fields[key]).x},`)
  const arColsCode = `const ASSISTANCE_COLS = {\n${arColLines.join('\n')}\n}`

  return [
    `// Generated by FACED Coordinate Editor — paste into route.ts`,
    `const FIELDS = {\n${lines.join('\n')}\n}`,
    fmRowsCode,
    fmColsCode,
    page2Code,
    arRowsCode,
    arColsCode,
  ].join('\n\n')
}

// ─── Draggable Marker ─────────────────────────────────────────────────────────
// KEY FIX: position is stored and passed as CANVAS pixels (pxX * scale, pxY * scale).
// On drag, data.x/data.y are already canvas pixels — we convert back to PNG pixels
// by dividing by scale, then store as PNG pixels. No double-conversion.
function DraggableMarker({
  fieldKey,
  field,
  onUpdate,
  scale,
  isSelected,
  onSelect,
}: {
  fieldKey: string
  field: FieldDef
  onUpdate: (key: string, pxX: number, pxY: number) => void
  scale: number
  isSelected: boolean
  onSelect: (key: string) => void
}) {
  const nodeRef = useRef<HTMLDivElement>(null)
  const colors = GROUP_COLORS[field.group]
  const label = field.label ?? fieldKey
  const pt = pxToPt(field.pxX, field.pxY)

  // Canvas position = PNG pixel position * scale
  const canvasX = field.pxX * scale
  const canvasY = field.pxY * scale

  return (
    <Draggable
      nodeRef={nodeRef}
      position={{ x: canvasX, y: canvasY }}
      // onDrag: data.x is canvas px → divide by scale → PNG px
      onDrag={(_, data) => onUpdate(fieldKey, data.x / scale, data.y / scale)}
      onStart={() => onSelect(fieldKey)}
      bounds="parent"
    >
      <div
        ref={nodeRef}
        className="absolute cursor-move select-none"
        style={{ top: 0, left: 0, zIndex: isSelected ? 20 : 10 }}
        onClick={() => onSelect(fieldKey)}
      >
        <div style={{
          width: field.type === 'checkbox' ? 10 : 8,
          height: field.type === 'checkbox' ? 10 : 8,
          borderRadius: field.type === 'checkbox' ? 2 : '50%',
          background: colors.dot,
          border: '1.5px solid white',
          boxShadow: isSelected ? `0 0 0 2px ${colors.dot}` : '0 1px 3px rgba(0,0,0,0.5)',
        }} />
        {/* Label — always show when selected or showTooltips; shows PDF pt coords */}
        {isSelected && (
          <div style={{
            position: 'absolute', left: 12, top: -2,
            background: 'rgba(10,10,10,0.92)', color: colors.dot,
            fontSize: 9, padding: '1px 5px', borderRadius: 3,
            whiteSpace: 'nowrap', pointerEvents: 'none',
            border: `1px solid ${colors.border}`,
          }}>
            {label} — pt({pt.x}, {pt.y})
          </div>
        )}
      </div>
    </Draggable>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function CoordinateEditorPage() {
  const [fields, setFields] = useState<Fields>(() =>
    // Deep clone so resets work correctly
    Object.fromEntries(Object.entries(INITIAL_FIELDS).map(([k, v]) => [k, { ...v }]))
  )
  const [activePage, setActivePage] = useState<1 | 2>(1)
  const [scale, setScale] = useState(0.5)
  const [copied, setCopied] = useState(false)
  const [selectedField, setSelectedField] = useState<string | null>(null)
  const [activeGroup, setActiveGroup] = useState<string>('all')
  const [showTooltips, setShowTooltips] = useState(false)

  // Stores PNG pixel positions (not canvas, not PDF pt)
  const updateField = useCallback((key: string, pxX: number, pxY: number) => {
    setFields(prev => ({ ...prev, [key]: { ...prev[key], pxX, pxY } }))
  }, [])

  const resetField = (key: string) => {
    setFields(prev => ({ ...prev, [key]: { ...INITIAL_FIELDS[key] } }))
  }

  // Direct PDF pt input from the inspector panel
  const updateFieldPt = (key: string, axis: 'x' | 'y', ptVal: number) => {
    setFields(prev => {
      const f = prev[key]
      const newPxX = axis === 'x' ? ptVal * PT_TO_PX_X : f.pxX
      const newPxY = axis === 'y' ? ptVal * PT_TO_PX_Y : f.pxY
      return { ...prev, [key]: { ...f, pxX: newPxX, pxY: newPxY } }
    })
  }

  const copyCode = () => {
    navigator.clipboard.writeText(generateRouteCode(fields))
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  const pageFields = Object.entries(fields).filter(([, v]) => v.page === activePage)
  const visibleFields = activeGroup === 'all'
    ? pageFields
    : pageFields.filter(([, v]) => v.group === activeGroup)

  const groups = ['all', ...Object.keys(GROUP_COLORS)] as const
  const sel = selectedField ? fields[selectedField] : null
  const selPt = sel ? pxToPt(sel.pxX, sel.pxY) : null

  const canvasW = Math.round(PNG_WIDTH * scale)
  const canvasH = Math.round(PNG_HEIGHT * scale)

  const S = (obj: React.CSSProperties): React.CSSProperties => obj

  return (
    <div style={S({ display: 'flex', height: '100vh', background: '#0a0a0f', color: '#e2e8f0', fontFamily: 'monospace', overflow: 'hidden' })}>

      {/* ── Sidebar ── */}
      <div style={S({ width: 280, display: 'flex', flexDirection: 'column', borderRight: '1px solid #1e293b', background: '#0d1117', flexShrink: 0, overflow: 'hidden' })}>

        <div style={S({ padding: '14px 16px', borderBottom: '1px solid #1e293b', flexShrink: 0 })}>
          <div style={S({ fontSize: 13, fontWeight: 700, color: '#f1f5f9' })}>FACED PDF MAPPER</div>
          <div style={S({ fontSize: 10, color: '#475569', marginTop: 3 })}>
            Markers store PNG px internally · labels show PDF pt
          </div>
        </div>

        {/* Page */}
        <div style={S({ display: 'flex', gap: 6, padding: '10px 12px', borderBottom: '1px solid #1e293b', flexShrink: 0 })}>
          {([1, 2] as const).map(p => (
            <button key={p} onClick={() => setActivePage(p)} style={S({
              flex: 1, padding: '5px 0', fontSize: 11, cursor: 'pointer', borderRadius: 4,
              background: activePage === p ? '#1d4ed8' : '#1e293b',
              color: activePage === p ? '#fff' : '#94a3b8', border: 'none',
            })}>Page {p} {p === 1 ? '(Front)' : '(Back)'}</button>
          ))}
        </div>

        {/* Zoom */}
        <div style={S({ padding: '8px 12px', borderBottom: '1px solid #1e293b', flexShrink: 0 })}>
          <div style={S({ fontSize: 10, color: '#64748b', marginBottom: 4 })}>
            Zoom {Math.round(scale * 100)}% · canvas {canvasW}×{canvasH}px
          </div>
          <input type="range" min={0.2} max={1.5} step={0.05} value={scale}
            onChange={e => setScale(parseFloat(e.target.value))}
            style={{ width: '100%', accentColor: '#3b82f6' }} />
        </div>

        {/* Groups */}
        <div style={S({ padding: '8px 12px', borderBottom: '1px solid #1e293b', flexShrink: 0 })}>
          <div style={S({ display: 'flex', flexWrap: 'wrap', gap: 4 })}>
            {groups.map(g => (
              <button key={g} onClick={() => setActiveGroup(g)} style={S({
                padding: '3px 8px', fontSize: 10, cursor: 'pointer', borderRadius: 3,
                background: activeGroup === g ? (g === 'all' ? '#1d4ed8' : GROUP_COLORS[g]?.dot ?? '#1d4ed8') : '#1e293b',
                color: activeGroup === g ? '#fff' : '#64748b', border: 'none', fontFamily: 'monospace',
              })}>{g}</button>
            ))}
          </div>
          <label style={S({ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8, fontSize: 10, color: '#64748b', cursor: 'pointer' })}>
            <input type="checkbox" checked={showTooltips} onChange={e => setShowTooltips(e.target.checked)} />
            Always show labels
          </label>
        </div>

        {/* Inspector */}
        {selectedField && sel && selPt && (
          <div style={S({ padding: '10px 12px', borderBottom: '1px solid #1e293b', background: '#0f172a', flexShrink: 0 })}>
            <div style={S({ fontSize: 10, color: '#94a3b8', marginBottom: 4 })}>SELECTED</div>
            <div style={S({ fontSize: 11, color: GROUP_COLORS[sel.group].dot, fontWeight: 600, marginBottom: 8 })}>{selectedField}</div>
            <div style={S({ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 8 })}>
              {(['x', 'y'] as const).map(axis => (
                <div key={axis}>
                  <div style={S({ fontSize: 9, color: '#475569', marginBottom: 3 })}>{axis.toUpperCase()} — PDF points</div>
                  <input
                    type="number"
                    value={axis === 'x' ? selPt.x : selPt.y}
                    onChange={e => updateFieldPt(selectedField, axis, +e.target.value)}
                    style={S({ width: '100%', padding: '4px 6px', fontSize: 11, background: '#1e293b', border: '1px solid #334155', borderRadius: 3, color: '#e2e8f0', fontFamily: 'monospace' })}
                  />
                </div>
              ))}
            </div>
            <div style={S({ fontSize: 9, color: '#475569', marginBottom: 6 })}>
              PNG px: {Math.round(sel.pxX)}, {Math.round(sel.pxY)}
            </div>
            <button onClick={() => resetField(selectedField)} style={S({
              width: '100%', padding: '4px 0', fontSize: 10, cursor: 'pointer',
              background: '#1e293b', border: '1px solid #334155', borderRadius: 3, color: '#94a3b8',
            })}>↺ Reset to default</button>
          </div>
        )}

        {/* Field list */}
        <div style={S({ flex: 1, overflowY: 'auto', padding: '8px 12px' })}>
          <div style={S({ fontSize: 9, color: '#475569', marginBottom: 6 })}>{visibleFields.length} fields</div>
          {visibleFields.map(([key, val]) => {
            const pt = pxToPt(val.pxX, val.pxY)
            return (
              <div key={key} onClick={() => setSelectedField(key)} style={S({
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '4px 6px', borderRadius: 3, cursor: 'pointer', marginBottom: 1,
                background: selectedField === key ? '#1e293b' : 'transparent',
                border: selectedField === key ? `1px solid ${GROUP_COLORS[val.group].border}` : '1px solid transparent',
              })}>
                <div style={S({ display: 'flex', alignItems: 'center', gap: 6 })}>
                  <div style={S({ width: 6, height: 6, borderRadius: val.type === 'checkbox' ? 1 : '50%', background: GROUP_COLORS[val.group].dot, flexShrink: 0 })} />
                  <span style={S({ fontSize: 10, color: '#cbd5e1', maxWidth: 130, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' })}>
                    {val.label ?? key}
                  </span>
                </div>
                <span style={S({ fontSize: 9, color: '#475569', fontFamily: 'monospace' })}>{pt.x},{pt.y}</span>
              </div>
            )
          })}
        </div>

        {/* Copy */}
        <div style={S({ padding: '12px', borderTop: '1px solid #1e293b', flexShrink: 0 })}>
          <button onClick={copyCode} style={S({
            width: '100%', padding: '8px 0', fontSize: 12, cursor: 'pointer', borderRadius: 4,
            background: copied ? '#15803d' : '#1d4ed8', color: '#fff', border: 'none', fontWeight: 600,
          })}>
            {copied ? '✓ Copied!' : '⎘ Copy FIELDS code for route.ts'}
          </button>
          <div style={S({ fontSize: 9, color: '#475569', textAlign: 'center', marginTop: 6 })}>
            Replaces FIELDS · FM_ROWS · FM_COLS in route.ts
          </div>
        </div>
      </div>

      {/* ── Canvas ── */}
      <div style={S({ flex: 1, overflow: 'auto', padding: 24, background: '#111827' })}>
        <div style={S({ position: 'relative', width: canvasW, height: canvasH, border: '1px solid #334155', boxShadow: '0 8px 32px rgba(0,0,0,0.6)', flexShrink: 0 })}>
          <img
            src={activePage === 1 ? '/FACED_FORM-1.png' : '/FACED_FORM-2.png'}
            alt={`FACED Form Page ${activePage}`}
            draggable={false}
            style={{ display: 'block', width: '100%', height: '100%', userSelect: 'none' }}
          />
          {visibleFields.map(([key, val]) => (
            <DraggableMarker
              key={key}
              fieldKey={key}
              field={val}
              onUpdate={updateField}
              scale={scale}
              isSelected={selectedField === key || showTooltips}
              onSelect={setSelectedField}
            />
          ))}
        </div>

        <div style={S({ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 14 })}>
          {Object.entries(GROUP_COLORS).map(([g, c]) => (
            <div key={g} style={S({ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, color: '#64748b' })}>
              <div style={S({ width: 8, height: 8, borderRadius: '50%', background: c.dot })} /> {g}
            </div>
          ))}
        </div>

        <div style={S({ marginTop: 12, padding: '8px 12px', background: '#0d1117', borderRadius: 6, border: '1px solid #1e293b', fontSize: 10, color: '#475569', maxWidth: 640, lineHeight: 1.7 })}>
          <strong style={{ color: '#64748b' }}>How to calibrate:</strong><br />
          1. Enable &quot;Always show labels&quot; to see all field names<br />
          2. Compare dot positions against the actual form fields<br />
          3. Drag a dot to sit at the <em>start</em> of where the text should appear<br />
          4. Use the inspector panel to type exact PDF pt values if needed<br />
          5. Click &quot;Copy FIELDS code&quot; → paste into route.ts replacing FIELDS, FM_ROWS, FM_COLS<br />
          <br />
          <strong style={{ color: '#64748b' }}>Coordinate system:</strong>{' '}
          x=0 is left edge · y=0 is top of page · right card starts at x=481pt (handled by RIGHT_OFFSET in route.ts)
        </div>
      </div>
    </div>
  )
}