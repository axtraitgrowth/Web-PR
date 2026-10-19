import { useState, useEffect } from 'react'
import { FloatingBackgroundHearts } from './components/FloatingBackgroundHearts'
import { ProgressIndicator } from './components/ProgressIndicator'
import { CuteCard } from './components/CuteCard'
import { InvitationScreen } from './components/screens/InvitationScreen'
import { AcceptanceScreen } from './components/screens/AcceptanceScreen'
import { DatePickerScreen } from './components/screens/DatePickerScreen'
import { TimePickerScreen } from './components/screens/TimePickerScreen'
import { FoodSelectionScreen } from './components/screens/FoodSelectionScreen'
import { DateAgreementScreen } from './components/screens/DateAgreementScreen'
import { CelebrationScreen } from './components/screens/CelebrationScreen'
import { AdminApp } from './components/admin/AdminApp'
import { trackVisitorEvent } from './utils/analytics'
import type { DatePlanState, FoodOption } from './types'
import { Lock, Shield, X } from 'lucide-react'

export function App() {
  // Routing state ('public' | 'admin')
  const [currentRoute, setCurrentRoute] = useState<'public' | 'admin'>(() => {
    return window.location.pathname.startsWith('/admin') || window.location.hash === '#admin'
      ? 'admin'
      : 'public'
  })

  // Privacy disclosure modal state
  const [showPrivacyModal, setShowPrivacyModal] = useState(false)

  // Multi-step public date invitation state
  const [state, setState] = useState<DatePlanState>({
    currentStep: 1,
    invitationAccepted: false,
    selectedDate: null,
    selectedTime: null,
    selectedFood: null,
    agreementChecked: false,
    isConfirmed: false,
  })

  // Handle URL changes & browser history
  useEffect(() => {
    const handleLocationChange = () => {
      const isAdmin = window.location.pathname.startsWith('/admin') || window.location.hash === '#admin'
      setCurrentRoute(isAdmin ? 'admin' : 'public')
    }

    window.addEventListener('popstate', handleLocationChange)
    window.addEventListener('hashchange', handleLocationChange)
    return () => {
      window.removeEventListener('popstate', handleLocationChange)
      window.removeEventListener('hashchange', handleLocationChange)
    }
  }, [])

  // Initial tracking event on landing page load
  useEffect(() => {
    if (currentRoute === 'public') {
      trackVisitorEvent('page_view', 1, { page: 'invitation' })
    }
  }, [currentRoute])

  const navigateTo = (route: 'public' | 'admin') => {
    setCurrentRoute(route)
    if (route === 'admin') {
      window.location.hash = '#admin'
    } else {
      window.location.hash = ''
      if (window.location.pathname.startsWith('/admin')) {
        window.history.pushState(null, '', '/')
      }
    }
  }

  // Handlers for state updates and transitions with tracking
  const handleAcceptInvitation = () => {
    setState((prev) => ({
      ...prev,
      invitationAccepted: true,
      currentStep: 2,
    }))
    trackVisitorEvent('accept_invitation', 2, { response: 'Said Yes!' })
  }

  const handleStartPlanning = () => {
    setState((prev) => ({
      ...prev,
      currentStep: 3,
    }))
    trackVisitorEvent('start_planning', 3)
  }

  const handleSelectDate = (dateStr: string) => {
    setState((prev) => ({
      ...prev,
      selectedDate: dateStr,
    }))
    trackVisitorEvent('select_date', 3, { date: dateStr })
  }

  const handleSelectTime = (timeStr: string) => {
    setState((prev) => ({
      ...prev,
      selectedTime: timeStr,
    }))
    trackVisitorEvent('select_time', 4, { time: timeStr })
  }

  const handleSelectFood = (food: FoodOption) => {
    setState((prev) => ({
      ...prev,
      selectedFood: food,
    }))
    trackVisitorEvent('select_food', 5, { food: `${food.emoji} ${food.name}` })
  }

  const handleToggleAgreement = (checked: boolean) => {
    setState((prev) => ({
      ...prev,
      agreementChecked: checked,
    }))
    if (checked) {
      trackVisitorEvent('agree_terms', 6)
    }
  }

  const handleConfirmDate = () => {
    setState((prev) => ({
      ...prev,
      isConfirmed: true,
      currentStep: 7,
    }))
    trackVisitorEvent('seal_date', 7, {
      date: state.selectedDate,
      time: state.selectedTime,
      food: state.selectedFood?.name,
    })
  }

  const handleGoBack = () => {
    setState((prev) => ({
      ...prev,
      currentStep: Math.max(1, prev.currentStep - 1),
    }))
  }

  const handleContinueNext = () => {
    setState((prev) => ({
      ...prev,
      currentStep: Math.min(7, prev.currentStep + 1),
    }))
  }

  const handleStartOver = () => {
    setState({
      currentStep: 1,
      invitationAccepted: false,
      selectedDate: null,
      selectedTime: null,
      selectedFood: null,
      agreementChecked: false,
      isConfirmed: false,
    })
    trackVisitorEvent('start_over', 1)
  }

  // ----------------------------------------------------
  // Render Admin Experience
  // ----------------------------------------------------
  if (currentRoute === 'admin') {
    return (
      <div className="relative min-h-screen w-full flex flex-col justify-start items-center p-3 sm:p-6 overflow-x-hidden bg-[#fdf2f4]">
        <FloatingBackgroundHearts />
        <div className="relative z-10 w-full">
          <AdminApp onBackToWebsite={() => navigateTo('public')} />
        </div>
      </div>
    )
  }

  // ----------------------------------------------------
  // Render Public Romantic Date Invitation
  // ----------------------------------------------------
  return (
    <div className="relative min-h-screen w-full flex flex-col justify-center items-center p-3 sm:p-6 overflow-x-hidden bg-[#fdf2f4]">
      {/* Decorative floating background elements */}
      <FloatingBackgroundHearts />

      {/* Main interactive container */}
      <main className="w-full max-w-[480px] flex flex-col items-center z-10 my-auto py-4">
        {/* Subtle step progress indicator */}
        <ProgressIndicator currentStep={state.currentStep} totalSteps={7} />

        {/* Centered romantic card */}
        <CuteCard key={state.currentStep}>
          {state.currentStep === 1 && (
            <InvitationScreen onAccept={handleAcceptInvitation} />
          )}

          {state.currentStep === 2 && (
            <AcceptanceScreen onContinue={handleStartPlanning} />
          )}

          {state.currentStep === 3 && (
            <DatePickerScreen
              selectedDate={state.selectedDate}
              onSelectDate={handleSelectDate}
              onContinue={handleContinueNext}
              onBack={handleGoBack}
            />
          )}

          {state.currentStep === 4 && (
            <TimePickerScreen
              selectedTime={state.selectedTime}
              onSelectTime={handleSelectTime}
              onContinue={handleContinueNext}
              onBack={handleGoBack}
            />
          )}

          {state.currentStep === 5 && (
            <FoodSelectionScreen
              selectedFood={state.selectedFood}
              onSelectFood={handleSelectFood}
              onContinue={handleContinueNext}
              onBack={handleGoBack}
            />
          )}

          {state.currentStep === 6 && (
            <DateAgreementScreen
              selectedDate={state.selectedDate}
              selectedTime={state.selectedTime}
              selectedFood={state.selectedFood}
              agreementChecked={state.agreementChecked}
              onToggleAgreement={handleToggleAgreement}
              onConfirm={handleConfirmDate}
              onBack={handleGoBack}
            />
          )}

          {state.currentStep === 7 && (
            <CelebrationScreen
              selectedDate={state.selectedDate}
              selectedTime={state.selectedTime}
              selectedFood={state.selectedFood}
              onStartOver={handleStartOver}
            />
          )}
        </CuteCard>

        {/* Footer with subtle privacy and admin portal triggers */}
        <footer className="mt-5 text-center select-none flex flex-col items-center gap-2">
          <p className="text-xs text-pink-400 font-medium">
            Handcrafted with 💗 for unforgettable moments
          </p>

          <div className="flex items-center justify-center gap-3 text-[11px] text-pink-400">
            <button
              type="button"
              onClick={() => setShowPrivacyModal(true)}
              className="hover:text-pink-600 transition-colors cursor-pointer flex items-center gap-1"
            >
              <Shield className="w-3 h-3" />
              <span>Privacy</span>
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => navigateTo('admin')}
              className="hover:text-pink-600 transition-colors cursor-pointer flex items-center gap-1 font-semibold"
            >
              <Lock className="w-3 h-3" />
              <span>Admin</span>
            </button>
          </div>
        </footer>
      </main>

      {/* Privacy Disclosure Modal */}
      {showPrivacyModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in-scale">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full border border-pink-100 shadow-xl text-left">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 font-bold text-pink-950 text-sm">
                <Shield className="w-4 h-4 text-pink-500" />
                <span>Privacy & Transparency</span>
              </div>
              <button
                type="button"
                onClick={() => setShowPrivacyModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer p-1"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed mb-3">
              We respect your privacy. This invitation website uses lightweight, anonymized session analytics solely to ensure your date plan is recorded and delivered seamlessly.
            </p>

            <ul className="text-xs text-slate-600 space-y-1.5 mb-4 pl-1">
              <li className="flex items-center gap-1.5">
                <span className="text-pink-500 font-bold">✓</span>
                <span>No invasive cookies or tracking pixels.</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="text-pink-500 font-bold">✓</span>
                <span>No personal data sold or shared with third parties.</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="text-pink-500 font-bold">✓</span>
                <span>Data stored securely with private access controls.</span>
              </li>
            </ul>

            <button
              type="button"
              onClick={() => setShowPrivacyModal(false)}
              className="w-full py-2.5 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-bold text-xs cursor-pointer transition-colors shadow-xs"
            >
              Got it! 💖
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
