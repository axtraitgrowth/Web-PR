import React, { useMemo } from 'react'

interface FloatingItem {
  id: number
  emoji: string
  left: string
  animationDuration: string
  animationDelay: string
  size: string
  opacity: number
}

export const FloatingBackgroundHearts: React.FC = () => {
  const items: FloatingItem[] = useMemo(() => {
    const emojis = ['💖', '🌸', '✨', '💕', '🌷', '🤍', '💗', '⭐']
    return Array.from({ length: 18 }, (_, i) => ({
      id: i,
      emoji: emojis[i % emojis.length],
      left: `${(i * 5.5 + 3) % 96}%`,
      animationDuration: `${7 + (i % 6) * 1.5}s`,
      animationDelay: `${(i * 0.7) % 6}s`,
      size: `${14 + (i % 4) * 5}px`,
      opacity: 0.35 + ((i % 4) * 0.1),
    }))
  }, [])

  return (
    <div
      className="fixed inset-0 overflow-hidden pointer-events-none select-none z-0"
      aria-hidden="true"
    >
      {items.map((item) => (
        <span
          key={item.id}
          className="floating-heart"
          style={{
            left: item.left,
            fontSize: item.size,
            opacity: item.opacity,
            animationDuration: item.animationDuration,
            animationDelay: item.animationDelay,
            bottom: '-40px',
          }}
        >
          {item.emoji}
        </span>
      ))}

      {/* Gentle ambient glow spots */}
      <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-pink-200/40 blur-3xl" />
      <div className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-rose-200/40 blur-3xl" />
    </div>
  )
}
