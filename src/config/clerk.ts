// Clerk Configuration
// Get your Clerk Publishable Key from: https://dashboard.clerk.com -> Your App -> API Keys
export const CLERK_PUBLISHABLE_KEY =
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY ?? "pk_test_cmF0aW9uYWwtbGVtdXItOTMuY2xlcmsuYWNjb3VudHMuZGV2JA";

// Clerk is optional - if not configured, the app will use Supabase authentication
export const isClerkEnabled = !!CLERK_PUBLISHABLE_KEY;
