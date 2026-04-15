"use client"

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useForm, type AnyFieldApi, type ReactFormApi } from '@tanstack/react-form'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import {
  getRegions,
  getProvinces,
  getMunicipalities,
  getBarangays,
  generateSerialNumber,
  type PsgcOption,
} from '../../lib/psgc'

// ─── Types ────────────────────────────────────────────────────────────────────

type FamilyMember = {
  name: string
  relationToHead: string
  birthdate: string
  age: string
  sex: string
  highestEducationalAttainment: string
  occupation: string
  typeOfVulnerability: string
}

type FormValues = {
  region: string
  province: string
  cityMunicipality: string
  district: string
  barangay: string
  evacuationCenter: string
  lastName: string
  firstName: string
  middleName: string
  nameExt: string
  birthdate: string
  birthplace: string
  sex: string
  civilStatus: string
  motherMaidenName: string
  religion: string
  occupation: string
  monthlyFamilyNetIncome: string
  idCardPresented: string
  idCardNumber: string
  primaryContactNumber: string
  altContactNumber: string
  houseBlockLotNo: string
  street: string
  subdivisionVillage: string
  addressBarangay: string
  addressCityMunicipality: string
  addressProvince: string
  zipCode: string
  fourPsBeneficiary: boolean
  isIP: boolean
  ipEthnicity: string
  familyMembers: FamilyMember[]
  bankEwallet: string
  accountName: string
  accountType: string
  accountNumber: string
  houseOwnership: string
  shelterDamage: string
  dataPrivacyConsent: boolean
}

type AppForm = ReactFormApi<FormValues>

// ─── Constants ────────────────────────────────────────────────────────────────

const STEPS = [
  { id: 1, title: 'Location of the Affected Family' },
  { id: 2, title: 'Head of the Family' },
  { id: 3, title: 'Family Information' },
  { id: 4, title: 'Account Information' },
]

const CIVIL_STATUS_OPTIONS = ['Single', 'Married', 'Widowed', 'Separated', 'Annulled']
const SEX_OPTIONS           = ['Male', 'Female']
const EDUCATIONAL_ATTAINMENT = [
  'No Formal Education', 'Elementary Level', 'Elementary Graduate',
  'High School Level', 'High School Graduate', 'College Level',
  'College Graduate', 'Post Graduate', 'Vocational/Technical',
]
const VULNERABILITY_TYPES = [
  'Senior Citizen (60+)', 'Person with Disability (PWD)', 'Pregnant/Lactating',
  'Solo Parent', 'Indigenous People (IP)', 'Child (0-17)', 'None',
]
const INCOME_BRACKETS = [
  'Below ₱5,000', '₱5,000 – ₱9,999', '₱10,000 – ₱14,999',
  '₱15,000 – ₱19,999', '₱20,000 – ₱29,999', '₱30,000 and above',
]
const BANK_EWALLET_OPTIONS = [
  'GCash', 'Maya (PayMaya)', 'BDO', 'BPI', 'Metrobank',
  'UnionBank', 'Landbank', 'DBP', 'RCBC', 'PNB', 'SeaBank', 'ShopeePay', 'Others',
]

// ─── Shared field components ──────────────────────────────────────────────────

function FormField({
  label, required, children, error,
}: {
  label: string
  required?: boolean
  children: React.ReactNode
  error?: string
}) {
  return (
    <div className="form-control w-full">
      <label className="label pb-1">
        <span className="label-text font-medium text-base-content">
          {label}
          {required && <span className="text-error ml-1">*</span>}
        </span>
      </label>
      {children}
      {error && (
        <label className="label pt-1">
          <span className="label-text-alt text-error mt-1">{error}</span>
        </label>
      )}
    </div>
  )
}

// Helper to safely get first error string from TanStack Form
function firstError(field: AnyFieldApi): string | undefined {
  const e = field.state.meta.errors[0]
  return typeof e === 'string' ? e : e?.message
}

// ─── Step Indicator ───────────────────────────────────────────────────────────

