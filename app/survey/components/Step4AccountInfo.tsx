'use client'

import type { AnyFieldApi } from '@tanstack/react-form'

import { FormField, firstError } from './FormField'
import { BANK_EWALLET_OPTIONS } from '../constants'
import type { FormValues } from '../types'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AppForm = any

export function Step4AccountInfo({ form }: { form: AppForm }) {
  return (
    <div className="space-y-6">

      {/* Account Information */}
      <div>
        <h3 className="font-semibold text-base-content mb-1">Account Information</h3>
        <p className="text-xs text-base-content/60 mb-4">
          Note: In case the family head does not have a bank or an e-wallet account,
          any of the family members with a validated account can be indicated.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          <form.Field name="bankEwallet">
            {(field: AnyFieldApi) => (
              <FormField label="26. Bank / E-Wallet">
                <select className="select select-bordered w-full" value={field.state.value ?? ''}
                  onChange={(e) => field.handleChange(e.target.value)}>
                  <option value="">Select bank or e-wallet</option>
                  {BANK_EWALLET_OPTIONS.map((b) => <option key={b}>{b}</option>)}
                </select>
              </FormField>
            )}
          </form.Field>

          <form.Field name="accountName">
            {(field: AnyFieldApi) => (
              <FormField label="27. Account Name">
                <input className="input input-bordered w-full" placeholder="Account name"
                  value={field.state.value ?? ''} onChange={(e) => field.handleChange(e.target.value)} />
              </FormField>
            )}
          </form.Field>

          <form.Field name="accountType">
            {(field: AnyFieldApi) => (
              <FormField label="28. Account Type">
                <select className="select select-bordered w-full" value={field.state.value ?? ''}
                  onChange={(e) => field.handleChange(e.target.value as FormValues['accountType'])}>
                  <option value="">Select account type</option>
                  <option value="Savings">Savings</option>
                  <option value="Checking">Checking</option>
                  <option value="E-Wallet">E-Wallet</option>
                </select>
              </FormField>
            )}
          </form.Field>

          {/* varchar in DB — leading zeros preserved, never cast to int */}
          <form.Field name="accountNumber">
            {(field: AnyFieldApi) => (
              <FormField label="29. Account Number">
                <input className="input input-bordered w-full" placeholder="Account number"
                  value={field.state.value ?? ''} onChange={(e) => field.handleChange(e.target.value)} />
              </FormField>
            )}
          </form.Field>

        </div>
      </div>

      <div className="divider" />

      {/* 30. House Ownership — matches DB CHECK: 'Owner' | 'Renter' | 'Sharer' */}
      <div>
        <h3 className="font-semibold text-base-content mb-3">30. House Ownership</h3>
        <form.Field name="houseOwnership">
          {(field: AnyFieldApi) => (
            <div className="flex flex-wrap gap-4">
              {(['Owner', 'Renter', 'Sharer'] as const).map((opt) => (
                <label key={opt} className="label cursor-pointer gap-3">
                  <input type="radio" className="radio radio-primary" name="houseOwnership"
                    value={opt} checked={field.state.value === opt}
                    onChange={() => field.handleChange(opt)} />
                  <span className="label-text font-medium">{opt}</span>
                </label>
              ))}
            </div>
          )}
        </form.Field>
      </div>

      {/* 31. Shelter Damage — matches DB CHECK: 'Partially Damaged' | 'Totally Damaged' */}
      <div>
        <h3 className="font-semibold text-base-content mb-3">31. Shelter Damage Classification</h3>
        <form.Field name="shelterDamage">
          {(field: AnyFieldApi) => (
            <div className="flex flex-wrap gap-4">
              {(['Partially Damaged', 'Totally Damaged'] as const).map((opt) => (
                <label key={opt} className="label cursor-pointer gap-3">
                  <input type="radio" className="radio radio-warning" name="shelterDamage"
                    value={opt} checked={field.state.value === opt}
                    onChange={() => field.handleChange(opt)} />
                  <span className="label-text font-medium">{opt}</span>
                </label>
              ))}
            </div>
          )}
        </form.Field>
      </div>

      <div className="divider" />

      {/* 32. Data Privacy Declaration */}
      <div className="alert alert-info">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div>
          <h4 className="font-bold text-sm">32. Data Privacy Declaration</h4>
          <p className="text-xs">
            All data and information indicated herein shall be used for identification purposes for the
            implementation of disaster risk reduction and management (DRRM) programs, projects, and activities
            and its disclosure shall be in compliance to Republic Act 10173 (Data Privacy Act of 2012).
          </p>
        </div>
      </div>

      <form.Field name="dataPrivacyConsent">
        {(field: AnyFieldApi) => (
          <div>
            <label className="label cursor-pointer gap-3 justify-start">
              <input type="checkbox" className="checkbox checkbox-primary"
                checked={field.state.value} onChange={(e) => field.handleChange(e.target.checked)} />
              <span className="label-text">I have read and agree to the Data Privacy Declaration above.</span>
            </label>
            {firstError(field) && (
              <p className="text-error text-xs mt-1">{firstError(field)}</p>
            )}
          </div>
        )}
      </form.Field>

    </div>
  )
}