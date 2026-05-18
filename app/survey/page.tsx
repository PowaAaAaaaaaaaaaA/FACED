'use client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'

import { STEPS, INCOME_MAP, PROVINCE_DISTRICTS } from './constants'
import { StepIndicator } from './components/StepIndicator'
import { Step1Location } from './components/Step1Location'
import { Step2FamilyHead } from './components/Step2FamilyHead'
import { Step3FamilyMembers } from './components/Step3FamilyMembers'
import { Step4AccountInfo } from './components/Step4AccountInfo'
import { Step5Success } from './components/Step5success'

type FamilyMember = {
  id: number
  fullName: string
  relation: string
  birthdate: string
  age: string
  sex: string
  education: string
  occupation: string
  vulnerability: string
}

const calculateAge = (birthdate: string) => {
  if (!birthdate) return ''
  const today = new Date()
  const birth = new Date(birthdate)
  let age = today.getFullYear() - birth.getFullYear()
  const m = today.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
  return String(age)
}

export default function SurveyPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [serialNumber, setSerialNumber] = useState('')

  // ── Location state (Step 1) ──
  const [selectedRegion, setSelectedRegion] = useState('')
  const [selectedProvince, setSelectedProvince] = useState('')
  const [selectedMunicipality, setSelectedMunicipality] = useState('')
  const [selectedBarangay, setSelectedBarangay] = useState('')
  const [regions, setRegions] = useState<{ code: string; name: string }[]>([])
  const [provinces, setProvinces] = useState<{ code: string; name: string }[]>([])
  const [municipalities, setMunicipalities] = useState<{ code: string; name: string; district: string | null }[]>([])
  const [barangays, setBarangays] = useState<{ code: string; name: string }[]>([])

  // ── Family members state (Step 3) ──
  const [members, setMembers] = useState<FamilyMember[]>([
    { id: 1, fullName: '', relation: '', birthdate: '', age: '', sex: '', education: '', occupation: '', vulnerability: '' },
  ])

  // ── Form data ──
  const [formData, setFormData] = useState({
    evacuationCenter: '',
    lastName: '', firstName: '', middleName: '', nameExtension: '',
    birthdate: '', age: '', birthplace: '', sex: '', civilStatus: '',
    mothersMaidenName: '', religion: '', occupation: '',
    monthlyFamilyNetIncome: '', idCardPresented: '', idCardNumber: '',
    contactPrimary: '', contactAlternate: '',
    houseNo: '', street: '', subdivision: '',
    addressBarangay: '', addressMunicipality: '', addressProvince: '', zipCode: '',
    is4psBeneficiary: false, isIndigenousPeople: false, ipEthnicity: '',
    bankEwallet: '', accountName: '', accountType: '', accountNumber: '',
    houseOwnership: '', shelterDamage: '',
  })

  const EWALLET_NAMES = ['GCash', 'Maya (PayMaya)', 'ShopeePay', 'SeaBank']
  const isEwallet = EWALLET_NAMES.includes(formData.bankEwallet)

  const updateForm = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => { const u = { ...prev }; delete u[field]; return u })
  }

  // ── PSGC fetches ──
  useEffect(() => {
    supabase.from('psgc_regions').select('code, name').order('name')
      .then(({ data }) => setRegions(data ?? []))
  }, [])

  useEffect(() => {
    if (!selectedRegion) return
    setProvinces([]); setMunicipalities([]); setBarangays([])
    setSelectedProvince(''); setSelectedMunicipality(''); setSelectedBarangay('')
    supabase.from('psgc_provinces').select('code, name')
      .eq('region_code', selectedRegion).order('name')
      .then(({ data }) => setProvinces(data ?? []))
  }, [selectedRegion])

  useEffect(() => {
    if (!selectedProvince) return
    setMunicipalities([]); setBarangays([])
    setSelectedMunicipality(''); setSelectedBarangay('')
    supabase.from('psgc_municipalities').select('code, name, district')
      .eq('province_code', selectedProvince).order('name')
      .then(({ data }) => setMunicipalities(data ?? []))
  }, [selectedProvince])

  useEffect(() => {
    if (!selectedMunicipality) return
    setBarangays([]); setSelectedBarangay('')
    supabase.from('psgc_barangays').select('code, name')
      .eq('municipality_code', selectedMunicipality).order('name')
      .then(({ data }) => setBarangays(data ?? []))
  }, [selectedMunicipality])

  const availableDistricts = selectedProvince ? (PROVINCE_DISTRICTS[selectedProvince] ?? []) : []
  const selectedDistrict = municipalities.find((m) => m.code === selectedMunicipality)?.district ?? ''

  // ── Members helpers ──
  const addMember = () => setMembers((prev) => [
    ...prev,
    { id: Date.now(), fullName: '', relation: '', birthdate: '', age: '', sex: '', education: '', occupation: '', vulnerability: '' },
  ])

  const deleteMember = (id: number) => {
    if (members.length === 1) return
    setMembers((prev) => prev.filter((m) => m.id !== id))
  }

  const updateMember = (id: number, field: keyof FamilyMember, value: string) => {
    setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, [field]: value } : m)))
    const index = members.findIndex((m) => m.id === id)
    setErrors((prev) => {
      const u = { ...prev }
      delete u[`member_${index}_${field}`]
      delete u.members
      return u
    })
  }

  // ── Navigation ──
  const handleBack = () => {
    if (step === 1) router.push('/DataPrivacy')
    else setStep((prev) => Math.max(prev - 1, 1))
  }

  const handleNext = () => {
    const newErrors: Record<string, string> = {}

    if (step === 1) {
      if (!selectedRegion) newErrors.region = 'Region is required'
      if (!selectedProvince) newErrors.province = 'Province is required'
      if (!selectedMunicipality) newErrors.municipality = 'Municipality is required'
      if (!selectedBarangay) newErrors.barangay = 'Barangay is required'
      if (!formData.evacuationCenter) newErrors.evacuationCenter = 'Evacuation center is required'
    }

    if (step === 2) {
      if (!formData.lastName) newErrors.lastName = 'Last name is required'
      if (!formData.firstName) newErrors.firstName = 'First name is required'
      if (!formData.birthdate) newErrors.birthdate = 'Birthdate is required'
      if (!formData.birthplace) newErrors.birthplace = 'Birthplace is required'
      if (!formData.sex) newErrors.sex = 'Sex is required'
      if (!formData.civilStatus) newErrors.civilStatus = 'Civil status is required'
      if (!formData.mothersMaidenName) newErrors.mothersMaidenName = "Mother's maiden name is required"
      if (!formData.religion) newErrors.religion = 'Religion is required'
      if (!formData.occupation) newErrors.occupation = 'Occupation is required'
      if (!formData.monthlyFamilyNetIncome) newErrors.monthlyFamilyNetIncome = 'Monthly income is required'
      if (!formData.idCardPresented) newErrors.idCardPresented = 'ID card is required'
      if (!formData.idCardNumber) newErrors.idCardNumber = 'ID card number is required'
      if (!formData.contactPrimary) newErrors.contactPrimary = 'Primary contact is required'
      if (formData.contactPrimary && formData.contactPrimary.length !== 11)
        newErrors.contactPrimary = 'Contact number must be 11 digits'
      if (!formData.houseNo) newErrors.houseNo = 'House/Block/Lot No. is required'
      if (!formData.addressBarangay) newErrors.addressBarangay = 'Barangay is required'
      if (!formData.addressMunicipality) newErrors.addressMunicipality = 'City/Municipality is required'
      if (!formData.addressProvince) newErrors.addressProvince = 'Province is required'
      if (!formData.zipCode) newErrors.zipCode = 'Zip code is required'
      if (formData.zipCode && formData.zipCode.length !== 4) newErrors.zipCode = 'Zip code must be 4 digits'
    }

    if (step === 3) {
      members.forEach((m, index) => {
        if (!m.fullName.trim()) newErrors[`member_${index}_fullName`] = 'Required'
        if (!m.relation) newErrors[`member_${index}_relation`] = 'Required'
        if (!m.birthdate) newErrors[`member_${index}_birthdate`] = 'Required'
        if (!m.sex) newErrors[`member_${index}_sex`] = 'Required'
        if (!m.education) newErrors[`member_${index}_education`] = 'Required'
        if (!m.occupation.trim()) newErrors[`member_${index}_occupation`] = 'Required'
        if (!m.vulnerability) newErrors[`member_${index}_vulnerability`] = 'Required'
      })
      if (members.length === 0) newErrors.members = 'At least one family member is required'
    }

    setErrors(newErrors)
    if (Object.keys(newErrors).length === 0) setStep((prev) => Math.min(prev + 1, 5))
  }

  const handleSubmit = async () => {
    const newErrors: Record<string, string> = {}
    if (!formData.bankEwallet) newErrors.bankEwallet = 'Bank/E-wallet is required'
    if (!formData.accountName) newErrors.accountName = 'Account name is required'
    if (!formData.accountType) newErrors.accountType = 'Account type is required'
    if (!formData.accountNumber) newErrors.accountNumber = 'Account number is required'
    if (!formData.houseOwnership) newErrors.houseOwnership = 'House ownership is required'
    if (!formData.shelterDamage) newErrors.shelterDamage = 'Shelter damage classification is required'
    setErrors(newErrors)
    if (Object.keys(newErrors).length > 0) return

    setIsSubmitting(true)
    setSubmitError('')

    const ACCOUNT_TYPE_MAP: Record<string, string> = { Savings: 'savings', Current: 'current', 'E-Wallet': 'e_wallet' }
    const BANK_NAME_MAP: Record<string, string> = { Landbank: 'landbank', DBP: 'dbp', BDO: 'bdo', BPI: 'bpi', Metrobank: 'metrobank', PNB: 'pnb', UnionBank: 'unionbank', RCBC: 'rcbc', Others: 'other_bank' }
    const EWALLET_NAME_MAP: Record<string, string> = { GCash: 'gcash', 'Maya (PayMaya)': 'maya', ShopeePay: 'shopeepay', SeaBank: 'seabank', Others: 'other_ewallet' }
    const CIVIL_STATUS_MAP: Record<string, string> = { Single: 'single', Married: 'married', Widowed: 'widowed', Separated: 'separated', Annulled: 'annulled', 'Live-in': 'live_in' }
    const HOUSE_OWNERSHIP_MAP: Record<string, string> = { Owner: 'owner', Renter: 'renter', Sharer: 'sharer' }
    const SHELTER_DAMAGE_MAP: Record<string, string> = { 'Partially Damaged': 'partially_damaged', 'Totally Damaged': 'totally_damaged' }
    const SEX_MAP: Record<string, string> = { Male: 'male', Female: 'female' }

    try {
      const res = await fetch('/api/submit-faced', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountInfo: {
            payment_channel: isEwallet ? 'e_wallet' : 'bank',
            bank_name: !isEwallet ? (BANK_NAME_MAP[formData.bankEwallet] ?? null) : null,
            ewallet_name: isEwallet ? (EWALLET_NAME_MAP[formData.bankEwallet] ?? null) : null,
            account_name: formData.accountName,
            account_type: ACCOUNT_TYPE_MAP[formData.accountType] ?? null,
            account_number: formData.accountNumber,
          },
          familyHead: {
            last_name: formData.lastName, first_name: formData.firstName,
            middle_name: formData.middleName || null, name_extension: formData.nameExtension || null,
            birthdate: formData.birthdate, age: formData.age ? parseInt(formData.age) : null,
            birthplace: formData.birthplace || null, sex: SEX_MAP[formData.sex] ?? null,
            civil_status: CIVIL_STATUS_MAP[formData.civilStatus] ?? null,
            mothers_maiden_name: formData.mothersMaidenName || null,
            religion: formData.religion || null, occupation: formData.occupation || null,
            monthly_family_net_income: INCOME_MAP[formData.monthlyFamilyNetIncome] ?? null,
            id_card_presented: formData.idCardPresented || null,
            id_card_number: formData.idCardNumber || null,
            contact_primary: formData.contactPrimary,
            contact_alternate: formData.contactAlternate || null,
            permanent_address: [formData.houseNo, formData.street, formData.subdivision, formData.addressBarangay, formData.addressMunicipality, formData.addressProvince, formData.zipCode].filter(Boolean).join(', '),
          },
          facedCard: {
            psgc_code: selectedBarangay,
            evacuation_center_site: formData.evacuationCenter || null,
            house_ownership: HOUSE_OWNERSHIP_MAP[formData.houseOwnership] ?? null,
            shelter_damage: SHELTER_DAMAGE_MAP[formData.shelterDamage] ?? null,
            is_4ps_beneficiary: formData.is4psBeneficiary,
            is_indigenous_people: formData.isIndigenousPeople,
            ip_ethnicity: formData.isIndigenousPeople ? formData.ipEthnicity : null,
            date_registered: new Date().toISOString().split('T')[0],
          },
          familyMembers: members
            .filter((m) => m.fullName.trim() !== '')
            .map((m) => ({
              full_name: m.fullName, relation_to_head: m.relation || null,
              birthdate: m.birthdate || null, age: m.age ? parseInt(m.age) : null,
              sex: m.sex ? (SEX_MAP[m.sex] ?? null) : null,
              highest_educational_attainment: m.education || null,
              occupation: m.occupation || null,
              type_of_vulnerability: m.vulnerability === 'None' ? null : m.vulnerability || null,
            })),
        }),
      })
      const result = await res.json()
      if (!result.success) throw new Error(result.error)
      setSerialNumber(result.serial_number)
      setStep(5)
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : JSON.stringify(error)
      setSubmitError(`Submission failed: ${msg}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen font-sans bg-white">
      <div className="w-full h-2 bg-gradient-to-r from-blue-900 via-blue-600 to-blue-400" />

      <header className="w-full bg-white border-b border-blue-100 shadow-sm py-4 px-4 sm:px-8">
        <div className="max-w-5xl mx-auto flex flex-row flex-wrap justify-center items-center gap-4 sm:gap-6">
          <Image src="/dswd_logo.png" alt="DSWD Logo" width={220} height={60} className="h-12 sm:h-14 w-auto" />
          <div className="hidden sm:block h-14 w-px bg-blue-200" />
          <Image src="/bagong_pilipinas.png" alt="Bagong Pilipinas Logo" width={80} height={80} className="h-12 sm:h-16 w-auto" />
        </div>
      </header>

      <main className="flex-1 bg-[#F4F7FB] py-8 sm:py-10 px-4">
        <div className="max-w-4xl mx-auto">

          <div className="text-center mb-6 px-2">
            <h1 className="text-base sm:text-xl font-bold text-blue-900 uppercase tracking-wide leading-snug">
              Family Assistance Card in Emergencies and Disasters
            </h1>
            <p className="text-sm text-base-content/60 mt-1">FACED Digital Registration Form</p>
          </div>

          <StepIndicator currentStep={step} />

          <div className="bg-white rounded-2xl shadow-lg border border-blue-100 p-5 sm:p-8">
            <div className="pb-4 border-b border-base-200">
              <span className="badge badge-primary badge-outline mb-2">
                Part {step} of {STEPS.length}
              </span>
              <h2 className="text-lg font-bold text-blue-900">{STEPS[step - 1].title}</h2>
            </div>

            {/* Step content */}
            {step === 1 && (
              <Step1Location
                selectedRegion={selectedRegion}
                selectedProvince={selectedProvince}
                selectedMunicipality={selectedMunicipality}
                selectedBarangay={selectedBarangay}
                selectedDistrict={selectedDistrict}
                availableDistricts={availableDistricts}
                regions={regions}
                provinces={provinces}
                municipalities={municipalities}
                barangays={barangays}
                evacuationCenter={formData.evacuationCenter}
                errors={errors}
                onRegionChange={(v) => { setSelectedRegion(v); setErrors((p) => { const u = { ...p }; delete u.region; return u }) }}
                onProvinceChange={(v) => { setSelectedProvince(v); setErrors((p) => { const u = { ...p }; delete u.province; return u }) }}
                onMunicipalityChange={(v) => { setSelectedMunicipality(v); setErrors((p) => { const u = { ...p }; delete u.municipality; return u }) }}
                onBarangayChange={(v) => { setSelectedBarangay(v); setErrors((p) => { const u = { ...p }; delete u.barangay; return u }) }}
                onEvacuationCenterChange={(v) => updateForm('evacuationCenter', v)}
              />
            )}

            {step === 2 && (
              <Step2FamilyHead
                formData={formData}
                errors={errors}
                updateForm={updateForm}
                calculateAge={calculateAge}
              />
            )}

            {step === 3 && (
              <Step3FamilyMembers
                members={members}
                errors={errors}
                onAdd={addMember}
                onDelete={deleteMember}
                onUpdate={updateMember}
              />
            )}

            {step === 4 && (
              <Step4AccountInfo
                formData={formData}
                errors={errors}
                submitError={submitError}
                isEwallet={isEwallet}
                updateForm={updateForm}
              />
            )}

            {step === 5 && (
              <Step5Success
                serialNumber={serialNumber}
                formData={formData}
                locationNames={{
                  barangay: barangays.find((b) => b.code === selectedBarangay)?.name ?? '',
                  municipality: municipalities.find((m) => m.code === selectedMunicipality)?.name ?? '',
                  province: provinces.find((p) => p.code === selectedProvince)?.name ?? '',
                  region: regions.find((r) => r.code === selectedRegion)?.name ?? '',
                }}
              />
            )}

            {/* Navigation */}
            <div className="flex justify-center gap-2 mt-6">
              {step < 5 && (
                <button type="button" className="btn btn-outline btn-primary" onClick={handleBack}>
                  Back
                </button>
              )}
              {step < 4 && (
                <button type="button" className="btn btn-primary" onClick={handleNext}>
                  Next
                </button>
              )}
              {step === 4 && (
                <button type="button" className="btn btn-success" onClick={handleSubmit} disabled={isSubmitting}>
                  {isSubmitting ? (
                    <><span className="loading loading-spinner loading-sm" /> Submitting...</>
                  ) : 'Submit'}
                </button>
              )}
            </div>
          </div>

        </div>
      </main>

      <footer className="w-full bg-gradient-to-b from-blue-950 via-blue-850 to-blue-800 text-blue-200 text-center py-5 px-4 sm:px-8 text-xs">
        <p className="font-semibold text-white text-sm">Republic of the Philippines</p>
        <p className="mt-1">Department of Social Welfare and Development — FACED Digital System</p>
        <p className="mt-1 text-blue-400">All rights reserved © {new Date().getFullYear()}</p>
      </footer>
    </div>
  )
}