import { useState } from 'react'
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
import type { DatePlanState, FoodOption } from './types'

export function App() {
  const [state, setState] = useState<DatePlanState>({
    currentStep: 1,
    invitationAccepted: false,
    selectedDate: null,
    selectedTime: null,
    selectedFood: null,
    agreementChecked: false,
    isConfirmed: false,
  })

  // Handlers for state updates and transitions
  const handleAcceptInvitation = () => {
    setState((prev) => ({
      ...prev,
      invitationAccepted: true,
      currentStep: 2,
    }))
  }

  const handleStartPlanning = () => {
    setState((prev) => ({
      ...prev,
      currentStep: 3,
    }))
  }

  const handleSelectDate = (dateStr: string) => {
    setState((prev) => ({
      ...prev,
      selectedDate: dateStr,
    }))
  }

  const handleSelectTime = (timeStr: string) => {
    setState((prev) => ({
      ...prev,
      selectedTime: timeStr,
    }))
  }

  const handleSelectFood = (food: FoodOption) => {
    setState((prev) => ({
      ...prev,
      selectedFood: food,
    }))
  }

  const handleToggleAgreement = (checked: boolean) => {
    setState((prev) => ({
      ...prev,
      agreementChecked: checked,
    }))
  }

  const handleConfirmDate = () => {
    setState((prev) => ({
      ...prev,
      isConfirmed: true,
      currentStep: 7,
    }))
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
  }

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

        {/* Subtle footer */}
        <footer className="mt-4 text-center select-none">
          <p className="text-xs text-pink-400 font-medium">
            Handcrafted with 💗 for unforgettable moments
          </p>
        </footer>
      </main>
    </div>
  )
}

export default App
