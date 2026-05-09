'use client'
import { useState, useEffect } from 'react'

// Start with current values from route.ts
const DEFAULT_COORDS = {
  serial_number:       { x: 415, y: 54.6 },
  region:              { x: 155, y: 82.0 },
  district:            { x: 370, y: 82.0 },
  province:            { x: 155, y: 91.9 },
  barangay:            { x: 370, y: 91.9 },
  city_municipality:   { x: 155, y: 101.8 },
  evacuation_center:   { x: 370, y: 101.8 },
  last_name:           { x: 113.2, y: 127.7 },
  first_name:          { x: 113.2, y: 137.5 },
  middle_name:         { x: 113.2, y: 147.5 },
  name_extension:      { x: 113.2, y: 161.1 },
  birthdate:           { x: 113.2, y: 178.4 },
  age:                 { x: 113.2, y: 191.9 },
  birthplace:          { x: 113.2, y: 201.8 },
  civil_status:        { x: 353.8, y: 127.7 },
  mothers_maiden_name: { x: 353.8, y: 137.2 },
  religion:            { x: 353.8, y: 147.1 },
  occupation:          { x: 353.8, y: 157.0 },
  monthly_income:      { x: 353.8, y: 174.3 },
  id_card_presented:   { x: 353.8, y: 191.6 },
  id_card_number:      { x: 353.8, y: 201.4 },
  contact_primary:     { x: 310,   y: 215.9 },
  contact_alternate:   { x: 400,   y: 215.9 },
  permanent_address:   { x: 112.8, y: 239.9 },
  ip_ethnicity:        { x: 282,   y: 270.5 },
  bank_ewallet:        { x: 126.4, y: 436.5 },
  account_type:        { x: 329.7, y: 436.5 },
  account_name:        { x: 126.4, y: 446.5 },
  account_number:      { x: 329.7, y: 446.5 },
  date_registered:     { x: 150,   y: 523.9 },
}

type CoordKey = keyof typeof DEFAULT_COORDS

export default function DevCoordsPage() {
  const [coords, setCoords] = useState(DEFAULT_COORDS)
  const [selected, setSelected] = useState<CoordKey>('region')
  const [cardId, setCardId] = useState('FC-00001')
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const current = coords[selected]

  const update = (axis: 'x' | 'y', value: number) => {
    setCoords(prev => ({
      ...prev,
      [selected]: { ...prev[selected], [axis]: value }
    }))
  }

  const generatePreview = async () => {
    setLoading(true)
    const res = await fetch('/api/generate-pdf/' + cardId + '?' + new URLSearchParams({
      coords: JSON.stringify(coords)
    }))
    const blob = await res.blob()
    setPdfUrl(URL.createObjectURL(blob))
    setLoading(false)
  }

  const copyCoords = () => {
    const output = Object.entries(coords)
      .map(([key, val]) => `  ${key}: { x: ${val.x}, y: toY(${val.y}), size: 7 },`)
      .join('\n')
    navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex h-screen gap-0">
      {/* Left — controls */}
      <div className="w-80 bg-gray-50 border-r flex flex-col overflow-hidden">
        <div className="p-4 border-b">
          <p className="text-sm font-semibold mb-2">Card ID</p>
          <input
            className="input input-sm input-bordered w-full mb-3"
            value={cardId}
            onChange={e => setCardId(e.target.value)}
            placeholder="FC-00001"
          />
          <button
            className="btn btn-primary btn-sm w-full"
            onClick={generatePreview}
            disabled={loading}
          >
            {loading ? <span className="loading loading-spinner loading-xs" /> : '🔄 Regenerate PDF'}
          </button>
        </div>

        {/* Field selector */}
        <div className="p-4 border-b">
          <p className="text-sm font-semibold mb-2">Field</p>
          <select
            className="select select-sm select-bordered w-full"
            value={selected}
            onChange={e => setSelected(e.target.value as CoordKey)}
          >
            {Object.keys(coords).map(key => (
              <option key={key} value={key}>{key}</option>
            ))}
          </select>
        </div>

        {/* X/Y sliders */}
        <div className="p-4 border-b">
          <p className="text-sm font-semibold mb-3">
            {selected} — x: <strong>{current.x}</strong>, y: <strong>{current.y}</strong>
          </p>

          <label className="text-xs text-gray-500 mb-1 block">X position (0–480)</label>
          <input
            type="range" min={0} max={480} step={0.5}
            value={current.x}
            onChange={e => update('x', parseFloat(e.target.value))}
            className="range range-xs range-primary w-full mb-1"
          />
          <input
            type="number" step={0.5}
            value={current.x}
            onChange={e => update('x', parseFloat(e.target.value))}
            className="input input-xs input-bordered w-full mb-4"
          />

          <label className="text-xs text-gray-500 mb-1 block">Y position (0–612, top=0)</label>
          <input
            type="range" min={0} max={612} step={0.5}
            value={current.y}
            onChange={e => update('y', parseFloat(e.target.value))}
            className="range range-xs range-primary w-full mb-1"
          />
          <input
            type="number" step={0.5}
            value={current.y}
            onChange={e => update('y', parseFloat(e.target.value))}
            className="input input-xs input-bordered w-full"
          />
        </div>

        {/* Copy output */}
        <div className="p-4">
          <button
            className={`btn btn-sm w-full ${copied ? 'btn-success' : 'btn-outline'}`}
            onClick={copyCoords}
          >
            {copied ? '✓ Copied!' : '📋 Copy all coords'}
          </button>
          <p className="text-xs text-gray-400 mt-2">
            Paste into FIELDS object in route.ts
          </p>
        </div>
      </div>

      {/* Right — PDF preview */}
      <div className="flex-1 bg-gray-200 flex flex-col">
        {pdfUrl ? (
          <iframe src={pdfUrl} className="w-full h-full border-0" />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400 text-sm">
            Enter a card ID and click Regenerate PDF
          </div>
        )}
      </div>
    </div>
  )
}