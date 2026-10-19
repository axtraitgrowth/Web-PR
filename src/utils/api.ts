/**
 * Universal API client supporting both Vercel Serverless (production)
 * and local Express development with smart fallback.
 */

const LOCAL_BACKEND_PORT = 3001

function isLocalEnvironment(): boolean {
  if (typeof window === 'undefined') return true
  const h = window.location.hostname
  return (
    h === 'localhost' ||
    h === '127.0.0.1' ||
    h.startsWith('192.168.') ||
    h.startsWith('10.') ||
    h.endsWith('.local')
  )
}

function getLocalDirectUrls(cleanEndpoint: string): string[] {
  const candidates: string[] = []
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname
    if (hostname && hostname !== 'localhost' && hostname !== '127.0.0.1') {
      candidates.push(`http://${hostname}:${LOCAL_BACKEND_PORT}${cleanEndpoint}`)
    }
  }
  candidates.push(`http://127.0.0.1:${LOCAL_BACKEND_PORT}${cleanEndpoint}`)
  candidates.push(`http://localhost:${LOCAL_BACKEND_PORT}${cleanEndpoint}`)
  return candidates
}

export async function apiFetch(endpoint: string, options: RequestInit = {}): Promise<Response> {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
  const local = isLocalEnvironment()

  // 1. Try relative path (Vercel Serverless or Vite dev proxy)
  try {
    const res = await fetch(cleanEndpoint, options)
    const contentType = res.headers.get('content-type') || ''

    // If we're on a public domain (like Vercel), the same-origin /api endpoint is our source of truth
    if (!local) {
      if (res.status === 404 || contentType.includes('text/html')) {
        throw new Error('API service is updating. Please refresh in a moment.')
      }
      return res
    }

    // In local dev, if proxy returned gateway errors or unhandled 404, fallback to direct port
    if (
      res.status === 404 ||
      res.status === 502 ||
      res.status === 503 ||
      res.status === 504 ||
      (contentType.includes('text/html') && cleanEndpoint.startsWith('/api'))
    ) {
      // Continue to local fallback
    } else {
      return res
    }
  } catch (err: any) {
    if (!local) {
      throw new Error(err?.message || 'Server connection error. Please check your internet connection.')
    }
  }

  // 2. Direct fallback for local development (port 3001)
  if (local) {
    const directUrls = getLocalDirectUrls(cleanEndpoint)
    for (const directUrl of directUrls) {
      try {
        const directRes = await fetch(directUrl, options)
        const directContentType = directRes.headers.get('content-type') || ''

        if (!directContentType.includes('text/html') || directRes.ok) {
          return directRes
        }
      } catch {
        // Try next candidate
      }
    }
  }

  throw new Error(
    local
      ? `Local server error. Please ensure the backend is running on port ${LOCAL_BACKEND_PORT}.`
      : 'Server connection error. Please check your connection and try again.'
  )
}
