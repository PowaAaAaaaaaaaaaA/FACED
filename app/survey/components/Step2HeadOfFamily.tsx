'use client'

import type { AnyFieldApi } from '@tanstack/react-form'
import { useStore } from '@tanstack/react-store'
import { FormField, firstError } from './FormField'
import {
  CIVIL_STATUS_OPTIONS,
  SEX_OPTIONS,
  INCOME_BRACKETS,
} from '../constants'
import type { FormValues } from '../types'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AppForm = any

export function Step2HeadOfFamily({ form }: { form: AppForm }) {
  // Derive age for display only — age column was dropped from DB
  const birthdate = useStore(form.store, (s: { values: FormValues }) => s.values.birthdate)
  const derivedAge = birthdate
    ? new Date().getFullYear() - new Date(birthdate).getFullYear()
    : null

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        <form.Field name="lastName">
          {(field: AnyFieldApi) => (
            <FormField label="7. Last Name" required error={firstError(field)}>
              <input className="input input-bordered w-full" placeholder="Last name"
                value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} onBlur={field.handleBlur} />
            </FormField>
          )}
        </form.Field>

        <form.Field name="firstName">
          {(field: AnyFieldApi) => (
            <FormField label="8. First Name" required error={firstError(field)}>
              <input className="input input-bordered w-full" placeholder="First name"
                value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} onBlur={field.handleBlur} />
            </FormField>
          )}
        </form.Field>

        <form.Field name="middleName">
          {(field: AnyFieldApi) => (
            <FormField label="9. Middle Name">
              <input className="input input-bordered w-full" placeholder="Middle name"
                value={field.state.value ?? ''} onChange={(e) => field.handleChange(e.target.value)} />
            </FormField>
          )}
        </form.Field>

        <form.Field name="nameExt">
          {(field: AnyFieldApi) => (
            <FormField label="10. Name Extension (Jr., Sr., I, II)">
              <input className="input input-bordered w-full" placeholder="e.g. Jr., Sr., II"
                value={field.state.value ?? ''} onChange={(e) => field.handleChange(e.target.value)} />
            </FormField>
          )}
        </form.Field>

      </div>

      <div className="divider text-xs text-base-content/50">Personal Details</div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        <form.Field name="birthdate">
          {(field: AnyFieldApi) => (
            <FormField label="11. Birthdate" required error={firstError(field)}>
              <input type="date" className="input input-bordered w-full"
                value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} onBlur={field.handleBlur} />
            </FormField>
          )}
        </form.Field>

        {/* 12. Age — display only, derived from birthdate, NOT stored in DB */}
        <div className="form-control w-full">
          <label className="label pb-1">
            <span className="label-text font-medium text-base-content">12. Age</span>
          </label>
          <input
            className="input input-bordered w-full bg-base-200 cursor-not-allowed"
            readOnly
            value={derivedAge !== null ? String(derivedAge) : '—'}
            placeholder="Auto-calculated"
          />
          <label className="label pt-1">
            <span className="label-text-alt text-base-content/40">Calculated from birthdate</span>
          </label>
        </div>

        <form.Field name="birthplace">
          {(field: AnyFieldApi) => (
            <FormField label="13. Birthplace" required error={firstError(field)}>
              <input className="input input-bordered w-full" placeholder="Place of birth"
                value={field.state.value ?? ''} onChange={(e) => field.handleChange(e.target.value)} onBlur={field.handleBlur} />
            </FormField>
          )}
        </form.Field>

        <form.Field name="sex">
          {(field: AnyFieldApi) => (
            <FormField label="14. Sex" required error={firstError(field)}>
              <select className="select select-bordered w-full" value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value as 'Male' | 'Female')} onBlur={field.handleBlur}>
                <option value="">Select</option>
                {SEX_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </FormField>
          )}
        </form.Field>

        <form.Field name="civilStatus">
          {(field: AnyFieldApi) => (
            <FormField label="15. Civil Status" error={firstError(field)}>
              <select className="select select-bordered w-full" value={field.state.value ?? ''}
                onChange={(e) => field.handleChange(e.target.value as FormValues['civilStatus'])}>
                <option value="">Select</option>
                {CIVIL_STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </FormField>
          )}
        </form.Field>

        <form.Field name="motherMaidenName">
          {(field: AnyFieldApi) => (
            <FormField label="16. Mother's Maiden Name">
              <input className="input input-bordered w-full" placeholder="Mother's maiden name"
                value={field.state.value ?? ''} onChange={(e) => field.handleChange(e.target.value)} />
            </FormField>
          )}
        </form.Field>

        <form.Field name="religion">
          {(field: AnyFieldApi) => (
            <FormField label="17. Religion">
              <input className="input input-bordered w-full" placeholder="Religion"
                value={field.state.value ?? ''} onChange={(e) => field.handleChange(e.target.value)} />
            </FormField>
          )}
        </form.Field>

        <form.Field name="occupation">
          {(field: AnyFieldApi) => (
            <FormField label="18. Occupation">
              <input className="input input-bordered w-full" placeholder="Occupation"
                value={field.state.value ?? ''} onChange={(e) => field.handleChange(e.target.value)} />
            </FormField>
          )}
        </form.Field>

        <form.Field name="monthlyFamilyNetIncome">
          {(field: AnyFieldApi) => (
            <FormField label="19. Monthly Family Net Income">
              <select className="select select-bordered w-full" value={field.state.value ?? ''}
                onChange={(e) => field.handleChange(e.target.value)}>
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
              <input className="input input-bordered w-full" placeholder="e.g. PhilSys, Driver's License"
                value={field.state.value ?? ''} onChange={(e) => field.handleChange(e.target.value)} />
            </FormField>
          )}
        </form.Field>

        <form.Field name="idCardNumber">
          {(field: AnyFieldApi) => (
            <FormField label="21. ID Card Number">
              <input className="input input-bordered w-full" placeholder="ID number"
                value={field.state.value ?? ''} onChange={(e) => field.handleChange(e.target.value)} />
            </FormField>
          )}
        </form.Field>

        {/* varchar in DB — never strip leading zeros */}
        <form.Field name="primaryContactNumber">
          {(field: AnyFieldApi) => (
            <FormField label="22. Contact Number – Primary" required error={firstError(field)}>
              <input className="input input-bordered w-full" placeholder="09XXXXXXXXX"
                value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} onBlur={field.handleBlur} />
            </FormField>
          )}
        </form.Field>

        <form.Field name="altContactNumber">
          {(field: AnyFieldApi) => (
            <FormField label="22. Contact Number – Alternate" error={firstError(field)}>
              <input className="input input-bordered w-full" placeholder="Alternate number"
                value={field.state.value ?? ''} onChange={(e) => field.handleChange(e.target.value)} />
            </FormField>
          )}
        </form.Field>

      </div>

      <div className="divider text-xs text-base-content/50">23. Permanent Address</div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {(
          [
            ['houseBlockLotNo',         'House / Block / Lot No.',  'House/Block/Lot No.'],
            ['street',                  'Street',                   'Street'],
            ['subdivisionVillage',      'Subd. / Village',          'Subdivision or village'],
            ['addressBarangay',         'Barangay',                 'Barangay'],
            ['addressCityMunicipality', 'City / Municipality',      'City or Municipality'],
            ['addressProvince',         'Province',                 'Province'],
            ['zipCode',                 'Zip Code',                 'e.g. 2300'],  // varchar — leading zeros preserved
          ] as [keyof FormValues, string, string][]
        ).map(([name, label, placeholder]) => (
          <form.Field key={name} name={name}>
            {(field: AnyFieldApi) => (
              <FormField label={label}>
                <input
                  className="input input-bordered w-full"
                  placeholder={placeholder}
                  value={(field.state.value as string) ?? ''}
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
              <input type="checkbox" className="checkbox checkbox-primary"
                checked={field.state.value} onChange={(e) => field.handleChange(e.target.checked)} />
              <span className="label-text font-medium">4Ps Beneficiary</span>
            </label>
          )}
        </form.Field>

        <form.Field name="isIP">
          {(field: AnyFieldApi) => (
            <label className="label cursor-pointer gap-3">
              <input type="checkbox" className="checkbox checkbox-primary"
                checked={field.state.value} onChange={(e) => field.handleChange(e.target.checked)} />
              <span className="label-text font-medium">IP (Indigenous People)</span>
            </label>
          )}
        </form.Field>
      </div>

      <form.Field name="ipEthnicity">
        {(field: AnyFieldApi) => (
          <FormField label="Type of Ethnicity (if IP)">
            <input className="input input-bordered w-full" placeholder="Specify ethnicity"
              value={field.state.value ?? ''} onChange={(e) => field.handleChange(e.target.value)} />
          </FormField>
        )}
      </form.Field>
    </div>
  )
}