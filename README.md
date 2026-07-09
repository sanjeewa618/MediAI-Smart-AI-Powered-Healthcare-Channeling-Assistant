# MediAI — Smart AI-Powered Healthcare Channeling Assistant

Modern, accessible mobile application to help patients find doctors, book appointments, and get AI-driven health guidance.

Key goals:
- Fast appointment booking and queue overview
- AI-driven symptom assistant and suggestions
- Clean patient & doctor dashboards with reports and records

---

## ⚡ Quick Start (Any Computer — Single Command)

> Just run **one command** from the project root. It will auto-detect your IP, configure the app, and launch both the backend and frontend automatically.

```bash
npm start
```

That's it! The script will:
- ✅ Detect your local Wi-Fi IP address
- ✅ Update `healthcare-app/.env` automatically
- ✅ Start the **Backend** server on port 4000
- ✅ Start the **Expo** frontend (with cache cleared)

> 📱 Make sure your phone and PC are on the **same Wi-Fi network**, then scan the QR code in **Expo Go**.

> ⛔ Press `Ctrl+C` to stop all servers.

---

## Table of contents
- [Demo / Preview](#demo--preview)
- [Features](#features)
- [Tech stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Getting started](#getting-started)
- [Folder structure](#folder-structure)
- [Contributing](#contributing)
- [License & contact](#license--contact)

--

## Demo / Preview
Open the app with Expo on your device or emulator. Use `npm start` from the `healthcare-app` folder and scan the QR code with the Expo Go app for a quick test on Android/iOS.

## Features
- Patient onboarding, sign in / sign up flows
- AI Health Assistant (symptom check + suggestions)
- Doctor & lab dashboards, availability, and appointment booking
- Reports and medical records viewer
- Bottom navigation for quick access to main areas

## Tech stack
- Expo + React Native
- React Navigation (stack & bottom-tabs)
- lucide-react-native for icons
- expo-linear-gradient for gradients and visual polish

## Prerequisites
- Node.js (LTS recommended)
- npm or yarn
- Expo CLI (optional) — `npm install -g expo-cli` (or use the local `expo` via `npx`)
- Android Studio / Xcode only if you need native emulators

## Getting started
1. Clone the repository
2. Install dependencies and start the dev server:

```bash
cd healthcare-app
npm install
npm start
```

3. Run on a device or emulator:
- For Android: `npm run android` (requires Android emulator or Expo Go on device)
- For iOS: `npm run ios` (macOS + Xcode)
- Web: `npm run web`

Tips:
- If you use the Expo Go app, scan the QR code shown after `npm start`.
- Press `a` in the terminal to open Android, `i` to open iOS (when using Expo CLI).

## Folder structure (important files)
- `healthcare-app/` — main Expo app
	- `App.tsx` — app entry
	- `src/screens/` — screen components (patient, doctor, lab, auth)
	- `src/components/` — shared components (BottomNavBar, CustomButton, inputs)
	- `src/navigation/` — navigation stacks and types
	- `assets/` — images and static assets

## Styling & theme
The project uses a centralized theme file at `src/theme/theme.ts` for colors, sizes and shadows — update the theme values there to keep the UI consistent.

## Design System & Color Palette
This app uses a modern purple gradient healthcare theme. Use the palette below to keep screens consistent across Android, iOS and Web.

Main Colors
- Primary Purple — `#7B2FF7` (header backgrounds, primary CTAs)
- Deep Violet — `#5F0FFF` (gradient shadows, deeper accents)
- Light Purple — `#A855F7` (glows / highlights)
- White — `#FFFFFF` (cards, surfaces)
- Soft Gray — `#F3F4F6` (section backgrounds, inputs)

Primary gradient examples
```css
/* vertical */
background: linear-gradient(180deg, #8B3DFF 0%, #6A11CB 50%, #5F0FFF 100%);

/* alternate */
background: linear-gradient(to bottom, #9333EA, #7E22CE, #5B21B6);
```

React Native example (expo-linear-gradient):
```tsx
<LinearGradient colors={["#9333EA", "#7E22CE", "#5B21B6"]} style={styles.container} />
```

Why this palette
- Purple conveys AI + healthcare + modern UI
- White cards + rounded corners improve readability
- Soft gradients + shadows create a premium look

--

## Architecture overview
This project follows a modular mobile-first architecture separating concerns across frontend (React Native / Expo), backend (Node.js / Express), AI services, and persistence.

High-level components
- Frontend (Expo/React Native): UI screens, navigation, local state, offline sync helpers
- Backend (Node/Express): REST API, authentication, booking logic, notifications
- Database: MongoDB (primary), Firebase for realtime features and notifications (optional)
- AI Services: OpenAI / custom ML microservices for symptom analysis
- Integrations: Payment provider, SMS/Email gateway, Cloud storage for reports

Data flow (simplified)
1. User interacts with frontend and requests data (e.g., search labs)
2. Frontend calls backend REST API (`/api/labs`, `/api/bookings`)
3. Backend validates, checks availability, writes booking entries to DB
4. Notifications (push/SMS) sent; token generated and returned to frontend
5. AI services called asynchronously for suggestions or analysis

Recommended repo layout
```
MediAI/
├─ healthcare-app/        # frontend (Expo)
├─ backend/               # Node/Express services
├─ ai-services/           # ML models & wrappers (OpenAI/Tensorflow)
├─ infra/                 # IaC, deployment scripts
└─ docs/
```

--

## Lab Services — UX & Data
Add a professional `Lab Services` screen with strong usability for patients to discover, filter and book lab tests.

Key UI areas
- Header: title, search, notification, hospital selector
- Categories: horizontal scroll with icons for Blood, Urine, Cardiac, Diabetes, etc.
- Featured lab cards: lab name, short info, price, availability, nurse in charge, rating, Book CTA
- Availability: calendar strip + time slots (available / busy / full states)
- Nurse area: photo, name, shift, current queue count

Example JSON for a lab document
```json
{
	"labId": "lab_123",
	"labName": "Central Diagnostics",
	"category": "Blood Tests",
	"availableSlots": ["2026-05-20T09:00:00","2026-05-20T11:00:00"],
	"assignedNurse": "nurse_45",
	"openTime": "07:00",
	"closeTime": "20:00"
}
```

Booking flow (recommended steps)
1. Test details confirmation
2. Select date
3. Select time slot
4. Enter patient details + upload referral (optional)
5. Choose sample collection (hospital / home)
6. Payment
7. Booking success → token & queue

Required patient info (recommended)
- Full name, NIC / Passport, DOB, Gender, Phone (required)
- Email, Address (optional)
- Allergies, existing conditions (optional)

Status flow for bookings
- Pending → Confirmed → Checked In → Sample Collected → Testing → Completed → Report Uploaded

--

## Backend & API notes
- Auth: JWT tokens, refresh tokens
- Endpoints:
	- `GET /api/labs` — search & filter labs
	- `GET /api/labs/:id` — lab details
	- `POST /api/bookings` — create booking
	- `GET /api/bookings/:id` — booking status and token
- Recommended validations: slot availability, nurse availability, lab open hours

Database recommendations
- Collections: `users`, `labs`, `tests`, `bookings`, `nurses`, `reports`
- Index `availableSlots` and `labId` for fast queries

--

## Deployment & Environment
Minimum env vars (backend `.env`):
```
PORT=5000
MONGO_URI=your_mongo_uri
JWT_SECRET=your_jwt_secret
OPENAI_API_KEY=your_openai_key
FIREBASE_SERVICE_ACCOUNT=path/to/serviceAccount.json
```

Deploy options
- Small deployment: Heroku / Render / Fly.io for backend + MongoDB Atlas
- Production: Kubernetes on AWS / GCP + managed MongoDB, Redis for queues

--

## Accessibility & Internationalization
- Provide Sinhala & Tamil language support via i18n
- Large fonts and high-contrast color variants
- Voice search and screen-reader labels for critical flows

--

## Quick start recap
```bash
cd healthcare-app
npm install
npm start
```

--

If you want, I can generate:
- a Figma-ready color/style token file
- full database schema (MongoDB / Firebase)
- backend API spec (OpenAPI)
- component-level React Native structure for the Lab Services screens


## Contributing
- Fork the repo, create a feature branch, and open a pull request.
- Keep changes small and focused; run the app locally and verify UI flows before sending a PR.
- Write clear commit messages and include a brief PR description explaining the change.

## Notes / Troubleshooting
- If you see UI color differences on Android vs iOS, verify Expo, device display settings, and that the app uses exact hex color values in `src/theme/theme.ts`.
- For navigation issues, check `src/navigation/AppNavigator.tsx` and `src/navigation/types.ts` for registered routes.

## License & contact
This repository is for demo/academic use. If you need help or want to collaborate, open an issue or contact the maintainer.
