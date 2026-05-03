# AdeegFinder

A React Native / Expo mobile app for finding and booking local service workers ("Adeeg" = service in Somali). Similar to TaskRabbit — clients discover workers by category, book them, and manage bookings.

## Tech Stack

- **Framework**: Expo SDK 54 + React Native 0.81.5
- **Language**: TypeScript
- **Routing**: Expo Router v6 (file-based)
- **State**: TanStack Query (server state) + React Context (auth)
- **Backend API**: Laravel REST API at `https://shaqo-api-master-jkif7q.free.laravel.cloud/api`
- **Package Manager**: pnpm
- **UI**: Custom components, expo-linear-gradient, expo-blur, @expo/vector-icons

## Project Structure

```
app/
  (auth)/          # Auth flow: welcome, login, register
  (tabs)/          # Main tabs: index, bookings, profile
  booking/         # Booking detail/new screens
  category/        # Category browse screen
  worker/          # Worker profile screen
  settings/        # Account, help, about screens
  _layout.tsx      # Root layout with providers
components/        # Reusable UI components
contexts/          # AuthContext
hooks/             # useColors
lib/               # api.ts, types.ts, formatters
constants/         # Colors, theme
server/
  dev-server.js    # Dev landing page on port 5000 (Replit webview)
  serve.js         # Production static file server
  templates/       # landing-page.html for production
scripts/
  build.js         # Production build script (Metro bundles for iOS/Android)
src/
  firebase.js      # Firebase config
```

## Running in Replit

- **Workflow**: "Start application" runs `bash start-dev.sh`
  - `server/dev-server.js` serves landing page on **port 5000** (Replit webview)
  - `expo start --localhost --port 8081` runs the Expo Metro dev server
- **Preview**: Scan the QR code shown in the webview with Expo Go on your phone

## Deployment

- **Build**: `node scripts/build.js` — starts Metro, downloads iOS + Android bundles and manifests, packages into `static-build/`
- **Run**: `node server/serve.js` — serves the static build with platform-specific manifest routing
- **Target**: autoscale

## Key Notes

- `metro.config.js` blocks `.local/` from Metro file watching (prevents ENOENT crashes)
- `app.json` uses `"origin": "https://replit.com/"` for Expo Router
- Firebase is configured in `src/firebase.js` and `google-services.json`
- Authentication uses a custom Laravel API — no local database needed
