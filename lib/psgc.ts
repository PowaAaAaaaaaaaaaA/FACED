import { supabase } from './supabase'

export interface PsgcOption {
  code: string
  name: string
}

export async function getRegions(): Promise<PsgcOption[]> {
  const { data, error } = await supabase
    .from('psgc_regions')
    .select('code, name')
    .order('name')
  if (error) throw error
  return data ?? []
}

export async function getProvinces(regionCode: string): Promise<PsgcOption[]> {
  const { data, error } = await supabase
    .from('psgc_provinces')
    .select('code, name')
    .eq('region_code', regionCode)
    .order('name')
  if (error) throw error
  return data ?? []
}

export async function getMunicipalities(provinceCode: string): Promise<PsgcOption[]> {
  const { data, error } = await supabase
    .from('psgc_municipalities')
    .select('code, name')
    .eq('province_code', provinceCode)
    .order('name')
  if (error) throw error
  return data ?? []
}

export async function getBarangays(municipalityCode: string): Promise<PsgcOption[]> {
  const { data, error } = await supabase
    .from('psgc_barangays')
    .select('code, name')
    .eq('municipality_code', municipalityCode)
    .order('name')
  if (error) throw error
  return data ?? []
}

// ── Serial number generator ───────────────────────────────────────────────────
// Format: {10-digit barangay PSGC code}-{5-digit sequence}
// Example: 0306910001-00001
export async function generateSerialNumber(barangayCode: string): Promise<string> {
  const { data, error } = await supabase
    .from('forms')
    .select('serialNum')
    .like('serialNum', `${barangayCode}-%`)
    .order('serialNum', { ascending: false })
    .limit(1)

  if (error) throw error

  const latest = data?.[0]?.serialNum
  const nextSequence = latest
    ? String(parseInt(latest.split('-')[1]) + 1).padStart(5, '0')
    : '00001'

  return `${barangayCode}-${nextSequence}`
}