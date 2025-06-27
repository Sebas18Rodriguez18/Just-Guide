import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Handle invalid session errors globally
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_OUT' || (event === 'TOKEN_REFRESHED' && !session)) {
    // Clear any invalid session data
    localStorage.removeItem(`sb-${supabaseUrl.split('//')[1].split('.')[0]}-auth-token`)
    
    // Redirect to login if we're not already there
    if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
      window.location.href = '/login'
    }
  }
})

// Add a global error handler for Supabase requests
const originalFetch = window.fetch
window.fetch = async (...args) => {
  try {
    const response = await originalFetch(...args)
    
    // Check if this is a Supabase auth request that failed with session error
    if (args[0]?.toString().includes('supabase.co/auth') && response.status === 403) {
      const responseText = await response.clone().text()
      if (responseText.includes('session_not_found') || responseText.includes('Session from session_id claim in JWT does not exist')) {
        // Clear invalid session data
        const supabaseProjectId = supabaseUrl.split('//')[1].split('.')[0]
        localStorage.removeItem(`sb-${supabaseProjectId}-auth-token`)
        
        // Sign out the user to clear any remaining session state
        await supabase.auth.signOut()
        
        // Redirect to login
        if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
          window.location.href = '/login'
        }
      }
    }
    
    return response
  } catch (error) {
    return originalFetch(...args)
  }
}