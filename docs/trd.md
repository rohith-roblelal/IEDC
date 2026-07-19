
# Technical Requirements Document (TRD)

## 1. Technology Stack
- **Frontend**: Next.js 15 (App Router), React 19, TypeScript.
- **Styling & Animations**: Tailwind CSS, Framer Motion.
- **Backend/Storage**: Currently utilizing `localStorage` for MVP registration data. (Scalable to API routes in Next.js).
- **Hosting**: Vercel (recommended for Next.js).

## 2. Architecture
- **Single-Page Application (SPA) / Server-Side Rendering (SSR)**:
  - The application is built using Next.js App Router for optimal performance, routing, and SEO.
  - Reusable React components for UI consistency.

## 3. Data Models (Client-Side)
- **Events**:
  - `id`: Unique identifier (string).
  - `title`: Name of the event (string).
  - `date`: Event date (string).
  - `registrationOpen`: Boolean indicating if registration is allowed.
- **Registrations**:
  - Stored in `localStorage` under `iedc-snmimt-registrations`.
  - Object structure: `{ eventId, name, email, registerNumber, department, year, registeredAt }`.

## 4. Security & Validation
- Form validation ensures all required fields are filled.
- Pattern matching for the register number.
- Client-side check to prevent duplicate `registerNumber` entries for a specific `eventId`.
