import React from 'react'

interface CuteCardProps {
  children: React.ReactNode
  className?: string
}

export const CuteCard: React.FC<CuteCardProps> = ({ children, className = '' }) => {
  return (
    <div
      className={`relative w-full max-w-[440px] mx-auto bg-white/95 backdrop-blur-sm rounded-3xl p-6 sm:p-8 shadow-[0_12px_40px_-10px_rgba(255,140,165,0.22)] border border-pink-100/80 transition-all duration-300 animate-fade-in-scale ${className}`}
    >
      {/* Decorative top corner flowers/sparkles */}
      <span
        className="absolute -top-3.5 -left-3.5 text-2xl select-none animate-bounce-slow"
        aria-hidden="true"
      >
        🌸
      </span>
      <span
        className="absolute -top-3.5 -right-3.5 text-2xl select-none animate-wiggle"
        aria-hidden="true"
      >
        ✨
      </span>

      {/* Main card contents */}
      <div className="relative z-10">{children}</div>
    </div>
  )
}