function StepIndicator({ currentStep }: { currentStep: number }) {
  return (
    <div className="w-full mb-8">
      <ul className="steps steps-horizontal w-full">
        {STEPS.map((s) => (
          <li
            key={s.id}
            className={`step text-xs ${currentStep >= s.id ? 'step-primary' : ''}`}
            data-content={currentStep > s.id ? '✓' : String(s.id)}
          >
            <span className="hidden sm:inline">{s.title}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

// ─── Step 1: Location ─────────────────────────────────────────────────────────

function Step1({
  form,
  onBarangayCodeChange,
}: {
  form: AppForm
  onBarangayCodeChange: (code: string) => void
}) {
  const [regions,       setRegions]       = useState<PsgcOption[]>([])
  const [provinces,     setProvinces]     = useState<PsgcOption[]>([])
  const [municipalities, setMunicipalities] = useState<PsgcOption[]>([])
  const [barangays,     setBarangays]     = useState<PsgcOption[]>([])

  const [selectedRegion,       setSelectedRegion]       = useState('')
  const [selectedProvince,     setSelectedProvince]     = useState('')
  const [selectedMunicipality, setSelectedMunicipality] = useState('')

  const [loadingProvinces,     setLoadingProvinces]     = useState(false)
  const [loadingMunicipalities, setLoadingMunicipalities] = useState(false)
  const [loadingBarangays,     setLoadingBarangays]     = useState(false)

  useEffect(() => {
    getRegions().then(setRegions).catch(console.error)
  }, [])

  useEffect(() => {
    if (!selectedRegion) { setProvinces([]); setMunicipalities([]); setBarangays([]); return }
    setLoadingProvinces(true)
    setProvinces([]); setMunicipalities([]); setBarangays([])
    setSelectedProvince(''); setSelectedMunicipality('')
    getProvinces(selectedRegion)
      .then(setProvinces).catch(console.error)
      .finally(() => setLoadingProvinces(false))
  }, [selectedRegion])

  useEffect(() => {
    if (!selectedProvince) { setMunicipalities([]); setBarangays([]); return }
    setLoadingMunicipalities(true)
    setMunicipalities([]); setBarangays([])
    setSelectedMunicipality('')
    getMunicipalities(selectedProvince)
      .then(setMunicipalities).catch(console.error)
      .finally(() => setLoadingMunicipalities(false))
  }, [selectedProvince])

  useEffect(() => {
    if (!selectedMunicipality) { setBarangays([]); return }
    setLoadingBarangays(true)
    setBarangays([])
    getBarangays(selectedMunicipality)
      .then(setBarangays).catch(console.error)
      .finally(() => setLoadingBarangays(false))
  }, [selectedMunicipality])

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        <form.Field
          name="region"
          validators={{ onChange: ({ value }) => !value ? 'Region is required' : undefined }}
        >
          {(field: AnyFieldApi) => (
            <FormField label="1. Region" required error={firstError(field)}>
              <select
                className="select select-bordered w-full"
                value={field.state.value}
                onChange={(e) => {
                  const selected = regions.find(r => r.name === e.target.value)
                  field.handleChange(e.target.value)
                  setSelectedRegion(selected?.code ?? '')
                  form.setFieldValue('province', '')
                  form.setFieldValue('cityMunicipality', '')
                  form.setFieldValue('barangay', '')
                }}
                onBlur={field.handleBlur}
              >
                <option value="">Select region</option>
                {regions.map((r) => <option key={r.code} value={r.name}>{r.name}</option>)}
              </select>
            </FormField>
          )}
        </form.Field>

        <form.Field
          name="province"
          validators={{ onChange: ({ value }) => !value ? 'Province is required' : undefined }}
        >
          {(field: AnyFieldApi) => (
            <FormField label="2. Province" required error={firstError(field)}>
              <select
                className="select select-bordered w-full"
                value={field.state.value}
                disabled={!selectedRegion || loadingProvinces}
                onChange={(e) => {
                  const selected = provinces.find(p => p.name === e.target.value)
                  field.handleChange(e.target.value)
                  setSelectedProvince(selected?.code ?? '')
                  form.setFieldValue('cityMunicipality', '')
                  form.setFieldValue('barangay', '')
                }}
                onBlur={field.handleBlur}
              >
                <option value="">{loadingProvinces ? 'Loading...' : 'Select province'}</option>
                {provinces.map((p) => <option key={p.code} value={p.name}>{p.name}</option>)}
              </select>
            </FormField>
          )}
        </form.Field>

        <form.Field
          name="cityMunicipality"
          validators={{ onChange: ({ value }) => !value ? 'City/Municipality is required' : undefined }}
        >
          {(field: AnyFieldApi) => (
            <FormField label="3. City / Municipality" required error={firstError(field)}>
              <select
                className="select select-bordered w-full"
                value={field.state.value}
                disabled={!selectedProvince || loadingMunicipalities}
                onChange={(e) => {
                  const selected = municipalities.find(m => m.name === e.target.value)
                  field.handleChange(e.target.value)
                  setSelectedMunicipality(selected?.code ?? '')
                  form.setFieldValue('barangay', '')
                }}
                onBlur={field.handleBlur}
              >
                <option value="">{loadingMunicipalities ? 'Loading...' : 'Select city/municipality'}</option>
                {municipalities.map((m) => <option key={m.code} value={m.name}>{m.name}</option>)}
              </select>
            </FormField>
          )}
        </form.Field>

        <form.Field name="district">
          {(field: AnyFieldApi) => (
            <FormField label="4. District">
              <input
                className="input input-bordered w-full"
                placeholder="Enter district"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
              />
            </FormField>
          )}
        </form.Field>

        <form.Field
          name="barangay"
          validators={{ onChange: ({ value }) => !value ? 'Barangay is required' : undefined }}
        >
          {(field: AnyFieldApi) => (
            <FormField label="5. Barangay" required error={firstError(field)}>
              <select
                className="select select-bordered w-full"
                value={field.state.value}
                disabled={!selectedMunicipality || loadingBarangays}
                onChange={(e) => {
                  const selected = barangays.find(b => b.name === e.target.value)
                  field.handleChange(e.target.value)
                  onBarangayCodeChange(selected?.code ?? '')
                }}
                onBlur={field.handleBlur}
              >
                <option value="">{loadingBarangays ? 'Loading...' : 'Select barangay'}</option>
                {barangays.map((b) => <option key={b.code} value={b.name}>{b.name}</option>)}
              </select>
            </FormField>
          )}
        </form.Field>

        <form.Field name="evacuationCenter">
          {(field: AnyFieldApi) => (
            <FormField label="6. Evacuation Center / Site">
              <input
                className="input input-bordered w-full"
                placeholder="Enter evacuation center or site"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
              />
            </FormField>
          )}
        </form.Field>

      </div>
    </div>
  )
}

// ─── Step 2: Head of Family ───────────────────────────────────────────────────

function Step2({ form }: { form: AppForm }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        <form.Field name="lastName" validators={{ onChange: ({ value }) => !value ? 'Last name is required' : undefined }}>
          {(field: AnyFieldApi) => (
            <FormField label="7. Last Name" required error={firstError(field)}>
              <input className="input input-bordered w-full" placeholder="Last name" value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} onBlur={field.handleBlur} />
            </FormField>
          )}
        </form.Field>

        <form.Field name="firstName" validators={{ onChange: ({ value }) => !value ? 'First name is required' : undefined }}>
          {(field: AnyFieldApi) => (
            <FormField label="8. First Name" required error={firstError(field)}>
              <input className="input input-bordered w-full" placeholder="First name" value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} onBlur={field.handleBlur} />
            </FormField>
          )}
        </form.Field>

        <form.Field name="middleName">
          {(field: AnyFieldApi) => (
            <FormField label="9. Middle Name">
              <input className="input input-bordered w-full" placeholder="Middle name" value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />
            </FormField>
          )}
        </form.Field>

        <form.Field name="nameExt">
          {(field: AnyFieldApi) => (
            <FormField label="10. Name Extension (Jr., Sr., I, II)">
              <input className="input input-bordered w-full" placeholder="e.g. Jr., Sr., II" value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />
            </FormField>
          )}
        </form.Field>
      </div>

      <div className="divider text-xs text-base-content/50">Personal Details</div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        <form.Field name="birthdate" validators={{ onChange: ({ value }) => !value ? 'Birthdate is required' : undefined }}>
          {(field: AnyFieldApi) => (
            <FormField label="11. Birthdate" required error={firstError(field)}>
              <input type="date" className="input input-bordered w-full" value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} onBlur={field.handleBlur} />
            </FormField>
          )}
        </form.Field>

        <form.Field name="birthplace">
          {(field: AnyFieldApi) => (
            <FormField label="13. Birthplace">
              <input className="input input-bordered w-full" placeholder="Place of birth" value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />
            </FormField>
          )}
        </form.Field>

        <form.Field name="sex" validators={{ onChange: ({ value }) => !value ? 'Sex is required' : undefined }}>
          {(field: AnyFieldApi) => (
            <FormField label="14. Sex" required error={firstError(field)}>
              <select className="select select-bordered w-full" value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} onBlur={field.handleBlur}>
                <option value="">Select</option>
                {SEX_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </FormField>
          )}
        </form.Field>

        <form.Field name="civilStatus">
          {(field: AnyFieldApi) => (
            <FormField label="15. Civil Status">
              <select className="select select-bordered w-full" value={field.state.value} onChange={(e) => field.handleChange(e.target.value)}>
                <option value="">Select</option>
                {CIVIL_STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </FormField>
          )}
        </form.Field>

        <form.Field name="motherMaidenName">
          {(field: AnyFieldApi) => (
            <FormField label="16. Mother's Maiden Name">
              <input className="input input-bordered w-full" placeholder="Mother's maiden name" value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />
            </FormField>
          )}
        </form.Field>

        <form.Field name="religion">
          {(field: AnyFieldApi) => (
            <FormField label="17. Religion">
              <input className="input input-bordered w-full" placeholder="Religion" value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />
            </FormField>
          )}
        </form.Field>

        <form.Field name="occupation">
          {(field: AnyFieldApi) => (
            <FormField label="18. Occupation">
              <input className="input input-bordered w-full" placeholder="Occupation" value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />
            </FormField>
          )}
        </form.Field>

        <form.Field name="monthlyFamilyNetIncome">
          {(field: AnyFieldApi) => (
            <FormField label="19. Monthly Family Net Income">
              <select className="select select-bordered w-full" value={field.state.value} onChange={(e) => field.handleChange(e.target.value)}>
                <option value="">Select bracket</option>
                {INCOME_BRACKETS.map((b) => <option key={b} value={b}>{b}</option>)}
              </select>
            </FormField>
          )}
        </form.Field>

      </div>

      <div className="divider text-xs text-base-content/50">ID & Contact</div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        <form.Field name="idCardPresented">
          {(field: AnyFieldApi) => (
            <FormField label="20. ID Card Presented">
              <input className="input input-bordered w-full" placeholder="e.g. PhilSys, Driver's License" value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />
            </FormField>
          )}
        </form.Field>

        <form.Field name="idCardNumber">
          {(field: AnyFieldApi) => (
            <FormField label="21. ID Card Number">
              <input className="input input-bordered w-full" placeholder="ID number" value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />
            </FormField>
          )}
        </form.Field>

        <form.Field name="primaryContactNumber" validators={{ onChange: ({ value }) => !value ? 'Primary contact is required' : undefined }}>
          {(field: AnyFieldApi) => (
            <FormField label="22. Contact Number – Primary" required error={firstError(field)}>
              <input className="input input-bordered w-full" placeholder="09XXXXXXXXX" value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} onBlur={field.handleBlur} />
            </FormField>
          )}
        </form.Field>

        <form.Field name="altContactNumber">
          {(field: AnyFieldApi) => (
            <FormField label="22. Contact Number – Alternate">
              <input className="input input-bordered w-full" placeholder="Alternate number" value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />
            </FormField>
          )}
        </form.Field>

      </div>

      <div className="divider text-xs text-base-content/50">23. Permanent Address</div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {(
          [
            ['houseBlockLotNo',        'House / Block / Lot No.',  'House/Block/Lot No.'],
            ['street',                 'Street',                   'Street'],
            ['subdivisionVillage',     'Subd. / Village',          'Subdivision or village'],
            ['addressBarangay',        'Barangay',                 'Barangay'],
            ['addressCityMunicipality','City / Municipality',      'City or Municipality'],
            ['addressProvince',        'Province',                 'Province'],
            ['zipCode',                'Zip Code',                 'Zip code'],
          ] as [keyof FormValues, string, string][]
        ).map(([name, label, placeholder]) => (
          <form.Field key={name} name={name}>
            {(field: AnyFieldApi) => (
              <FormField label={label}>
                <input
                  className="input input-bordered w-full"
                  placeholder={placeholder}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
              </FormField>
            )}
          </form.Field>
        ))}
      </div>

      <div className="divider text-xs text-base-content/50">24. Others</div>

      <div className="flex flex-wrap gap-6">
        <form.Field name="fourPsBeneficiary">
          {(field: AnyFieldApi) => (
            <label className="label cursor-pointer gap-3">
              <input type="checkbox" className="checkbox checkbox-primary" checked={field.state.value} onChange={(e) => field.handleChange(e.target.checked)} />
              <span className="label-text font-medium">4Ps Beneficiary</span>
            </label>
          )}
        </form.Field>

        <form.Field name="isIP">
          {(field: AnyFieldApi) => (
            <label className="label cursor-pointer gap-3">
              <input type="checkbox" className="checkbox checkbox-primary" checked={field.state.value} onChange={(e) => field.handleChange(e.target.checked)} />
              <span className="label-text font-medium">IP (Indigenous People)</span>
            </label>
          )}
        </form.Field>
      </div>

      <form.Field name="ipEthnicity">
        {(field: AnyFieldApi) => (
          <FormField label="Type of Ethnicity (if IP)">
            <input className="input input-bordered w-full" placeholder="Specify ethnicity" value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />
          </FormField>
        )}
      </form.Field>
    </div>
  )
}

