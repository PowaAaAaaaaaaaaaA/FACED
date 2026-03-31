"use client"

import React from 'react'
import Link from 'next/link'

import { useState } from 'react'
import { ChevronRightIcon } from 'lucide-react'
import Image from 'next/image'
export default function DataPrivacyPage() {

const [isChecked, setChecked] = useState(false);

const handleClick = () => {
  setChecked(prev => !prev);
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
            <h2 className="text-blue-900 font-bold text-lg">Data Privacy Notice</h2>
            <p className="text-slate-500 text-sm mt-1">Please read the Data Privacy Notice</p>
            <p className="text-slate-400 text-xs italic">Pakibasa ng mabuti ang Data Privacy Notice</p>
        </div>

        <div className="h-72 overflow-y-auto border border-blue-100 rounded-xl bg-[#F8FAFD] px-5 py-4 flex flex-col gap-4 text-sm scroll-smooth">
          <p className='text-zinc-900 text-pretty'>
            <span className='font-bold'>1.</span>  I certify that the information provided are <span className='font-bold'>true and correct</span> and I understand that I shall be held liable under all circumstances for any false information, misrepresentation and fraud in this application.
            <br />
            <span className='text-zinc-800 text-pretty italic text-sm'>(Pinatutunayan ko na ang lahat ng impormasyong aking ibinigay ay totoo at wasto. Nauunawaan ko na ako ay mananagot sa ilalim ng batas sa anumang maling impormasyon, maling paglalahad, o pandaraya na aking nagawa kaugnay ng aplikasyon na ito.)</span>
          </p>

          <p className='text-zinc-900 text-pretty'>
            <span className='font-bold'>2.</span> I authorize MSWDO PANIQUI to use and access my personal data and records submitted, which may be considered sensitive, to process my application for __________________________________ including verification from my source of such information and for the establishment, exercise or defense of MSWDO Paniqui legal claims against me in case I commit misrepresentation or fraud in the submission of this application.
            <br />
            <span className='text-zinc-800 text-pretty italic text-sm'>(Ako ay nagbibigay ng pahintulot sa MSWDO Paniqui na gamitin, iproseso, at i-access ang aking personal na datos at mga rekord na aking isinumite, kabilang ang mga impormasyong itinuturing na sensitibo, para sa layunin ng pagproseso ng aking aplikasyon para sa ______________, kabilang ang beripikasyon mula sa pinanggalingan ng naturang impormasyon, at para sa pagtatatag, pagsasagawa, o pagtatanggol ng mga legal na karapatan ng MSWDO Paniqui sakaling ako ay magbigay ng maling impormasyon o magsagawa ng pandaraya sa pagsusumite ng aplikasyon.)</span>
          </p>

          <p className='text-zinc-900 text-pretty'>
            <span className='font-bold'>3.</span> I agree that the information collected through this form shall be used and retained by the MSWDO- Paniqui for processing of my___________________________.
            <br />
            <span className='text-zinc-800 text-pretty italic text-sm'>(Ako ay sumasang-ayon na ang mga impormasyong makokolekta sa pamamagitan ng form na ito ay gagamitin at itatago ng MSWDO Paniqui para sa pagproseso ng aking ______________.)</span>
          </p>

          <p className='text-zinc-900 text-pretty'>
            <span className='font-bold'>4.</span> I trust that MSWDO Paniqui shall keep confidential and secure all the information using organizational, physical and technical measures and procedures, pursuant to the Data Privacy Act of 2012 (R.A. No. 10173). I was made aware that MSWDO Paniqui will not divulge my personal data to any person unless authorized by me or required through a subpoena issued by the courts. However, MSWDO Paniqui shall only share my data with other government agencies and with partner private companies like banks, collecting agents, insurance companies or IT solutions contractors through a data sharing agreement or as lawfully permitted under the applicable provision of R.A. No. 10173, for the purpose of delivering efficient and effective service and for the attainment of MSWDO Paniqui legal mandate of providing social security.
            <br />
            <span className='text-zinc-800 text-pretty italic text-sm'>(Ako ay may tiwala na ang MSWDO Paniqui ay pananatilihing kumpidensyal at ligtas ang lahat ng aking personal na impormasyon sa pamamagitan ng angkop na organisasyonal, pisikal, at teknikal na mga hakbang at pamamaraan, alinsunod sa Data Privacy Act of 2012 (Republic Act No. 10173). Ipinabatid sa akin na hindi ibubunyag ng MSWDO Paniqui ang aking personal na datos sa sinumang tao maliban kung may pahintulot ko o kung kinakailangan sa pamamagitan ng subpoena na inilabas ng hukuman. Gayunpaman, maaari lamang ibahagi ng MSWDO Paniqui ang aking datos sa iba pang ahensya ng pamahalaan at sa mga katuwang na pribadong kompanya tulad ng mga bangko, collecting agents, insurance companies, o IT solutions contractors, sa pamamagitan ng isang data sharing agreement o kung pinahihintulutan ng batas sa ilalim ng R.A. No. 10173, para sa layunin ng pagbibigay ng episyente at epektibong serbisyo at sa pagtupad ng legal na mandato ng MSWDO Paniqui sa pagbibigay ng serbisyong panlipunan.)</span>
          </p>

          <p className='text-zinc-900 text-pretty'>
            <span className='font-bold'>5.</span> I understand that, while MSWDO Paniqui is committed to ensuring the safety and security of my personal data, no method of transmission over the internet or method of electronic storage will guaranty absolute security. Nevertheless, MSWDO Paniqui commits that all the forms used in collecting my information shall be disposed of in accordance with MSWDO Paniqui Records Retention and Disposition Schedule to insure against unnecessary disclosure of information.
            <br />
            <span className='text-zinc-800 text-pretty italic text-sm'>(Nauunawaan ko na bagama&apos;t ang MSWDO Paniqui ay nagsusumikap na matiyak ang kaligtasan at seguridad ng aking personal na datos, walang anumang paraan ng transmisyon sa internet o elektronikong pag-iimbak ang makapagbibigay ng ganap na garantiya ng seguridad. Gayunpaman, ang MSWDO Paniqui ay nangangakong ang lahat ng mga form na ginamit sa pangangalap ng aking impormasyon ay itatapon alinsunod sa Records Retention and Disposition Schedule ng MSWDO Paniqui upang maiwasan ang hindi kinakailangang pagbubunyag ng impormasyon.)</span>
          </p>

        </div>

         

          <label className='flex justify-center items-center gap-2 label text-zinc-800 text-md cursor-pointer'>
            <input 
              type="checkbox" 
              className="checkbox checkbox-secondary checkbox-md" 
              checked={isChecked}
              onChange={handleClick} 
            />
            <span className="flex flex-col">
              <span>I&apos;ve read the Data Privacy Notice</span>
              <span className="text-xs text-slate-400 italic">Nabasa ko na ang Data Privacy Notice</span>
            </span>
          </label>
          <Link href={'/survey'} className={!isChecked ? "pointer-events-none" : ""}>
            <button 
              className={`btn btn-md w-full rounded-lg text-sm tracking-wide transition-all ${
                isChecked 
                  ? "btn-primary" 
                  : "btn-outline opacity-50 cursor-not-allowed"
              }`}
              // disabled={!isChecked}
              aria-disabled = {!isChecked}
            >
              Take Survey
            </button>
          </Link>

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