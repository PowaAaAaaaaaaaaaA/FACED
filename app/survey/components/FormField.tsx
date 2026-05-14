import type { AnyFieldApi } from '@tanstack/react-form'

// ─── FormField wrapper ────────────────────────────────────────────────────────

export function FormField({
  label,
  required,
  children,
  error,
}: {
  label: string
  required?: boolean
  children: React.ReactNode
  error?: string
}) {
  return (
    <div className="form-control w-full">
      <label className="label pb-1">
        <span className="label-text font-medium text-base-content">
          {label}
          {required && <span className="text-error ml-1">*</span>}
        </span>
      </label>
      {children}
      {error && (
        <label className="label pt-1">
          <span className="label-text-alt text-error mt-1">{error}</span>
        </label>
      )}
    </div>
  )
}

// ─── Extract first error message from TanStack Form field ─────────────────────

export function firstError(field: AnyFieldApi): string | undefined {
  const e = field.state.meta.errors[0]
  return typeof e === 'string' ? e : (e as { message?: string })?.message
}