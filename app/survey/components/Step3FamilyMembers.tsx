'use client'
import { Trash2, LucidePlus, Info } from 'lucide-react'
import {
  RELATION_FAMHEAD, SEX_OPTIONS, EDUCATIONAL_ATTAINMENT, VULNERABILITY_TYPES,
} from '../constants'

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

type Props = {
  members: FamilyMember[]
  errors: Record<string, string>
  onAdd: () => void
  onDelete: (id: number) => void
  onUpdate: (id: number, field: keyof FamilyMember, value: string) => void
}

export function Step3FamilyMembers({ members, errors, onAdd, onDelete, onUpdate }: Props) {
  return (
    <div className="mt-4 flex flex-col gap-4">

      {/* ── Desktop: table ── */}
      <div className="hidden md:block overflow-x-auto rounded-box border border-base-content/5 bg-base-100">
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
                <td>
                  <input type="text"
                    className={`input input-primary w-full input-sm ${errors[`member_${index}_fullName`] ? 'input-error' : ''}`}
                    placeholder="Full Name" value={member.fullName}
                    onChange={(e) => onUpdate(member.id, 'fullName', e.target.value)} />
                  {errors[`member_${index}_fullName`] && (
                    <p className="text-xs text-red-500 mt-1">{errors[`member_${index}_fullName`]}</p>
                  )}
                </td>
                <td>
                  <select
                    className={`select select-primary w-full select-sm ${errors[`member_${index}_relation`] ? 'select-error' : ''}`}
                    value={member.relation}
                    onChange={(e) => onUpdate(member.id, 'relation', e.target.value)}>
                    <option disabled value="">--Select--</option>
                    {RELATION_FAMHEAD.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                  {errors[`member_${index}_relation`] && (
                    <p className="text-xs text-red-500 mt-1">{errors[`member_${index}_relation`]}</p>
                  )}
                </td>
                <td>
                  <input type="date"
                    className={`input input-primary w-full input-sm ${errors[`member_${index}_birthdate`] ? 'input-error' : ''}`}
                    value={member.birthdate}
                    onChange={(e) => {
                      onUpdate(member.id, 'birthdate', e.target.value)
                      const birth = new Date(e.target.value)
                      const today = new Date()
                      let age = today.getFullYear() - birth.getFullYear()
                      const m = today.getMonth() - birth.getMonth()
                      if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
                      onUpdate(member.id, 'age', String(age))
                    }} />
                  {errors[`member_${index}_birthdate`] && (
                    <p className="text-xs text-red-500 mt-1">{errors[`member_${index}_birthdate`]}</p>
                  )}
                </td>
                <td>
                  <input type="text"
                    className="input input-primary input-sm w-full bg-blue-50 opacity-100 cursor-default text-center"
                    placeholder="Auto" value={member.age} readOnly />
                </td>
                <td>
                  <select
                    className={`select select-primary w-full select-sm ${errors[`member_${index}_sex`] ? 'select-error' : ''}`}
                    value={member.sex}
                    onChange={(e) => onUpdate(member.id, 'sex', e.target.value)}>
                    <option disabled value="">--Select--</option>
                    {SEX_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                  {errors[`member_${index}_sex`] && (
                    <p className="text-xs text-red-500 mt-1">{errors[`member_${index}_sex`]}</p>
                  )}
                </td>
                <td>
                  <select
                    className={`select select-primary w-full select-sm ${errors[`member_${index}_education`] ? 'select-error' : ''}`}
                    value={member.education}
                    onChange={(e) => onUpdate(member.id, 'education', e.target.value)}>
                    <option disabled value="">--Select--</option>
                    {EDUCATIONAL_ATTAINMENT.map((e) => <option key={e} value={e}>{e}</option>)}
                  </select>
                  {errors[`member_${index}_education`] && (
                    <p className="text-xs text-red-500 mt-1">{errors[`member_${index}_education`]}</p>
                  )}
                </td>
                <td>
                  <input type="text"
                    className={`input input-primary w-full input-sm ${errors[`member_${index}_occupation`] ? 'input-error' : ''}`}
                    placeholder="Occupation" value={member.occupation}
                    onChange={(e) => onUpdate(member.id, 'occupation', e.target.value)} />
                  {errors[`member_${index}_occupation`] && (
                    <p className="text-xs text-red-500 mt-1">{errors[`member_${index}_occupation`]}</p>
                  )}
                </td>
                <td>
                  <select
                    className={`select select-primary w-full select-sm ${errors[`member_${index}_vulnerability`] ? 'select-error' : ''}`}
                    value={member.vulnerability}
                    onChange={(e) => onUpdate(member.id, 'vulnerability', e.target.value)}>
                    <option disabled value="">--Select--</option>
                    {VULNERABILITY_TYPES.map((v) => <option key={v} value={v}>{v}</option>)}
                  </select>
                  {errors[`member_${index}_vulnerability`] && (
                    <p className="text-xs text-red-500 mt-1">{errors[`member_${index}_vulnerability`]}</p>
                  )}
                </td>
                <td className="text-center">
                  <button type="button"
                    className="btn btn-square btn-sm btn-ghost text-red-500"
                    onClick={() => onDelete(member.id)}
                    disabled={members.length === 1}
                    title={members.length === 1 ? 'At least one member required' : 'Remove'}>
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Mobile: stacked cards ── */}
      <div className="flex flex-col gap-4 md:hidden">
        {members.map((member, index) => (
          <div key={member.id} className="border border-blue-100 rounded-xl p-4 bg-white shadow-sm flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-blue-700 uppercase tracking-wide">
                Member {index + 1}
              </span>
              <button type="button"
                className="btn btn-square btn-sm btn-ghost text-red-400"
                onClick={() => onDelete(member.id)}
                disabled={members.length === 1}>
                <Trash2 size={15} />
              </button>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-500 font-medium">Full Name</label>
              <input type="text"
                className={`input input-primary input-sm w-full ${errors[`member_${index}_fullName`] ? 'input-error' : ''}`}
                placeholder="Full Name" value={member.fullName}
                onChange={(e) => onUpdate(member.id, 'fullName', e.target.value)} />
              {errors[`member_${index}_fullName`] && <p className="text-xs text-red-500">{errors[`member_${index}_fullName`]}</p>}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-slate-500 font-medium">Relation to Head</label>
                <select
                  className={`select select-primary select-sm w-full ${errors[`member_${index}_relation`] ? 'select-error' : ''}`}
                  value={member.relation}
                  onChange={(e) => onUpdate(member.id, 'relation', e.target.value)}>
                  <option disabled value="">--Select--</option>
                  {RELATION_FAMHEAD.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
                {errors[`member_${index}_relation`] && <p className="text-xs text-red-500">{errors[`member_${index}_relation`]}</p>}
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs text-slate-500 font-medium">Sex</label>
                <select
                  className={`select select-primary select-sm w-full ${errors[`member_${index}_sex`] ? 'select-error' : ''}`}
                  value={member.sex}
                  onChange={(e) => onUpdate(member.id, 'sex', e.target.value)}>
                  <option disabled value="">--Select--</option>
                  {SEX_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
                {errors[`member_${index}_sex`] && <p className="text-xs text-red-500">{errors[`member_${index}_sex`]}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-slate-500 font-medium">Birthdate</label>
                <input type="date"
                  className={`input input-primary input-sm w-full ${errors[`member_${index}_birthdate`] ? 'input-error' : ''}`}
                  value={member.birthdate}
                  onChange={(e) => {
                    onUpdate(member.id, 'birthdate', e.target.value)
                    const birth = new Date(e.target.value)
                    const today = new Date()
                    let age = today.getFullYear() - birth.getFullYear()
                    const m = today.getMonth() - birth.getMonth()
                    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
                    onUpdate(member.id, 'age', String(age))
                  }} />
                {errors[`member_${index}_birthdate`] && <p className="text-xs text-red-500">{errors[`member_${index}_birthdate`]}</p>}
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-slate-500 font-medium">Age</label>
                <input type="text"
                  className="input input-primary input-sm w-full bg-blue-50 opacity-100 cursor-default text-center"
                  placeholder="Auto" value={member.age} readOnly />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-500 font-medium">Educational Attainment</label>
              <select
                className={`select select-primary select-sm w-full ${errors[`member_${index}_education`] ? 'select-error' : ''}`}
                value={member.education}
                onChange={(e) => onUpdate(member.id, 'education', e.target.value)}>
                <option disabled value="">--Select--</option>
                {EDUCATIONAL_ATTAINMENT.map((e) => <option key={e} value={e}>{e}</option>)}
              </select>
              {errors[`member_${index}_education`] && <p className="text-xs text-red-500">{errors[`member_${index}_education`]}</p>}
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-500 font-medium flex items-center gap-1">
                Occupation
                <div className="tooltip tooltip-right" data-tip="Put N/A if no work">
                  <Info size={12} className="text-blue-400 cursor-help" />
                </div>
              </label>
              <input type="text"
                className={`input input-primary input-sm w-full ${errors[`member_${index}_occupation`] ? 'input-error' : ''}`}
                placeholder="Occupation" value={member.occupation}
                onChange={(e) => onUpdate(member.id, 'occupation', e.target.value)} />
              {errors[`member_${index}_occupation`] && <p className="text-xs text-red-500">{errors[`member_${index}_occupation`]}</p>}
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-500 font-medium">Type of Vulnerability</label>
              <select
                className={`select select-primary select-sm w-full ${errors[`member_${index}_vulnerability`] ? 'select-error' : ''}`}
                value={member.vulnerability}
                onChange={(e) => onUpdate(member.id, 'vulnerability', e.target.value)}>
                <option disabled value="">--Select--</option>
                {VULNERABILITY_TYPES.map((v) => <option key={v} value={v}>{v}</option>)}
              </select>
              {errors[`member_${index}_vulnerability`] && <p className="text-xs text-red-500">{errors[`member_${index}_vulnerability`]}</p>}
            </div>
          </div>
        ))}
      </div>

      {errors.members && (
        <p className="text-xs text-red-500 text-center">{errors.members}</p>
      )}

      <div className="flex justify-center">
        <button type="button" className="btn btn-soft btn-primary btn-sm" onClick={onAdd}>
          <LucidePlus size={16} /> Add Family Member
        </button>
      </div>
    </div>
  )
}