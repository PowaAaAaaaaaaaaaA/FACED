'use client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import { generateSerialNumber } from '../../lib/psgc'
import { Pencil, Trash2, LucidePlus, Info, CheckCircle, Printer } from 'lucide-react'

import { STEPS, INCOME_MAP, CIVIL_STATUS_OPTIONS, SEX_OPTIONS, RELIGIONS, INCOME_BRACKETS, VALID_IDS, RELATION_FAMHEAD, EDUCATIONAL_ATTAINMENT, VULNERABILITY_TYPES, BANK_EWALLET_OPTIONS, ACCOUNT_TYPE_OPTIONS, HOUSE_OWNERSHIP, SHELTER_DMG_CLASSIFICATION, PROVINCE_DISTRICTS, MUNICIPALITY_DISTRICT } from './constants'
import { StepIndicator } from './components/StepIndicator'
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
  const monthDiff = today.getMonth() - birth.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  return String(age)
}

export default function SurveyPage() {
  const router = useRouter();
  const [step, setStep]= useState(1)
  const [members, setMembers] = useState<FamilyMember[]>([
    { id: 1, fullName: '', relation: '', birthdate: '', age: '', sex: '', education: '', occupation: '', vulnerability: '' }
  ])

  const addMember = () => {
    setMembers((prev) => [
      ...prev,
      {
        id: Date.now(), fullName: '', relation: '', birthdate: '', age: '', sex: '', education: '', occupation: '', vulnerability: ''
      }
    ])
    console.log('Added member')
  }

  const deleteMember = (id: number) => {
    if (members.length === 1) return
    setMembers((prev) => prev.filter((m) => m.id !== id))
  }

  const updateMember = (id: number, field: keyof FamilyMember, value: string) => {
    setMembers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, [field]: value } : m))
    )
    // Clear the error for this specific cell
    const index = members.findIndex(m => m.id === id)
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
      if (formData.zipCode && formData.zipCode.length !== 4) {
        newErrors.zipCode = 'Zip code must be 4 digits'
      }
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

  const handleBack = () => {
    if (step === 1) {
      router.push('/DataPrivacy')
    } else {
      setStep((prev) => Math.max(prev - 1, 1))
    }
  }

  //for step 1
  const [selectedRegion, setSelectedRegion] = useState('')
  const [selectedProvince, setSelectedProvince] = useState('')
  const [selectedMunicipality, setSelectedMunicipality] = useState('')
  const [selectedBarangay, setSelectedBarangay] = useState('')

  //fetched lists
  const [regions, setRegions] = useState<{code: string, name: string}[]>([])
  const [provinces, setProvinces] = useState<{code: string, name: string}[]>([])
  const [municipalities, setMunicipalities] = useState<{
    code: string
    name: string
    district: string | null
  }[]>([])
  const [barangays, setBarangays] = useState<{code: string, name: string}[]>([])

  useEffect(() => {
    const fetchRegions = async () => {
      const {data, error} = await supabase
        .from('psgc_regions')
        .select('code, name')
        .order('name')
      if (error) console.error(error)
      else setRegions(data ?? [])
    }
    fetchRegions()
  }, [])

  useEffect(() => {
    if(!selectedRegion) return

    const fetchProvinces = async () => {
      setProvinces([])       // clear old list
      setMunicipalities([])  // clear downstream lists too
      setBarangays([])
      setSelectedProvince('')
      setSelectedMunicipality('')
      setSelectedBarangay('')

      const {data, error} = await supabase
        .from('psgc_provinces')
        .select('code, name')
        .eq('region_code', selectedRegion)
        .order('name')
      if (error) console.error(error)
      else setProvinces(data ?? [])
    }
    fetchProvinces()
  }, [selectedRegion])

  useEffect(() => {
    if (!selectedProvince) return

    const fetchMunicipalities = async () => {
      setMunicipalities([])
      setBarangays([])
      setSelectedMunicipality('')
      setSelectedBarangay('')

      const { data, error } = await supabase
        .from('psgc_municipalities')
        .select('code, name, district')
        .eq('province_code', selectedProvince)
        .order('name')
      if (error) console.error(error)
      else setMunicipalities(data ?? [])
    }
    fetchMunicipalities()
  }, [selectedProvince])

  const availableDistricts = selectedProvince 
  ? (PROVINCE_DISTRICTS[selectedProvince] ?? []) 
  : []

  const selectedDistrict = municipalities.find(m => m.code === selectedMunicipality)?.district ?? ''

  useEffect(() => {
  if (!selectedMunicipality) return

    const fetchBarangays = async () => {
      setBarangays([])
      setSelectedBarangay('')

      const { data, error } = await supabase
        .from('psgc_barangays')
        .select('code, name')
        .eq('municipality_code', selectedMunicipality)
        .order('name')
      if (error) console.error(error)
      else setBarangays(data ?? [])
    }
    fetchBarangays()
  }, [selectedMunicipality])

  //form data
  const [formData, setFormData] = useState({
    // Step 1 — location
    evacuationCenter: '',

    // Step 2 — family head
    lastName: '',
    firstName: '',
    middleName: '',
    nameExtension: '',
    birthdate: '',
    age: '',
    birthplace: '',
    sex: '',
    civilStatus: '',
    mothersMaidenName: '',
    religion: '',
    occupation: '',
    monthlyFamilyNetIncome: '',
    idCardPresented: '',
    idCardNumber: '',
    contactPrimary: '',
    contactAlternate: '',
    // permanent address
    houseNo: '',
    street: '',
    subdivision: '',
    addressBarangay: '',
    addressMunicipality: '',
    addressProvince: '',
    zipCode: '',
    // others
    is4psBeneficiary: false,
    isIndigenousPeople: false,
    ipEthnicity: '',

    // Step 4 — account info
    bankEwallet: '',
    accountName: '',
    accountType: '',
    accountNumber: '',
    houseOwnership: '',
    shelterDamage: '',
  })

  const EWALLET_NAMES = ['GCash', 'Maya (PayMaya)', 'ShopeePay', 'SeaBank']
  const isEwallet = EWALLET_NAMES.includes(formData.bankEwallet)

  const updateForm = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error for this field when user updates it
    if (errors[field]) {
      setErrors((prev) => {
        const updated = { ...prev }
        delete updated[field]
        return updated
      })
    }
  }

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [serialNumber, setSerialNumber] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  // validate() stays as its own function — defined separately
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}
    if (!formData.bankEwallet) newErrors.bankEwallet = 'Bank/E-wallet is required'
    if (!formData.accountName) newErrors.accountName = 'Account name is required'
    if (!formData.accountType) newErrors.accountType = 'Account type is required'
    if (!formData.accountNumber) newErrors.accountNumber = 'Account number is required'
    if (!formData.houseOwnership) newErrors.houseOwnership = 'House ownership is required'
    if (!formData.shelterDamage) newErrors.shelterDamage = 'Shelter damage classification is required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }
  // handleSubmit calls validate() first before touching Supabase
  const handleSubmit = async () => {
    if (!validate()) return

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
            religion: formData.religion || null,
            occupation: formData.occupation || null,
            monthly_family_net_income: INCOME_MAP[formData.monthlyFamilyNetIncome] ?? null,
            id_card_presented: formData.idCardPresented || null, id_card_number: formData.idCardNumber || null,
            contact_primary: formData.contactPrimary, contact_alternate: formData.contactAlternate || null,
            permanent_address: [formData.houseNo, formData.street, formData.subdivision, formData.addressBarangay, formData.addressMunicipality, formData.addressProvince, formData.zipCode].filter(Boolean).join(', '),
          },
          facedCard: {
            psgc_code: selectedBarangay, evacuation_center_site: formData.evacuationCenter || null,
            house_ownership: HOUSE_OWNERSHIP_MAP[formData.houseOwnership] ?? null,
            shelter_damage: SHELTER_DAMAGE_MAP[formData.shelterDamage] ?? null,
            is_4ps_beneficiary: formData.is4psBeneficiary, is_indigenous_people: formData.isIndigenousPeople,
            ip_ethnicity: formData.isIndigenousPeople ? formData.ipEthnicity : null,
            date_registered: new Date().toISOString().split('T')[0],
          },
          familyMembers: members
            .filter((m) => m.fullName.trim() !== '')
            .map((m) => ({
              full_name: m.fullName,
              relation_to_head: m.relation || null,
              birthdate: m.birthdate || null,
              age: m.age ? parseInt(m.age) : null,
              sex: m.sex ? SEX_MAP[m.sex] ?? null : null,
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

  // MAIN FORM
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
            <h1 className="text-xl font-bold text-blue-900 uppercase tracking-wide">
              Family Assistance Card in Emergencies and Disasters
            </h1>
            <p className="text-xs sm:text-sm text-base-content/60 mt-1">FACED Digital Registration Form</p>
          </div>

          {/* ── Horizontal Step Indicator (always horizontal) ── */}
          <StepIndicator currentStep={step} steps={STEPS} />

          <div className="bg-white rounded-2xl shadow-lg border border-blue-100 p-8">
            <div className=" pb-4 border-b border-base-200">
              <span className="badge badge-primary badge-outline mb-2">
                Part {step} of {STEPS.length}
              </span>
              <h2 className="text-lg font-bold text-blue-900">{STEPS[step - 1].title}</h2>
              {/* step 1 */}
              {step === 1 && (
                <form>
                  {/* parent container */}
                  <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                    {/* Region */}
                    <div className="flex flex-col gap-1">
                      <label className="fieldset-legend">Region</label>
                      <select
                        className={`select select-primary w-full ${errors.region ? 'select-error' : ''}`}
                        value={selectedRegion}
                        onChange={(e) => {
                          setSelectedRegion(e.target.value)
                          setErrors((prev) => { const u = { ...prev }; delete u.region; return u })
                        }}
                      >
                        <option disabled value="">Select Region</option>
                        {regions.map((r) => (
                          <option key={r.code} value={r.code}>{r.name}</option>
                        ))}
                      </select>
                      {errors.region && (
                        <p className="text-xs text-red-500">{errors.region}</p>
                      )}
                    </div>

                    {/* Province */}
                    <div className="flex flex-col gap-1">
                      <label className="fieldset-legend">Province</label>
                      <select
                        className={`select select-primary w-full ${errors.province ? 'select-error' : ''}`}
                        value={selectedProvince}
                        onChange={(e) => {
                          setSelectedProvince(e.target.value)
                          setErrors((prev) => { const u = { ...prev }; delete u.province; return u })
                        }}
                        disabled={provinces.length === 0}
                      >
                        <option disabled value="">Select Province</option>
                        {provinces.map((p) => (
                          <option key={p.code} value={p.code}>{p.name}</option>
                        ))}
                      </select>
                      {errors.province && (
                        <p className="text-xs text-red-500">{errors.province}</p>
                      )}
                    </div>

                    {/* City/Municipality */}
                    <div className="flex flex-col gap-1">
                      <label className="fieldset-legend">City / Municipality</label>
                      <select
                        className={`select select-primary w-full ${errors.municipality ? 'select-error' : ''}`}
                        value={selectedMunicipality}
                        onChange={(e) => {
                          setSelectedMunicipality(e.target.value)
                          setErrors((prev) => { const u = { ...prev }; delete u.municipality; return u })
                        }}
                        disabled={municipalities.length === 0}
                      >
                        <option disabled value="">Select City/Municipality</option>
                        {municipalities.map((m) => (
                          <option key={m.code} value={m.code}>{m.name}</option>
                        ))}
                      </select>
                      {errors.municipality && (
                        <p className="text-xs text-red-500">{errors.municipality}</p>
                      )}
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
                        onChange={(e) => {
                          setSelectedBarangay(e.target.value)
                          setErrors((prev) => { const u = { ...prev }; delete u.barangay; return u })
                        }}
                        disabled={barangays.length === 0}
                      >
                        <option disabled value="">Select Barangay</option>
                        {barangays.map((b) => (
                          <option key={b.code} value={b.code}>{b.name}</option>
                        ))}
                      </select>
                      {errors.barangay && (
                        <p className="text-xs text-red-500">{errors.barangay}</p>
                      )}
                    </div>

                    {/* Evacuation Center — full width since it's the last odd one */}
                    <div className="flex flex-col gap-1 col-span-2">
                      <label className="fieldset-legend">Evacuation Center / Site</label>
                      <input
                        type="text"
                        className={`input input-primary w-full ${errors.evacuationCenter ? 'input-error' : ''}`}
                        placeholder="Enter evacuation center or site"
                        value={formData.evacuationCenter} 
                        onChange={(e) => updateForm('evacuationCenter', e.target.value)}
                      />
                      {errors.evacuationCenter && (
                        <p className="text-xs text-red-500">{errors.evacuationCenter}</p>
                      )}
                    </div>

                  </div>
                </form>
              )}

              {/* step 2 */}
              {step === 2 && (
                <form>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                    {/* left side */}
                    <div className="flex flex-col gap-1">
                      <legend className="fieldset-legend">Last Name <span className="text-red-500">*</span></legend>
                      <input
                        type="text"
                        className={`input input-primary w-full ${errors.lastName ? 'input-error' : ''}`}
                        placeholder="Last Name"
                        value={formData.lastName}
                        onChange={(e) => updateForm('lastName', e.target.value)}
                      />
                      {errors.lastName && <p className="text-xs text-red-500">{errors.lastName}</p>}

                      <legend className="fieldset-legend">First Name <span className="text-red-500">*</span></legend>
                      <input
                        type="text"
                        className={`input input-primary w-full ${errors.firstName ? 'input-error' : ''}`}
                        placeholder="First Name"
                        value={formData.firstName}
                        onChange={(e) => updateForm('firstName', e.target.value)}
                      />
                      {errors.firstName && <p className="text-xs text-red-500">{errors.firstName}</p>}

                      <legend className="fieldset-legend">Middle Name</legend>
                      <input
                        type="text"
                        className="input input-primary w-full"
                        placeholder="Middle Name"
                        value={formData.middleName}
                        onChange={(e) => updateForm('middleName', e.target.value)}
                      />

                      <legend className="fieldset-legend">Name Extension</legend>
                      <input
                        type="text"
                        className="input input-primary w-full"
                        placeholder="Jr., Sr., III"
                        value={formData.nameExtension}
                        onChange={(e) => updateForm('nameExtension', e.target.value)}
                      />

                      <legend className="fieldset-legend">Birthdate <span className="text-red-500">*</span></legend>
                      <input
                        type="date"
                        className={`input input-primary w-full ${errors.birthdate ? 'input-error' : ''}`}
                        value={formData.birthdate}
                        onChange={(e) => {
                          updateForm('birthdate', e.target.value)
                          updateForm('age', calculateAge(e.target.value))
                        }}
                      />
                      {errors.birthdate && <p className="text-xs text-red-500">{errors.birthdate}</p>}

                      <legend className="fieldset-legend">Age</legend>
                      <input
                        type="text"
                        className="input input-primary w-full bg-blue-50 opacity-100"
                        placeholder="Auto-calculated"
                        value={formData.age}
                        readOnly
                      />

                      <legend className="fieldset-legend">Birthplace <span className="text-red-500">*</span></legend>
                      <input
                        type="text"
                        className={`input input-primary w-full ${errors.birthplace ? 'input-error' : ''}`}
                        placeholder="Birthplace"
                        value={formData.birthplace}
                        onChange={(e) => updateForm('birthplace', e.target.value)}
                      />
                      {errors.birthplace && <p className="text-xs text-red-500">{errors.birthplace}</p>}

                      <legend className="fieldset-legend">Sex <span className="text-red-500">*</span></legend>
                      <select
                        className={`select select-primary w-full ${errors.sex ? 'select-error' : ''}`}
                        value={formData.sex}
                        onChange={(e) => updateForm('sex', e.target.value)}
                      >
                        <option disabled value="">--Select--</option>
                        {SEX_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                      {errors.sex && <p className="text-xs text-red-500">{errors.sex}</p>}
                    </div>

                    {/* right side */}
                    <div className="flex flex-col gap-1">
                      <legend className="fieldset-legend">Civil Status <span className="text-red-500">*</span></legend>
                      <select
                        className={`select select-primary w-full ${errors.civilStatus ? 'select-error' : ''}`}
                        value={formData.civilStatus}
                        onChange={(e) => updateForm('civilStatus', e.target.value)}
                      >
                        <option disabled value="">--Select Status--</option>
                        {CIVIL_STATUS_OPTIONS.map((status) => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </select>
                      {errors.civilStatus && <p className="text-xs text-red-500">{errors.civilStatus}</p>}

                      <legend className="fieldset-legend">Mother&apos;s Maiden Name <span className="text-red-500">*</span></legend>
                      <input
                        type="text"
                        className={`input input-primary w-full ${errors.mothersMaidenName ? 'input-error' : ''}`}
                        placeholder="Mother's Maiden Name"
                        value={formData.mothersMaidenName}
                        onChange={(e) => updateForm('mothersMaidenName', e.target.value)}
                      />
                      {errors.mothersMaidenName && <p className="text-xs text-red-500">{errors.mothersMaidenName}</p>}

                      <legend className="fieldset-legend">Religion <span className="text-red-500">*</span></legend>
                      <select
                        className={`select select-primary w-full ${errors.religion ? 'select-error' : ''}`}
                        value={formData.religion}
                        onChange={(e) => updateForm('religion', e.target.value)}
                      >
                        <option disabled value="">--Select Religion--</option>
                        {RELIGIONS.map((religion) => (
                          <option key={religion} value={religion}>{religion}</option>
                        ))}
                      </select>
                      {errors.religion && <p className="text-xs text-red-500">{errors.religion}</p>}

                      <label className="fieldset-legend flex items-center gap-1">
                        Occupation <span className="text-red-500">*</span>
                        <div className="tooltip tooltip-right" data-tip="Put N/A if no work">
                          <Info size={14} className="text-secondary cursor-help" />
                        </div>
                      </label>
                      <input
                        type="text"
                        className={`input input-primary w-full ${errors.occupation ? 'input-error' : ''}`}
                        placeholder="Occupation"
                        value={formData.occupation}
                        onChange={(e) => updateForm('occupation', e.target.value)}
                      />
                      {errors.occupation && <p className="text-xs text-red-500">{errors.occupation}</p>}

                      <legend className="fieldset-legend">Monthly Family Net Income <span className="text-red-500">*</span></legend>
                      <select
                        className={`select select-primary w-full ${errors.monthlyFamilyNetIncome ? 'select-error' : ''}`}
                        value={formData.monthlyFamilyNetIncome}
                        onChange={(e) => updateForm('monthlyFamilyNetIncome', e.target.value)}
                      >
                        <option disabled value="">--Select Income Bracket--</option>
                        {INCOME_BRACKETS.map((income) => (
                          <option key={income} value={income}>{income}</option>
                        ))}
                      </select>
                      {errors.monthlyFamilyNetIncome && <p className="text-xs text-red-500">{errors.monthlyFamilyNetIncome}</p>}

                      <legend className="fieldset-legend">ID Card Presented <span className="text-red-500">*</span></legend>
                      <select
                        className={`select select-primary w-full ${errors.idCardPresented ? 'select-error' : ''}`}
                        value={formData.idCardPresented}
                        onChange={(e) => updateForm('idCardPresented', e.target.value)}
                      >
                        <option disabled value="">--Select ID--</option>
                        {VALID_IDS.map((validID) => (
                          <option key={validID} value={validID}>{validID}</option>
                        ))}
                      </select>
                      {errors.idCardPresented && <p className="text-xs text-red-500">{errors.idCardPresented}</p>}

                      <label className="fieldset-legend flex items-center gap-1">
                        ID Card Number <span className="text-red-500">*</span>
                        <div className="tooltip tooltip-right" data-tip="Please double check the ID Card Number">
                          <Info size={14} className="text-secondary cursor-help" />
                        </div>
                      </label>
                      <input
                        type="text"
                        className={`input input-primary w-full ${errors.idCardNumber ? 'input-error' : ''}`}
                        placeholder="ID Card Number"
                        value={formData.idCardNumber}
                        onChange={(e) => updateForm('idCardNumber', e.target.value)}
                      />
                      {errors.idCardNumber && <p className="text-xs text-red-500">{errors.idCardNumber}</p>}

                      <legend className="fieldset-legend">Contact Number <span className="text-red-500">*</span></legend>
                      <div className="flex flex-row w-full gap-2">
                        <div className="flex flex-col gap-1 flex-1">
                          <input
                            type="text"
                            inputMode="tel"
                            maxLength={13}
                            className={`input input-primary w-full ${errors.contactPrimary ? 'input-error' : ''}`}
                            placeholder="Primary — 09XXXXXXXXX"
                            value={formData.contactPrimary}
                            onChange={(e) => {
                              let value = e.target.value.trim()
                              if (value.startsWith('+63')) value = '0' + value.slice(3)
                              value = value.replace(/\D/g, '')
                              if (value.length <= 11) updateForm('contactPrimary', value)
                            }}
                          />
                          {errors.contactPrimary && <p className="text-xs text-red-500">{errors.contactPrimary}</p>}
                        </div>
                        <div className="flex flex-col gap-1 flex-1">
                          <input
                            type="text"
                            inputMode="tel"
                            maxLength={13}
                            className="input input-primary w-full"
                            placeholder="Alternate — optional"
                            value={formData.contactAlternate}
                            onChange={(e) => {
                              let value = e.target.value.trim()
                              if (value.startsWith('+63')) value = '0' + value.slice(3)
                              value = value.replace(/\D/g, '')
                              if (value.length <= 11) updateForm('contactAlternate', value)
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Permanent Address */}
                  <legend className="fieldset-legend max-w-full mt-4">
                    Permanent Address <span className="text-red-500">*</span>
                  </legend>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                    <div className="flex flex-col gap-2">
                      <input type="text"
                        className={`input input-primary w-full ${errors.houseNo ? 'input-error' : ''}`}
                        placeholder="House/Block/Lot No. *"
                        value={formData.houseNo}
                        onChange={(e) => updateForm('houseNo', e.target.value)}
                      />
                      {errors.houseNo && <p className="text-xs text-red-500">{errors.houseNo}</p>}

                      <input type="text" className="input input-primary w-full" placeholder="Street"
                        value={formData.street} onChange={(e) => updateForm('street', e.target.value)} />

                      <input type="text" className="input input-primary w-full" placeholder="Subd./Village"
                        value={formData.subdivision} onChange={(e) => updateForm('subdivision', e.target.value)} />

                      <input type="text"
                        className={`input input-primary w-full ${errors.addressBarangay ? 'input-error' : ''}`}
                        placeholder="Barangay *"
                        value={formData.addressBarangay}
                        onChange={(e) => updateForm('addressBarangay', e.target.value)}
                      />
                      {errors.addressBarangay && <p className="text-xs text-red-500">{errors.addressBarangay}</p>}
                    </div>

                    <div className="flex flex-col gap-2">
                      <input type="text"
                        className={`input input-primary w-full ${errors.addressMunicipality ? 'input-error' : ''}`}
                        placeholder="City/Municipality *"
                        value={formData.addressMunicipality}
                        onChange={(e) => updateForm('addressMunicipality', e.target.value)}
                      />
                      {errors.addressMunicipality && <p className="text-xs text-red-500">{errors.addressMunicipality}</p>}

                      <input type="text"
                        className={`input input-primary w-full ${errors.addressProvince ? 'input-error' : ''}`}
                        placeholder="Province *"
                        value={formData.addressProvince}
                        onChange={(e) => updateForm('addressProvince', e.target.value)}
                      />
                      {errors.addressProvince && <p className="text-xs text-red-500">{errors.addressProvince}</p>}

                      <input
                        type="text" inputMode="numeric" pattern="[0-9]*" maxLength={4}
                        className={`input input-primary w-full ${errors.zipCode ? 'input-error' : ''}`}
                        placeholder="Zip Code *"
                        value={formData.zipCode}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '')
                          if (value.length <= 4) updateForm('zipCode', value)
                        }}
                      />
                      {errors.zipCode && <p className="text-xs text-red-500">{errors.zipCode}</p>}
                    </div>
                  </div>

                  {/* Others */}
                  <div className="flex flex-col gap-3 mt-4">
                    <label className="fieldset-legend">Others</label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        className="checkbox checkbox-primary"
                        checked={formData.is4psBeneficiary}
                        onChange={(e) => updateForm('is4psBeneficiary', e.target.checked)}
                      />
                      <span className="text-sm">4Ps Beneficiary</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        className="checkbox checkbox-primary"
                        checked={formData.isIndigenousPeople}
                        onChange={(e) => updateForm('isIndigenousPeople', e.target.checked)}
                      />
                      <span className="text-sm">Indigenous People (IP)</span>
                    </label>
                    {formData.isIndigenousPeople && (
                      <div className="flex flex-col gap-1 ml-7">
                        <label className="fieldset-legend">Type of Ethnicity</label>
                        <input
                          type="text"
                          className="input input-primary w-full"
                          placeholder="e.g. Igorot, Aeta, Mangyan"
                          value={formData.ipEthnicity}
                          onChange={(e) => updateForm('ipEthnicity', e.target.value)}
                        />
                      </div>
                    )}
                  </div>
                </form>
              )}

              {/* step 3 */}
              {step === 3 && (
                <form>
                  <div className="overflow-x-auto rounded-box border border-base-content/5 bg-base-100">
                    <table className="table table-xs table-fixed w-full">
                      <thead className="bg-primary text-white">
                        <tr>
                          <th className="w-36 text-center">Family Member</th>
                          <th className="w-32 text-center">Relation to Head</th>
                          <th className="w-32 text-center">Birthdate</th>
                          <th className="w-16 text-center">Age</th>
                          <th className="w-24 text-center">Sex</th>
                          <th className="w-40 text-center">Educational Attainment</th>
                          <th className="w-32 text-center">
                            <span className="flex items-center justify-center gap-1">
                              Occupation
                              <div className="tooltip tooltip-bottom" data-tip="Put N/A if no work">
                                <Info size={12} className="text-blue-200 cursor-help" />
                              </div>
                            </span>
                          </th>
                          <th className="w-36 text-center">Type of Vulnerability</th>
                          <th className="w-20 text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {members.map((member, index) => (
                          <tr key={member.id}>

                            {/* Full Name */}
                            <td>
                              <input
                                type="text"
                                className={`input input-primary w-full input-sm ${errors[`member_${index}_fullName`] ? 'input-error' : ''}`}
                                placeholder="Full Name"
                                value={member.fullName}
                                onChange={(e) => updateMember(member.id, 'fullName', e.target.value)}
                              />
                              {errors[`member_${index}_fullName`] && (
                                <p className="text-xs text-red-500 mt-1">{errors[`member_${index}_fullName`]}</p>
                              )}
                            </td>

                            {/* Relation */}
                            <td>
                              <select
                                className={`select select-primary w-full select-sm ${errors[`member_${index}_relation`] ? 'select-error' : ''}`}
                                value={member.relation}
                                onChange={(e) => updateMember(member.id, 'relation', e.target.value)}
                              >
                                <option disabled value="">--Select--</option>
                                {RELATION_FAMHEAD.map((rel) => (
                                  <option key={rel} value={rel}>{rel}</option>
                                ))}
                              </select>
                              {errors[`member_${index}_relation`] && (
                                <p className="text-xs text-red-500 mt-1">{errors[`member_${index}_relation`]}</p>
                              )}
                            </td>

                            {/* Birthdate */}
                            <td>
                              <input
                                type="date"
                                className={`input input-primary w-full input-sm ${errors[`member_${index}_birthdate`] ? 'input-error' : ''}`}
                                value={member.birthdate}
                                onChange={(e) => {
                                  updateMember(member.id, 'birthdate', e.target.value)
                                  updateMember(member.id, 'age', calculateAge(e.target.value))
                                }}
                              />
                              {errors[`member_${index}_birthdate`] && (
                                <p className="text-xs text-red-500 mt-1">{errors[`member_${index}_birthdate`]}</p>
                              )}
                            </td>

                            {/* Age — read only, no error needed */}
                            <td>
                              <input
                                type="text"
                                className="input input-primary input-sm w-full bg-blue-50 opacity-100 cursor-default text-center"
                                placeholder="Auto"
                                value={member.age}
                                readOnly
                              />
                            </td>

                            {/* Sex */}
                            <td>
                              <select
                                className={`select select-primary w-full select-sm ${errors[`member_${index}_sex`] ? 'select-error' : ''}`}
                                value={member.sex}
                                onChange={(e) => updateMember(member.id, 'sex', e.target.value)}
                              >
                                <option disabled value="">--Select--</option>
                                {SEX_OPTIONS.map((option) => (
                                  <option key={option} value={option}>{option}</option>
                                ))}
                              </select>
                              {errors[`member_${index}_sex`] && (
                                <p className="text-xs text-red-500 mt-1">{errors[`member_${index}_sex`]}</p>
                              )}
                            </td>

                            {/* Educational Attainment */}
                            <td>
                              <select
                                className={`select select-primary w-full select-sm ${errors[`member_${index}_education`] ? 'select-error' : ''}`}
                                value={member.education}
                                onChange={(e) => updateMember(member.id, 'education', e.target.value)}
                              >
                                <option disabled value="">--Select--</option>
                                {EDUCATIONAL_ATTAINMENT.map((educ) => (
                                  <option key={educ} value={educ}>{educ}</option>
                                ))}
                              </select>
                              {errors[`member_${index}_education`] && (
                                <p className="text-xs text-red-500 mt-1">{errors[`member_${index}_education`]}</p>
                              )}
                            </td>

                            {/* Occupation */}
                            <td>
                              <input
                                type="text"
                                className={`input input-primary w-full input-sm ${errors[`member_${index}_occupation`] ? 'input-error' : ''}`}
                                placeholder="Occupation"
                                value={member.occupation}
                                onChange={(e) => updateMember(member.id, 'occupation', e.target.value)}
                              />
                              {errors[`member_${index}_occupation`] && (
                                <p className="text-xs text-red-500 mt-1">{errors[`member_${index}_occupation`]}</p>
                              )}
                            </td>

                            {/* Type of Vulnerability */}
                            <td>
                              <select
                                className={`select select-primary w-full select-sm ${errors[`member_${index}_vulnerability`] ? 'select-error' : ''}`}
                                value={member.vulnerability}
                                onChange={(e) => updateMember(member.id, 'vulnerability', e.target.value)}
                              >
                                <option disabled value="">--Select--</option>
                                {VULNERABILITY_TYPES.map((v) => (
                                  <option key={v} value={v}>{v}</option>
                                ))}
                              </select>
                              {errors[`member_${index}_vulnerability`] && (
                                <p className="text-xs text-red-500 mt-1">{errors[`member_${index}_vulnerability`]}</p>
                              )}
                            </td>

                            {/* Action */}
                            <td className="text-center">
                              <button
                                type="button"
                                className="btn btn-square btn-sm btn-ghost text-red-500"
                                onClick={() => deleteMember(member.id)}
                                disabled={members.length === 1}
                                title={members.length === 1 ? 'At least one member required' : 'Remove'}
                              >
                                <Trash2 size={16} />
                              </button>
                            </td>

                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Members error */}
                  {errors.members && (
                    <p className="text-xs text-red-500 text-center mt-2">{errors.members}</p>
                  )}

                  <div className="flex justify-center mt-3">
                    <button
                      type="button"
                      className="btn btn-soft btn-primary btn-sm"
                      onClick={addMember}
                    >
                      <LucidePlus size={16} /> Add Family Member
                    </button>
                  </div>
                </form>
              )}

              {/* step 4 */}
              {step === 4 && (
                <form>
                  <div className="card card-xs shadow-sm w-full bg-yellow-200 mb-4">
                    <div className="card-body">
                      <h2 className="card-title text-md">
                        <Info size={16} /> Notice
                      </h2>
                      <p className="text-xs font-bold">
                        In case the family head does not have a bank or an e-wallet account,
                        any of the family members with a validated account can be indicated.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                    {/* left side */}
                    <div className="flex flex-col gap-1">
                      <legend className="fieldset-legend">
                        Bank/E-wallet <span className="text-red-500">*</span>
                      </legend>
                      <select
                        className={`select select-primary w-full ${errors.bankEwallet ? 'select-error' : ''}`}
                        value={formData.bankEwallet}
                        onChange={(e) => updateForm('bankEwallet', e.target.value)}
                      >
                        <option disabled value="">--Select Bank / E-Wallet--</option>
                        {BANK_EWALLET_OPTIONS.map((provider) => (
                          <option key={provider} value={provider}>{provider}</option>
                        ))}
                      </select>
                      {errors.bankEwallet && <p className="text-xs text-red-500">{errors.bankEwallet}</p>}

                      <legend className="fieldset-legend">
                        Account Name <span className="text-red-500">*</span>
                      </legend>
                      <input
                        type="text"
                        className={`input input-primary w-full ${errors.accountName ? 'input-error' : ''}`}
                        placeholder="Account Name"
                        value={formData.accountName}
                        onChange={(e) => updateForm('accountName', e.target.value)}
                      />
                      {errors.accountName && <p className="text-xs text-red-500">{errors.accountName}</p>}
                    </div>

                    {/* right side */}
                    <div className="flex flex-col gap-1">
                      <label className="fieldset-legend">
                        Account Type <span className="text-red-500">*</span>
                      </label>
                      <select
                        className={`select select-primary w-full ${errors.accountType ? 'select-error' : ''}`}
                        value={formData.accountType}
                        onChange={(e) => updateForm('accountType', e.target.value)}
                      >
                        <option disabled value="">--Select--</option>
                        {isEwallet
                          ? <option value="E-Wallet">E-Wallet</option>
                          : ACCOUNT_TYPE_OPTIONS.filter((t) => t !== 'E-Wallet').map((type) => (
                              <option key={type} value={type}>{type}</option>
                            ))
                        }
                      </select>
                      {errors.accountType && <p className="text-xs text-red-500">{errors.accountType}</p>}

                      <legend className="fieldset-legend">
                        Account Number <span className="text-red-500">*</span>
                      </legend>
                      <input
                        type="text"
                        inputMode="numeric"
                        className={`input input-primary w-full ${errors.accountNumber ? 'input-error' : ''}`}
                        placeholder="Account Number"
                        value={formData.accountNumber}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '')
                          updateForm('accountNumber', value)
                        }}
                      />
                      {errors.accountNumber && <p className="text-xs text-red-500">{errors.accountNumber}</p>}
                    </div>
                  </div>

                  {/* House Ownership + Shelter Damage */}
                  <div className="grid grid-cols-2 gap-x-6 gap-y-4 mt-4">
                    <div className="flex flex-col gap-2">
                      <legend className="fieldset-legend">
                        House Ownership <span className="text-red-500">*</span>
                      </legend>
                      {HOUSE_OWNERSHIP.map((ownership) => (
                        <label key={ownership} className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="radio"
                            name="HOUSE_OWNERSHIP"
                            className="radio radio-primary"
                            value={ownership}
                            checked={formData.houseOwnership === ownership}
                            onChange={(e) => updateForm('houseOwnership', e.target.value)}
                          />
                          <span className="text-sm">{ownership}</span>
                        </label>
                      ))}
                      {errors.houseOwnership && (
                        <p className="text-xs text-red-500">{errors.houseOwnership}</p>
                      )}
                    </div>

                    <div className="flex flex-col gap-2">
                      <legend className="fieldset-legend">
                        Shelter Damage Classification <span className="text-red-500">*</span>
                      </legend>
                      {SHELTER_DMG_CLASSIFICATION.map((shelter) => (
                        <label key={shelter} className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="radio"
                            name="shelter_dmg"
                            className="radio radio-primary"
                            value={shelter}
                            checked={formData.shelterDamage === shelter}
                            onChange={(e) => updateForm('shelterDamage', e.target.value)}
                          />
                          <span className="text-sm">{shelter}</span>
                        </label>
                      ))}
                      {errors.shelterDamage && (
                        <p className="text-xs text-red-500">{errors.shelterDamage}</p>
                      )}
                    </div>
                  </div>

                  {/* Submit error */}
                  {submitError && (
                    <p className="text-sm text-red-500 text-center mt-4">{submitError}</p>
                  )}
                </form>
              )}

              {step === 5 && (
                <div className="flex flex-col items-center gap-6 py-4">

                  {/* Success icon */}
                  <div className="flex flex-col items-center gap-2">
                    <div className="bg-green-100 rounded-full p-4">
                      <CheckCircle size={48} className="text-green-600" />
                    </div>
                    <h2 className="text-xl font-bold text-green-700">Form Submitted Successful!</h2>
                    <p className="text-sm text-slate-500">Matagumpay na naitala ang inyong pamilya.</p>
                  </div>

                  {/* Serial Number — from API response */}
                  <div className="flex flex-col items-center gap-2 w-full">
                    <p className="text-sm text-slate-500 font-medium">Your FACED Serial Number</p>
                    <div className="bg-blue-50 border-2 border-blue-200 border-dashed rounded-xl px-10 py-4 text-center">
                      <p className="text-2xl font-mono font-bold text-blue-900 tracking-widest">
                        {serialNumber}
                      </p>
                    </div>
                    <p className="text-xs text-slate-400 italic text-center">
                      Itala o i-print ang serial number na ito. Ito ang inyong reference sa FACED system.
                    </p>
                  </div>

                  {/* Summary — from formData and location states */}
                  <div className="w-full border border-blue-100 rounded-xl overflow-hidden">
                    <div className="bg-blue-900 px-4 py-2">
                      <p className="text-white text-sm font-semibold">Registration Summary</p>
                    </div>
                    <div className="divide-y divide-blue-50">
                      {[
                        {
                          label: 'Full Name',
                          value: [formData.firstName, formData.middleName, formData.lastName]
                            .filter(Boolean).join(' ')
                        },
                        {
                          label: 'Barangay',
                          value: barangays.find(b => b.code === selectedBarangay)?.name ?? ''
                        },
                        {
                          label: 'Municipality',
                          value: municipalities.find(m => m.code === selectedMunicipality)?.name ?? ''
                        },
                        {
                          label: 'Province',
                          value: provinces.find(p => p.code === selectedProvince)?.name ?? ''
                        },
                        {
                          label: 'Region',
                          value: regions.find(r => r.code === selectedRegion)?.name ?? ''
                        },
                        {
                          label: 'Evacuation Center',
                          value: formData.evacuationCenter || '—'
                        },
                        {
                          label: 'Date Registered',
                          value: new Date().toLocaleDateString('en-PH', {
                            year: 'numeric', month: 'long', day: 'numeric'
                          })
                        },
                      ].map(({ label, value }) => (
                        <div key={label} className="flex justify-between px-4 py-2 text-sm">
                          <span className="text-slate-500">{label}</span>
                          <span className="font-medium text-slate-800">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 w-full">
                    <button
                      type="button"
                      className="btn btn-outline btn-primary flex-1"
                      onClick={() => window.print()}
                    >
                      <Printer size={16} /> Print Confirmation
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary flex-1"
                      onClick={() => router.push('/')}
                    >
                      Back to Home
                    </button>
                  </div>

                </div>
              )}
              
              {/* ── Navigation buttons ── */}
              <div className="flex justify-center gap-1 mt-6">

                {/* Back button — hide on step 5 */}
                {step < 5 && (
                  <button
                    type="button"
                    className="btn btn-outline btn-primary"
                    onClick={handleBack}
                  >
                    Back
                  </button>
                )}

                {/* Next — steps 1 to 3 */}
                {step < 4 && (
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleNext}
                  >
                    Next
                  </button>
                )}

                {step === 4 && (
                <button
                  type="button"
                  className="btn btn-success"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span className="loading loading-spinner loading-sm" />
                      Submitting...
                    </>
                  ) : 'Submit'}
                </button>
              )}

              </div>
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