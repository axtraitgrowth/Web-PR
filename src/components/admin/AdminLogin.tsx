import React, { useState } from 'react'
import { Lock, Eye, EyeOff, ShieldCheck, ArrowLeft, Loader2, AlertCircle } from 'lucide-react'
import { apiFetch } from '../../utils/api'

interface AdminLoginProps {
  onLoginSuccess: (token: string, username: string) => void
  onBackToWebsite: () => void
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess, onBackToWebsite }) => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    if (!username.trim() || !password) {
      setErrorMessage('Please manually enter both username and password.')
      return
    }

    setIsLoading(true)

    try {
      const res = await apiFetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username.trim(),
          password,
        }),
      })

      let data: any = null
      try {
        data = await res.json()
      } catch {
        if (res.status === 404) {
          data = { error: 'Admin API endpoint not found (404). Please ensure the backend is running on port 3001.' }
        } else {
          data = { error: `Server response error (${res.status})` }
        }
      }

      if (!res.ok) {
        setErrorMessage(data?.error || 'Authentication failed. Please verify credentials.')
        setIsLoading(false)
        return
      }

      onLoginSuccess(data.token, data.admin.username)
    } catch (err: any) {
      setErrorMessage(err.message || 'Server connection error. Please ensure the backend is running.')
      setIsLoading(false)
    }
  }


  return (
    <div className="w-full max-w-md mx-auto bg-white/95 backdrop-blur-md rounded-3xl p-6 sm:p-8 shadow-[0_12px_40px_-10px_rgba(255,140,165,0.25)] border border-pink-100 animate-fade-in-scale">
      {/* Header icon */}
      <div className="flex flex-col items-center text-center mb-6">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-500 text-white flex items-center justify-center shadow-md shadow-pink-500/25 mb-3">
          <Lock className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-black text-pink-950 tracking-tight">Admin Portal</h1>
        <p className="text-xs sm:text-sm text-pink-700/80 font-medium mt-1">
          Authorized personnel only. Please sign in manually.
        </p>
      </div>

      {/* Error alert */}
      {errorMessage && (
        <div className="mb-5 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-start gap-2 animate-fade-in-scale">
          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Login form with manual entry enforced */}
      <form onSubmit={handleSubmit} autoComplete="off" className="space-y-4">
        {/* Username field */}
        <div>
          <label
            htmlFor="admin-username-field"
            className="block text-xs font-bold text-pink-900 mb-1.5 uppercase tracking-wider"
          >
            Admin Username
          </label>
          <input
            id="admin-username-field"
            type="text"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter username"
            autoComplete="off"
            data-lpignore="true"
            data-1p-ignore="true"
            spellCheck={false}
            className="w-full px-4 py-3 rounded-2xl bg-pink-50/70 border border-pink-200 focus:border-pink-500 focus:bg-white text-sm font-semibold text-slate-800 placeholder-pink-300 outline-none transition-all"
          />
        </div>

        {/* Password field with Visibility Toggle Eye Icon */}
        <div>
          <label
            htmlFor="admin-password-field"
            className="block text-xs font-bold text-pink-900 mb-1.5 uppercase tracking-wider"
          >
            Password
          </label>
          <div className="relative flex items-center">
            <input
              id="admin-password-field"
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              autoComplete="new-password"
              data-lpignore="true"
              data-1p-ignore="true"
              spellCheck={false}
              className="w-full pl-4 pr-11 py-3 rounded-2xl bg-pink-50/70 border border-pink-200 focus:border-pink-500 focus:bg-white text-sm font-semibold text-slate-800 placeholder-pink-300 outline-none transition-all"
            />
            {/* Eye toggle icon button */}
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 p-1.5 rounded-xl text-pink-400 hover:text-pink-600 hover:bg-pink-100/60 transition-colors cursor-pointer"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              title={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4 stroke-[2.2]" />
              ) : (
                <Eye className="w-4 h-4 stroke-[2.2]" />
              )}
            </button>
          </div>
          <p className="mt-1 text-[11px] text-pink-400">
            Click the eye icon to verify entered password. Autofill is disabled for security.
          </p>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full mt-2 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 active:from-pink-700 active:to-rose-700 text-white font-bold text-sm shadow-md shadow-pink-500/25 hover:shadow-pink-500/40 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Verifying credentials...</span>
            </>
          ) : (
            <>
              <ShieldCheck className="w-4 h-4" />
              <span>Sign In to Dashboard</span>
            </>
          )}
        </button>
      </form>

      {/* Return to website link */}
      <div className="mt-6 pt-4 border-t border-pink-100 text-center">
        <button
          type="button"
          onClick={onBackToWebsite}
          className="inline-flex items-center gap-1.5 text-xs text-pink-700/80 hover:text-pink-900 font-semibold transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Date Invitation</span>
        </button>
      </div>

      <div className="mt-4 text-center">
        <span className="text-[10px] text-slate-400">
          Default credentials for setup: admin / AdminPassword!2026
        </span>
      </div>
    </div>
  )
}
