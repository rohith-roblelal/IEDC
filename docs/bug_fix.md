# Bug Fixes

## 1. ARQ Pool Initialization Failed (Redis Timeout)

**Error Log:**
`2026-08-08T17:34:13.971383Z [error    ] arq_pool_initialization_failed [arq] app=IEDC_Backend env=development error='Timeout connecting to server'`

**Cause:**
The application uses ARQ for background tasks, which requires a Redis instance to be running. By default, the application expects Redis to be running locally on `redis://localhost:6379`. If you are running the backend using `uvicorn` directly without starting Redis, the connection will time out.

**Solution:**
Ensure that a Redis instance is running and accessible to your backend application. You have a few options:

1. **Run Redis via Docker (Recommended):**
   Run the `redis` service from the existing `docker-compose.yml` in your project root:
   ```bash
   docker compose up -d redis
   ```
2. **Use a Remote Redis Server:**
   If you have a managed Redis instance, update your `backend/.env` file with the correct URL:
   ```env
   REDIS_URL="rediss://your-remote-redis-url:port"
   ```
3. **Run Redis Locally:**
   Install and start a local Redis server directly on your operating system listening on port `6379`.

## 2. Collaborative Partner Logos
**Issue:** Logos on the homepage are too small, have white backgrounds, and clicking them doesn't display details.
**Status:** Fixed
**Solution:** Extended the Backend SQLAlchemy `Partner` model and Pydantic schemas with `description` and `website_url` fields, and ran an Alembic migration. Updated the Admin Dashboard to include Description (textarea) and Website URL inputs. On the homepage, increased the logo size, removed the solid white background in favor of a glassmorphism style card with hover animations, and made the cards clickable to open a modal containing full partner details (including the description, an external link to their website, and Escape-key closure support).

## 3. Unable to Delete Co-Founder (Startup)
**Issue:** The delete, cancel, and close buttons for co-founders in the Startup section are not working.
**Status:** Fixed 
**Solution:** The issue was in the `ConfirmProvider` (`frontend/src/components/ui/ConfirmProvider.tsx`). React `useState` has a specific behavior where passing a function evaluates it to resolve the state. Passing a Promise `resolve` function inside `useState` caused the state to hold the wrong reference or silently drop execution context. I replaced the state setter `setResolvePromise` with a `useRef` hook (`resolvePromiseRef`) to safely store the `resolve` callback, and added `type="button"` to the modal buttons to prevent implicit form submission blocking.

## 4. Events Not Appearing on Homepage
**Issue:** Successfully added events from the admin panel do not appear on the homepage.
**Status:** Fixed
**Solution:** Extracted the UI logic from `EventsClient.tsx` into a reusable `EventCard` component. Updated the backend `EventRepository` and the `GET /api/v1/events` endpoint to accept `date_after` and `sort` query parameters. Finally, implemented the data fetching logic inside `HomeClient.tsx` to retrieve up to 3 upcoming published events, rendering them using the `EventCard` beneath the "Latest Announcements" section. Included loading skeletons and empty state fallback.

## 5. Event Posters Not Displaying
**Issue:** Event posters uploaded via the admin panel are not displaying.
**Status:** Fixed
**Solution:** Resolved a frontend/backend contract mismatch where the frontend was incorrectly using `banner_image_url` instead of the backend's defined `banner_url` schema. Standardized all instances across `events.ts`, `EventForm.tsx`, `EventCard.tsx`, and the `[slug]` pages to use the single canonical property `banner_url`. Conducted a global codebase search to guarantee zero remaining references to `banner_image_url`.

## 6. Unable to Delete Student Lead
**Issue:** Attempting to delete a student lead results in a "Failed to delete" error.
**Status:** Fixed
**Solution:** The issue was caused by using native `fetch()` instead of `clientFetch()` in the dashboard pages. Native `fetch()` failed to attach the `HttpOnly` authentication cookie for cross-origin or proxy-routed requests, leading to a `401 Unauthorized` response that was silently swallowed. The fix was migrating `TeamPage` (and others) to use `clientFetch`, which correctly attaches `credentials: "include"`.

## 7. Unable to Delete Collaborative Partner
**Issue:** Attempting to delete a collaborative partner results in a "Failed to delete" error.
**Status:** Fixed
**Solution:** Similar to Bug 6, the `PartnersPage` was making API requests using the native `fetch()` API without credentials, which failed authentication. Replaced with `clientFetch()` and added `ApiError` handling.

## 8. Unable to Delete Announcements
**Issue:** Announcements cannot be deleted from the admin panel.
**Status:** Fixed
**Solution:** Caused by the same authentication cookie issue as Bugs 6 and 7. The `AnnouncementsPage` was migrated to use `clientFetch()`. A global audit of the dashboard was also conducted, removing native `fetch()` from `events`, `podcasts`, `messages`, and `registrations` pages, ensuring all authenticated API requests now correctly use `clientFetch()`.

## 9. Deleted Posters Still Appearing on Homepage
**Issue:** Posters deleted from the admin panel continue to appear on the homepage.
**Status:** Fixed
**Solution:** The issue was caused by aggressive caching of the `/api/v1/gallery` API endpoint across the frontend and CDN, compounded by delayed state updates. Implemented a targeted fix by adding `cache: "no-store"` specifically for admin dashboard gallery requests to ensure fresh data, and optimized the local React state in the admin gallery page to remove items immediately upon successful deletion, preserving optimal caching for public visitors.

## 10. Images Added in Settings Not Displaying
**Issue:** Images added through the Settings section do not appear on the website.
**Status:** Fixed
**Solution:** The uploaded images for Favicon, Hero Image, and Open Graph Image were correctly saved to the backend but were ignored by the frontend. We migrated `layout.tsx` to use the dynamic `generateMetadata` Next.js API, which natively hooks up the `favicon_url` to `metadata.icons` and `og_image_url` to `metadata.openGraph.images` / `metadata.twitter.images`. We removed the static `opengraph-image.tsx` from the root and created a fallback `/api/og/route.tsx` generator for when no custom Open Graph image is configured. Additionally, `HomeClient.tsx` was updated to conditionally render `hero_image_url` using the `<Image>` component while preserving the SVG fallback and Framer Motion animations. We also integrated the Next.js `Image` component into `Navbar.tsx` and `Footer.tsx` for optimal logo rendering.
