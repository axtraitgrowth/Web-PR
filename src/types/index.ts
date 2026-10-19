export interface FoodOption {
  id: string
  name: string
  emoji: string
  subtitle: string
  description?: string
}

export interface DatePlanState {
  currentStep: number // 1 to 7
  invitationAccepted: boolean
  selectedDate: string | null // e.g., '2026-10-24' or formatted display string
  selectedTime: string | null
  selectedFood: FoodOption | null
  agreementChecked: boolean
  isConfirmed: boolean
}

export interface RomanticConfig {
  recipientName: string
  senderName: string
  invitation: {
    heading: string
    question: string
    subtext: string
    yesButtonText: string
    noButtonText: string
    noButtonPlayfulTexts: string[]
  }
  acceptance: {
    heading: string
    subtext: string
    buttonText: string
  }
  datePicker: {
    heading: string
    subtext: string
  }
  timePicker: {
    heading: string
    subtext: string
    options: string[]
  }
  foodChoices: {
    heading: string
    subtext: string
    options: FoodOption[]
  }
  agreement: {
    heading: string
    subtitle: string
    terms: string[]
    costText: string
    checkboxLabel: string
    sealButtonText: string
  }
  celebration: {
    heading: string
    subtext: string
    copySuccessText: string
  }
}
