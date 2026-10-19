import React, { useEffect, useState, useMemo } from 'react'
import { ROMANTIC_CONFIG } from '../../config/dateConfig'
import type { FoodOption } from '../../types'
import { fireCelebrationConfetti } from '../../utils/confetti'
import { Copy, CheckCheck, RotateCcw, Calendar, Clock, Utensils, HeartHandshake } from 'lucide-react'

interface CelebrationScreenProps {
  selectedDate: string | null
  selectedTime: string | null
  selectedFood: FoodOption | null
  onStartOver: () => void
}

export const CelebrationScreen: React.FC<CelebrationScreenProps> = ({
  selectedDate,
  selectedTime,
  selectedFood,
  onStartOver,
}) => {
  const [copied, setCopied] = useState(false)

  // Trigger celebration confetti on mount
  useEffect(() => {
    fireCelebrationConfetti()
  }, [])

  const formattedDate = useMemo(() => {
    if (!selectedDate) return 'A special day'
    const [y, m, d] = selectedDate.split('-').map(Number)
    const dateObj = new Date(y, m - 1, d)
    return dateObj.toLocaleDateString(undefined, {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })
  }, [selectedDate])

  const handleCopyDetails = async () => {
    const summaryText = [
      `🎉 IT'S OFFICIALLY A DATE! 💗`,
      `📅 Date: ${formattedDate}`,
      `⏰ Time: ${selectedTime || 'To be decided'}`,
      `🍽️ Food: ${selectedFood ? `${selectedFood.emoji} ${selectedFood.name} ("${selectedFood.subtitle}")` : 'Delicious treats'}`,
      `💌 Status: Sealed with love!`,
      `✨ Ready for lots of laughs and good vibes!`,
    ].join('\n')

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(summaryText)
      } else {
        // Fallback for non-secure / older browser contexts
        const textArea = document.createElement('textarea')
        textArea.value = summaryText
        textArea.style.position = 'fixed'
        textArea.style.opacity = '0'
        document.body.appendChild(textArea)
        textArea.focus()
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
      }
      setCopied(true)
      setTimeout(() => setCopied(false), 3000)
    } catch (err) {
      console.error('Failed to copy date details', err)
    }
  }

  return (
    <div className="flex flex-col items-center text-center w-full">
      {/* Celebration Mascot Badge */}
      <div className="relative mb-4 flex items-center justify-center">
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-tr from-pink-400 to-rose-400 text-white flex items-center justify-center text-4xl sm:text-5xl shadow-lg shadow-pink-500/30 animate-pulse-gentle">
          🎉
        </div>
        <span
          className="absolute -top-1 -right-1 text-2xl sm:text-3xl select-none animate-wiggle"
          aria-hidden="true"
        >
          💖
        </span>
        <span
          className="absolute -bottom-1 -left-1 text-2xl select-none animate-bounce-slow"
          aria-hidden="true"
        >
          ✨
        </span>
      </div>

      {/* Heading */}
      <h2 className="text-2xl sm:text-3xl font-black text-pink-900 tracking-tight mb-2">
        {ROMANTIC_CONFIG.celebration.heading}
      </h2>

      {/* Supporting message */}
      <p className="text-sm sm:text-base text-pink-800/90 font-medium mb-6 max-w-xs leading-relaxed">
        {ROMANTIC_CONFIG.celebration.subtext}
      </p>

      {/* Ticket / Confirmation Card */}
      <div className="w-full bg-gradient-to-br from-pink-50 via-rose-50 to-pink-100/80 rounded-2xl p-4 sm:p-5 border-2 border-dashed border-pink-300 shadow-sm text-left mb-5 relative overflow-hidden">
        {/* Ticket notch cutouts */}
        <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white border-r border-pink-300" />
        <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white border-l border-pink-300" />

        <div className="flex items-center justify-between pb-3 mb-3 border-b border-pink-200">
          <div className="flex items-center gap-1.5 font-bold text-xs text-pink-900">
            <HeartHandshake className="w-4 h-4 text-pink-600" />
            <span>CONFIRMED ITINERARY</span>
          </div>
          <span className="text-[11px] font-bold text-rose-600 bg-white/80 px-2.5 py-0.5 rounded-full border border-pink-200 shadow-2xs">
            Sealed 💖
          </span>
        </div>

        <div className="space-y-2 text-xs sm:text-sm pl-2 pr-2">
          <div className="flex items-start gap-2">
            <Calendar className="w-4 h-4 text-pink-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wide">
                Day & Date
              </p>
              <p className="font-extrabold text-pink-950">{formattedDate}</p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <Clock className="w-4 h-4 text-pink-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wide">
                Meeting Time
              </p>
              <p className="font-extrabold text-pink-950">{selectedTime || 'TBD'}</p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <Utensils className="w-4 h-4 text-pink-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wide">
                Food & Drinks
              </p>
              <p className="font-extrabold text-pink-950">
                {selectedFood ? `${selectedFood.emoji} ${selectedFood.name} — ${selectedFood.subtitle}` : 'TBD'}
              </p>
            </div>


          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-pink-200 flex items-center justify-between text-[11px] text-pink-800 font-semibold px-2">
          <span>Cost: Unlimited love 💖</span>
          <span>Status: 100% Locked In ✨</span>
        </div>
      </div>


      {/* Copy Date Details Button with visible feedback */}
      <div className="w-full flex flex-col gap-2.5 mb-3">
        <button
          type="button"
          onClick={handleCopyDetails}
          className="w-full py-3 px-4 rounded-xl bg-pink-100 hover:bg-pink-200/90 active:bg-pink-300 text-pink-900 font-bold text-sm transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer shadow-xs border border-pink-200"
        >
          {copied ? (
            <>
              <CheckCheck className="w-4 h-4 text-emerald-600 stroke-[2.5]" />
              <span className="text-emerald-700 font-extrabold">
                {ROMANTIC_CONFIG.celebration.copySuccessText}
              </span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 text-pink-600" />
              <span>Copy Date Details 📋</span>
            </>
          )}
        </button>

        {/* Start Over Button */}
        <button
          type="button"
          onClick={onStartOver}
          className="w-full py-2.5 px-4 rounded-xl text-pink-700/80 hover:text-pink-900 hover:bg-pink-50 text-xs font-semibold transition-all duration-150 flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Start Over & Plan Another Date</span>
        </button>
      </div>

      {/* Cute reassurance note */}
      <p className="text-[11px] text-slate-500 max-w-xs mt-1">
        Can't wait to see your smile on our date! 🌸
      </p>
    </div>
  )
}
