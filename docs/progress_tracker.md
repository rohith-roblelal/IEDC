# IEDC SNMIMT - Progress Tracker

This document tracks the ongoing development, features implemented, and upcoming tasks for the IEDC SNMIMT Next.js website.

## ✅ Completed Tasks

### UI & Styling
- **Aesthetic Migration**: Successfully ported the premium dark mode, rich gradients, and Poppins typography from the static HTML MVP to the Next.js application.
- **Header & Navbar**: 
  - Replaced the SVG logo with the official uploaded `logo.png` image.
  - Precisely scaled the logo height down to match the `IEDC SNMIMT` text baseline.
- **Hero Section**: 
  - Restored the animated SVG infinity-lightning logo.
  - Added animated "IEDC SNMIMT" sub-text directly below the main hero logo.
- **Footer**: 
  - Added a responsive LinkedIn SVG icon link to match the original static site design.
- **Team Page**: 
  - Reordered the hierarchy: Faculty & Nodal Officers -> Student Leadership -> Core Team -> Assistant Leads.

### Functionality & Logic
- **Smart Event Auto-Closing**: 
  - Implemented automatic date-checking logic for the Events page.
  - Events automatically flip from "Registration Open" to "Event Finished" once their date passes.
  - "Register Now" buttons convert to "View Details" buttons for past events.
  - The Registration Modal dynamically hides the form and displays a "Registration Closed" badge for past events.
- **Bug Fixes**: 
  - Fixed a major React Hydration Mismatch error caused by browser extensions (e.g., Grammarly) injecting code into the DOM.
  - Fixed a `lucide-react` compilation crash by replacing missing icons with raw SVGs.

## 🚧 In Progress / Next Steps
- Implement a backend database for event registrations (replacing `localStorage`).
- Finalize mobile responsiveness for any newly added sections.
- Populate real content/images for the Team and About pages.
