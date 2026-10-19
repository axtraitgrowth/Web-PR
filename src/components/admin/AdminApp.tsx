import React, { useState, useEffect } from 'react'
import { AdminLogin } from './AdminLogin'
import { AdminDashboard } from './AdminDashboard'
import { Loader2 } from 'lucide-react'

interface AdminAppProps {
  onBackToWebsite: () => void
}

const TOKEN_KEY = 'romantic_admin_token'
const USERNAME_KEY = 'romantic_admin_username'

export const AdminApp: React.FC<AdminAppProps> = ({ onBackToWebsite }) => {
  const [token, setToken] = useState<string>(() => {
    return (typeof window !== 'undefined' && localStorage.getItem(TOKEN_KEY)) || ''
  })
  const [username, setUsername] = useState<string>(() => {
    return (typeof window !== 'undefined' && localStorage.getItem(USERNAME_KEY)) || 'admin'
  })
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return typeof window !== 'undefined' && !!localStorage.getItem(TOKEN_KEY)
  })
  const [isVerifying, setIsVerifying] = useState<boolean>(() => {
    return typeof window !== 'undefined' && !!localStorage.getItem(TOKEN_KEY)
  })

  // Verify stored token with backend
  useEffect(() => {
    const savedToken = localStorage.getItem(TOKEN_KEY)
    if (!savedToken) {
      return
    }

    let isMounted = true

    fetch('/api/admin/me', {
      headers: {
        Authorization: `Bearer ${savedToken}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Unauthorized')
        return res.json()
      })
      .then((data) => {
        if (!isMounted) return
        setUsername(data.admin?.username || 'admin')
        setIsAuthenticated(true)
        setIsVerifying(false)
      })
      .catch(() => {
        if (!isMounted) return
        localStorage.removeItem(TOKEN_KEY)
        localStorage.removeItem(USERNAME_KEY)
        setToken('')
        setIsAuthenticated(false)
        setIsVerifying(false)
      })

    return () => {
      isMounted = false
    }
  }, [])

  const handleLoginSuccess = (newToken: string, newUsername: string) => {
    localStorage.setItem(TOKEN_KEY, newToken)
    localStorage.setItem(USERNAME_KEY, newUsername)
    setToken(newToken)
    setUsername(newUsername)
    setIsAuthenticated(true)
  }

  const handleLogout = () => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USERNAME_KEY)
    setToken('')
    setIsAuthenticated(false)
  }

  if (isVerifying) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3 bg-white/90 p-8 rounded-3xl border border-pink-100 shadow-sm">
          <Loader2 className="w-8 h-8 text-pink-500 animate-spin" />
          <span className="text-xs font-bold text-pink-900 tracking-wider">
            Securing Admin Session...
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full flex flex-col justify-start items-center py-6">
      {isAuthenticated ? (
        <AdminDashboard
          token={token}
          username={username}
          onLogout={handleLogout}
          onViewWebsite={onBackToWebsite}
        />
      ) : (
        <div className="my-auto w-full px-4">
          <AdminLogin
            onLoginSuccess={handleLoginSuccess}
            onBackToWebsite={onBackToWebsite}
          />
        </div>
      )}
    </div>
  )
}
