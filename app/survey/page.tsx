"use client"

import React from 'react'
import Link from 'next/link'
import { useForm } from '@tanstack/react-form'
import { useState } from 'react'
import { ChevronRightIcon, ContactIcon } from 'lucide-react'
import Image from 'next/image'

export default function SurveyPage() {
const [step, setStep] = useState(1);
const [isChecked, setChecked] = useState(false);
const steps = [
  { id: 1, title: 'Location of the Affected Family' },
  { id: 2, title: 'Head of the Family' },
  { id: 3, title: 'Family Information' },
  { id: 4, title: 'Account Information' },
]

const handleClick = () => {
  setChecked(prev => !prev);
}

const form = useForm({
    defaultValues: {
      // step1 - location of the affected family
      region: '',
      citymunicipality: '',
      province: '',
      district: '',
      evacuationCenter: '',
      // step2 - head of the family
      lastName: '',
      firstName: '',
      middleName: '',
      nameExt: '',
      birthdate: '',
      birthplace: '',
      sex: '',
      motherMaidenName: '',
      religion: '',
      monthlyFamilyNetIncome: '',
      idCard: '',
      idCardNumber: '',
      primaryContactNumber: '',
      altContactNumber: '',
      houseblockLotNo: '',
      street: '',
      subdVillage: '',
      barangay: '',
      cityMuni: '',
      province_head: '',
      zipCode: '',
      //others dropdown
      fourPsBeneficiary: false,
      others: '',

      // step3 - family information, this will be a table wherein the user can add multiple family members
        familyMembers: '',
        relationshipToHead: '',
        famBirthdate: '',
        famAge: '',
        famSex: '',
        famHighestEducationalAttainment: '',
        famOccupation: '',
        typeOfVulnerability: '',

      // step4 -account information in case the family head does not have a bank or an e-wallet account, any of the family members with a validated account can be indicated.
        bankEwallet: '',
        accountName: '',
        accountType: '',
        accountNumber: '',
        //this is in step 4 also
        //house ownership, this will be a dropdown with the options owner, renter, sharer, and others.
        owner: '',
        renter: '',
        sharer: '',
        //this is in step 4 also
        //shelter damage classification, this will be a dropdown with the options partially damaged, totally damaged.
        partiallyDamaged: '',
        totallyDamaged: '',

    },
    
    onSubmit: async ({ value }) => {
      // Final submission logic
      console.log(value)
    },
  })

  const nextStep = async () => {
    // Optional: Validate specific fields before proceeding
    setStep((prev) => prev + 1)
  }


  return (
    <div className="flex flex-col min-h-screen font-sans bg-white">
      <div className="w-full h-2 bg-gradient-to-r from-blue-900 via-blue-600 to-blue-400" />
       <header className="w-full bg-white border-b border-blue-100 shadow-sm py-4 px-8">
          <div className="max-w-5xl mx-auto flex flex-row justify-center items-center gap-6">
            <Image src="/dswd_logo.png" alt="DSWD Logo" width={220} height={60}/>
            <div className="h-14 w-px bg-blue-200" />
            <Image src="/bagong_pilipinas.png" alt="Bagong Pilipinas Logo" width={80} height={80} />
          </div>
      </header>

      <main className="flex-1 flex items-center justify-center bg-[#F4F7FB] py-16 px-6">
        <div className="bg-white rounded-2xl shadow-lg border border-blue-100 w-full max-w-[50%] p-10 flex flex-col gap-2">
          
          <div className="text-center">
            <h2 className="text-blue-900 font-bold text-lg">Part {steps[0].id}</h2>
            <p className="text-slate-500 text-sm mt-1">{steps[0].title}</p>
          </div>


          <Link href={'/'}>
            <button 
              className={'btn btn-outline w-full rounded-lg text-sm tracking-wide transition-all text-zinc-800 hover:text-white'}
            >
              Back to home
            </button>
          </Link>
        </div>
      </main>

      <footer className="w-full bg-gradient-to-b from-blue-950 via-blue-850 to-blue-800 text-blue-200 text-center py-5 px-8 text-xs">
        <p className="font-semibold text-white text-sm">Republic of the Philippines</p>
        <p className="mt-1">Department of Social Welfare and Development &mdash; FACED Digital System</p>
        <p className="mt-1 text-blue-400">All rights reserved &copy; {new Date().getFullYear()}</p>
      </footer>
    </div>
  
  )
}