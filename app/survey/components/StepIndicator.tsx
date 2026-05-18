import { STEPS } from '../constants'

export function StepIndicator({ currentStep }: { currentStep: number }) {
  const current = STEPS.find((s) => s.id === currentStep)

  return (
    <div className="w-full mb-6">
      <ul className="hidden sm:flex items-center justify-center w-full">
        {STEPS.map((s, i) => {
          const isDone = currentStep > s.id
          const isActive = currentStep === s.id

          return (
            <li key={s.id} className="flex items-center flex-1 min-w-0">
              {/* Step bubble + label */}
              <div className="flex flex-col items-center gap-1 flex-1 min-w-0">
                <div
                  className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 border-2 transition-all
                    ${isDone ? 'bg-primary border-primary text-white' : ''}
                    ${isActive ? 'bg-primary border-primary text-white ring-2 ring-primary/30 ring-offset-1' : ''}
                    ${!isDone && !isActive ? 'bg-white border-base-300 text-base-400' : ''}
                  `}
                >
                  {isDone ? '✓' : s.id}
                </div>
                <span
                  className={`
                    text-center text-[10px] leading-tight px-1 line-clamp-2 max-w-[80px]
                    ${isActive ? 'text-primary font-semibold' : 'text-base-400'}
                    ${isDone ? 'text-primary/70' : ''}
                  `}
                >
                  {s.title}
                </span>
              </div>

              {i < STEPS.length - 1 && (
                <div
                  className={`h-0.5 flex-1 mx-1 mb-5 shrink-0 transition-all ${
                    currentStep > s.id ? 'bg-primary' : 'bg-base-200'
                  }`}
                />
              )}
            </li>
          )
        })}
      </ul>

      <div className="flex flex-col gap-2 sm:hidden px-1">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span className="font-medium text-blue-900">{current?.title}</span>
          <span>Step {currentStep} of {STEPS.length}</span>
        </div>
        <div className="w-full h-2 bg-base-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / STEPS.length) * 100}%` }}
          />
        </div>
        {/* Dot indicators */}
        <div className="flex justify-center gap-2 mt-1">
          {STEPS.map((s) => (
            <div
              key={s.id}
              className={`
                rounded-full transition-all duration-200
                ${currentStep === s.id ? 'w-4 h-2 bg-primary' : ''}
                ${currentStep > s.id ? 'w-2 h-2 bg-primary/50' : ''}
                ${currentStep < s.id ? 'w-2 h-2 bg-base-300' : ''}
              `}
            />
          ))}
        </div>
      </div>

    </div>
  )
}