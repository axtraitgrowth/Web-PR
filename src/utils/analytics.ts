/**
 * Privacy-friendly visitor analytics tracker
 */
import { apiFetch } from './api'

function getOrCreateVisitorId(): string {
  try {
    const KEY = 'romantic_date_visitor_id'
    let id = sessionStorage.getItem(KEY)
    if (!id) {
      id = 'v_' + Math.random().toString(36).substring(2, 12) + '_' + Date.now().toString(36)
      sessionStorage.setItem(KEY, id)
    }
    return id
  } catch {
    return 'v_anonymous_' + Date.now()
  }
}

function detectDevice(): { type: 'Mobile' | 'Tablet' | 'Desktop'; browser: string; os: string; referrer: string } {
  if (typeof window === 'undefined') {
    return { type: 'Desktop', browser: 'Unknown', os: 'Unknown', referrer: 'Direct' }
  }

  const ua = navigator.userAgent
  let type: 'Mobile' | 'Tablet' | 'Desktop' = 'Desktop'
  if (/iPad|tablet|PlayBook/i.test(ua) || (navigator.maxTouchPoints > 1 && window.innerWidth >= 768 && window.innerWidth <= 1024)) {
    type = 'Tablet'
  } else if (/Mobi|Android|iPhone|iPod/i.test(ua) || window.innerWidth < 768) {
    type = 'Mobile'
  }

  // Browser detection
  let browser = 'Other'
  if (/Edg/i.test(ua)) browser = 'Edge'
  else if (/Chrome/i.test(ua)) browser = 'Chrome'
  else if (/Safari/i.test(ua)) browser = 'Safari'
  else if (/Firefox/i.test(ua)) browser = 'Firefox'

  // OS detection
  let os = 'Other'
  if (/Windows/i.test(ua)) os = 'Windows'
  else if (/Mac/i.test(ua)) os = 'macOS'
  else if (/Android/i.test(ua)) os = 'Android'
  else if (/iPhone|iPad|iPod/i.test(ua)) os = 'iOS'
  else if (/Linux/i.test(ua)) os = 'Linux'

  const referrer = document.referrer ? new URL(document.referrer).hostname : 'Direct'

  return { type, browser, os, referrer }
}

export function trackVisitorEvent(
  eventType: string,
  stepNumber: number,
  details?: Record<string, any>
): void {
  try {
    const visitorId = getOrCreateVisitorId()
    const device = detectDevice()

    apiFetch('/api/track', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        visitorId,
        eventType,
        stepNumber,
        details,
        device,
      }),
    }).catch(() => {
      // Graceful silence if server is unavailable
    })
  } catch {
    // Fail silently in strict privacy environments
  }
}
