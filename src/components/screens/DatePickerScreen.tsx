import React, { useState, useMemo } from 'react'
import { ROMANTIC_CONFIG } from '../../config/dateConfig'
import { ChevronLeft, ChevronRight, ArrowLeft, ArrowRight, AlertCircle, Heart } from 'lucide-react'

interface DatePickerScreenProps {
  selectedDate: string | null
  onSelectDate: (dateStr: string) => void
  onContinue: () => void
  onBack: () => void
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

const DAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

export const DatePickerScreen: React.FC<DatePickerScreenProps> = ({
  selectedDate,
  onSelectDate,
  onContinue,
  onBack,
}) => {
  const [today] = useState(() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d
  })

  // If a date was already selected previously, initialize viewing that month; otherwise current month
  const initialYearMonth = useMemo(() => {
    if (selectedDate) {
      const parts = selectedDate.split('-').map(Number)
      if (parts.length === 3) {
        return { year: parts[0], month: parts[1] - 1 }
      }
    }
    return { year: today.getFullYear(), month: today.getMonth() }
  }, [selectedDate, today])

  const [viewYear, setViewYear] = useState(initialYearMonth.year)
  const [viewMonth, setViewMonth] = useState(initialYearMonth.month)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Prevent navigating to months before the current month
  const canGoPrev = useMemo(() => {
    if (viewYear > today.getFullYear()) return true
    return viewYear === today.getFullYear() && viewMonth > today.getMonth()
  }, [viewYear, viewMonth, today])

  const handlePrevMonth = () => {
    if (!canGoPrev) return
    setErrorMessage(null)
    if (viewMonth === 0) {
      setViewMonth(11)
      setViewYear((y) => y - 1)
    } else {
      setViewMonth((m) => m - 1)
    }
  }

  const handleNextMonth = () => {
    setErrorMessage(null)
    if (viewMonth === 11) {
      setViewMonth(0)
      setViewYear((y) => y + 1)
    } else {
      setViewMonth((m) => m + 1)
    }
  }

  // Calculate calendar days
  const calendarCells = useMemo(() => {
    const firstDayIndex = new Date(viewYear, viewMonth, 1).getDay()
    const daysInCurrentMonth = new Date(viewYear, viewMonth + 1, 0).getDate()

    const cells: Array<{
      day: number | null
      dateString: string | null
      isPast: boolean
      isToday: boolean
      isSelected: boolean
    }> = []

    // Blank padding before first day
    for (let i = 0; i < firstDayIndex; i++) {
      cells.push({
        day: null,
        dateString: null,
        isPast: false,
        isToday: false,
        isSelected: false,
      })
    }

    // Days of the month
    for (let day = 1; day <= daysInCurrentMonth; day++) {
      const cellDate = new Date(viewYear, viewMonth, day)
      cellDate.setHours(0, 0, 0, 0)

      const yyyy = viewYear
      const mm = String(viewMonth + 1).padStart(2, '0')
      const dd = String(day).padStart(2, '0')
      const dateString = `${yyyy}-${mm}-${dd}`

      const isPast = cellDate < today
      const isToday = cellDate.getTime() === today.getTime()
      const isSelected = selectedDate === dateString

      cells.push({
        day,
        dateString,
        isPast,
        isToday,
        isSelected,
      })
    }

    return cells
  }, [viewYear, viewMonth, today, selectedDate])

  const handleDayClick = (dateStr: string) => {
    setErrorMessage(null)
    onSelectDate(dateStr)
  }

  const handleContinueClick = () => {
    if (!selectedDate) {
      setErrorMessage('Please pick a date for our adventure! 💕')
      return
    }
    onContinue()
  }

  // Format selected date nicely for human display
  const formattedSelectedDate = useMemo(() => {
    if (!selectedDate) return null
    const [y, m, d] = selectedDate.split('-').map(Number)
    const dateObj = new Date(y, m - 1, d)
    return dateObj.toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }, [selectedDate])

