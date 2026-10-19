import React, { useMemo } from 'react'
import { ROMANTIC_CONFIG } from '../../config/dateConfig'
import type { FoodOption } from '../../types'
import { fireHeartConfetti } from '../../utils/confetti'
import { ArrowLeft, Check, HeartHandshake, Calendar, Clock, Utensils, ShieldCheck } from 'lucide-react'

interface DateAgreementScreenProps {
  visitorName: string
  onNameChange: (name: string) => void
  selectedDate: string | null
  selectedTime: string | null
  selectedFood: FoodOption | null
  agreementChecked: boolean
  onToggleAgreement: (checked: boolean) => void
  onConfirm: () => void
  onBack: () => void
}

export const DateAgreementScreen: React.FC<DateAgreementScreenProps> = ({
  visitorName,
  onNameChange,
  selectedDate,
  selectedTime,
  selectedFood,
  agreementChecked,
  onToggleAgreement,
  onConfirm,
  onBack,
}) => {
  const formattedDate = useMemo(() => {
    if (!selectedDate) return 'Upcoming day'
    const [y, m, d] = selectedDate.split('-').map(Number)
    const dateObj = new Date(y, m - 1, d)
    return dateObj.toLocaleDateString(undefined, {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }, [selectedDate])

  const handleSealClick = () => {
    if (!agreementChecked || !visitorName.trim()) return
    fireHeartConfetti()
    onConfirm()
  }

  return (
    <div className="flex flex-col items-center text-center w-full">
      {/* Header icon / stamp */}
      <div className="w-12 h-12 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 mb-2 shadow-xs">
        <HeartHandshake className="w-6 h-6" />
      </div>

      {/* Heading */}
      <h2 className="text-xl sm:text-2xl font-extrabold text-pink-900 tracking-tight mb-0.5">
        {ROMANTIC_CONFIG.agreement.heading}
      </h2>

      {/* Subtitle */}
      <p className="text-xs sm:text-sm text-pink-700/80 font-medium mb-4">
        {ROMANTIC_CONFIG.agreement.subtitle}
      </p>

      {/* Official Summary Card */}
      <div className="w-full bg-pink-50/80 rounded-2xl p-4 border border-pink-200/90 text-left mb-3 shadow-inner space-y-2.5">
        <div className="flex items-center justify-between pb-2 border-b border-pink-200/70 text-xs font-bold text-pink-900">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-pink-600" />
            OFFICIAL DATE CERTIFICATE
          </span>
          <span className="px-2 py-0.5 rounded-full bg-pink-200/80 text-[10px] text-pink-800 uppercase tracking-wider font-extrabold">
            Active
          </span>
        </div>

        {/* Selected Values Grid */}
        <div className="grid grid-cols-1 gap-2 text-xs sm:text-sm">
          <div className="flex items-center justify-between bg-white/70 px-3 py-1.5 rounded-xl border border-pink-100">
            <span className="text-slate-600 flex items-center gap-1.5 font-medium">
              <span className="text-pink-500">🌸</span>
              Reserved for:
            </span>
            <span className="font-extrabold text-pink-950">{visitorName || 'Special Someone'}</span>
          </div>

          <div className="flex items-center justify-between bg-white/70 px-3 py-1.5 rounded-xl border border-pink-100">
            <span className="text-slate-600 flex items-center gap-1.5 font-medium">
              <Calendar className="w-3.5 h-3.5 text-pink-500" />
              Date:
            </span>
            <span className="font-bold text-pink-950">{formattedDate}</span>
          </div>

          <div className="flex items-center justify-between bg-white/70 px-3 py-1.5 rounded-xl border border-pink-100">
            <span className="text-slate-600 flex items-center gap-1.5 font-medium">
              <Clock className="w-3.5 h-3.5 text-pink-500" />
              Time:
            </span>
            <span className="font-bold text-pink-950">{selectedTime || 'Pending'}</span>
          </div>

          <div className="flex items-center justify-between bg-white/70 px-3 py-1.5 rounded-xl border border-pink-100">
            <span className="text-slate-600 flex items-center gap-1.5 font-medium">
              <Utensils className="w-3.5 h-3.5 text-pink-500" />
              Food & Drink:
            </span>
            <span className="font-bold text-pink-950">
              {selectedFood ? `${selectedFood.emoji} ${selectedFood.name}` : 'Pending'}
            </span>


          </div>

          <div className="flex items-center justify-between px-2 pt-1 text-[11px] text-slate-500">
            <span>Date status:</span>
            <span className="font-semibold text-rose-600">Officially planned 📌</span>
          </div>

          <div className="flex items-center justify-between px-2 text-[11px] text-slate-500">
            <span>Agreement status:</span>
            <span className="font-semibold text-pink-600">Accepted with love 💌</span>
          </div>
        </div>
      </div>

      {/* Humorous Agreement Terms */}
      <div className="w-full bg-white/80 rounded-2xl p-3.5 border border-pink-100 text-left mb-3">
        <h4 className="text-xs font-bold text-pink-900 mb-2 flex items-center gap-1.5">
          <span>📜 Terms & Conditions of Having Fun:</span>
        </h4>
        <ul className="space-y-1.5 text-xs text-slate-700">
          {ROMANTIC_CONFIG.agreement.terms.map((term, index) => (
            <li key={index} className="flex items-start gap-1.5 leading-snug">
              <span className="text-pink-500 select-none">💖</span>
              <span>{term}</span>
            </li>
          ))}
        </ul>

        {/* Cost Notice */}
        <div className="mt-3 pt-2.5 border-t border-pink-100 flex items-center justify-between">
          <span className="text-xs font-extrabold text-pink-900">
            {ROMANTIC_CONFIG.agreement.costText}
          </span>
          <span className="text-[10px] text-pink-600 font-semibold">
            Priceless, forever & always ✨
          </span>
        </div>
      </div>

      {/* Signature Name Confirmation Field */}
      <div className="w-full bg-white/90 rounded-2xl p-3 border border-pink-100 text-left mb-3 shadow-2xs">
        <label htmlFor="signature-name-input" className="block text-xs font-bold text-pink-900 mb-1 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <span>✍️</span>
            <span>Signed with love by <span className="text-rose-500 font-extrabold">*</span></span>
          </span>
          <span className="text-[10px] text-pink-500 font-semibold uppercase bg-pink-100/70 px-2 py-0.5 rounded-full">
            Required
          </span>
        </label>
        <input
          id="signature-name-input"
          type="text"
          required
          maxLength={60}
          value={visitorName}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="Enter your name to sign..."
          className="w-full px-3 py-2 rounded-xl bg-pink-50/70 border border-pink-200 text-xs font-bold text-pink-950 outline-none focus:bg-white focus:border-pink-500 transition-colors"
        />
        {!visitorName.trim() && (
          <p className="mt-1 text-[11px] text-rose-500 font-bold">
            Please enter your name to seal the date! 💗
          </p>
        )}
      </div>

      {/* Checkbox agreement */}
      <label
        htmlFor="date-agreement-checkbox"
        className="w-full flex items-center gap-2.5 p-3 rounded-2xl bg-pink-100/70 hover:bg-pink-100 active:bg-pink-200 border border-pink-200 transition-colors cursor-pointer mb-4 select-none text-left"
      >
        <div className="relative flex items-center justify-center">
          <input
            id="date-agreement-checkbox"
            type="checkbox"
            checked={agreementChecked}
            onChange={(e) => onToggleAgreement(e.target.checked)}
            className="sr-only"
          />
          <div
            className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
              agreementChecked
                ? 'bg-pink-500 border-pink-500 text-white shadow-xs'
                : 'bg-white border-pink-300'
            }`}
          >
            {agreementChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
          </div>
        </div>
        <span className="text-xs sm:text-sm font-bold text-pink-950">
          {ROMANTIC_CONFIG.agreement.checkboxLabel}
        </span>
      </label>

      {/* Navigation Buttons: Back and Seal */}
      <div className="w-full flex items-center justify-between gap-3 pt-1">
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
          disabled={!agreementChecked || !visitorName.trim()}
          onClick={handleSealClick}
          className={`flex-1 py-2.5 sm:py-3 px-4 rounded-xl font-bold text-sm transition-all duration-150 flex items-center justify-center gap-1.5 ${
            agreementChecked && visitorName.trim()
              ? 'bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 active:from-pink-700 active:to-rose-700 text-white shadow-lg shadow-pink-500/30 hover:scale-102 active:scale-98 cursor-pointer'
              : 'bg-pink-200/70 text-pink-400 cursor-not-allowed opacity-60'
          }`}
        >
          <span>{ROMANTIC_CONFIG.agreement.sealButtonText}</span>
        </button>
      </div>
    </div>
  )
}
