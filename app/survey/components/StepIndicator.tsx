import { STEPS } from '../constants'

export function StepIndicator({ currentStep }: { currentStep: number }) {
  return (
    <div className="w-full mb-8 flex items-center justify-center">
      <ul className="steps steps-vertical lg:steps-horizontal">
        {STEPS.map((s) => (
          <li
            key={s.id}
            className={`step text-xs ${currentStep >= s.id ? 'step-primary' : ''}`}
            data-content={currentStep > s.id ? '✓' : String(s.id)}
          >
            <span className="hidden sm:inline">{s.title}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}