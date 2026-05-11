"use client"
import { useState, useRef } from "react"
import Draggable from "react-draggable"

// ─── All FACED fields with initial positions ─────────────────────────────────

const PDF_SCALE = 2.7785  // image px per PDF point (2678 / 963.84)
const IMG_WIDTH  = 2678   // your PNG width
const IMG_HEIGHT = 1701   // your PNG height

// These match the FIELDS object in route.ts
// x = pixels from left of image, y = pixels from top of image
const INITIAL_FIELDS = {
  // Page 1 fields
  serial_number:       { x: 403, y: 59,  page: 1 },

  region:              { x: 120, y: 88,  page: 1 },
  district:            { x: 385, y: 86,  page: 1 },
  province:            { x: 120, y: 100, page: 1 },
  barangay:            { x: 385, y: 99,  page: 1 },
  city_municipality:   { x: 120, y: 112, page: 1 },
  evacuation_center:   { x: 385, y: 112, page: 1 },

  last_name:           { x: 113, y: 128, page: 1 },
  first_name:          { x: 113, y: 138, page: 1 },
  middle_name:         { x: 113, y: 148, page: 1 },
  name_extension:      { x: 113, y: 161, page: 1 },
  birthdate:           { x: 113, y: 178, page: 1 },
  age:                 { x: 113, y: 192, page: 1 },
  birthplace:          { x: 113, y: 202, page: 1 },

  civil_status:        { x: 354, y: 128, page: 1 },
  mothers_maiden_name: { x: 354, y: 137, page: 1 },
  religion:            { x: 354, y: 147, page: 1 },
  occupation:          { x: 354, y: 157, page: 1 },
  monthly_income:      { x: 354, y: 174, page: 1 },
  id_card_presented:   { x: 354, y: 192, page: 1 },
  id_card_number:      { x: 354, y: 201, page: 1 },

  sex_male:            { x: 94,  y: 216, page: 1 },
  sex_female:          { x: 158, y: 216, page: 1 },
  contact_primary:     { x: 310, y: 216, page: 1 },
  contact_alternate:   { x: 400, y: 216, page: 1 },

  permanent_address:   { x: 113, y: 240, page: 1 },
  fourps_checkbox:     { x: 112, y: 271, page: 1 },
  ip_checkbox:         { x: 207, y: 271, page: 1 },
  ip_ethnicity:        { x: 282, y: 271, page: 1 },

  // Family members rows (row 1-8)
  fm_row1:             { x: 29,  y: 326, page: 1 },
  fm_row2:             { x: 29,  y: 339, page: 1 },
  fm_row3:             { x: 29,  y: 352, page: 1 },
  fm_row4:             { x: 29,  y: 365, page: 1 },
  fm_row5:             { x: 29,  y: 378, page: 1 },
  fm_row6:             { x: 29,  y: 391, page: 1 },
  fm_row7:             { x: 29,  y: 404, page: 1 },
  fm_row8:             { x: 29,  y: 417, page: 1 },

  // Family member columns (use fm_row1 as reference row)
  fm_col_relation:     { x: 106, y: 326, page: 1 },
  fm_col_birthdate:    { x: 153, y: 326, page: 1 },
  fm_col_age:          { x: 207, y: 326, page: 1 },
  fm_col_sex:          { x: 236, y: 326, page: 1 },
  fm_col_education:    { x: 264, y: 326, page: 1 },
  fm_col_occupation:   { x: 324, y: 326, page: 1 },
  fm_col_vulnerability:{ x: 382, y: 326, page: 1 },

  bank_ewallet:        { x: 126, y: 437, page: 1 },
  account_type:        { x: 330, y: 437, page: 1 },
  account_name:        { x: 126, y: 447, page: 1 },
  account_number:      { x: 330, y: 447, page: 1 },

  house_owner:         { x: 36,  y: 462, page: 1 },
  house_renter:        { x: 90,  y: 462, page: 1 },
  house_sharer:        { x: 165, y: 462, page: 1 },
  shelter_partial:     { x: 295, y: 462, page: 1 },
  shelter_total:       { x: 375, y: 462, page: 1 },

  date_registered:     { x: 150, y: 524, page: 1 },

  // Page 2 — serial number on back
  serial_number_back:  { x: 403, y: 55,  page: 2 },
}

type FieldKey = keyof typeof INITIAL_FIELDS
type Fields = typeof INITIAL_FIELDS

