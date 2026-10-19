import React, { useState } from 'react'
import { ROMANTIC_CONFIG } from '../../config/dateConfig'
import { Clock, ArrowLeft, ArrowRight, AlertCircle, Check } from 'lucide-react'

interface TimePickerScreenProps {
  selectedTime: string | null
  onSelectTime: (timeStr: string) => void
  onContinue: () => void
  onBack: () => void
}

export const TimePickerScreen: React.FC<TimePickerScreenProps> = ({
  selectedTime,
  onSelectTime,
  onContinue,
  onBack,
}) => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const timeOptions = ROMANTIC_CONFIG.timePicker.options

  const handleTimeClick = (timeStr: string) => {
    setErrorMessage(null)
    onSelectTime(timeStr)
  }

  const handleContinueClick = () => {
    if (!selectedTime) {
      setErrorMessage('Please pick a time so I can be ready for you! ⏰')
      return
    }
    onContinue()
  }

  return (
    <div className="flex flex-col items-center text-center w-full">
      {/* Heading */}
      <h2 className="text-xl sm:text-2xl font-extrabold text-pink-900 tracking-tight mb-1">
        {ROMANTIC_CONFIG.timePicker.heading}
      </h2>

      {/* Supporting text */}
      <p className="text-xs sm:text-sm text-pink-700/80 font-medium mb-5">
        {ROMANTIC_CONFIG.timePicker.subtext}
      </p>

      {/* Time Options Grid */}
      <div className="w-full grid grid-cols-2 gap-2.5 sm:gap-3 mb-4">
        {timeOptions.map((timeStr) => {
          const isSelected = selectedTime === timeStr
          const isEvening = timeStr.includes('PM') && parseInt(timeStr) >= 5

          return (
            <button
              key={timeStr}
              type="button"
              onClick={() => handleTimeClick(timeStr)}
              className={`p-3 rounded-2xl border text-sm sm:text-base font-bold transition-all duration-200 flex items-center justify-between cursor-pointer ${
                isSelected
                  ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white border-pink-400 shadow-md shadow-pink-500/25 scale-[1.02]'
                  : 'bg-pink-50/70 hover:bg-pink-100/90 active:bg-pink-200 border-pink-200/80 text-pink-950 hover:scale-[1.01]'
              }`}
            >
              <div className="flex items-center gap-2">
                <Clock
                  className={`w-4 h-4 ${
                    isSelected ? 'text-white' : 'text-pink-500'
                  }`}
                />
                <span>{timeStr}</span>
              </div>

              {isSelected ? (
                <span className="w-5 h-5 rounded-full bg-white/25 flex items-center justify-center text-white">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </span>
              ) : (
                <span className="text-xs opacity-60">
                  {isEvening ? '🌙' : '☀️'}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Selected time display */}
      <div className="min-h-[26px] mb-4 flex items-center justify-center">
        {selectedTime ? (
          <span className="text-xs sm:text-sm text-pink-800 font-semibold bg-pink-100 px-3 py-0.5 rounded-full border border-pink-200">
            ⏰ Perfect! See you at <span className="font-bold">{selectedTime}</span>
          </span>
        ) : (
          <span className="text-xs text-pink-500/80 font-medium">
            Tap a time slot above ✨
          </span>
        )}
      </div>

      {/* Validation Alert */}
      {errorMessage && (
        <div className="w-full mb-4 px-3 py-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center justify-center gap-1.5 animate-fade-in-scale">
          <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Navigation Buttons: Back and Continue */}
      <div className="w-full flex items-center justify-between gap-3 pt-1">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 py-2.5 sm:py-3 px-4 rounded-xl bg-pink-100/80 hover:bg-pink-200 active:bg-pink-300 text-pink-800 font-semibold text-sm transition-all duration-150 flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <button
          type="button"
          onClick={handleContinueClick}
          className="flex-1 py-2.5 sm:py-3 px-4 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 active:from-pink-700 active:to-rose-700 text-white font-bold text-sm shadow-md shadow-pink-500/25 hover:shadow-pink-500/40 active:scale-98 transition-all duration-150 flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <span>Continue</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
