"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function DataPrivacyPage() {
  const router = useRouter()
  const [isChecked, setChecked] = useState(false)

  return (
    <div className="flex flex-col min-h-screen font-sans bg-white">
      <div className="w-full h-2 bg-gradient-to-r from-blue-900 via-blue-600 to-blue-400" />

      <header className="w-full bg-white border-b border-blue-100 shadow-sm py-4 px-4 sm:px-8">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-6">
          <Image src="/dswd_logo.png" alt="DSWD Logo" width={220} height={60} className="w-40 sm:w-56 h-auto" />
          <div className="hidden sm:block h-14 w-px bg-blue-200" />
          <div className="block sm:hidden h-px w-16 bg-blue-200" />
          <Image src="/bagong_pilipinas.png" alt="Bagong Pilipinas Logo" width={80} height={80} className="w-14 sm:w-20 h-auto" />
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center bg-[#F4F7FB] py-8 sm:py-16 px-4 sm:px-6">
        <div className="bg-white rounded-2xl shadow-lg border border-blue-100 w-full max-w-xl p-6 sm:p-10 flex flex-col gap-4">

          <div className="text-center">
            <h2 className="text-blue-900 font-bold text-base sm:text-lg">Data Privacy Declaration</h2>
            <p className="text-slate-500 text-sm mt-1">Please read the Data Privacy Declaration</p>
            <p className="text-slate-400 text-xs italic">Pakibasa ng mabuti ang Data Privacy Declaration</p>
          </div>

          <div className="h-56 sm:h-72 overflow-y-auto border border-blue-100 rounded-xl bg-[#F8FAFD] px-4 sm:px-5 py-4 flex flex-col gap-4 text-sm scroll-smooth">
            <p className="text-zinc-900 text-pretty">
              All data and information indicated herein shall be used for identification
              purposes for the implementation of disaster risk reduction and management
              (DRRM) programs, projects, and activities and its disclosure shall be in
              compliance to Republic Act 10173 (Data Privacy Act of 2012).
            </p>
            <p className="text-slate-500 text-sm italic text-pretty">
              Ang lahat ng datos at impormasyong nakalahad sa formong ito ay gagamitin
              lamang para sa mga layunin ng pagkakakilanlan sa pagpapatupad ng mga
              programa, proyekto, at gawain ng disaster risk reduction and management
              (DRRM), at ang anumang pagsisiwalat nito ay susunod sa Republic Act 10173
              o ang Data Privacy Act of 2012.
            </p>
          </div>

          <label className="flex justify-center items-center gap-2 label text-zinc-800 text-sm sm:text-md cursor-pointer">
            <input
              type="checkbox"
              className="checkbox checkbox-secondary checkbox-md shrink-0"
              checked={isChecked}
              onChange={() => setChecked((prev) => !prev)}
            />
            <span className="flex flex-col">
              <span>I&apos;ve read the Data Privacy Notice</span>
              <span className="text-xs text-slate-400 italic">Nabasa ko na ang Data Privacy Notice</span>
            </span>
          </label>

          <button
            type="button"
            disabled={!isChecked}
            onClick={() => router.push('/survey')}
            className={`btn btn-md w-full rounded-lg text-sm tracking-wide transition-all ${
              isChecked
                ? 'btn-primary'
                : 'btn-outline opacity-50 cursor-not-allowed'
            }`}
          >
            Take Survey
          </button>

          <button
            type="button"
            onClick={() => router.push('/')}
            className="btn btn-outline w-full rounded-lg text-sm tracking-wide transition-all text-zinc-800 hover:text-white"
          >
            Back to home
          </button>

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