'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useForm } from '@tanstack/react-form'
import { supabase } from '@/lib/supabase'
import { generateSerialNumber } from '../../lib/psgc'
import { Pencil, Trash2, LucidePlus, Info } from 'lucide-react'

import { STEPS, INCOME_MAP, CIVIL_STATUS_OPTIONS, SEX_OPTIONS, RELIGIONS, INCOME_BRACKETS, VALID_IDS, RELATION_FAMHEAD, EDUCATIONAL_ATTAINMENT, VULNERABILITY_TYPES, BANK_EWALLET_OPTIONS, ACCOUNT_TYPE_OPTIONS, HOUSE_OWNERSHIP, SHELTER_DMG_CLASSIFICATION } from './constants'
import { StepIndicator } from './components/StepIndicator'
type FamilyMember = {
  id:number
  fullName:string
  relation: string
  birthdate: string
  age: string
  sex: string
  education: string
  occupation: string
  vulnerability: string
}

export default function SurveyPage() {

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
    // Don't allow deleting the last row
    if (members.length === 1) return
    setMembers((prev) => prev.filter((m) => m.id !== id))
    console.log('Deleted member')
  }

  // Update a specific field in a specific row
  const updateMember = (id: number, field: keyof FamilyMember, value: string) => {
    setMembers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, [field]: value } : m))
    )
  }

  const EWALLET_NAMES = ['GCash', 'Maya (PayMaya)', 'ShopeePay', 'SeaBank']
  const [selectedProvider, setSelectedProvider] = useState('')
  const isEwallet = EWALLET_NAMES.includes(selectedProvider)

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
                      <select className="select select-primary w-full">
                        <option disabled>Select Region</option>
                        <option>Region III</option>
                      </select>
                    </div>

                    {/* Province */}
                    <div className="flex flex-col gap-1">
                      <label className="fieldset-legend">Province</label>
                      <select className="select select-primary w-full">
                        <option disabled>Select Province</option>
                        <option>Tarlac</option>
                      </select>
                    </div>

                    {/* City/Municipality */}
                    <div className="flex flex-col gap-1">
                      <label className="fieldset-legend">City / Municipality</label>
                      <select className="select select-primary w-full">
                        <option disabled>Select City/Municipality</option>
                        <option>Paniqui</option>
                      </select>
                    </div>

                    {/* District */}
                    <div className="flex flex-col gap-1">
                      <label className="fieldset-legend">District</label>
                      <select className="select select-primary w-full">
                        <option disabled>Select District</option>
                        <option>1st District</option>
                      </select>
                    </div>

                    {/* Barangay */}
                    <div className="flex flex-col gap-1">
                      <label className="fieldset-legend">Barangay</label>
                      <select className="select select-primary w-full">
                        <option disabled>Select Barangay</option>
                        <option>Abogado</option>
                      </select>
                    </div>

                    {/* Evacuation Center — full width since it's the last odd one */}
                    <div className="flex flex-col gap-1 col-span-2">
                      <label className="fieldset-legend">Evacuation Center / Site</label>
                      <input
                        type="text"
                        className="input input-primary w-full"
                        placeholder="Enter evacuation center or site"
                      />
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
                      <legend className="fieldset-legend">Last Name</legend>
                      <input type="text" className="input input-primary w-full" placeholder="Last Name" />

                      <legend className="fieldset-legend">First Name</legend>
                      <input type="text" className="input input-primary w-full" placeholder="First Name" />

                      <legend className="fieldset-legend">Middle Name</legend>
                      <input type="text" className="input input-primary w-full" placeholder="Middle Name" />

                      <legend className="fieldset-legend">Name Extension</legend>
                      <input type="text" className="input input-primary w-full" placeholder="Name Extension" />

                      <legend className="fieldset-legend">Birthdate</legend>
                      <input type="date" className="input input-primary w-full" />

                      <legend className="fieldset-legend">Age</legend>
                      <input type="text" className="input input-primary w-full" placeholder="Age" />

                      <legend className="fieldset-legend">Birthplace</legend>
                      <input type="text" className="input input-primary w-full" placeholder="Birthplace" />

                      <legend className="fieldset-legend">Sex</legend>
                      <select className="select select-primary w-full">
                        <option disabled>--Select--</option>
                        {SEX_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>

                    {/* right side */}
                    <div className="flex flex-col gap-1">
                      <legend className="fieldset-legend">Civil Status</legend>
                      <select className="select select-primary w-full">
                        <option disabled>--Select Status--</option>
                        {CIVIL_STATUS_OPTIONS.map((status) => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </select>

                      <legend className="fieldset-legend">Mother&apos;s Maiden Name</legend>
                      <input type="text" className="input input-primary w-full" placeholder="Mother&apos;s Maiden Name" />

                      <legend className="fieldset-legend">Religion</legend>
                      <select className='select select-primary w-full'>
                        <option disabled>--Select Religion--</option>
                        {RELIGIONS.map((religion) => (
                          <option key={religion} value={religion}>{religion}</option>
                        ))}
                      </select>

                      <legend className="fieldset-legend">Occupation</legend>
                      <input type="text" className="input input-primary w-full" placeholder="Occupation" />

                      <legend className="fieldset-legend">Monthly Family Net Income</legend>
                      <select className='select select-primary w-full'>
                        <option disabled>--Select Income Bracket</option>
                        {INCOME_BRACKETS.map((income) => (
                          <option key={income} value={income}>{income}</option>
                        ))}
                      </select>

                      <legend className="fieldset-legend">ID Card Presented</legend>
                      <select className='select select-primary w-full'>
                        <option disabled>--Select ID--</option>
                        {VALID_IDS.map((validID) => (
                          <option key={validID} value={validID}>{validID}</option>
                        ))}
                      </select>

                      <legend className="fieldset-legend">ID Card Number</legend>
                      <input type="text" className="input input-primary w-full" placeholder="ID Card Number" />

                      <legend className="fieldset-legend">Contact Number</legend>
                      <div className='flex flex-row w-full'>
                        <input type="text" className="input input-primary w-full" placeholder="Primary Contact Number" />
                        <div className="divider divider-secondary divider-horizontal"></div>
                        <input type="text" className="input input-primary" placeholder="Alternative Contact Number w-full" />
                      </div>
                    </div> 
                  </div>

                  {/* bottom */}
                  {/* Permanent address */}
                  <legend className="fieldset-legend max-w-full">Permanent Address</legend>
                  <div className='grid grid-cols-2 gap-x-6 gap-y-4'>
                    <div className="flex flex-col gap-1">

                      <input type="text" className="input input-primary w-full" placeholder="House/Block/Lot No." />
                      <input type="text" className="input input-primary w-full" placeholder="Street" />
                      <input type="text" className="input input-primary w-full" placeholder="Sub./Village" />
                      <input type="text" className="input input-primary w-full" placeholder="Barangay" />
                    </div>

                    <div className="flex flex-col gap-1">
                      <input type="text" className="input input-primary w-full" placeholder="City/Municipality" />
                      <input type="text" className="input input-primary w-full" placeholder="Province" />
                      <input type="text" className="input input-primary w-full" placeholder="Zip Code" />
                    </div>
                  </div>


                  {/* Others */}
                  <div className="flex flex-col gap-3">
                    <label className="fieldset-legend">Others</label>

                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        className="checkbox checkbox-primary"
                      />
                      <span className="text-sm">4Ps Beneficiary</span>
                    </label>

                    {/* Indigenous People */}
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        className="checkbox checkbox-primary"
                      />
                      <span className="text-sm">Indigenous People (IP)</span>
                    </label>

                    {/* Type of Ethnicity — only shows if IP is checked */}
                    <div className="flex flex-col gap-1 ml-7">
                      <label className="fieldset-legend">Type of Ethnicity</label>
                      <input
                        type="text"
                        className="input input-primary w-full"
                        placeholder="e.g. Igorot, Aeta, Mangyan"
                      />
                    </div>
                  </div>
                </form>
              )}

              {/* step 3 */}
              {step === 3 && (
                <form>
                  <div className="overflow-x-auto rounded-box border border-base-content/5 bg-base-100">
                    <table className="table table-xs table-fixed w-full">
                      {/* head */}
                      <thead className='bg-primary text-white'>
                        <tr>
                          <th className="w-36">Family Member</th>
                          <th className="w-32">Relation to Head</th>
                          <th className="w-32">Birthdate</th>
                          <th className="w-16">Age</th>
                          <th className="w-24">Sex</th>
                          <th className="w-40">Educational Attainment</th>
                          <th className="w-32">Occupation</th>
                          <th className="w-36">Type of Vulnerability</th>
                          <th className="w-20">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {members.map((member)=>(
                          <tr key={member.id}>
                            <td>
                              <input 
                                type="text" 
                                className="input input-primary w-full input-sm"
                                placeholder="Full Name"
                                value={member.fullName}
                                onChange={(e) => updateMember(member.id, 'fullName', e.target.value)}
                              />
                            </td>
                            <td>
                              <select 
                                className='select select-primary w-full select-sm'
                                value={member.relation}
                                onChange={(e) => updateMember(member.id, 'relation', e.target.value)}
                              >
                                <option disabled>--Select Relation--</option>
                                {RELATION_FAMHEAD.map((rel) => (
                                  <option key={rel} value={rel}>{rel}</option>
                                ))}
                              </select>
                            </td>
                            <td>
                              <input 
                                type="date" 
                                className="input input-primary w-full input-sm"
                                value={member.birthdate} 
                                onChange={(e) => updateMember(member.id, 'birthdate', e.target.value)}
                              />
                            </td>
                            <td>
                              <input
                                type="number"
                                className="input input-primary input-sm w-full"
                                min="0"
                                max="120"
                                placeholder="Age"
                                value={member.age}
                                onChange={(e) => updateMember(member.id, 'age', e.target.value)}
                              />
                            </td>
                            <td>
                              <select 
                                className='select select-primary w-full select-sm'
                                value={member.sex}
                                onChange={(e) => updateMember(member.id, 'sex', e.target.value)}  
                              >
                                <option disabled>--Select--</option>
                                {SEX_OPTIONS.map((option) => (
                                  <option key={option} value={option}>{option}</option>
                                ))}
                              </select>
                            </td>
                            <td>
                              <select
                                className='select select-primary w-full select-sm'
                                value={member.education}
                                onChange={(e) => updateMember(member.id, 'education', e.target.value)}
                              >
                                <option disabled>--Select--</option>
                                {EDUCATIONAL_ATTAINMENT.map((educ) => (
                                  <option key={educ} value={educ}>{educ}</option>
                                ))}
                              </select>
                            </td>
                            <td>
                              <input 
                                type="text" 
                                className="input input-primary w-full input-sm"
                                placeholder="Occupation" 
                                value={member.occupation}
                                onChange={(e) => updateMember(member.id, 'occupation', e.target.value)}
                              />
                            </td>
                            <td>
                              <select 
                                className='select select-primary w-full select-sm'
                                value={member.vulnerability}
                                onChange={(e) => updateMember(member.id, 'vulnerability', e.target.value)}
                              >
                                <option disabled>--Select--</option>
                                {VULNERABILITY_TYPES.map((v) => (
                                  <option key={v} value={v}>{v}</option>
                                ))}
                              </select>
                            </td>
                            <td>
                              <button
                                type="button"
                                className="btn btn-square btn-sm btn-ghost text-red-500"
                                onClick={() => deleteMember(member.id)}
                                disabled={members.length === 1}
                                title={members.length === 1 ? "At least one member required" : "Remove"}
                              >
                                <Trash2 size={16} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* adds nnew row to the table */}
                  <div className='flex justify-center'>
                    <button 
                      type='button'
                      className="btn btn-soft btn-primary btn-sm"
                      onClick={addMember}
                    >
                      <LucidePlus size={16}/> Add Family Member
                    </button>
                  </div>
                  
                    
                </form>
              )}

              {/* step 4 */}
              {step === 4 && (
                <form>
                  <div className="card card-xs shadow-sm w-full bg-yellow-200">
                    <div className="card-body">
                      <h2 className="card-title text-md">
                        <Info size={16}/>Notice
                      </h2>
                      <p className='text-xs font-bold'>In case the family head does not have a bank or an e-wallet account, any of the family members with a validated account can be indicated.</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                    {/* left side */}
                    <div className="flex flex-col gap-1">
                      <legend className="fieldset-legend">Bank/E-wallet</legend>
                      <select
                        className="select select-primary w-full"
                        value={selectedProvider}
                        onChange={(e) => setSelectedProvider(e.target.value)}
                      >
                        <option disabled value="">--Select Bank / E-Wallet--</option>
                        {BANK_EWALLET_OPTIONS.map((provider) => (
                          <option key={provider} value={provider}>{provider}</option>
                        ))}
                      </select>

                      <legend className="fieldset-legend">Account Name</legend>
                      <input type="text" className="input input-primary w-full" placeholder="Account Name" />

                    </div>

                    {/* right side */}
                    <div className="flex flex-col gap-1">
                      <label className="fieldset-legend">Account Type</label>
                        <select className="select select-primary w-full">
                          <option disabled>--Select--</option>
                          {isEwallet
                            ? <option value="e_wallet">E-Wallet</option>
                            : ACCOUNT_TYPE_OPTIONS.filter(t => t !== 'E-Wallet').map((type) => (
                                <option key={type} value={type}>{type}</option>
                              ))
                          }
                      </select>

                      <legend className="fieldset-legend">Account Number</legend>
                      <input type="text" className="input input-primary w-full" placeholder="Account Number" />
                    </div> 
                  </div>

                  {/* bottom */}
                  {/* house ownership */}
                  <div className='grid grid-cols-2 gap-x-6 gap-y-4'>
                    <div className="flex flex-col gap-1">
                      <legend className="fieldset-legend max-w-full">House Ownership</legend>
                      {HOUSE_OWNERSHIP.map((ownership) => (
                        <label key={ownership} className='flex items-center gap-3 cursor-pointer'>
                          <input 
                            type="radio" 
                            name="HOUSE_OWNERSHIP" 
                            className="radio radio-primary" 
                            value={ownership}
                          />
                            <span className='text-sm'>{ownership}</span>
                        </label>
                      ))}       
                    </div>

                    <div className="flex flex-col gap-1">
                      <legend className="fieldset-legend max-w-full">Shelter Damage Classification</legend>
                      {SHELTER_DMG_CLASSIFICATION.map((shelter) => (
                        <label key={shelter} className='flex items-center gap-3 cursor-pointer'>
                          <input 
                            type="radio" 
                            name="shelter_dmg" 
                            className="radio radio-primary" 
                            value={shelter}
                          />
                            <span className='text-sm'>{shelter}</span>
                        </label>
                      ))}    
                    </div>
                  </div>
                </form>
              )}
              
              {/* ── Navigation buttons ── always visible ── */}
              <div className="flex justify-center gap-1 mt-6">
                {step > 1 && (
                  <button
                    type="button"
                    className="btn btn-outline btn-primary"
                    onClick={handleBack}
                  >
                    Back
                  </button>
                )}

                {step < 4 ? (
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleNext}
                  >
                    Next
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="btn btn-success"
                  >
                    Submit
                  </button>
                )}
              </div>
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