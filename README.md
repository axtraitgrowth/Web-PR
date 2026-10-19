# Romantic Date Invitation Website 💗

A complete, fully functional, mobile-first romantic date invitation interactive website built with React, TypeScript, Tailwind CSS, Lucide icons, and Canvas Confetti.

---

## ✨ Features & User Journey

1. **Screen 1 — The Invitation (`InvitationScreen`)**
   - Cute bouncing heart illustration with blushing smile.
   - "Hey, you! 💗" & "Will you go on a date with me?"
   - **"Yes, absolutely! 💕"**: Triggers romantic heart confetti burst and advances to acceptance.
   - **"No 🙈"**: Playfully moves away in a controlled area, cycles through playful responses ("Are you sure? 🥺", "Give me a chance! 💗", "Wait, think about the snacks! 🍕", etc.), while remaining accessible.

2. **Screen 2 — Acceptance (`AcceptanceScreen`)**
   - Celebratory heading: "WAIT... YOU SAID YES?! 🥹💖"
   - Animated character and "Let's Plan Our Date ✨" button.

3. **Screen 3 — Pick a Date (`DatePickerScreen`)**
   - Custom calendar with month navigation (`< Prev`, `Next >`).
   - Disables past dates automatically.
   - Highlights the selected date and formats it clearly.
   - Validates selection before allowing navigation.
   - Full Back and Continue navigation preserving choices.

4. **Screen 4 — Pick a Time (`TimePickerScreen`)**
   - Responsive grid of selectable time slots (11:00 AM to 8:00 PM).
   - Sun / Moon ambient icons and selected badge indicators.
   - Back and Continue navigation preserving choices.

5. **Screen 5 — Date Food & Drink Choices (`FoodSelectionScreen`)**
   - 6 interactive date food and drink cards:
     1. ☕ **Coffee Date** — "Warm & cozy"
     2. 🍵 **Tea Date** — "Calm & soothing"
     3. 🍕 **Pizza** — "Classic comfort"
     4. 🍣 **Sushi** — "Fancy vibes"
     5. 🍝 **Pasta** — "Italian romance"
     6. 🍔 **Burgers** — "Casual & fun"
   - Single-select with checkmark badges and validation.



6. **Screen 6 — Our Date Agreement (`DateAgreementScreen`)**
   - Official Date Certificate summary of the selected date, time, and food.
   - Humorous agreement terms (good vibes, conversation, smiles mandatory).
   - Cost: "Cost: Unlimited love 💖".
   - Checkbox: "I agree to have a lovely time with you 💗".

   - "Seal Our Date 💖" button (enabled only when checked).

7. **Screen 7 — Final Celebration (`CelebrationScreen`)**
   - "IT'S OFFICIALLY A DATE! 🎉💗"
   - Confetti fireworks on mount.
   - Official confirmed itinerary ticket card.
   - **"Copy Date Details 📋"**: Copies formatted itinerary to clipboard with visible confirmation.
   - **"Start Over"**: Resets all state and choices cleanly to step 1.

---

## 🎨 How to Personalize

Open [`src/config/dateConfig.ts`](file:///c:/Web%20PR/src/config/dateConfig.ts) to customize:
- `recipientName`: e.g. `'Maya'` or leave `''` for natural default.
- `senderName`: e.g. `'Alex'`.
- Button texts, headings, playful phrases, food choices, and time slots.

---

## 🚀 Running the Project

```bash
# Start development server
npm run dev

# Run production build
npm run build

# Run linter
npm run lint
```
