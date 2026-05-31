'use client'
import { Info } from 'lucide-react'
import { BANK_EWALLET_OPTIONS, ACCOUNT_TYPE_OPTIONS, HOUSE_OWNERSHIP, SHELTER_DMG_CLASSIFICATION } from '../constants'

type Props = {
  formData: {
    bankEwallet: string
    accountName: string
    accountType: string
    accountNumber: string
    houseOwnership: string
    shelterDamage: string
  }
  errors: Record<string, string>
  submitError: string
  isEwallet: boolean
  updateForm: (field: string, value: string | boolean) => void
}

export function Step4AccountInfo({ formData, errors, submitError, isEwallet, updateForm }: Props) {
  return (
    <div className="mt-4 flex flex-col gap-6">

      {/* Notice banner */}
      <div className="card card-xs shadow-sm w-full bg-yellow-200">
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

      {/* Account fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
        {/* Left */}
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label className="fieldset-legend">Bank/E-wallet <span className="text-red-500">*</span></label>
            <select
              className={`select select-primary w-full ${errors.bankEwallet ? 'select-error' : ''}`}
              value={formData.bankEwallet}
              onChange={(e) => updateForm('bankEwallet', e.target.value)}>
              <option disabled value="">--Select Bank / E-Wallet--</option>
              {BANK_EWALLET_OPTIONS.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
            {errors.bankEwallet && <p className="text-xs text-red-500">{errors.bankEwallet}</p>}
          </div>

          <div className="flex flex-col gap-1">
            <label className="fieldset-legend">Account Name <span className="text-red-500">*</span></label>
            <input type="text"
              className={`input input-primary w-full ${errors.accountName ? 'input-error' : ''}`}
              placeholder="Account Name" value={formData.accountName}
              onChange={(e) => updateForm('accountName', e.target.value)} />
            {errors.accountName && <p className="text-xs text-red-500">{errors.accountName}</p>}
          </div>
        </div>

        {/* Right */}
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label className="fieldset-legend">Account Type <span className="text-red-500">*</span></label>
            <select
              className={`select select-primary w-full ${errors.accountType ? 'select-error' : ''}`}
              value={formData.accountType}
              onChange={(e) => updateForm('accountType', e.target.value)}>
              <option disabled value="">--Select--</option>
              {isEwallet
                ? <option value="E-Wallet">E-Wallet</option>
                : ACCOUNT_TYPE_OPTIONS.filter((t) => t !== 'E-Wallet').map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))
              }
            </select>
            {errors.accountType && <p className="text-xs text-red-500">{errors.accountType}</p>}
          </div>

          <div className="flex flex-col gap-1">
            <label className="fieldset-legend">Account Number <span className="text-red-500">*</span></label>
            <input type="text" inputMode="numeric"
              className={`input input-primary w-full ${errors.accountNumber ? 'input-error' : ''}`}
              placeholder="Account Number" value={formData.accountNumber}
              onChange={(e) => {
                const v = e.target.value.replace(/\D/g, '')
                updateForm('accountNumber', v)
              }} />
            {errors.accountNumber && <p className="text-xs text-red-500">{errors.accountNumber}</p>}
          </div>
        </div>
      </div>

      {/* House Ownership + Shelter Damage */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
        <div className="flex flex-col gap-2">
          <label className="fieldset-legend">House Ownership <span className="text-red-500">*</span></label>
          {HOUSE_OWNERSHIP.map((o) => (
            <label key={o} className="flex items-center gap-3 cursor-pointer">
              <input type="radio" name="HOUSE_OWNERSHIP" className="radio radio-primary"
                value={o} checked={formData.houseOwnership === o}
                onChange={(e) => updateForm('houseOwnership', e.target.value)} />
              <span className="text-sm">{o}</span>
            </label>
          ))}
          {errors.houseOwnership && <p className="text-xs text-red-500">{errors.houseOwnership}</p>}
        </div>

        <div className="flex flex-col gap-2">
          <label className="fieldset-legend">Shelter Damage Classification <span className="text-red-500">*</span></label>
          {SHELTER_DMG_CLASSIFICATION.map((s) => (
            <label key={s} className="flex items-center gap-3 cursor-pointer">
              <input type="radio" name="shelter_dmg" className="radio radio-primary"
                value={s} checked={formData.shelterDamage === s}
                onChange={(e) => updateForm('shelterDamage', e.target.value)} />
              <span className="text-sm">{s}</span>
            </label>
          ))}
          {errors.shelterDamage && <p className="text-xs text-red-500">{errors.shelterDamage}</p>}
        </div>
      </div>

      {submitError && (
        <p className="text-sm text-red-500 text-center">{submitError}</p>
      )}
    </div>
  )
}