// ─── Step 3: Family Members ───────────────────────────────────────────────────

const EMPTY_MEMBER: FamilyMember = {
  name: '', relationToHead: '', birthdate: '', age: '',
  sex: '', highestEducationalAttainment: '', occupation: '', typeOfVulnerability: '',
}

function Step3({ form }: { form: AppForm }) {
  const [members, setMembers] = useState<FamilyMember[]>([{ ...EMPTY_MEMBER }])

  const addMember    = () => setMembers((prev) => [...prev, { ...EMPTY_MEMBER }])
  const removeMember = (idx: number) => setMembers((prev) => prev.filter((_, i) => i !== idx))

  const updateMember = (idx: number, key: keyof FamilyMember, value: string) => {
    setMembers((prev) => {
      const updated = [...prev]
      updated[idx]  = { ...updated[idx], [key]: value }
      if (key === 'birthdate' && value) {
        const age = new Date().getFullYear() - new Date(value).getFullYear()
        updated[idx].age = String(age)
      }
      form.setFieldValue('familyMembers', updated)
      return updated
    })
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-base-content/60">Section 25 — List all family members including the head of the family.</p>
      <div className="overflow-x-auto rounded-lg border border-base-300">
        <table className="table table-zebra table-sm w-full min-w-[900px]">
          <thead className="bg-blue-900 text-white">
            <tr>
              <th className="text-xs">Family Members</th>
              <th className="text-xs">Relation to Head</th>
              <th className="text-xs">Birthdate</th>
              <th className="text-xs">Age</th>
              <th className="text-xs">Sex</th>
              <th className="text-xs">Highest Educational Attainment</th>
              <th className="text-xs">Occupation</th>
              <th className="text-xs">Type of Vulnerability</th>
              <th className="text-xs"></th>
            </tr>
          </thead>
          <tbody>
            {members.map((member, idx) => (
              <tr key={idx}>
                <td><input className="input input-bordered input-xs w-32" placeholder="Full name" value={member.name} onChange={(e) => updateMember(idx, 'name', e.target.value)} /></td>
                <td><input className="input input-bordered input-xs w-28" placeholder="e.g. Spouse" value={member.relationToHead} onChange={(e) => updateMember(idx, 'relationToHead', e.target.value)} /></td>
                <td><input type="date" className="input input-bordered input-xs w-36" value={member.birthdate} onChange={(e) => updateMember(idx, 'birthdate', e.target.value)} /></td>
                <td><input className="input input-bordered input-xs w-14" placeholder="Age" value={member.age} onChange={(e) => updateMember(idx, 'age', e.target.value)} /></td>
                <td>
                  <select className="select select-bordered select-xs w-20" value={member.sex} onChange={(e) => updateMember(idx, 'sex', e.target.value)}>
                    <option value="">—</option>
                    <option>Male</option>
                    <option>Female</option>
                  </select>
                </td>
                <td>
                  <select className="select select-bordered select-xs w-36" value={member.highestEducationalAttainment} onChange={(e) => updateMember(idx, 'highestEducationalAttainment', e.target.value)}>
                    <option value="">Select</option>
                    {EDUCATIONAL_ATTAINMENT.map((e) => <option key={e}>{e}</option>)}
                  </select>
                </td>
                <td><input className="input input-bordered input-xs w-28" placeholder="Occupation" value={member.occupation} onChange={(e) => updateMember(idx, 'occupation', e.target.value)} /></td>
                <td>
                  <select className="select select-bordered select-xs w-36" value={member.typeOfVulnerability} onChange={(e) => updateMember(idx, 'typeOfVulnerability', e.target.value)}>
                    <option value="">Select</option>
                    {VULNERABILITY_TYPES.map((v) => <option key={v}>{v}</option>)}
                  </select>
                </td>
                <td>
                  {members.length > 1 && (
                    <button type="button" className="btn btn-ghost btn-xs text-error" onClick={() => removeMember(idx)}>✕</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button type="button" className="btn btn-outline btn-sm btn-primary" onClick={addMember}>+ Add Family Member</button>
    </div>
  )
}

// ─── Step 4: Account & Property Info ─────────────────────────────────────────

function Step4({ form }: { form: AppForm }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold text-base-content mb-1">Account Information</h3>
        <p className="text-xs text-base-content/60 mb-4">Note: In case the family head does not have a bank or an e-wallet account, any of the family members with a validated account can be indicated.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          <form.Field name="bankEwallet">
            {(field: AnyFieldApi) => (
              <FormField label="26. Bank / E-Wallet">
                <select className="select select-bordered w-full" value={field.state.value} onChange={(e) => field.handleChange(e.target.value)}>
                  <option value="">Select bank or e-wallet</option>
                  {BANK_EWALLET_OPTIONS.map((b) => <option key={b}>{b}</option>)}
                </select>
              </FormField>
            )}
          </form.Field>

          <form.Field name="accountName">
            {(field: AnyFieldApi) => (
              <FormField label="27. Account Name">
                <input className="input input-bordered w-full" placeholder="Account name" value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />
              </FormField>
            )}
          </form.Field>

          <form.Field name="accountType">
            {(field: AnyFieldApi) => (
              <FormField label="28. Account Type">
                <select className="select select-bordered w-full" value={field.state.value} onChange={(e) => field.handleChange(e.target.value)}>
                  <option value="">Select account type</option>
                  <option>Savings</option>
                  <option>Checking</option>
                  <option>E-Wallet</option>
                </select>
              </FormField>
            )}
          </form.Field>

          <form.Field name="accountNumber">
            {(field: AnyFieldApi) => (
              <FormField label="29. Account Number">
                <input className="input input-bordered w-full" placeholder="Account number" value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />
              </FormField>
            )}
          </form.Field>

        </div>
      </div>

      <div className="divider" />

      <div>
        <h3 className="font-semibold text-base-content mb-3">30. House Ownership</h3>
        <form.Field name="houseOwnership">
          {(field: AnyFieldApi) => (
            <div className="flex flex-wrap gap-4">
              {['Owner', 'Renter', 'Sharer'].map((opt) => (
                <label key={opt} className="label cursor-pointer gap-3">
                  <input type="radio" className="radio radio-primary" name="houseOwnership" value={opt} checked={field.state.value === opt} onChange={() => field.handleChange(opt)} />
                  <span className="label-text font-medium">{opt}</span>
                </label>
              ))}
            </div>
          )}
        </form.Field>
      </div>

      <div>
        <h3 className="font-semibold text-base-content mb-3">31. Shelter Damage Classification</h3>
        <form.Field name="shelterDamage">
          {(field: AnyFieldApi) => (
            <div className="flex flex-wrap gap-4">
              {['Partially Damaged', 'Totally Damaged'].map((opt) => (
                <label key={opt} className="label cursor-pointer gap-3">
                  <input type="radio" className="radio radio-warning" name="shelterDamage" value={opt} checked={field.state.value === opt} onChange={() => field.handleChange(opt)} />
                  <span className="label-text font-medium">{opt}</span>
                </label>
              ))}
            </div>
          )}
        </form.Field>
      </div>

      <div className="divider" />

      <div className="alert alert-info">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div>
          <h4 className="font-bold text-sm">32. Data Privacy Declaration</h4>
          <p className="text-xs">All data and information indicated herein shall be used for identification purposes for the implementation of disaster risk reduction and management (DRRM) programs, projects, and activities and its disclosure shall be in compliance to Republic Act 10173 (Data Privacy Act of 2012).</p>
        </div>
      </div>

      <form.Field
        name="dataPrivacyConsent"
        validators={{ onChange: ({ value }) => !value ? 'You must agree to the Data Privacy Declaration' : undefined }}
      >
        {(field: AnyFieldApi) => (
          <div>
            <label className="label cursor-pointer gap-3 justify-start">
              <input type="checkbox" className="checkbox checkbox-primary" checked={field.state.value} onChange={(e) => field.handleChange(e.target.checked)} />
              <span className="label-text">I have read and agree to the Data Privacy Declaration above.</span>
            </label>
            {firstError(field) && <p className="text-error text-xs mt-1">{firstError(field)}</p>}
          </div>
        )}
      </form.Field>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function SurveyPage() {
  const [step,          setStep]          = useState(1)
  const [submitted,     setSubmitted]     = useState(false)
  const [submitting,    setSubmitting]    = useState(false)
  const [submitError,   setSubmitError]   = useState('')
  const [serialNum,     setSerialNum]     = useState('')
  const [barangayCode,  setBarangayCode]  = useState('')

  const form = useForm<FormValues>({
    defaultValues: {
      region: '', province: '', cityMunicipality: '', district: '',
      barangay: '', evacuationCenter: '',
      lastName: '', firstName: '', middleName: '', nameExt: '',
      birthdate: '', birthplace: '', sex: '', civilStatus: '',
      motherMaidenName: '', religion: '', occupation: '',
      monthlyFamilyNetIncome: '', idCardPresented: '', idCardNumber: '',
      primaryContactNumber: '', altContactNumber: '',
      houseBlockLotNo: '', street: '', subdivisionVillage: '',
      addressBarangay: '', addressCityMunicipality: '', addressProvince: '', zipCode: '',
      fourPsBeneficiary: false, isIP: false, ipEthnicity: '',
      familyMembers: [],
      bankEwallet: '', accountName: '', accountType: '', accountNumber: '',
      houseOwnership: '', shelterDamage: '', dataPrivacyConsent: false,
    },
    onSubmit: async ({ value }) => {
      if (!barangayCode) {
        setSubmitError('Please select a barangay in Step 1 before submitting.')
        return
      }
      setSubmitting(true)
      setSubmitError('')
      try {
        const serial = await generateSerialNumber(barangayCode)

        const { error: formError } = await supabase.from('forms').insert({
          serialNum: serial,
          encodedBy: 1,
          status: 'submitted',
        })
        if (formError) throw formError

        const { data: headData, error: headError } = await supabase
          .from('users')
          .insert({
            serialNum:            serial,
            region:               value.region,
            province:             value.province,
            cityMunicipality:     value.cityMunicipality,
            district:             value.district,
            barangay:             value.barangay,
            evacuationCenter:     value.evacuationCenter || null,
            lastName:             value.lastName,
            firstName:            value.firstName,
            middleName:           value.middleName || null,
            nameExt:              value.nameExt || null,
            birthdate:            value.birthdate,
            age:                  value.birthdate ? new Date().getFullYear() - new Date(value.birthdate).getFullYear() : 0,
            birthplace:           value.birthplace || null,
            sex:                  value.sex,
            civilStatus:          value.civilStatus || null,
            motherMaidenName:     value.motherMaidenName || null,
            religion:             value.religion || null,
            occupation:           value.occupation || null,
            monthlyFamNetIncome:  null,
            idCardPresented:      value.idCardPresented || null,
            idCardNum:            value.idCardNumber || null,
            contactPNum:          value.primaryContactNumber || null,
            contactANum:          value.altContactNumber || null,
            houseBlockLot:        value.houseBlockLotNo || null,
            street:               value.street || null,
            subdVillage:          value.subdivisionVillage || null,
            barangayAdd:          value.addressBarangay || null,
            cityMunicipalityAdd:  value.addressCityMunicipality || null,
            provinceAdd:          value.addressProvince || null,
            zipCode:              value.zipCode || null,
            fourPsBeneficiary:    value.fourPsBeneficiary,
            isIP:                 value.isIP,
            ethnicityType:        value.ipEthnicity || null,
          })
          .select('headID')
          .single()
        if (headError) throw headError

        const headID = headData.headID

        if (value.familyMembers.length > 0) {
          const { error: membersError } = await supabase.from('family_information').insert(
            value.familyMembers.map((m) => ({
              serialNum:             serial,
              headID,
              relationToFamilyHead:  m.relationToHead,
              birthdate:             m.birthdate || null,
              age:                   m.age ? parseInt(m.age) : null,
              sex:                   m.sex || null,
              highestEducAttainment: m.highestEducationalAttainment || null,
              occupation:            m.occupation || null,
              vulnerabilityType:     m.typeOfVulnerability || null,
            }))
          )
          if (membersError) throw membersError
        }

        if (value.bankEwallet || value.accountNumber) {
          const { error: accError } = await supabase.from('account_info').insert({
            serialNum:          serial,
            headID,
            bankEWallet:        value.bankEwallet || null,
            accName:            value.accountName || null,
            accType:            value.accountType || null,
            accNum:             value.accountNumber || null,
            houseOwnership:     value.houseOwnership || null,
            shelterDamageClass: value.shelterDamage || null,
          })
          if (accError) throw accError
        }

        setSerialNum(serial)
        setSubmitted(true)
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Something went wrong. Please try again.'
        console.error('Submit error:', err)
        setSubmitError(message)
      } finally {
        setSubmitting(false)
      }
    },
  })

  const handleNext = () => setStep((prev) => Math.min(prev + 1, 4))
  const handleBack = () => setStep((prev) => Math.max(prev - 1, 1))

  if (submitted) {
    return (
      <div className="flex flex-col min-h-screen bg-[#F4F7FB] items-center justify-center gap-6">
        <div className="bg-white rounded-2xl shadow-lg border border-blue-100 p-12 text-center max-w-md">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-blue-900 mb-2">Form Submitted!</h2>
          <p className="text-base-content/70 mb-2">Your FACED form has been successfully submitted.</p>
          <div className="bg-blue-50 rounded-xl px-6 py-3 mb-6 border border-blue-100">
            <p className="text-xs text-blue-600 mb-1">Your serial number</p>
            <p className="text-lg font-bold font-mono text-blue-900">{serialNum}</p>
          </div>
          <p className="text-xs text-base-content/50 mb-6">Please keep this serial number for your records. The data will be reviewed by the assigned LSWDO.</p>
          <Link href="/"><button className="btn btn-primary w-full">Back to Home</button></Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen font-sans bg-white">
      <div className="w-full h-2 bg-gradient-to-r from-blue-900 via-blue-600 to-blue-400" />

      <header className="w-full bg-white border-b border-blue-100 shadow-sm py-4 px-8">
        <div className="max-w-5xl mx-auto flex flex-row justify-center items-center gap-6">
          <Image src="/dswd_logo.png" alt="DSWD Logo" width={220} height={60} />
          <div className="h-14 w-px bg-blue-200" />
          <Image src="/bagong_pilipinas.png" alt="Bagong Pilipinas Logo" width={80} height={80} />
        </div>
      </header>

      <main className="flex-1 bg-[#F4F7FB] py-10 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-6">
            <h1 className="text-xl font-bold text-blue-900 uppercase tracking-wide">Family Assistance Card in Emergencies and Disasters</h1>
            <p className="text-sm text-base-content/60 mt-1">FACED Digital Registration Form</p>
          </div>

          <StepIndicator currentStep={step} />

          <div className="bg-white rounded-2xl shadow-lg border border-blue-100 p-8">
            <div className="mb-6 pb-4 border-b border-base-200">
              <span className="badge badge-primary badge-outline mb-2">Part {step} of {STEPS.length}</span>
              <h2 className="text-lg font-bold text-blue-900">{STEPS[step - 1].title}</h2>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); if (step === 4) form.handleSubmit() }}>
              {step === 1 && <Step1 form={form} onBarangayCodeChange={setBarangayCode} />}
              {step === 2 && <Step2 form={form} />}
              {step === 3 && <Step3 form={form} />}
              {step === 4 && <Step4 form={form} />}

              {submitError && (
                <div className="alert alert-error mt-4">
                  <span className="text-sm">{submitError}</span>
                </div>
              )}

              <div className="flex justify-between mt-8 pt-6 border-t border-base-200">
                <div>
                  {step > 1 ? (
                    <button type="button" className="btn btn-outline" onClick={handleBack}>← Back</button>
                  ) : (
                    <Link href="/"><button type="button" className="btn btn-ghost text-base-content/60">← Back to Home</button></Link>
                  )}
                </div>
                <div>
                  {step < 4 ? (
                    <button type="button" className="btn btn-primary" onClick={handleNext}>Next →</button>
                  ) : (
                    <button type="submit" className="btn btn-success text-white" disabled={submitting}>
                      {submitting
                        ? <><span className="loading loading-spinner loading-sm" /> Submitting...</>
                        : 'Submit Form ✓'
                      }
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      </main>

      <footer className="w-full bg-gradient-to-b from-blue-950 via-blue-850 to-blue-800 text-blue-200 text-center py-5 px-8 text-xs">
        <p className="font-semibold text-white text-sm">Republic of the Philippines</p>
        <p className="mt-1">Department of Social Welfare and Development — FACED Digital System</p>
        <p className="mt-1 text-blue-400">All rights reserved © {new Date().getFullYear()}</p>
      </footer>
    </div>
  )
}