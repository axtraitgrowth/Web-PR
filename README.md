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

## 🔐 Private & Secure Admin Panel

The platform includes a dedicated, private, server-secured Admin Panel for visitor analytics and date progression monitoring.

### 🛡️ Security Features
- **Server-Side Authentication**: Protected by signed JWT tokens and `bcryptjs` password hashing (salt rounds = 10).
- **Manual Entry Enforced**: Browser autofill, automatic password managers, and spellcheck are disabled (`autoComplete="new-password"`, `data-lpignore="true"`, `data-1p-ignore="true"`).
- **Password Visibility Eye Icon**: Integrated toggle eye button allowing the admin to inspect entered credentials before submitting.
- **Rate Limiting**: Server-side brute-force defense (`express-rate-limit`) limits failed login attempts to 10 per 15 minutes per IP.
- **Session Protection**: Private API endpoints (`/api/admin/analytics`, `/api/admin/me`, `/api/admin/change-password`) reject all unauthenticated requests with `401 Unauthorized`.
- **Privacy First**: Only high-level anonymous session metrics (devices, browsers, and chosen date options) are tracked. No sensitive PII, tracking pixels, or third-party ad beacons are collected.

### 📊 Visitor Analytics & Date Filtering
- **Live KPI Metrics**: Total page views, unique visitor sessions, acceptance rate (who said Yes!), and confirmed date count.
- **Funnel Progression**: Real-time drop-off and conversion rates across all 7 stages of the date invitation.
- **Date Filtering**:
  - Quick presets: *All Time*, *Today*, *Yesterday*, *Last 7 Days*, *Last 30 Days*.
  - Custom Date Range Picker: Filter visitor activity between any start date and end date.
- **Detailed Activity Log**: Searchable, filterable session table displaying exact date, time, and food choices selected by your partner.
- **Password Management**: In-dashboard modal allowing admins to securely update their password.

### 🔑 Default Credentials
- **Username**: `admin`
- **Password**: `AdminPassword!2026`
*(Access by clicking **"Admin"** in the website footer or navigating to `http://localhost:5173/#admin`)*

---

## 🎨 How to Personalize

Open [`src/config/dateConfig.ts`](file:///c:/Web%20PR/src/config/dateConfig.ts) to customize:
- `recipientName`: e.g. `'Maya'` or leave `''` for natural default.
- `senderName`: e.g. `'Alex'`.
- Button texts, headings, playful phrases, food choices, and time slots.

---

## 🚀 Running the Project

```bash
# Start both backend server and frontend with live proxy
npm run dev

# Run only the backend server
npm run server

# Run production build
npm run build

# Run linter
npm run lint
```

