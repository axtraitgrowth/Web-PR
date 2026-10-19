/**
 * Safe API client with automatic direct backend fallback
 */

const BACKEND_PORT = 3001

export async function apiFetch(endpoint: string, options: RequestInit = {}): Promise<Response> {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`

  // 1. Try relative path (standard Vite proxy or production same-origin)
  try {
    const res = await fetch(cleanEndpoint, options)
    // If Vite proxy returned Bad Gateway / Gateway Timeout, fallback to direct port
    if (res.status === 502 || res.status === 503 || res.status === 504) {
      throw new Error(`Proxy gateway error (${res.status})`)
    }
    return res
  } catch {
    // 2. Direct fallback to backend server on port 3001
    const host = typeof window !== 'undefined' ? window.location.hostname : '127.0.0.1'
    const directUrl = `http://${host}:${BACKEND_PORT}${cleanEndpoint}`

    try {
      const directRes = await fetch(directUrl, options)
      return directRes
    } catch {
      // Try 127.0.0.1 if hostname wasn't localhost
      if (host !== '127.0.0.1' && host !== 'localhost') {
        try {
          return await fetch(`http://127.0.0.1:${BACKEND_PORT}${cleanEndpoint}`, options)
        } catch {}
      }
      throw new Error(
        `Server connection error. Could not connect to the backend at ${cleanEndpoint} or http://${host}:${BACKEND_PORT}.`
      )
    }
  }
}
