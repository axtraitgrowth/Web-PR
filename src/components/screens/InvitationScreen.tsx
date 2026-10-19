import React, { useState, useRef, useCallback } from 'react'
import { ROMANTIC_CONFIG } from '../../config/dateConfig'
import { fireHeartConfetti } from '../../utils/confetti'

interface InvitationScreenProps {
  initialName?: string
  onAccept: (name: string) => void
}

export const InvitationScreen: React.FC<InvitationScreenProps> = ({ initialName = '', onAccept }) => {
  const [name, setName] = useState(initialName)
  const [nameError, setNameError] = useState<string | null>(null)
  const [noOffset, setNoOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 })
  const [noTextIndex, setNoTextIndex] = useState(0)
  const [isPressingYes, setIsPressingYes] = useState(false)
  const noButtonRef = useRef<HTMLButtonElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const playfulTexts = ROMANTIC_CONFIG.invitation.noButtonPlayfulTexts

  // Display greeting personalized or default
  const greeting = ROMANTIC_CONFIG.recipientName
    ? `Hey, ${ROMANTIC_CONFIG.recipientName}! 💗`
    : ROMANTIC_CONFIG.invitation.heading

  // Handle No button evasion in a controlled, bounded area
  const dodgeNoButton = useCallback(() => {
    // Pick next playful message
    setNoTextIndex((prev) => (prev + 1) % playfulTexts.length)

    // Bounded movement: within +/- 75px X and +/- 35px Y
    // Ensures it never jumps outside the card or covers the Yes button
    const randomX = (Math.random() - 0.5) * 140
    const randomY = (Math.random() - 0.5) * 70

    setNoOffset({
      x: Math.round(randomX),
      y: Math.round(randomY),
    })
  }, [playfulTexts.length])

  const handleYesClick = () => {
    const trimmed = name.trim()
    if (!trimmed) {
      setNameError('Please enter your name first so I know who is saying yes! 💗')
      return
    }
    setNameError(null)
    setIsPressingYes(true)
    fireHeartConfetti()
    setTimeout(() => {
      onAccept(trimmed)
    }, 400)
  }

  return (
    <div className="flex flex-col items-center text-center">
      {/* Cute animated heart character illustration */}
      <div className="relative mb-5 flex items-center justify-center">
        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-pink-100/90 flex items-center justify-center animate-pulse-gentle shadow-inner">
          <svg
            className="w-16 h-16 sm:w-20 sm:h-20 text-pink-500 animate-heart-beat filter drop-shadow-md"
            viewBox="0 0 24 24"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </div>
        {/* Blushing smile details */}
        <span
          className="absolute -bottom-1 -right-1 text-2xl select-none animate-wiggle"
          aria-hidden="true"
        >
          💌
        </span>
      </div>

      {/* Typography */}
      <h1 className="text-2xl sm:text-3xl font-extrabold text-pink-900 tracking-tight mb-2">
        {greeting}
      </h1>

      <p className="text-xl sm:text-2xl font-bold text-slate-800 mb-3 leading-snug">
        {ROMANTIC_CONFIG.invitation.question}
      </p>

      <p className="text-sm sm:text-base text-pink-700/80 mb-5 max-w-xs font-medium">
        {ROMANTIC_CONFIG.invitation.subtext}
      </p>

      {/* Mandatory Name Field */}
      <div className="w-full max-w-xs mb-6 text-left">
        <label
          htmlFor="portal-visitor-name"
          className="block text-xs font-bold text-pink-900 mb-1.5 flex items-center justify-between"
        >
          <span className="flex items-center gap-1.5">
            <span className="text-pink-500">🌸</span>
            <span>Your Name <span className="text-rose-500 font-extrabold">*</span></span>
          </span>
          <span className="text-[10px] text-pink-500 font-semibold uppercase tracking-wider bg-pink-100/70 px-2 py-0.5 rounded-full">
            Required
          </span>
        </label>
        <div className="relative">
          <input
            id="portal-visitor-name"
            type="text"
            required
            maxLength={60}
            value={name}
            onChange={(e) => {
              setName(e.target.value)
              if (nameError) setNameError(null)
            }}
            placeholder="What's your name, cutie? 💗"
            autoComplete="off"
            className={`w-full px-4 py-2.5 rounded-2xl bg-white/95 text-sm font-semibold text-slate-800 placeholder-pink-300 outline-none transition-all duration-200 border-2 shadow-inner ${
              nameError
                ? 'border-rose-400 focus:border-rose-500 focus:ring-4 focus:ring-rose-100 bg-rose-50/40'
                : 'border-pink-200 focus:border-pink-500 focus:ring-4 focus:ring-pink-100'
            }`}
          />
        </div>
        {nameError && (
          <p className="mt-1.5 text-xs text-rose-600 font-bold flex items-center gap-1 animate-fade-in-scale">
            <span>⚠️</span>
            <span>{nameError}</span>
          </p>
        )}
      </div>

      {/* Action Buttons Container */}
      <div
        ref={containerRef}
        className="relative w-full min-h-[90px] flex flex-wrap items-center justify-center gap-3 sm:gap-4 select-none px-2"
      >
        {/* Yes Button */}
        <button
          type="button"
          onClick={handleYesClick}
          className={`relative z-10 px-6 sm:px-7 py-3 sm:py-3.5 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 active:from-pink-700 active:to-rose-700 text-white font-bold text-base sm:text-lg rounded-2xl shadow-lg shadow-pink-500/30 hover:shadow-pink-500/50 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer focus:outline-none focus:ring-4 focus:ring-pink-300 ${
            isPressingYes ? 'scale-90 opacity-90' : ''
          }`}
          aria-label="Yes, absolutely! Accept date invitation"
        >
          {ROMANTIC_CONFIG.invitation.yesButtonText}
        </button>

        {/* Playful No Button */}
        <button
          ref={noButtonRef}
          type="button"
          onMouseEnter={dodgeNoButton}
          onClick={dodgeNoButton}
          onFocus={dodgeNoButton}
          style={{
            transform: `translate(${noOffset.x}px, ${noOffset.y}px)`,
            transition: 'transform 0.18s cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
          className="relative z-0 px-5 sm:px-6 py-2.5 sm:py-3 bg-pink-100/80 hover:bg-pink-200/90 active:bg-pink-300/90 text-pink-800 font-semibold text-sm sm:text-base rounded-2xl border border-pink-200/70 shadow-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-pink-300 whitespace-nowrap"
          aria-label="Playful No option"
        >
          {playfulTexts[noTextIndex]}
        </button>
      </div>

      <p className="mt-4 text-xs text-pink-400 font-medium">
        (Tip: There's only one right answer 😉)
      </p>
    </div>
  )
}
