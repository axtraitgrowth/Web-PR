/**
 * Safe API client with automatic direct backend fallback
 */

const BACKEND_PORT = 3001

function getCandidateDirectUrls(cleanEndpoint: string): string[] {
  const candidates: string[] = []
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname
    if (hostname && hostname !== 'localhost' && hostname !== '127.0.0.1') {
      candidates.push(`http://${hostname}:${BACKEND_PORT}${cleanEndpoint}`)
    }
  }
  candidates.push(`http://127.0.0.1:${BACKEND_PORT}${cleanEndpoint}`)
  candidates.push(`http://localhost:${BACKEND_PORT}${cleanEndpoint}`)
  return candidates
}

export async function apiFetch(endpoint: string, options: RequestInit = {}): Promise<Response> {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`

  // 1. Try relative path first (standard Vite dev proxy or same-origin)
  let relativeFailed = false
  try {
    const res = await fetch(cleanEndpoint, options)
    const contentType = res.headers.get('content-type') || ''

    // If server returned 404 (proxy unrouted/missing endpoint), 502/503/504 gateway error,
    // or HTML SPA fallback rather than an API response:
    if (
      res.status === 404 ||
      res.status === 502 ||
      res.status === 503 ||
      res.status === 504 ||
      (contentType.includes('text/html') && cleanEndpoint.startsWith('/api'))
    ) {
      relativeFailed = true
    } else {
      return res
    }
  } catch {
    relativeFailed = true
  }

  // 2. Direct fallback to Express backend server on port 3001
  if (relativeFailed) {
    const directUrls = getCandidateDirectUrls(cleanEndpoint)
    for (const directUrl of directUrls) {
      try {
        const directRes = await fetch(directUrl, options)
        const directContentType = directRes.headers.get('content-type') || ''

        // Verify it didn't return an HTML 404 page from an unrelated local server
        if (!directContentType.includes('text/html') || directRes.ok) {
          return directRes
        }
      } catch {
        // Try next fallback candidate
      }
    }
  }

  throw new Error(
    `Server connection error. Could not connect to the backend API at ${cleanEndpoint} or port ${BACKEND_PORT}.`
  )
}
