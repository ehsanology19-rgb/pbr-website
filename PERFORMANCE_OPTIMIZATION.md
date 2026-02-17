# Dashboard Loading Optimizations

## Overview

This document outlines optimizations applied to improve dashboard and auth loading performance on the PBR website.

## 1. Role caching (`src/lib/auth.js`)

- **In-memory cache**: User roles are cached in a `Map` keyed by `userId`. Repeated calls to `getUserRole(userId)` (e.g. from AuthContext and ProtectedRoute) read from cache instead of hitting the database.
- **Cache invalidation**: Cache is cleared on `signOut()`. Optional `clearRoleCache(userId)` is exported for use after admin role updates.
- **Lighter query**: Role fetch uses `.select('role').eq('user_id', userId).limit(1).maybeSingle()` with no `.order()` to reduce work.

## 2. Non-blocking auth (`src/contexts/AuthContext.jsx`)

- **Session first**: `loading` is set to `false` as soon as the session is known (user present or not). The UI is not blocked waiting for the role.
- **Role in background**: Role is fetched after setting `loading = false`, so the app can show logged-in state or redirect to login without waiting for the role query.

## 3. Protected route behavior (`src/components/auth/ProtectedRoute.jsx`)

- **Loading only when needed**: Full-screen "Loading…" is shown only when `loading && !user` (session still unknown). Once we know the user, we don't block the whole UI on role.
- **Verifying access**: If the user is set but `role === null` (still loading), a short "Verifying access…" state is shown instead of a generic loading screen.
- **Admin check**: After role is loaded, non-admins see "Access denied" and redirect; admins see the dashboard.

## 4. Dashboard stats (`src/lib/supabase.js` + `DashboardHome.jsx`)

- **Count-only queries**: Dashboard home uses `getDashboardStats()` with Supabase count queries (`select('*', { count: 'exact', head: true })`) instead of loading full tables.
- **Single parallel request**: One `Promise.all` runs the five count queries in parallel so the dashboard home loads faster and with less data.

## 5. Lazy loading and code splitting

- Consider lazy-loading dashboard routes (e.g. `React.lazy` + `Suspense`) so the main bundle stays smaller and dashboard code loads when needed.

## 6. Caching and async data

- **Role**: Cached in memory as above; no persistent storage.
- **Dashboard stats**: Fetched on each visit; can be extended with short-lived in-memory or SWR-style caching if needed.

## Summary

- Auth no longer blocks on role fetch; session is shown first, role updates after.
- Role is cached to avoid repeated DB calls and the role query is simplified.
- Protected route shows loading only while session or role is unknown, then either "Verifying access…", "Access denied", or the dashboard.
- Dashboard home uses count-only stats for faster load and less data transfer.
