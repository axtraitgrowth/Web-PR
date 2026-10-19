import React, { useState, useEffect, useCallback, useMemo } from 'react'
import {
  Users,
  Eye,
  Heart,
  Calendar,
  Clock,
  Filter,
  RefreshCw,
  LogOut,
  Smartphone,
  Monitor,
  Tablet,
  CheckCircle2,
  Sparkles,
  Search,
  ExternalLink,
  Shield,
  KeyRound,
  Lock,
  Trash2,
  AlertTriangle,
} from 'lucide-react'
import { apiFetch } from '../../utils/api'

interface AdminDashboardProps {
  token: string
  username: string
  onLogout: () => void
  onViewWebsite: () => void
}

interface AnalyticsData {
  kpis: {
    totalPageViews: number
    totalVisitors: number
    acceptedCount: number
    sealedCount: number
    acceptanceRate: number
    completionRate: number
  }
  funnel: Array<{ step: number; label: string; count: number }>
  deviceBreakdown: Array<{ device_type: string; count: number }>
  browserBreakdown: Array<{ browser: string; count: number }>
  dailyTrend: Array<{ date: string; views: number; visitors: number }>
  recentVisitors: Array<{
    id: string
    first_visit: string
    last_visit: string
    device_type: string
    browser: string
    os: string
    referrer: string
    current_step: number
    accepted_date: number
    chosen_date: string | null
    chosen_time: string | null
    chosen_food: string | null
    date_sealed: number
  }>
  recentEvents: Array<any>
}

