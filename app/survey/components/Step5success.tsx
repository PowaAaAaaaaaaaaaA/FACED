'use client'
import { CheckCircle, Printer } from 'lucide-react'
import { useRouter } from 'next/navigation'

type Props = {
  serialNumber: string
  formData: {
    firstName: string
    middleName: string
    lastName: string
    evacuationCenter: string
  }
  locationNames: {
    barangay: string
    municipality: string
    province: string
    region: string
  }
}

export function Step5Success({ serialNumber, formData, locationNames }: Props) {
  const router = useRouter()

  const summaryRows = [
    {
      label: 'Full Name',
      value: [formData.firstName, formData.middleName, formData.lastName].filter(Boolean).join(' '),
    },
    { label: 'Barangay', value: locationNames.barangay },
    { label: 'Municipality', value: locationNames.municipality },
    { label: 'Province', value: locationNames.province },
    { label: 'Region', value: locationNames.region },
    { label: 'Evacuation Center', value: formData.evacuationCenter || '—' },
    {
      label: 'Date Registered',
      value: new Date().toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' }),
    },
  ]

  return (
    <div id="print-card" className="flex flex-col items-center gap-6 py-4">

      {/* Success icon */}
      <div className="flex flex-col items-center gap-2 text-center">
        <div className="bg-green-100 rounded-full p-4">
          <CheckCircle size={48} className="text-green-600" />
        </div>
        <h2 className="text-xl font-bold text-green-700">Form Submitted Successfully!</h2>
        <p className="text-sm text-slate-500">Matagumpay na naitala ang inyong pamilya.</p>
      </div>

      {/* Serial Number */}
      <div className="flex flex-col items-center gap-2 w-full">
        <p className="text-sm text-slate-500 font-medium">Your FACED Serial Number</p>
        <div className="bg-blue-50 border-2 border-blue-200 border-dashed rounded-xl px-6 sm:px-10 py-4 text-center w-full max-w-sm">
          <p className="text-xl sm:text-2xl font-mono font-bold text-blue-900 tracking-widest break-all">
            {serialNumber}
          </p>
        </div>
        <p className="text-xs text-slate-400 italic text-center">
          Itala o i-print ang serial number na ito. Ito ang inyong reference sa FACED system.
        </p>
      </div>

      {/* Summary */}
      <div className="w-full border border-blue-100 rounded-xl overflow-hidden">
        <div className="bg-blue-900 px-4 py-2">
          <p className="text-white text-sm font-semibold">Registration Summary</p>
        </div>
        <div className="divide-y divide-blue-50">
          {summaryRows.map(({ label, value }) => (
            <div key={label} className="flex flex-col sm:flex-row sm:justify-between px-4 py-2 text-sm gap-0.5 sm:gap-2">
              <span className="text-slate-500">{label}</span>
              <span className="font-medium text-slate-800 sm:text-right">{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 w-full">
        <button
          type="button"
          className="btn btn-outline btn-primary flex-1"
          onClick={() => {
            const cardEl = document.getElementById('print-card')
            if (!cardEl) return

            const original = document.body.innerHTML
            document.body.innerHTML = cardEl.innerHTML
            window.print()
            document.body.innerHTML = original
            window.location.reload()
            }}>
          <Printer size={16} /> Print Confirmation
        </button>
        <button
          type="button"
          className="btn btn-primary flex-1"
          onClick={() => router.push('/')}>
          Back to Home
        </button>
      </div>
    </div>
  )
}