'use client'

import { CheckCircle, AlertCircle } from 'lucide-react'
import type { ActionResult } from '@/lib/actions/character'

export function ActionFeedback({ result }: { result: ActionResult | null }) {
  if (!result) return null
  return (
    <div
      className={`flex items-start gap-3 rounded-lg border px-4 py-3 text-sm mb-5 ${
        result.success
          ? 'border-green-500/30 bg-green-500/10 text-green-400'
          : 'border-red-500/30 bg-red-500/10 text-red-400'
      }`}
    >
      {result.success ? <CheckCircle size={16} className="mt-0.5 shrink-0" /> : <AlertCircle size={16} className="mt-0.5 shrink-0" />}
      <span>{result.message}</span>
    </div>
  )
}