function calculatePresetDates(type: 'all' | 'today' | 'yesterday' | '7days' | '30days'): { start: string; end: string } {
  if (type === 'all') return { start: '', end: '' }
  const today = new Date()
  const formatDate = (d: Date) => d.toISOString().split('T')[0]

  if (type === 'today') {
    const s = formatDate(today)
    return { start: s, end: s }
  }
  if (type === 'yesterday') {
    const y = new Date(today)
    y.setDate(y.getDate() - 1)
    const s = formatDate(y)
    return { start: s, end: s }
  }
  if (type === '7days') {
    const past7 = new Date(today)
    past7.setDate(past7.getDate() - 7)
    return { start: formatDate(past7), end: formatDate(today) }
  }
  if (type === '30days') {
    const past30 = new Date(today)
    past30.setDate(past30.getDate() - 30)
    return { start: formatDate(past30), end: formatDate(today) }
  }
  return { start: '', end: '' }
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  token,
  username,
  onLogout,
  onViewWebsite,
}) => {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Date Filtering State
  const [quickFilter, setQuickFilter] = useState<'all' | 'today' | 'yesterday' | '7days' | '30days'>('all')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [appliedRange, setAppliedRange] = useState<{ start?: string; end?: string }>({})

  // Search filter for table
  const [searchQuery, setSearchQuery] = useState('')

  // Password change modal state
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [passwordStatus, setPasswordStatus] = useState<{ success?: string; error?: string } | null>(null)

  // Clear data confirmation modal
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [isClearing, setIsClearing] = useState(false)

  // Fetch analytics from server
  const fetchAnalytics = useCallback(async (start?: string, end?: string) => {
    setIsLoading(true)
    setError(null)

    try {
      let url = '/api/admin/analytics'
      const queryParams = new URLSearchParams()
      if (start) queryParams.append('startDate', start)
      if (end) queryParams.append('endDate', end)
      if (queryParams.toString()) {
        url += `?${queryParams.toString()}`
      }

      const res = await apiFetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (res.status === 401) {
        onLogout()
        return
      }

      if (!res.ok) {
        throw new Error('Failed to load analytics data')
      }

      const json = await res.json()
      setData(json)
    } catch (err: any) {
      setError(err.message || 'Error fetching analytics')
    } finally {
      setIsLoading(false)
    }
  }, [token, onLogout])

  // Initial load and filter updates
  useEffect(() => {
    let active = true
    const load = async () => {
      try {
        let url = '/api/admin/analytics'
        const queryParams = new URLSearchParams()
        if (appliedRange.start) queryParams.append('startDate', appliedRange.start)
        if (appliedRange.end) queryParams.append('endDate', appliedRange.end)
        if (queryParams.toString()) {
          url += `?${queryParams.toString()}`
        }

        const res = await apiFetch(url, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (!active) return

        if (res.status === 401) {
          onLogout()
          return
        }

        if (!res.ok) throw new Error('Failed to load analytics')
        const json = await res.json()
        setData(json)
        setIsLoading(false)
      } catch (err: any) {
        if (!active) return
        setError(err.message || 'Error fetching analytics')
        setIsLoading(false)
      }
    }

    load()
    return () => {
      active = false
    }
  }, [token, appliedRange, onLogout])

  // Handle Quick Filter selection
  const handleQuickFilter = (type: 'all' | 'today' | 'yesterday' | '7days' | '30days') => {
    setQuickFilter(type)
    const { start, end } = calculatePresetDates(type)
    setStartDate(start)
    setEndDate(end)
    setAppliedRange({ start: start || undefined, end: end || undefined })
  }

  // Handle Custom Date Range Apply
  const handleApplyCustomFilter = (e: React.FormEvent) => {
    e.preventDefault()
    setQuickFilter('all')
    setAppliedRange({
      start: startDate || undefined,
      end: endDate || undefined,
    })
  }

  // Handle Clear Filter
  const handleClearFilter = () => {
    setQuickFilter('all')
    setStartDate('')
    setEndDate('')
    setAppliedRange({})
  }

  // Handle Wipe/Clear All Visitor Analytics
  const handleClearAllRecords = async () => {
    setIsClearing(true)
    try {
      const res = await apiFetch('/api/admin/clear-analytics', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (res.ok) {
        setShowClearConfirm(false)
        await fetchAnalytics(appliedRange.start, appliedRange.end)
      }
    } catch {
      setError('Failed to clear analytics records.')
    } finally {
      setIsClearing(false)
    }
  }

  // Handle Password Change
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordStatus(null)

    try {
      const res = await apiFetch('/api/admin/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      })

      const json = await res.json()
      if (!res.ok) {
        setPasswordStatus({ error: json.error || 'Failed to update password' })
      } else {
        setPasswordStatus({ success: 'Password updated successfully!' })
        setCurrentPassword('')
        setNewPassword('')
        setTimeout(() => setShowPasswordModal(false), 1500)
      }
    } catch {
      setPasswordStatus({ error: 'Server error' })
    }
  }

  // Filter visitors by search query
  const filteredVisitors = useMemo(() => {
    const list = data?.recentVisitors || []
    if (!searchQuery.trim()) return list

    const q = searchQuery.toLowerCase()
    return list.filter((v) =>
      v.id.toLowerCase().includes(q) ||
      v.browser.toLowerCase().includes(q) ||
      v.device_type.toLowerCase().includes(q) ||
      (v.chosen_date && v.chosen_date.toLowerCase().includes(q)) ||
      (v.chosen_food && v.chosen_food.toLowerCase().includes(q))
    )
  }, [data?.recentVisitors, searchQuery])

  const formatTimestamp = (isoStr: string) => {
    try {
      const d = new Date(isoStr)
      return d.toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return isoStr
    }
  }

  const hasAnyVisitors = (data?.kpis.totalVisitors ?? 0) > 0

  return (
    <div className="w-full max-w-5xl mx-auto px-3 sm:px-6 py-6 text-slate-800 animate-fade-in-scale">
      {/* Top Navbar */}
      <header className="w-full bg-white/95 backdrop-blur-md rounded-3xl p-4 sm:p-5 shadow-sm border border-pink-100 flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-500 text-white flex items-center justify-center shadow-md shadow-pink-500/25">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-black text-pink-950 leading-tight">
                Date Invitation Analytics
              </h1>
              <span className="px-2 py-0.5 rounded-full bg-pink-100 text-pink-800 text-[10px] font-bold uppercase tracking-wider">
                Private Admin
              </span>
            </div>
            <p className="text-xs text-pink-700/80 font-medium">
              Signed in as <span className="font-bold">{username}</span>
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => fetchAnalytics(appliedRange.start, appliedRange.end)}
            className="p-2 sm:px-3 sm:py-2 rounded-xl bg-pink-50 hover:bg-pink-100 text-pink-800 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border border-pink-200/80"
            title="Refresh statistics"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            type="button"
            onClick={() => setShowClearConfirm(true)}
            className="p-2 sm:px-3 sm:py-2 rounded-xl bg-pink-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border border-pink-200/80"
            title="Clear all records"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset Data</span>
          </button>

          <button
            type="button"
            onClick={() => setShowPasswordModal(true)}
            className="p-2 sm:px-3 sm:py-2 rounded-xl bg-pink-50 hover:bg-pink-100 text-pink-800 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border border-pink-200/80"
            title="Change password"
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Credentials</span>
          </button>

          <button
            type="button"
            onClick={onViewWebsite}
            className="p-2 sm:px-3 sm:py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border border-rose-200/80"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">View Invitation</span>
          </button>

          <button
            type="button"
            onClick={onLogout}
            className="p-2 sm:px-3 sm:py-2 rounded-xl bg-slate-100 hover:bg-rose-100 text-slate-700 hover:text-rose-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border border-slate-200"
            title="Sign out"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Date Filter Bar */}
      <section className="w-full bg-white/90 backdrop-blur-sm rounded-3xl p-4 sm:p-5 shadow-xs border border-pink-100 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Quick presets */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-bold text-pink-900 flex items-center gap-1 mr-1">
              <Filter className="w-3.5 h-3.5 text-pink-600" />
              Filter:
            </span>
            {[
              { id: 'all', label: 'All Time' },
              { id: 'today', label: 'Today' },
              { id: 'yesterday', label: 'Yesterday' },
              { id: '7days', label: 'Last 7 Days' },
              { id: '30days', label: 'Last 30 Days' },
            ].map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleQuickFilter(preset.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  quickFilter === preset.id && !appliedRange.start
                    ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-xs'
                    : 'bg-pink-50 hover:bg-pink-100 text-pink-900 border border-pink-100'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>

          {/* Custom Date Range Picker */}
          <form
            onSubmit={handleApplyCustomFilter}
            className="flex items-center gap-2 flex-wrap text-xs font-semibold"
          >
            <div className="flex items-center gap-1.5 bg-pink-50/80 px-2.5 py-1.5 rounded-xl border border-pink-200/80">
              <Calendar className="w-3.5 h-3.5 text-pink-500" />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-transparent text-slate-800 outline-none text-xs"
                title="Start date"
              />
            </div>
            <span className="text-pink-400 font-bold">to</span>
            <div className="flex items-center gap-1.5 bg-pink-50/80 px-2.5 py-1.5 rounded-xl border border-pink-200/80">
              <Calendar className="w-3.5 h-3.5 text-pink-500" />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-transparent text-slate-800 outline-none text-xs"
                title="End date"
              />
            </div>
            <button
              type="submit"
              className="px-3 py-1.5 bg-pink-500 hover:bg-pink-600 text-white rounded-xl font-bold cursor-pointer transition-colors shadow-2xs"
            >
              Apply Range
            </button>
            {(appliedRange.start || appliedRange.end) && (
              <button
                type="button"
                onClick={handleClearFilter}
                className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium cursor-pointer transition-colors"
              >
                Clear
              </button>
            )}
          </form>
        </div>

        {/* Filter badge confirmation */}
        {(appliedRange.start || appliedRange.end) && (
          <div className="mt-3 pt-2.5 border-t border-pink-100 flex items-center justify-between text-xs text-pink-800 font-medium">
            <span>
              Showing activity from <span className="font-bold">{appliedRange.start || 'Beginning'}</span> to{' '}
              <span className="font-bold">{appliedRange.end || 'Now'}</span>
            </span>
            <span className="text-[11px] text-pink-500">Custom Filter Active</span>
          </div>
        )}
      </section>

      {/* Error alert if fetch failed */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm font-semibold mb-6">
          {error}
        </div>
      )}

      {/* 4 KPI Summary Cards */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        {/* Total Page Views */}
        <div className="bg-white/95 rounded-3xl p-4 sm:p-5 border border-pink-100 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Pageviews
            </span>
            <span className="p-2 rounded-xl bg-pink-50 text-pink-600">
              <Eye className="w-4 h-4" />
            </span>
          </div>
          <div>
            <h3 className="text-2xl sm:text-3xl font-black text-pink-950">
              {data?.kpis.totalPageViews ?? 0}
            </h3>
            <p className="text-[11px] text-pink-600/90 font-semibold mt-0.5">
              {hasAnyVisitors ? 'Across all interactions' : 'No visits recorded yet'}
            </p>
          </div>
        </div>

        {/* Unique Visitors */}
        <div className="bg-white/95 rounded-3xl p-4 sm:p-5 border border-pink-100 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Unique Visitors
            </span>
            <span className="p-2 rounded-xl bg-rose-50 text-rose-600">
              <Users className="w-4 h-4" />
            </span>
          </div>
          <div>
            <h3 className="text-2xl sm:text-3xl font-black text-rose-950">
              {data?.kpis.totalVisitors ?? 0}
            </h3>
            <p className="text-[11px] text-rose-600/90 font-semibold mt-0.5">
              {hasAnyVisitors ? 'Unique user sessions' : 'No visitors yet'}
            </p>
          </div>
        </div>

        {/* Acceptance Rate (Said Yes) */}
        <div className="bg-white/95 rounded-3xl p-4 sm:p-5 border border-pink-100 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Said "YES!"
            </span>
            <span className="p-2 rounded-xl bg-pink-100 text-pink-600">
              <Heart className="w-4 h-4 fill-pink-500 text-pink-500" />
            </span>
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <h3 className="text-2xl sm:text-3xl font-black text-pink-950">
                {data?.kpis.acceptedCount ?? 0}
              </h3>
              {hasAnyVisitors && (
                <span className="text-xs font-bold text-pink-500">
                  ({data?.kpis.acceptanceRate ?? 0}%)
                </span>
              )}
            </div>
            <p className="text-[11px] text-pink-600/90 font-semibold mt-0.5">
              {hasAnyVisitors ? 'Invitation acceptances 💖' : 'Awaiting first response'}
            </p>
          </div>
        </div>

        {/* Sealed Date (Completed Itinerary) */}
        <div className="bg-white/95 rounded-3xl p-4 sm:p-5 border border-pink-100 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Dates Sealed
            </span>
            <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <h3 className="text-2xl sm:text-3xl font-black text-emerald-950">
                {data?.kpis.sealedCount ?? 0}
              </h3>
              {hasAnyVisitors && (
                <span className="text-xs font-bold text-emerald-600">
                  ({data?.kpis.completionRate ?? 0}%)
                </span>
              )}
            </div>
            <p className="text-[11px] text-emerald-700/90 font-semibold mt-0.5">
              {hasAnyVisitors ? 'Officially planned 🎉' : 'Awaiting completion'}
            </p>
          </div>
        </div>
      </section>

      {/* Date Invitation Funnel & Devices Row */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Step-by-Step Funnel Progression (2 cols) */}
        <div className="lg:col-span-2 bg-white/95 rounded-3xl p-5 sm:p-6 border border-pink-100 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-extrabold text-base text-pink-950 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-pink-500" />
                  Invitation Progression Funnel
                </h3>
                <p className="text-xs text-slate-500">
                  Real-time tracking of each step completed by your date
                </p>
              </div>
            </div>

            {hasAnyVisitors ? (
              <div className="space-y-3">
                {data?.funnel.map((item) => {
                  const maxVisitors = data?.kpis.totalVisitors || 1
                  const percentage = Math.round((item.count / maxVisitors) * 100)

                  return (
                    <div key={item.step} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                        <span className="flex items-center gap-1.5">
                          <span className="w-5 h-5 rounded-full bg-pink-100 text-pink-700 text-[10px] flex items-center justify-center font-extrabold">
                            {item.step}
                          </span>
                          {item.label}
                        </span>
                        <span className="text-pink-950">
                          {item.count} visitor{item.count !== 1 ? 's' : ''}{' '}
                          <span className="text-slate-400 font-normal">({percentage}%)</span>
                        </span>
                      </div>
                      <div className="w-full h-2.5 rounded-full bg-pink-50 overflow-hidden border border-pink-100/60">
                        <div
                          className="h-full bg-gradient-to-r from-pink-400 to-rose-500 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, Math.max(item.count > 0 ? 5 : 0, percentage))}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="py-12 px-4 flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 rounded-2xl bg-pink-50 text-pink-400 flex items-center justify-center mb-3 shadow-inner">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h4 className="font-extrabold text-pink-950 text-sm mb-1">No data available yet</h4>
                <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
                  Once your date opens the invitation link, their verified step-by-step progress will display here in real time.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Device & Browser Card (1 col) */}
        <div className="bg-white/95 rounded-3xl p-5 sm:p-6 border border-pink-100 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-extrabold text-base text-pink-950 mb-1">
              Devices & Browsers
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Visitor client hardware & technology
            </p>

            {hasAnyVisitors && data?.deviceBreakdown.length ? (
              <>
                <div className="space-y-2.5 mb-5">
                  {data.deviceBreakdown.map((dev) => (
                    <div
                      key={dev.device_type}
                      className="flex items-center justify-between p-2.5 rounded-2xl bg-pink-50/60 border border-pink-100 text-xs font-semibold"
                    >
                      <div className="flex items-center gap-2">
                        {dev.device_type === 'Mobile' ? (
                          <Smartphone className="w-4 h-4 text-pink-600" />
                        ) : dev.device_type === 'Tablet' ? (
                          <Tablet className="w-4 h-4 text-pink-600" />
                        ) : (
                          <Monitor className="w-4 h-4 text-pink-600" />
                        )}
                        <span>{dev.device_type}</span>
                      </div>
                      <span className="font-bold text-pink-900">{dev.count} sessions</span>
                    </div>
                  ))}
                </div>

                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Top Browsers
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {data.browserBreakdown.map((b) => (
                    <span
                      key={b.browser}
                      className="px-2.5 py-1 rounded-xl bg-pink-100/70 text-pink-900 text-xs font-bold border border-pink-200"
                    >
                      {b.browser}: {b.count}
                    </span>
                  ))}
                </div>
              </>
            ) : (
              <div className="py-12 flex flex-col items-center justify-center text-center text-slate-400">
                <div className="w-10 h-10 rounded-2xl bg-pink-50 text-pink-400 flex items-center justify-center mb-2.5">
                  <Smartphone className="w-5 h-5" />
                </div>
                <p className="text-xs font-bold text-pink-950 mb-0.5">No data available yet</p>
                <p className="text-[11px] text-slate-400 max-w-[200px]">
                  Hardware and browser metrics will appear upon the first verified visit.
                </p>
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-pink-100 text-[11px] text-slate-400">
            🔒 High-level privacy: no IP addresses or personal fingerprinting stored.
          </div>
        </div>
      </section>

      {/* Visitor Activity Table */}
      <section className="w-full bg-white/95 rounded-3xl p-5 sm:p-6 border border-pink-100 shadow-xs mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="font-extrabold text-base text-pink-950">
              Recent Visitor Sessions
            </h3>
            <p className="text-xs text-slate-500">
              Detailed log of activity, choices made, and current progress
            </p>
          </div>

          {/* Table search filter */}
          {hasAnyVisitors && (
            <div className="relative">
              <Search className="w-4 h-4 text-pink-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search session, device, food..."
                className="pl-9 pr-3 py-1.5 rounded-xl bg-pink-50/70 border border-pink-200 text-xs font-semibold text-slate-800 placeholder-pink-300 outline-none w-full sm:w-64"
              />
            </div>
          )}
        </div>

        {/* Table or Clean Empty State */}
        {hasAnyVisitors ? (
          <div className="w-full overflow-x-auto rounded-2xl border border-pink-100">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-pink-50/80 text-pink-900 font-bold border-b border-pink-100">
                  <th className="py-2.5 px-3">Session</th>
                  <th className="py-2.5 px-3">Last Active</th>
                  <th className="py-2.5 px-3">Device & OS</th>
                  <th className="py-2.5 px-3">Highest Stage</th>
                  <th className="py-2.5 px-3">Date Picked</th>
                  <th className="py-2.5 px-3">Time Picked</th>
                  <th className="py-2.5 px-3">Food & Drinks</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-pink-50">
                {filteredVisitors.length > 0 ? (
                  filteredVisitors.map((visitor) => (
                    <tr key={visitor.id} className="hover:bg-pink-50/40 transition-colors">
                      {/* Session ID */}
                      <td className="py-2.5 px-3 font-mono text-[11px] text-pink-700 font-semibold">
                        {visitor.id.length > 14 ? `${visitor.id.substring(0, 12)}...` : visitor.id}
                      </td>

                      {/* Last Active */}
                      <td className="py-2.5 px-3 text-slate-600 whitespace-nowrap">
                        {formatTimestamp(visitor.last_visit)}
                      </td>

                      {/* Device & OS */}
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span className="font-semibold text-slate-800">{visitor.device_type}</span>
                        <span className="text-[11px] text-slate-400 block">
                          {visitor.browser} • {visitor.os}
                        </span>
                      </td>

                      {/* Highest Stage */}
                      <td className="py-2.5 px-3 font-bold text-pink-900">
                        Stage {visitor.current_step} of 7
                      </td>

                      {/* Date Picked */}
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        {visitor.chosen_date ? (
                          <span className="font-semibold text-pink-950 flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-pink-500" />
                            {visitor.chosen_date}
                          </span>
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>

                      {/* Time Picked */}
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        {visitor.chosen_time ? (
                          <span className="font-semibold text-pink-950 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-pink-500" />
                            {visitor.chosen_time}
                          </span>
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>

                      {/* Food Picked */}
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        {visitor.chosen_food ? (
                          <span className="px-2 py-0.5 rounded-full bg-pink-100 font-bold text-pink-900 text-[11px]">
                            {visitor.chosen_food}
                          </span>
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        {visitor.date_sealed === 1 ? (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-[10px] inline-flex items-center gap-1">
                            <span>✓ Sealed 🎉</span>
                          </span>
                        ) : visitor.accepted_date === 1 ? (
                          <span className="px-2 py-0.5 rounded-full bg-pink-100 text-pink-800 font-bold text-[10px]">
                            Said Yes 💖
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium text-[10px]">
                            Viewing 👀
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400 italic">
                      No visitor records match your search filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-14 px-4 flex flex-col items-center justify-center text-center bg-pink-50/40 rounded-2xl border border-pink-100/70">
            <div className="w-14 h-14 rounded-3xl bg-pink-100/70 text-pink-400 flex items-center justify-center mb-3 shadow-inner">
              <Users className="w-7 h-7 text-pink-500" />
            </div>
            <h4 className="font-black text-pink-950 text-base mb-1">No data available yet</h4>
            <p className="text-xs text-slate-500 max-w-sm mb-5 leading-relaxed">
              No genuine visitor records have been collected yet. Once a real user opens and interacts with your date invitation, their verified activity and choices will appear here automatically.
            </p>
            <button
              type="button"
              onClick={onViewWebsite}
              className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs font-bold shadow-md shadow-pink-500/20 hover:scale-102 active:scale-98 transition-all inline-flex items-center gap-1.5 cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Open Public Invitation Link</span>
            </button>
          </div>
        )}
      </section>

      {/* Clear Records Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in-scale">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full border border-pink-100 shadow-xl">
            <div className="flex items-center gap-2.5 text-rose-600 mb-3 font-bold text-sm">
              <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0" />
              <span>Reset Analytics Data</span>
            </div>
            <p className="text-xs text-slate-600 mb-5 leading-relaxed">
              Are you sure you want to clear all recorded visits, sessions, and events? This will reset all metrics to zero so you can start fresh with clean, genuine records.
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowClearConfirm(false)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isClearing}
                onClick={handleClearAllRecords}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-500 hover:bg-rose-600 active:bg-rose-700 text-white cursor-pointer shadow-xs"
              >
                {isClearing ? 'Clearing...' : 'Yes, Reset All Data'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in-scale">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full border border-pink-100 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-black text-pink-950 text-base flex items-center gap-2">
                <Lock className="w-4 h-4 text-pink-500" />
                Change Admin Password
              </h3>
              <button
                type="button"
                onClick={() => setShowPasswordModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer font-bold"
              >
                ✕
              </button>
            </div>

            {passwordStatus?.error && (
              <div className="p-2.5 rounded-xl bg-rose-50 text-rose-700 text-xs font-semibold mb-3">
                {passwordStatus.error}
              </div>
            )}
            {passwordStatus?.success && (
              <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-semibold mb-3">
                {passwordStatus.success}
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-pink-50/70 border border-pink-200 text-xs outline-none focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  New Password (min 6 chars)
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-pink-50/70 border border-pink-200 text-xs outline-none focus:bg-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl text-xs font-bold bg-pink-500 hover:bg-pink-600 text-white cursor-pointer shadow-xs"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
