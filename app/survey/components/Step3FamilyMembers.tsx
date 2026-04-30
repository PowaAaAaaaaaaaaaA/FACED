'use client'

import { useState } from 'react'

import { EDUCATIONAL_ATTAINMENT, VULNERABILITY_TYPES } from '../constants'
import type { FormValues, FamilyMemberLocal } from '../types'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AppForm = any

const EMPTY_MEMBER: FamilyMemberLocal = {
  name: '', relationToHead: '', birthdate: '',
  sex: '', highestEducationalAttainment: '', occupation: '', typeOfVulnerability: '',
}

// Age derived from birthdate — NOT stored in DB (column was dropped in migration)
function deriveAge(birthdate: string): string {
  if (!birthdate) return ''
  return String(new Date().getFullYear() - new Date(birthdate).getFullYear())
}

export function Step3FamilyMembers({ form }: { form: AppForm }) {
  const [members, setMembers] = useState<FamilyMemberLocal[]>([{ ...EMPTY_MEMBER }])

  const addMember = () => {
    setMembers((prev) => {
      const updated = [...prev, { ...EMPTY_MEMBER }]
      form.setFieldValue('familyMembers', updated)
      return updated
    })
  }

  const removeMember = (idx: number) => {
    setMembers((prev) => {
      const updated = prev.filter((_, i) => i !== idx)
      form.setFieldValue('familyMembers', updated)
      return updated
    })
  }

  const updateMember = (idx: number, key: keyof FamilyMemberLocal, value: string) => {
    setMembers((prev) => {
      const updated = [...prev]
      updated[idx]  = { ...updated[idx], [key]: value }
      form.setFieldValue('familyMembers', updated)
      return updated
    })
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-base-content/60">
        Section 25 — List all family members excluding the family head.
      </p>

      <div className="overflow-x-auto rounded-lg border border-base-300">
        <table className="table table-zebra table-sm w-full min-w-[900px]">
          <thead className="bg-blue-900 text-white">
            <tr>
              <th className="text-xs">Family Member</th>
              <th className="text-xs">Relation to Head</th>
              <th className="text-xs">Birthdate</th>
              <th className="text-xs">Age</th>
              <th className="text-xs">Sex</th>
              <th className="text-xs">Highest Educational Attainment</th>
              <th className="text-xs">Occupation</th>
              <th className="text-xs">Type of Vulnerability</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {members.map((member, idx) => (
              <tr key={idx}>
                <td>
                  <input className="input input-bordered input-xs w-32" placeholder="Full name"
                    value={member.name} onChange={(e) => updateMember(idx, 'name', e.target.value)} />
                </td>
                <td>
                  <input className="input input-bordered input-xs w-28" placeholder="e.g. Spouse"
                    value={member.relationToHead} onChange={(e) => updateMember(idx, 'relationToHead', e.target.value)} />
                </td>
                <td>
                  <input type="date" className="input input-bordered input-xs w-36"
                    value={member.birthdate ?? ''} onChange={(e) => updateMember(idx, 'birthdate', e.target.value)} />
                </td>
                {/* Age — read-only, derived from birthdate, NOT sent to DB */}
                <td>
                  <input
                    className="input input-bordered input-xs w-14 bg-base-200 cursor-not-allowed"
                    readOnly
                    value={deriveAge(member.birthdate ?? '')}
                    placeholder="—"
                  />
                </td>
                <td>
                  <select className="select select-bordered select-xs w-20"
                    value={member.sex} onChange={(e) => updateMember(idx, 'sex', e.target.value)}>
                    <option value="">—</option>
                    <option>Male</option>
                    <option>Female</option>
                  </select>
                </td>
                <td>
                  {/* Values match DB CHECK constraint exactly */}
                  <select className="select select-bordered select-xs w-40"
                    value={member.highestEducationalAttainment} onChange={(e) => updateMember(idx, 'highestEducationalAttainment', e.target.value)}>
                    <option value="">Select</option>
                    {EDUCATIONAL_ATTAINMENT.map((e) => <option key={e}>{e}</option>)}
                  </select>
                </td>
                <td>
                  <input className="input input-bordered input-xs w-28" placeholder="Occupation"
                    value={member.occupation ?? ''} onChange={(e) => updateMember(idx, 'occupation', e.target.value)} />
                </td>
                <td>
                  {/* 'None' filtered out before insert into family_vulnerabilities */}
                  <select className="select select-bordered select-xs w-40"
                    value={member.typeOfVulnerability} onChange={(e) => updateMember(idx, 'typeOfVulnerability', e.target.value)}>
                    <option value="">Select</option>
                    {VULNERABILITY_TYPES.map((v) => <option key={v}>{v}</option>)}
                  </select>
                </td>
                <td>
                  {members.length > 1 && (
                    <button type="button" className="btn btn-ghost btn-xs text-error"
                      onClick={() => removeMember(idx)}>✕</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button type="button" className="btn btn-outline btn-sm btn-primary" onClick={addMember}>
        + Add Family Member
      </button>
    </div>
  )
}