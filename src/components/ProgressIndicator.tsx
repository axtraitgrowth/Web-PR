import React from 'react'

interface ProgressIndicatorProps {
  currentStep: number // 1 to 7
  totalSteps?: number
}

const STEP_LABELS = [
  'Invitation',
  'Accepted',
  'Pick a Date',
  'Pick a Time',
  'Food & Drinks',
  'Agreement',
  'Celebration',


]

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  currentStep,
  totalSteps = 7,
}) => {
  return (
    <div
      className="flex items-center justify-center gap-1.5 sm:gap-2 mb-4 sm:mb-6 select-none"
      role="progressbar"
      aria-label="Date Planning Progress"
      aria-valuenow={currentStep}
      aria-valuemin={1}
      aria-valuemax={totalSteps}
    >
      {Array.from({ length: totalSteps }, (_, i) => {
        const stepNum = i + 1
        const isCompleted = stepNum < currentStep
        const isCurrent = stepNum === currentStep

        return (
          <div
            key={stepNum}
            className="flex items-center"
            title={`${STEP_LABELS[i] || `Step ${stepNum}`}`}
          >
            <div
              className={`transition-all duration-300 rounded-full flex items-center justify-center ${
                isCurrent
                  ? 'w-6 h-6 bg-pink-500 text-white shadow-sm ring-2 ring-pink-300 scale-110 font-bold text-[11px]'
                  : isCompleted
                  ? 'w-4 h-4 bg-pink-400 text-white text-[9px]'
                  : 'w-3 h-3 bg-pink-200/80'
              }`}
            >
              {isCurrent ? (
                <span>💖</span>
              ) : isCompleted ? (
                <span>✓</span>
              ) : null}
            </div>
            {stepNum < totalSteps && (
              <div
                className={`w-2.5 sm:w-4 h-0.5 rounded transition-colors duration-300 ${
                  isCompleted ? 'bg-pink-400' : 'bg-pink-200'
                }`}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
