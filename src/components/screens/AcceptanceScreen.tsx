import React from 'react'
import { ROMANTIC_CONFIG } from '../../config/dateConfig'
import { Sparkles, CalendarHeart } from 'lucide-react'

interface AcceptanceScreenProps {
  visitorName?: string
  onContinue: () => void
}

export const AcceptanceScreen: React.FC<AcceptanceScreenProps> = ({ visitorName, onContinue }) => {
  const headingText = visitorName
    ? `WAIT ${visitorName.toUpperCase()}... YOU SAID YES?! 🥹💖`
    : ROMANTIC_CONFIG.acceptance.heading

  const subtextText = visitorName
    ? `You just made my day, ${visitorName}! Now let's plan our little date.`
    : ROMANTIC_CONFIG.acceptance.subtext
  return (
    <div className="flex flex-col items-center text-center">
      {/* Joyous animated heart mascot */}
      <div className="relative mb-5 flex items-center justify-center">
        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-tr from-pink-200 to-rose-100 flex items-center justify-center animate-bounce-slow shadow-md">
          <span className="text-5xl sm:text-6xl select-none" role="img" aria-label="Happy blushing face">
            🥹
          </span>
        </div>
        <span
          className="absolute -top-2 -right-2 text-3xl select-none animate-pulse-gentle"
          aria-hidden="true"
        >
          💖
        </span>
        <span
          className="absolute -bottom-1 -left-2 text-2xl select-none animate-wiggle"
          aria-hidden="true"
        >
          🎉
        </span>
      </div>

      {/* Heading */}
      <h2 className="text-2xl sm:text-3xl font-extrabold text-pink-900 tracking-tight mb-2">
        {headingText}
      </h2>

      {/* Supporting text */}
      <p className="text-base sm:text-lg text-pink-800/90 font-medium mb-6 max-w-xs leading-relaxed">
        {subtextText}
      </p>

      {/* Cute mini excitement badge */}
      <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-pink-100/80 text-pink-800 text-xs font-semibold mb-7 border border-pink-200/60 shadow-xs">
        <Sparkles className="w-3.5 h-3.5 text-pink-600 animate-spin" style={{ animationDuration: '4s' }} />
        <span>Stage 1 of 5: Date Itinerary Setup</span>
      </div>

      {/* Advance Button */}
      <button
        type="button"
        onClick={onContinue}
        className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 active:from-pink-700 active:to-rose-700 text-white font-bold text-base sm:text-lg rounded-2xl shadow-lg shadow-pink-500/25 hover:shadow-pink-500/40 hover:scale-102 active:scale-98 transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 focus:outline-none focus:ring-4 focus:ring-pink-300"
      >
        <CalendarHeart className="w-5 h-5 text-white/95" />
        <span>{ROMANTIC_CONFIG.acceptance.buttonText}</span>
      </button>
    </div>
  )
}
