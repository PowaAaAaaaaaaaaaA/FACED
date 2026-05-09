'use client'
import { useState } from 'react'
import { useFacedStore } from '@/app/store/useFacedStore'
import { Printer } from 'lucide-react'

export default function PrintPanel() {
  const selectedCard = useFacedStore((s) => s.selectedCard)
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handlePreview = async () => {
    if (!selectedCard?.id) return
    setLoading(true)
    // Use blob so it previews instead of downloading
    const res = await fetch(`/api/generate-pdf/${selectedCard.id}`)
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    setPdfUrl(url)
    setLoading(false)
  }

  if (!selectedCard) {
    return (
      <div className="flex items-center justify-center h-full text-sm text-gray-400">
        Select a card from the list to preview
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b">
        <div>
          <p className="text-sm font-semibold">{selectedCard.full_name}</p>
          <p className="text-xs text-gray-400">{selectedCard.serial_number}</p>
        </div>
        <div className="flex gap-2">
          <button
            className="btn btn-sm btn-outline btn-primary"
            onClick={handlePreview}
            disabled={loading}
          >
            {loading ? <span className="loading loading-spinner loading-xs" /> : 'Preview'}
          </button>
          <button
            className="btn btn-sm btn-primary"
            onClick={() => window.open(`/api/generate-pdf/${selectedCard.id}`, '_blank')}
          >
            <Printer size={14} /> Print / Save PDF
          </button>
        </div>
      </div>

      {/* PDF Preview */}
      <div className="flex-1 bg-gray-100 overflow-hidden">
        {pdfUrl ? (
          <iframe
            src={pdfUrl}
            className="w-full h-full border-0"
            title="FACED Card Preview"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-sm text-gray-400">
            Click Preview to load the card
          </div>
        )}
      </div>
    </div>
  )
}