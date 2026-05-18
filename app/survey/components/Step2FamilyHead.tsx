'use client'
import { Info } from 'lucide-react'
import {
  CIVIL_STATUS_OPTIONS, SEX_OPTIONS, RELIGIONS,
  INCOME_BRACKETS, VALID_IDS,
} from '../constants'

type FormData = {
  lastName: string
  firstName: string
  middleName: string
  nameExtension: string
  birthdate: string
  age: string
  birthplace: string
  sex: string
  civilStatus: string
  mothersMaidenName: string
  religion: string
  occupation: string
  monthlyFamilyNetIncome: string
  idCardPresented: string
  idCardNumber: string
  contactPrimary: string
  contactAlternate: string
  houseNo: string
  street: string
  subdivision: string
  addressBarangay: string
  addressMunicipality: string
  addressProvince: string
  zipCode: string
  is4psBeneficiary: boolean
  isIndigenousPeople: boolean
  ipEthnicity: string
}

type Props = {
  formData: FormData
  errors: Record<string, string>
  updateForm: (field: string, value: string | boolean) => void
  calculateAge: (birthdate: string) => string
}

export function Step2FamilyHead({ formData, errors, updateForm, calculateAge }: Props) {
  return (
    <div className="mt-4 flex flex-col gap-6">

      {/* Personal Info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">

        {/* Left column */}
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label className="fieldset-legend">Last Name <span className="text-red-500">*</span></label>
            <input type="text"
              className={`input input-primary w-full ${errors.lastName ? 'input-error' : ''}`}
              placeholder="Last Name" value={formData.lastName}
              onChange={(e) => updateForm('lastName', e.target.value)} />
            {errors.lastName && <p className="text-xs text-red-500">{errors.lastName}</p>}
          </div>

          <div className="flex flex-col gap-1">
            <label className="fieldset-legend">First Name <span className="text-red-500">*</span></label>
            <input type="text"
              className={`input input-primary w-full ${errors.firstName ? 'input-error' : ''}`}
              placeholder="First Name" value={formData.firstName}
              onChange={(e) => updateForm('firstName', e.target.value)} />
            {errors.firstName && <p className="text-xs text-red-500">{errors.firstName}</p>}
          </div>

          <div className="flex flex-col gap-1">
            <label className="fieldset-legend">Middle Name</label>
            <input type="text" className="input input-primary w-full"
              placeholder="Middle Name" value={formData.middleName}
              onChange={(e) => updateForm('middleName', e.target.value)} />
          </div>

          <div className="flex flex-col gap-1">
            <label className="fieldset-legend">Name Extension</label>
            <input type="text" className="input input-primary w-full"
              placeholder="Jr., Sr., III" value={formData.nameExtension}
              onChange={(e) => updateForm('nameExtension', e.target.value)} />
          </div>

          <div className="flex flex-col gap-1">
            <label className="fieldset-legend">Birthdate <span className="text-red-500">*</span></label>
            <input type="date"
              className={`input input-primary w-full ${errors.birthdate ? 'input-error' : ''}`}
              value={formData.birthdate}
              onChange={(e) => {
                updateForm('birthdate', e.target.value)
                updateForm('age', calculateAge(e.target.value))
              }} />
            {errors.birthdate && <p className="text-xs text-red-500">{errors.birthdate}</p>}
          </div>

          <div className="flex flex-col gap-1">
            <label className="fieldset-legend">Age</label>
            <input type="text" className="input input-primary w-full bg-blue-50 opacity-100"
              placeholder="Auto-calculated" value={formData.age} readOnly />
          </div>

          <div className="flex flex-col gap-1">
            <label className="fieldset-legend">Birthplace <span className="text-red-500">*</span></label>
            <input type="text"
              className={`input input-primary w-full ${errors.birthplace ? 'input-error' : ''}`}
              placeholder="Birthplace" value={formData.birthplace}
              onChange={(e) => updateForm('birthplace', e.target.value)} />
            {errors.birthplace && <p className="text-xs text-red-500">{errors.birthplace}</p>}
          </div>

          <div className="flex flex-col gap-1">
            <label className="fieldset-legend">Sex <span className="text-red-500">*</span></label>
            <select className={`select select-primary w-full ${errors.sex ? 'select-error' : ''}`}
              value={formData.sex} onChange={(e) => updateForm('sex', e.target.value)}>
              <option disabled value="">--Select--</option>
              {SEX_OPTIONS.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
            </select>
            {errors.sex && <p className="text-xs text-red-500">{errors.sex}</p>}
          </div>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label className="fieldset-legend">Civil Status <span className="text-red-500">*</span></label>
            <select className={`select select-primary w-full ${errors.civilStatus ? 'select-error' : ''}`}
              value={formData.civilStatus} onChange={(e) => updateForm('civilStatus', e.target.value)}>
              <option disabled value="">--Select Status--</option>
              {CIVIL_STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            {errors.civilStatus && <p className="text-xs text-red-500">{errors.civilStatus}</p>}
          </div>

          <div className="flex flex-col gap-1">
            <label className="fieldset-legend">Mother&apos;s Maiden Name <span className="text-red-500">*</span></label>
            <input type="text"
              className={`input input-primary w-full ${errors.mothersMaidenName ? 'input-error' : ''}`}
              placeholder="Mother's Maiden Name" value={formData.mothersMaidenName}
              onChange={(e) => updateForm('mothersMaidenName', e.target.value)} />
            {errors.mothersMaidenName && <p className="text-xs text-red-500">{errors.mothersMaidenName}</p>}
          </div>

          <div className="flex flex-col gap-1">
            <label className="fieldset-legend">Religion <span className="text-red-500">*</span></label>
            <select className={`select select-primary w-full ${errors.religion ? 'select-error' : ''}`}
              value={formData.religion} onChange={(e) => updateForm('religion', e.target.value)}>
              <option disabled value="">--Select Religion--</option>
              {RELIGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
            {errors.religion && <p className="text-xs text-red-500">{errors.religion}</p>}
          </div>

          <div className="flex flex-col gap-1">
            <label className="fieldset-legend flex items-center gap-1">
              Occupation <span className="text-red-500">*</span>
              <div className="tooltip tooltip-right" data-tip="Put N/A if no work">
                <Info size={14} className="text-secondary cursor-help" />
              </div>
            </label>
            <input type="text"
              className={`input input-primary w-full ${errors.occupation ? 'input-error' : ''}`}
              placeholder="Occupation" value={formData.occupation}
              onChange={(e) => updateForm('occupation', e.target.value)} />
            {errors.occupation && <p className="text-xs text-red-500">{errors.occupation}</p>}
          </div>

          <div className="flex flex-col gap-1">
            <label className="fieldset-legend">Monthly Family Net Income <span className="text-red-500">*</span></label>
            <select className={`select select-primary w-full ${errors.monthlyFamilyNetIncome ? 'select-error' : ''}`}
              value={formData.monthlyFamilyNetIncome}
              onChange={(e) => updateForm('monthlyFamilyNetIncome', e.target.value)}>
              <option disabled value="">--Select Income Bracket--</option>
              {INCOME_BRACKETS.map((i) => <option key={i} value={i}>{i}</option>)}
            </select>
            {errors.monthlyFamilyNetIncome && <p className="text-xs text-red-500">{errors.monthlyFamilyNetIncome}</p>}
          </div>

          <div className="flex flex-col gap-1">
            <label className="fieldset-legend">ID Card Presented <span className="text-red-500">*</span></label>
            <select className={`select select-primary w-full ${errors.idCardPresented ? 'select-error' : ''}`}
              value={formData.idCardPresented}
              onChange={(e) => updateForm('idCardPresented', e.target.value)}>
              <option disabled value="">--Select ID--</option>
              {VALID_IDS.map((id) => <option key={id} value={id}>{id}</option>)}
            </select>
            {errors.idCardPresented && <p className="text-xs text-red-500">{errors.idCardPresented}</p>}
          </div>

          <div className="flex flex-col gap-1">
            <label className="fieldset-legend flex items-center gap-1">
              ID Card Number <span className="text-red-500">*</span>
              <div className="tooltip tooltip-right" data-tip="Please double check the ID Card Number">
                <Info size={14} className="text-secondary cursor-help" />
              </div>
            </label>
            <input type="text"
              className={`input input-primary w-full ${errors.idCardNumber ? 'input-error' : ''}`}
              placeholder="ID Card Number" value={formData.idCardNumber}
              onChange={(e) => updateForm('idCardNumber', e.target.value)} />
            {errors.idCardNumber && <p className="text-xs text-red-500">{errors.idCardNumber}</p>}
          </div>

          {/* Contact numbers */}
          <div className="flex flex-col gap-1">
            <label className="fieldset-legend">Contact Number <span className="text-red-500">*</span></label>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex flex-col gap-1 flex-1">
                <input type="text" inputMode="tel" maxLength={13}
                  className={`input input-primary w-full ${errors.contactPrimary ? 'input-error' : ''}`}
                  placeholder="Primary — 09XXXXXXXXX" value={formData.contactPrimary}
                  onChange={(e) => {
                    let v = e.target.value.trim()
                    if (v.startsWith('+63')) v = '0' + v.slice(3)
                    v = v.replace(/\D/g, '')
                    if (v.length <= 11) updateForm('contactPrimary', v)
                  }} />
                {errors.contactPrimary && <p className="text-xs text-red-500">{errors.contactPrimary}</p>}
              </div>
              <div className="flex-1">
                <input type="text" inputMode="tel" maxLength={13}
                  className="input input-primary w-full"
                  placeholder="Alternate — optional" value={formData.contactAlternate}
                  onChange={(e) => {
                    let v = e.target.value.trim()
                    if (v.startsWith('+63')) v = '0' + v.slice(3)
                    v = v.replace(/\D/g, '')
                    if (v.length <= 11) updateForm('contactAlternate', v)
                  }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Permanent Address */}
      <div className="flex flex-col gap-2">
        <label className="fieldset-legend text-base font-semibold">
          Permanent Address <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
          <div className="flex flex-col gap-2">
            <div>
              <input type="text"
                className={`input input-primary w-full ${errors.houseNo ? 'input-error' : ''}`}
                placeholder="House/Block/Lot No. *" value={formData.houseNo}
                onChange={(e) => updateForm('houseNo', e.target.value)} />
              {errors.houseNo && <p className="text-xs text-red-500 mt-1">{errors.houseNo}</p>}
            </div>
            <input type="text" className="input input-primary w-full"
              placeholder="Street" value={formData.street}
              onChange={(e) => updateForm('street', e.target.value)} />
            <input type="text" className="input input-primary w-full"
              placeholder="Subd./Village" value={formData.subdivision}
              onChange={(e) => updateForm('subdivision', e.target.value)} />
            <div>
              <input type="text"
                className={`input input-primary w-full ${errors.addressBarangay ? 'input-error' : ''}`}
                placeholder="Barangay *" value={formData.addressBarangay}
                onChange={(e) => updateForm('addressBarangay', e.target.value)} />
              {errors.addressBarangay && <p className="text-xs text-red-500 mt-1">{errors.addressBarangay}</p>}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <div>
              <input type="text"
                className={`input input-primary w-full ${errors.addressMunicipality ? 'input-error' : ''}`}
                placeholder="City/Municipality *" value={formData.addressMunicipality}
                onChange={(e) => updateForm('addressMunicipality', e.target.value)} />
              {errors.addressMunicipality && <p className="text-xs text-red-500 mt-1">{errors.addressMunicipality}</p>}
            </div>
            <div>
              <input type="text"
                className={`input input-primary w-full ${errors.addressProvince ? 'input-error' : ''}`}
                placeholder="Province *" value={formData.addressProvince}
                onChange={(e) => updateForm('addressProvince', e.target.value)} />
              {errors.addressProvince && <p className="text-xs text-red-500 mt-1">{errors.addressProvince}</p>}
            </div>
            <div>
              <input type="text" inputMode="numeric" pattern="[0-9]*" maxLength={4}
                className={`input input-primary w-full ${errors.zipCode ? 'input-error' : ''}`}
                placeholder="Zip Code *" value={formData.zipCode}
                onChange={(e) => {
                  const v = e.target.value.replace(/\D/g, '')
                  if (v.length <= 4) updateForm('zipCode', v)
                }} />
              {errors.zipCode && <p className="text-xs text-red-500 mt-1">{errors.zipCode}</p>}
            </div>
          </div>
        </div>
      </div>

      {/* Others */}
      <div className="flex flex-col gap-3">
        <label className="fieldset-legend text-base font-semibold">Others</label>
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" className="checkbox checkbox-primary"
            checked={formData.is4psBeneficiary}
            onChange={(e) => updateForm('is4psBeneficiary', e.target.checked)} />
          <span className="text-sm">4Ps Beneficiary</span>
        </label>
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" className="checkbox checkbox-primary"
            checked={formData.isIndigenousPeople}
            onChange={(e) => updateForm('isIndigenousPeople', e.target.checked)} />
          <span className="text-sm">Indigenous People (IP)</span>
        </label>
        {formData.isIndigenousPeople && (
          <div className="flex flex-col gap-1 ml-7">
            <label className="fieldset-legend">Type of Ethnicity</label>
            <input type="text" className="input input-primary w-full"
              placeholder="e.g. Igorot, Aeta, Mangyan"
              value={formData.ipEthnicity}
              onChange={(e) => updateForm('ipEthnicity', e.target.value)} />
          </div>
        )}
      </div>

    </div>
  )
}