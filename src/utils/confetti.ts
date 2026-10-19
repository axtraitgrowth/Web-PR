import confetti from 'canvas-confetti'

/**
 * Fires a burst of romantic heart and sparkle confetti
 */
export const fireHeartConfetti = () => {
  try {
    // Left burst
    confetti({
      particleCount: 40,
      angle: 60,
      spread: 55,
      origin: { x: 0.1, y: 0.7 },
      colors: ['#ff4d6d', '#ff758f', '#ff8fa3', '#ffccd5', '#ffd166', '#ffffff'],
      shapes: ['circle'],
      ticks: 200,
    })

    // Right burst
    confetti({
      particleCount: 40,
      angle: 120,
      spread: 55,
      origin: { x: 0.9, y: 0.7 },
      colors: ['#ff4d6d', '#ff758f', '#ff8fa3', '#ffccd5', '#ffd166', '#ffffff'],
      shapes: ['circle'],
      ticks: 200,
    })

    // Center romantic burst
    confetti({
      particleCount: 50,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#e63946', '#ff4d6d', '#ffb703', '#ffc6ff', '#ffffff'],
      ticks: 250,
    })
  } catch (e) {
    // Fallback if canvas-confetti cannot run (e.g. headless)
    console.debug('Confetti triggered', e)
  }
}

/**
 * Grand celebration fireworks for the final screen
 */
export const fireCelebrationConfetti = () => {
  try {
    const end = Date.now() + 2.5 * 1000

    const colors = ['#ff4d6d', '#ff758f', '#ff85a1', '#fbb1bd', '#ffd166', '#ffffff']

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors,
      })
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors,
      })

      if (Date.now() < end) {
        requestAnimationFrame(frame)
      }
    }

    frame()
  } catch (e) {
    console.debug('Celebration confetti triggered', e)
  }
}
