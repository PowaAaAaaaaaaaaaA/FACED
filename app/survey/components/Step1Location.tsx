'use client'

import { useCallback, useEffect, useReducer } from 'react'
import type { AnyFieldApi } from '@tanstack/react-form'
import { FormField, firstError } from './FormField'
import {
  getRegions,
  getProvinces,
  getMunicipalities,
  getBarangays,
  type PsgcOption,
} from '../../../lib/psgc'
import type { FormValues, LocationCodes } from '../types'


// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AppForm = any

// ─── Local state via reducer (avoids setState-in-effect lint warning) ─────────

type PsgcState = {
  regions:        PsgcOption[]
  provinces:      PsgcOption[]
  municipalities: PsgcOption[]
  barangays:      PsgcOption[]
  loadingProvinces:      boolean
  loadingMunicipalities: boolean
  loadingBarangays:      boolean
  selectedRegionCode:       string
  selectedProvinceCode:     string
  selectedMunicipalityCode: string
}

type PsgcAction =
  | { type: 'SET_REGIONS';        payload: PsgcOption[] }
  | { type: 'SET_PROVINCES';      payload: PsgcOption[] }
  | { type: 'SET_MUNICIPALITIES'; payload: PsgcOption[] }
  | { type: 'SET_BARANGAYS';      payload: PsgcOption[] }
  | { type: 'LOADING_PROVINCES';      payload: boolean }
  | { type: 'LOADING_MUNICIPALITIES'; payload: boolean }
  | { type: 'LOADING_BARANGAYS';      payload: boolean }
  | { type: 'SELECT_REGION';       payload: string }
  | { type: 'SELECT_PROVINCE';     payload: string }
  | { type: 'SELECT_MUNICIPALITY'; payload: string }
  | { type: 'RESET_FROM_REGION' }
  | { type: 'RESET_FROM_PROVINCE' }
  | { type: 'RESET_FROM_MUNICIPALITY' }

const initialState: PsgcState = {
  regions: [], provinces: [], municipalities: [], barangays: [],
  loadingProvinces: false, loadingMunicipalities: false, loadingBarangays: false,
  selectedRegionCode: '', selectedProvinceCode: '', selectedMunicipalityCode: '',
}