// Color coding by field group
const FIELD_COLORS: Record<string, string> = {
  serial:   'bg-yellow-400',
  location: 'bg-blue-500',
  head:     'bg-green-500',
  family:   'bg-purple-500',
  account:  'bg-orange-500',
  other:    'bg-red-500',
}

function getColor(fieldName: string): string {
  if (fieldName.includes('serial'))                             return FIELD_COLORS.serial
  if (['region','district','province','barangay','city_municipality','evacuation_center'].includes(fieldName)) return FIELD_COLORS.location
  if (['bank_ewallet','account_type','account_name','account_number'].includes(fieldName)) return FIELD_COLORS.account
  if (fieldName.startsWith('fm_'))                             return FIELD_COLORS.family
  if (['house_owner','house_renter','house_sharer','shelter_partial','shelter_total'].includes(fieldName)) return FIELD_COLORS.other
  return FIELD_COLORS.head
}

function DraggableMarker({
  fieldName,
  coords,
  onUpdate,
  scale,
}: {
  fieldName: string
  coords: { x: number; y: number; page: number }
  onUpdate: (name: string, x: number, y: number) => void
  scale: number
}) {
  const nodeRef = useRef<HTMLDivElement>(null)
  const color = getColor(fieldName)

  return (
    <Draggable
      nodeRef={nodeRef}
      position={{
        x: coords.x * PDF_SCALE * scale,  // PDF pt → image px → scaled
        y: coords.y * PDF_SCALE * scale,
      }}
      onDrag={(_, data) => {
        // Convert back: scaled px → image px → PDF pt
        onUpdate(
          fieldName,
          Math.round(data.x / scale / PDF_SCALE),
          Math.round(data.y / scale / PDF_SCALE)
        )
      }}
      bounds="parent"
    >
      <div ref={nodeRef} className="absolute cursor-move select-none z-10" style={{ top: 0, left: 0 }}>
        <div className={`w-3 h-3 rounded-full ${color} border border-white shadow-md`} />
        <div className="absolute left-4 top-0 bg-gray-900/90 text-white text-[9px] px-1.5 py-0.5 rounded whitespace-nowrap pointer-events-none">
          {fieldName} ({coords.x}, {coords.y})
        </div>
      </div>
    </Draggable>
  )
}

