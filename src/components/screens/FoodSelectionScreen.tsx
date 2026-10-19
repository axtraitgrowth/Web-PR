import React, { useState } from 'react'
import { ROMANTIC_CONFIG } from '../../config/dateConfig'
import type { FoodOption } from '../../types'
import { ArrowLeft, ArrowRight, AlertCircle, Check, Utensils } from 'lucide-react'

interface FoodSelectionScreenProps {
  selectedFood: FoodOption | null
  onSelectFood: (food: FoodOption) => void
  onContinue: () => void
  onBack: () => void
}

export const FoodSelectionScreen: React.FC<FoodSelectionScreenProps> = ({
  selectedFood,
  onSelectFood,
  onContinue,
  onBack,
}) => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const foods = ROMANTIC_CONFIG.foodChoices.options

  const handleFoodClick = (food: FoodOption) => {
    setErrorMessage(null)
    onSelectFood(food)
  }

  const handleContinueClick = () => {
    if (!selectedFood) {
      setErrorMessage('Please pick what we should enjoy together on our date! 💗')
      return
    }
    onContinue()
  }



  return (
    <div className="flex flex-col items-center text-center w-full">
      {/* Heading */}
      <h2 className="text-xl sm:text-2xl font-extrabold text-pink-900 tracking-tight mb-1">
        {ROMANTIC_CONFIG.foodChoices.heading}
      </h2>

      {/* Supporting text */}
      <p className="text-xs sm:text-sm text-pink-700/80 font-medium mb-4">
        {ROMANTIC_CONFIG.foodChoices.subtext}
      </p>

      {/* Grid of 6 selectable food cards */}
      <div className="w-full grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3 mb-4">
        {foods.map((food) => {
          const isSelected = selectedFood?.id === food.id

          return (
            <button
              key={food.id}
              type="button"
              onClick={() => handleFoodClick(food)}
              className={`relative p-3 rounded-2xl border text-left flex flex-col justify-between transition-all duration-200 cursor-pointer ${
                isSelected
                  ? 'bg-gradient-to-b from-rose-50 to-pink-100/90 border-pink-500 ring-2 ring-pink-400 shadow-md shadow-pink-400/20 scale-[1.02]'
                  : 'bg-white hover:bg-pink-50/80 active:bg-pink-100/70 border-pink-100 hover:border-pink-200 shadow-xs hover:scale-[1.01]'
              }`}
            >
              {/* Selected indicator check badge */}
              {isSelected && (
                <span className="absolute top-2 right-2 w-5 h-5 rounded-full bg-pink-500 text-white flex items-center justify-center shadow-xs">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </span>
              )}

              {/* Emoji icon */}
              <div className="text-3xl mb-1.5 select-none">{food.emoji}</div>

              {/* Food Name & Subtitle */}
              <div>
                <h3 className="font-extrabold text-sm sm:text-base text-pink-950 leading-tight">
                  {food.name}
                </h3>
                <p className="text-[11px] text-pink-700 font-medium leading-snug mt-0.5">
                  "{food.subtitle}"
                </p>
                {food.description && (
                  <p className="text-[10px] text-slate-500 mt-1 line-clamp-1">
                    {food.description}
                  </p>
                )}
              </div>
            </button>
          )
        })}
      </div>

      {/* Selection Confirmation Mini Badge */}
      <div className="min-h-[26px] mb-4 flex items-center justify-center">
        {selectedFood ? (
          <span className="text-xs sm:text-sm text-pink-800 font-semibold bg-pink-100 px-3 py-0.5 rounded-full border border-pink-200 inline-flex items-center gap-1.5">
            <Utensils className="w-3.5 h-3.5 text-pink-600" />
            <span>Mmm, {selectedFood.emoji} {selectedFood.name} sounds like a lovely date!</span>
          </span>
        ) : (
          <span className="text-xs text-pink-500/80 font-medium">
            Choose what you're craving above 😋
          </span>
        )}
      </div>


      {/* Validation Alert */}
      {errorMessage && (
        <div className="w-full mb-4 px-3 py-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center justify-center gap-1.5 animate-fade-in-scale">
          <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Navigation Buttons: Back and Continue */}
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