function psgcReducer(state: PsgcState, action: PsgcAction): PsgcState {
  switch (action.type) {
    case 'SET_REGIONS':        return { ...state, regions: action.payload }
    case 'SET_PROVINCES':      return { ...state, provinces: action.payload }
    case 'SET_MUNICIPALITIES': return { ...state, municipalities: action.payload }
    case 'SET_BARANGAYS':      return { ...state, barangays: action.payload }
    case 'LOADING_PROVINCES':      return { ...state, loadingProvinces: action.payload }
    case 'LOADING_MUNICIPALITIES': return { ...state, loadingMunicipalities: action.payload }
    case 'LOADING_BARANGAYS':      return { ...state, loadingBarangays: action.payload }
    case 'SELECT_REGION':       return { ...state, selectedRegionCode: action.payload }
    case 'SELECT_PROVINCE':     return { ...state, selectedProvinceCode: action.payload }
    case 'SELECT_MUNICIPALITY': return { ...state, selectedMunicipalityCode: action.payload }
    case 'RESET_FROM_REGION':
      return {
        ...state,
        provinces: [], municipalities: [], barangays: [],
        selectedProvinceCode: '', selectedMunicipalityCode: '',
      }
    case 'RESET_FROM_PROVINCE':
      return { ...state, municipalities: [], barangays: [], selectedMunicipalityCode: '' }
    case 'RESET_FROM_MUNICIPALITY':
      return { ...state, barangays: [] }
    default: return state
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

export function Step1Location({
  form,
  onLocationCodesChange,
}: {
  form: AppForm
  onLocationCodesChange: (codes: LocationCodes) => void
}) {
  const [state, dispatch] = useReducer(psgcReducer, initialState)

  // Load regions once on mount
  useEffect(() => {
    getRegions()
      .then((data) => dispatch({ type: 'SET_REGIONS', payload: data }))
      .catch(console.error)
  }, [])

  // Fetch provinces when region changes
  useEffect(() => {
    if (!state.selectedRegionCode) return
    let cancelled = false
    dispatch({ type: 'LOADING_PROVINCES', payload: true })
    getProvinces(state.selectedRegionCode)
      .then((data) => { if (!cancelled) dispatch({ type: 'SET_PROVINCES', payload: data }) })
      .catch(console.error)
      .finally(() => { if (!cancelled) dispatch({ type: 'LOADING_PROVINCES', payload: false }) })
    return () => { cancelled = true }
  }, [state.selectedRegionCode])

  // Fetch municipalities when province changes
  useEffect(() => {
    if (!state.selectedProvinceCode) return
    let cancelled = false
    dispatch({ type: 'LOADING_MUNICIPALITIES', payload: true })
    getMunicipalities(state.selectedProvinceCode)
      .then((data) => { if (!cancelled) dispatch({ type: 'SET_MUNICIPALITIES', payload: data }) })
      .catch(console.error)
      .finally(() => { if (!cancelled) dispatch({ type: 'LOADING_MUNICIPALITIES', payload: false }) })
    return () => { cancelled = true }
  }, [state.selectedProvinceCode])

  // Fetch barangays when municipality changes
  useEffect(() => {
    if (!state.selectedMunicipalityCode) return
    let cancelled = false
    dispatch({ type: 'LOADING_BARANGAYS', payload: true })
    getBarangays(state.selectedMunicipalityCode)
      .then((data) => { if (!cancelled) dispatch({ type: 'SET_BARANGAYS', payload: data }) })
      .catch(console.error)
      .finally(() => { if (!cancelled) dispatch({ type: 'LOADING_BARANGAYS', payload: false }) })
    return () => { cancelled = true }
  }, [state.selectedMunicipalityCode])

  const handleRegionChange = useCallback((name: string, field: AnyFieldApi) => {
    const selected = state.regions.find(r => r.name === name)
    field.handleChange(name)
    dispatch({ type: 'SELECT_REGION', payload: selected?.code ?? '' })
    dispatch({ type: 'RESET_FROM_REGION' })
    form.setFieldValue('province', '')
    form.setFieldValue('cityMunicipality', '')
    form.setFieldValue('barangay', '')
    onLocationCodesChange({ regionCode: selected?.code ?? '', provinceCode: '', municipalityCode: '', barangayCode: '' })
  }, [state.regions, form, onLocationCodesChange])

  const handleProvinceChange = useCallback((name: string, field: AnyFieldApi) => {
    const selected = state.provinces.find(p => p.name === name)
    field.handleChange(name)
    dispatch({ type: 'SELECT_PROVINCE', payload: selected?.code ?? '' })
    dispatch({ type: 'RESET_FROM_PROVINCE' })
    form.setFieldValue('cityMunicipality', '')
    form.setFieldValue('barangay', '')
    onLocationCodesChange({
      regionCode: state.selectedRegionCode,
      provinceCode: selected?.code ?? '',
      municipalityCode: '',
      barangayCode: '',
    })
  }, [state.provinces, state.selectedRegionCode, form, onLocationCodesChange])

  const handleMunicipalityChange = useCallback((name: string, field: AnyFieldApi) => {
    const selected = state.municipalities.find(m => m.name === name)
    field.handleChange(name)
    dispatch({ type: 'SELECT_MUNICIPALITY', payload: selected?.code ?? '' })
    dispatch({ type: 'RESET_FROM_MUNICIPALITY' })
    form.setFieldValue('barangay', '')
    onLocationCodesChange({
      regionCode: state.selectedRegionCode,
      provinceCode: state.selectedProvinceCode,
      municipalityCode: selected?.code ?? '',
      barangayCode: '',
    })
  }, [state.municipalities, state.selectedRegionCode, state.selectedProvinceCode, form, onLocationCodesChange])

  const handleBarangayChange = useCallback((name: string, field: AnyFieldApi) => {
    const selected = state.barangays.find(b => b.name === name)
    field.handleChange(name)
    onLocationCodesChange({
      regionCode: state.selectedRegionCode,
      provinceCode: state.selectedProvinceCode,
      municipalityCode: state.selectedMunicipalityCode,
      barangayCode: selected?.code ?? '',
    })
  }, [state.barangays, state.selectedRegionCode, state.selectedProvinceCode, state.selectedMunicipalityCode, onLocationCodesChange])

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* 1. Region */}
        <form.Field name="region">
          {(field: AnyFieldApi) => (
            <FormField label="1. Region" required error={firstError(field)}>
              <select
                className="select select-bordered w-full"
                value={field.state.value}
                onChange={(e) => handleRegionChange(e.target.value, field)}
                onBlur={field.handleBlur}
              >
                <option value="">Select region</option>
                {state.regions.map((r) => (
                  <option key={r.code} value={r.name}>{r.name}</option>
                ))}
              </select>
            </FormField>
          )}
        </form.Field>

        {/* 2. Province */}
        <form.Field name="province">
          {(field: AnyFieldApi) => (
            <FormField label="2. Province" required error={firstError(field)}>
              <select
                className="select select-bordered w-full"
                value={field.state.value}
                disabled={!state.selectedRegionCode || state.loadingProvinces}
                onChange={(e) => handleProvinceChange(e.target.value, field)}
                onBlur={field.handleBlur}
              >
                <option value="">{state.loadingProvinces ? 'Loading...' : 'Select province'}</option>
                {state.provinces.map((p) => (
                  <option key={p.code} value={p.name}>{p.name}</option>
                ))}
              </select>
            </FormField>
          )}
        </form.Field>

        {/* 3. City/Municipality */}
        <form.Field name="cityMunicipality">
          {(field: AnyFieldApi) => (
            <FormField label="3. City / Municipality" required error={firstError(field)}>
              <select
                className="select select-bordered w-full"
                value={field.state.value}
                disabled={!state.selectedProvinceCode || state.loadingMunicipalities}
                onChange={(e) => handleMunicipalityChange(e.target.value, field)}
                onBlur={field.handleBlur}
              >
                <option value="">{state.loadingMunicipalities ? 'Loading...' : 'Select city/municipality'}</option>
                {state.municipalities.map((m) => (
                  <option key={m.code} value={m.name}>{m.name}</option>
                ))}
              </select>
            </FormField>
          )}
        </form.Field>

        {/* 4. District — free text, no PSGC table */}
        <form.Field name="district">
          {(field: AnyFieldApi) => (
            <FormField label="4. District">
              <input
                className="input input-bordered w-full"
                placeholder="Enter district"
                value={field.state.value ?? ''}
                onChange={(e) => field.handleChange(e.target.value)}
              />
            </FormField>
          )}
        </form.Field>

        {/* 5. Barangay */}
        <form.Field name="barangay">
          {(field: AnyFieldApi) => (
            <FormField label="5. Barangay" required error={firstError(field)}>
              <select
                className="select select-bordered w-full"
                value={field.state.value}
                disabled={!state.selectedMunicipalityCode || state.loadingBarangays}
                onChange={(e) => handleBarangayChange(e.target.value, field)}
                onBlur={field.handleBlur}
              >
                <option value="">{state.loadingBarangays ? 'Loading...' : 'Select barangay'}</option>
                {state.barangays.map((b) => (
                  <option key={b.code} value={b.name}>{b.name}</option>
                ))}
              </select>
            </FormField>
          )}
        </form.Field>

        {/* 6. Evacuation Center */}
        <form.Field name="evacuationCenter">
          {(field: AnyFieldApi) => (
            <FormField label="6. Evacuation Center / Site">
              <input
                className="input input-bordered w-full"
                placeholder="Enter evacuation center or site"
                value={field.state.value ?? ''}
                onChange={(e) => field.handleChange(e.target.value)}
              />
            </FormField>
          )}
        </form.Field>

      </div>
    </div>
  )
}