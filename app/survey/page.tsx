'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useForm } from '@tanstack/react-form'
import { supabase } from '@/lib/supabase'
import { generateSerialNumber } from '../../lib/psgc'

import { FormSchema, type FormValues, type FamilyMemberLocal, type LocationCodes } from './types'
import { STEPS, INCOME_MAP } from './constants'
import { StepIndicator } from './components/StepIndicator'

export default function SurveyPage() {
  const [step, setStep]= useState(1)

  const form = useForm({
    defaultValues: {
      region: '', province: '', cityMunicipality: '', district: '',
      barangay: '', evacuationCenter: '',
      lastName: '', firstName: '', middleName: '', nameExt: '',
      birthdate: '', birthplace: '',
      sex: '' as 'Male' | 'Female',
      civilStatus: undefined,
      motherMaidenName: '', religion: '', occupation: '',
      monthlyFamilyNetIncome: '',
      idCardPresented: '', idCardNumber: '',
      primaryContactNumber: '', altContactNumber: '',
      houseBlockLotNo: '', street: '', subdivisionVillage: '',
      addressBarangay: '', addressCityMunicipality: '',
      addressProvince: '', zipCode: '',
      fourPsBeneficiary: false, isIP: false, ipEthnicity: '',
      familyMembers: [] as FamilyMemberLocal[],
      bankEwallet: '', accountName: '',
      accountType: undefined, accountNumber: '',
      houseOwnership: undefined, shelterDamage: undefined,
      dataPrivacyConsent: false as unknown as true,
    },
    validators: {
      onSubmit: ({ value }) => {
        const result = FormSchema.safeParse(value)
        if (!result.success) {
          return result.error.issues.map((i) => i.message).join(", ")
        }
        return undefined
      },
    },
    onSubmit: async ({ value }) => {
      if (!locationCodes.barangayCode) {
        setSubmitError('Please select a barangay in Step 1 before submitting.')
        return
      }
      setSubmitting(true)
      setSubmitError('')

      try {
        const serial = await generateSerialNumber(locationCodes.barangayCode)

        // ── 1. Insert form record ──────────────────────────────────
        const { error: formError } = await supabase.from('forms').insert({
          serialNum: serial,
          encodedBy: 1,        // TODO: replace with actual logged-in adminID
          status: 'submitted',
        })
        if (formError) throw formError

        // ── 2. Insert head of family ───────────────────────────────
        // NOTE: age column dropped from DB — do NOT send it
        // Send *_code columns, NOT the old plain-text name columns
        const { data: headData, error: headError } = await supabase
          .from('users')
          .insert({
            serialNum:           serial,
            region_code:         locationCodes.regionCode,
            province_code:       locationCodes.provinceCode,
            municipality_code:   locationCodes.municipalityCode,
            barangay_code:       locationCodes.barangayCode,
            district:            value.district             || null,
            evacuationCenter:    value.evacuationCenter     || null,
            lastName:            value.lastName,
            firstName:           value.firstName,
            middleName:          value.middleName           || null,
            nameExt:             value.nameExt              || null,
            birthdate:           value.birthdate,
            birthplace:          value.birthplace,
            sex:                 value.sex,
            civilStatus:         value.civilStatus          || null,
            motherMaidenName:    value.motherMaidenName     || null,
            religion:            value.religion             || null,
            occupation:          value.occupation           || null,
            // Convert bracket label → numeric(10,2) for DB
            monthlyFamNetIncome: value.monthlyFamilyNetIncome
                                   ? (INCOME_MAP[value.monthlyFamilyNetIncome] ?? null)
                                   : null,
            idCardPresented:     value.idCardPresented      || null,
            idCardNum:           value.idCardNumber         || null,
            contactPNum:         value.primaryContactNumber || null,  // varchar — leading 0 preserved
            contactANum:         value.altContactNumber     || null,  // varchar
            houseBlockLot:       value.houseBlockLotNo      || null,
            street:              value.street               || null,
            subdVillage:         value.subdivisionVillage   || null,
            barangayAdd:         value.addressBarangay      || null,
            cityMunicipalityAdd: value.addressCityMunicipality || null,
            provinceAdd:         value.addressProvince      || null,
            zipCode:             value.zipCode              || null,  // varchar — leading 0 preserved
            fourPsBeneficiary:   value.fourPsBeneficiary,
            isIP:                value.isIP,
            ethnicityType:       value.ipEthnicity          || null,
          })
          .select('headID')
          .single()
        if (headError) throw headError

        const headID = headData.headID

        // ── 3. Insert family members + vulnerabilities ─────────────
        if (value.familyMembers.length > 0) {
          // age column dropped — do NOT send it
          // vulnerabilityType column dropped — goes to family_vulnerabilities table
          const { data: memberData, error: membersError } = await supabase
            .from('family_information')
            .insert(
              value.familyMembers.map((m) => ({
                serialNum:             serial,
                headID,
                relationToFamilyHead:  m.relationToHead,
                birthdate:             m.birthdate             || null,
                sex:                   m.sex                   || null,
                highestEducAttainment: m.highestEducationalAttainment || null,
                occupation:            m.occupation            || null,
              }))
            )
            .select('famMemberID')
          if (membersError) throw membersError

          // Insert into junction table — filter out 'None' and '' (not valid CHECK values)
          const vulnerabilityRows = value.familyMembers.flatMap((m, i) => {
            const type = m.typeOfVulnerability
            if (!type || type === 'None') return []
            return [{ famMemberID: memberData[i].famMemberID, vulnerabilityType: type }]
          })
          if (vulnerabilityRows.length > 0) {
            const { error: vulnError } = await supabase
              .from('family_vulnerabilities')
              .insert(vulnerabilityRows)
            if (vulnError) throw vulnError
          }
        }

        // ── 4. Insert account info ─────────────────────────────────
        if (value.bankEwallet || value.accountNumber || value.houseOwnership) {
          const { error: accError } = await supabase.from('account_info').insert({
            serialNum:          serial,
            headID,
            bankEWallet:        value.bankEwallet      || null,
            accName:            value.accountName      || null,
            accType:            value.accountType      || null,
            accNum:             value.accountNumber    || null,  // varchar — leading zeros preserved
            houseOwnership:     value.houseOwnership   || null,
            shelterDamageClass: value.shelterDamage    || null,
          })
          if (accError) throw accError
        }

        setSerialNum(serial)
        setSubmitted(true)
      } catch (err: unknown) {
        const message = err instanceof Error
          ? err.message
          : 'Something went wrong. Please try again.'
        console.error('Submit error:', err)
        setSubmitError(message)
      } finally {
        setSubmitting(false)
      }
    },
  })

  const handleNext = () => setStep((prev) => Math.min(prev + 1, 4))
  const handleBack = () => setStep((prev) => Math.max(prev - 1, 1))

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
            <p className="text-sm text-base-content/60 mt-1">FACED Digital Registration Form</p>
          </div>

          <StepIndicator currentStep={step} />

          <div className="bg-white rounded-2xl shadow-lg border border-blue-100 p-8">
            <div className="mb-6 pb-4 border-b border-base-200">
              <span className="badge badge-primary badge-outline mb-2">
                Part {step} of {STEPS.length}
              </span>
              <h2 className="text-lg font-bold text-blue-900">{STEPS[step - 1].title}</h2>
            </div>

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