import { createClient, createAdminClient } from '@insforge/sdk'

// Browser client for client components (reads access token cookie, refreshes via /api/auth/refresh)
export function getBrowserClient() {
  return createClient({
    baseUrl: process.env.NEXT_PUBLIC_INSFORGE_URL,
    anonKey: process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY,
  })
}

// Admin client for server-side operations that need full access
export function getAdminClient() {
  return createAdminClient({
    baseUrl: process.env.NEXT_PUBLIC_INSFORGE_URL,
    apiKey: process.env.INSFORGE_API_KEY!,
  })
}
