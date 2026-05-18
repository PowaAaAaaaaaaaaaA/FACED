'use client'
import { Info } from 'lucide-react'

type Props = {
  selectedRegion: string
  selectedProvince: string
  selectedMunicipality: string
  selectedBarangay: string
  selectedDistrict: string
  availableDistricts: string[]
  regions: { code: string; name: string }[]
  provinces: { code: string; name: string }[]
  municipalities: { code: string; name: string; district: string | null }[]
  barangays: { code: string; name: string }[]
  evacuationCenter: string
  errors: Record<string, string>
  onRegionChange: (val: string) => void
  onProvinceChange: (val: string) => void
  onMunicipalityChange: (val: string) => void
  onBarangayChange: (val: string) => void
  onEvacuationCenterChange: (val: string) => void
}

export function Step1Location({
  selectedRegion, selectedProvince, selectedMunicipality, selectedBarangay,
  selectedDistrict, availableDistricts,
  regions, provinces, municipalities, barangays,
  evacuationCenter, errors,
  onRegionChange, onProvinceChange, onMunicipalityChange, onBarangayChange,
  onEvacuationCenterChange,
}: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 mt-4">

      {/* Region */}
      <div className="flex flex-col gap-1">
        <label className="fieldset-legend">Region</label>
        <select
          className={`select select-primary w-full ${errors.region ? 'select-error' : ''}`}
          value={selectedRegion}
          onChange={(e) => onRegionChange(e.target.value)}
        >
          <option disabled value="">Select Region</option>
          {regions.map((r) => (
            <option key={r.code} value={r.code}>{r.name}</option>
          ))}
        </select>
        {errors.region && <p className="text-xs text-red-500">{errors.region}</p>}
      </div>

      {/* Province */}
      <div className="flex flex-col gap-1">
        <label className="fieldset-legend">Province</label>
        <select
          className={`select select-primary w-full ${errors.province ? 'select-error' : ''}`}
          value={selectedProvince}
          onChange={(e) => onProvinceChange(e.target.value)}
          disabled={provinces.length === 0}
        >
          <option disabled value="">Select Province</option>
          {provinces.map((p) => (
            <option key={p.code} value={p.code}>{p.name}</option>
          ))}
        </select>
        {errors.province && <p className="text-xs text-red-500">{errors.province}</p>}
      </div>

      {/* City/Municipality */}
      <div className="flex flex-col gap-1">
        <label className="fieldset-legend">City / Municipality</label>
        <select
          className={`select select-primary w-full ${errors.municipality ? 'select-error' : ''}`}
          value={selectedMunicipality}
          onChange={(e) => onMunicipalityChange(e.target.value)}
          disabled={municipalities.length === 0}
        >
          <option disabled value="">Select City/Municipality</option>
          {municipalities.map((m) => (
            <option key={m.code} value={m.code}>{m.name}</option>
          ))}
        </select>
        {errors.municipality && <p className="text-xs text-red-500">{errors.municipality}</p>}
      </div>

      {/* District */}
      <div className="flex flex-col gap-1">
        <label className="fieldset-legend flex items-center gap-1">
          District
          <div className="tooltip tooltip-right" data-tip="Auto-filled based on your municipality">
            <Info size={14} className="text-blue-400 cursor-help" />
          </div>
        </label>
        <select
          className="select select-primary w-full bg-blue-50 text-blue-900 opacity-100 cursor-default"
          value={selectedDistrict}
          disabled
        >
          <option value="">— Select Municipality First —</option>
          {availableDistricts.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
        {selectedDistrict && (
          <p className="text-xs text-blue-400 flex items-center gap-1">
            <Info size={11} /> Auto-filled based on selected municipality
          </p>
        )}
      </div>

      {/* Barangay */}
      <div className="flex flex-col gap-1">
        <label className="fieldset-legend">Barangay</label>
        <select
          className={`select select-primary w-full ${errors.barangay ? 'select-error' : ''}`}
          value={selectedBarangay}
          onChange={(e) => onBarangayChange(e.target.value)}
          disabled={barangays.length === 0}
        >
          <option disabled value="">Select Barangay</option>
          {barangays.map((b) => (
            <option key={b.code} value={b.code}>{b.name}</option>
          ))}
        </select>
        {errors.barangay && <p className="text-xs text-red-500">{errors.barangay}</p>}
      </div>

      {/* Evacuation Center — full width */}
      <div className="flex flex-col gap-1 col-span-1 sm:col-span-2">
        <label className="fieldset-legend">Evacuation Center / Site</label>
        <input
          type="text"
          className={`input input-primary w-full ${errors.evacuationCenter ? 'input-error' : ''}`}
          placeholder="Enter evacuation center or site"
          value={evacuationCenter}
          onChange={(e) => onEvacuationCenterChange(e.target.value)}
        />
        {errors.evacuationCenter && (
          <p className="text-xs text-red-500">{errors.evacuationCenter}</p>
        )}
      </div>

    </div>
  )
}