  return (
    <div className="flex flex-col items-center text-center w-full">
      {/* Heading */}
      <h2 className="text-xl sm:text-2xl font-extrabold text-pink-900 tracking-tight mb-1">
        {ROMANTIC_CONFIG.datePicker.heading}
      </h2>

      {/* Supporting text */}
      <p className="text-xs sm:text-sm text-pink-700/80 font-medium mb-4">
        {ROMANTIC_CONFIG.datePicker.subtext}
      </p>

      {/* Calendar Card Box */}
      <div className="w-full bg-pink-50/70 rounded-2xl p-3 sm:p-4 border border-pink-100 shadow-inner mb-3">
        {/* Month Navigation Header */}
        <div className="flex items-center justify-between mb-3 px-1">
          <button
            type="button"
            onClick={handlePrevMonth}
            disabled={!canGoPrev}
            className={`p-1.5 rounded-xl transition-all ${
              canGoPrev
                ? 'hover:bg-pink-200/80 text-pink-800 active:scale-90 cursor-pointer'
                : 'text-pink-300 opacity-40 cursor-not-allowed'
            }`}
            aria-label="Previous Month"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <span className="font-bold text-pink-900 text-sm sm:text-base">
            {MONTH_NAMES[viewMonth]} {viewYear}
          </span>

          <button
            type="button"
            onClick={handleNextMonth}
            className="p-1.5 rounded-xl hover:bg-pink-200/80 text-pink-800 active:scale-90 transition-all cursor-pointer"
            aria-label="Next Month"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Day of Week Labels */}
        <div className="grid grid-cols-7 gap-1 mb-1 text-center">
          {DAY_LABELS.map((label, idx) => (
            <span
              key={label}
              className={`text-[11px] sm:text-xs font-bold py-1 ${
                idx === 0 || idx === 6 ? 'text-rose-500' : 'text-pink-700'
              }`}
            >
              {label}
            </span>
          ))}
        </div>

        {/* Calendar Day Grid */}
        <div className="grid grid-cols-7 gap-1 text-center">
          {calendarCells.map((cell, index) => {
            if (!cell.day || !cell.dateString) {
              return <div key={`empty-${index}`} className="w-8 h-8 sm:w-9 sm:h-9" />
            }

            return (
              <button
                key={cell.dateString}
                type="button"
                disabled={cell.isPast}
                onClick={() => handleDayClick(cell.dateString!)}
                className={`w-8 h-8 sm:w-9 sm:h-9 mx-auto rounded-xl flex items-center justify-center text-xs sm:text-sm font-semibold transition-all duration-150 relative ${
                  cell.isSelected
                    ? 'bg-gradient-to-tr from-pink-500 to-rose-500 text-white shadow-md shadow-pink-500/30 scale-105 z-10'
                    : cell.isPast
                    ? 'text-pink-300/60 cursor-not-allowed line-through'
                    : 'text-slate-800 hover:bg-pink-200/70 active:scale-95 cursor-pointer'
                } ${cell.isToday && !cell.isSelected ? 'ring-1.5 ring-pink-400 font-bold text-pink-700' : ''}`}
                aria-label={`${cell.dateString}${cell.isSelected ? ', selected' : ''}`}
              >
                {cell.day}
                {cell.isSelected && (
                  <span className="absolute -top-1 -right-1 text-[9px]">💖</span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Selected date display badge */}
      <div className="min-h-[28px] mb-4 flex items-center justify-center">
        {formattedSelectedDate ? (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-100 text-pink-900 text-xs sm:text-sm font-semibold border border-pink-200 animate-fade-in-scale">
            <Heart className="w-3.5 h-3.5 fill-pink-500 text-pink-500" />
            <span>Selected: {formattedSelectedDate}</span>
          </div>
        ) : (
          <span className="text-xs text-pink-500/80 font-medium">
            Tap a date above to select 🗓️
          </span>
        )}
      </div>

      {/* Validation alert */}
      {errorMessage && (
        <div className="w-full mb-4 px-3 py-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center justify-center gap-1.5 animate-fade-in-scale">
          <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Navigation Buttons: Back and Continue */}
      <div className="w-full flex items-center justify-between gap-3 pt-2">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 py-2.5 sm:py-3 px-4 rounded-xl bg-pink-100/80 hover:bg-pink-200 active:bg-pink-300 text-pink-800 font-semibold text-sm transition-all duration-150 flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <button
          type="button"
          onClick={handleContinueClick}
          className="flex-1 py-2.5 sm:py-3 px-4 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 active:from-pink-700 active:to-rose-700 text-white font-bold text-sm shadow-md shadow-pink-500/25 hover:shadow-pink-500/40 active:scale-98 transition-all duration-150 flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <span>Continue</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