export default function CoordinateEditorPage() {
  const [fields, setFields] = useState<Fields>(INITIAL_FIELDS)
  const [activePage, setActivePage] = useState<1 | 2>(1)
  const [scale, setScale] = useState(1)
  const [copied, setCopied] = useState(false)
  const [activeGroup, setActiveGroup] = useState<string>('all')

  const updateField = (name: string, x: number, y: number) => {
    setFields(prev => ({
      ...prev,
      [name]: { ...prev[name as FieldKey], x, y },
    }))
  }

  // Generate the FIELDS object code to paste into route.ts
  const generateCode = () => {
    const PAGE_HEIGHT = 612.12
    const toY = (y: number) => (PAGE_HEIGHT - y).toFixed(1)

    const lines = Object.entries(fields)
      .filter(([, v]) => v.page === 1 || [])
      .map(([key, v]) => {
        if (['sex_male','sex_female','fourps_checkbox','ip_checkbox',
             'house_owner','house_renter','house_sharer',
             'shelter_partial','shelter_total'].includes(key)) {
          return `  ${key}_x: ${v.x},\n  ${key}_y: toY(${v.y}),`
        }
        if (key.startsWith('fm_row')) {
          return `  // ${key}: y = toY(${v.y}) → ${toY(v.y)}`
        }
        if (key.startsWith('fm_col')) {
          return `  // ${key}: x = ${v.x}`
        }
        return `  ${key}: { x: ${v.x}, y: toY(${v.y}), size: 7 },`
      })
      .join('\n')

    // FM_ROWS array
    const fmRows = Object.entries(fields)
      .filter(([k]) => k.startsWith('fm_row'))
      .map(([, v]) => v.y)
    const fmRowsCode = `\nconst FM_ROWS = [${fmRows.join(', ')}]\n  .map(y => toY(y - 8))`

    // FM_COLS object
    const fmCols = Object.entries(fields)
      .filter(([k]) => k.startsWith('fm_col'))
      .map(([k, v]) => `  ${k.replace('fm_col_', '')}: ${v.x}`)
    const fmColsCode = `\nconst FM_COLS = {\n  full_name: ${fields.fm_row1.x},\n${fmCols.join(',\n')}\n}`

    return `const FIELDS = {\n${lines}\n}${fmRowsCode}${fmColsCode}`
  }

  const copyCode = () => {
    navigator.clipboard.writeText(generateCode())
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const pageFields = Object.entries(fields).filter(([, v]) => v.page === activePage)

  const groups = ['all', 'location', 'head', 'family', 'account', 'other', 'serial']
  const visibleFields = activeGroup === 'all'
    ? pageFields
    : pageFields.filter(([name]) => getColor(name) === FIELD_COLORS[activeGroup])

  return (
    <div className="flex h-screen bg-gray-950 text-white overflow-hidden">

      {/* ── Sidebar ── */}
      <div className="w-72 flex flex-col border-r border-gray-800 overflow-hidden shrink-0">
        <div className="p-4 border-b border-gray-800">
          <h1 className="font-bold text-sm">FACED Coordinate Mapper</h1>
          <p className="text-xs text-gray-400 mt-1">Drag red dots to position fields</p>
        </div>

        {/* Page selector */}
        <div className="p-3 border-b border-gray-800 flex gap-2">
          <button
            onClick={() => setActivePage(1)}
            className={`flex-1 btn btn-xs ${activePage === 1 ? 'btn-primary' : 'btn-ghost'}`}
          >Page 1 (Front)</button>
          <button
            onClick={() => setActivePage(2)}
            className={`flex-1 btn btn-xs ${activePage === 2 ? 'btn-primary' : 'btn-ghost'}`}
          >Page 2 (Back)</button>
        </div>

        {/* Scale */}
        <div className="p-3 border-b border-gray-800">
          <label className="text-xs text-gray-400">Zoom: {Math.round(scale * 100)}%</label>
          <input
            type="range" min={0.3} max={2} step={0.05}
            value={scale}
            onChange={e => setScale(parseFloat(e.target.value))}
            className="range range-xs range-primary w-full mt-1"
          />
        </div>

        {/* Group filter */}
        <div className="p-3 border-b border-gray-800">
          <label className="text-xs text-gray-400 mb-2 block">Show fields</label>
          <div className="flex flex-wrap gap-1">
            {groups.map(g => (
              <button
                key={g}
                onClick={() => setActiveGroup(g)}
                className={`btn btn-xs ${activeGroup === g ? 'btn-primary' : 'btn-ghost'}`}
              >{g}</button>
            ))}
          </div>
        </div>

        {/* Field list */}
        <div className="flex-1 overflow-y-auto p-3">
          <p className="text-xs text-gray-500 mb-2">
            {visibleFields.length} fields on page {activePage}
          </p>
          {visibleFields.map(([name, coords]) => (
            <div key={name} className="flex items-center justify-between py-1 border-b border-gray-800/50 text-xs">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${getColor(name)}`} />
                <span className="text-gray-300 truncate max-w-[120px]">{name}</span>
              </div>
              <span className="text-gray-500 font-mono">{coords.x}, {coords.y}</span>
            </div>
          ))}
        </div>

        {/* Copy button */}
        <div className="p-3 border-t border-gray-800">
          <button
            onClick={copyCode}
            className={`btn btn-sm w-full ${copied ? 'btn-success' : 'btn-primary'}`}
          >
            {copied ? '✓ Copied to clipboard!' : '📋 Copy FIELDS code'}
          </button>
          <p className="text-xs text-gray-500 mt-2 text-center">
            Paste into route.ts FIELDS object
          </p>
        </div>
      </div>

      {/* ── PDF Image Canvas ── */}
      <div className="flex-1 overflow-auto bg-gray-900 p-6">
        <div
          className="relative border border-gray-600 shadow-2xl"
          style={{ width:  `${IMG_WIDTH  * scale}px`,
                height: `${IMG_HEIGHT * scale}px`, }}
        >
          {/* Page image */}
          <img
            src={activePage === 1 ? '/FACED_FORM-1.png' : '/FACED_FORM-2.png'}
            alt={`FACED Form Page ${activePage}`}
            className="block w-full"
            draggable={false}
            style={{ width: '100%', height: '100%' }}
          />

          {/* Draggable markers */}
          {visibleFields.map(([name, coords]) => (
            <DraggableMarker
              key={name}
              fieldName={name}
              coords={coords}
              onUpdate={updateField}
              scale={scale}
            />
          ))}
        </div>

        {/* Legend */}
        <div className="mt-4 flex gap-4 flex-wrap">
          {Object.entries(FIELD_COLORS).map(([group, color]) => (
            <div key={group} className="flex items-center gap-2 text-xs text-gray-400">
              <div className={`w-3 h-3 rounded-full ${color}`} />
              {group}
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}