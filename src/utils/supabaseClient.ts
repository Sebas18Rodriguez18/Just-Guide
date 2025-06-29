import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Handle auth state changes more gracefully
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_OUT') {
    // Clear any invalid session data
    localStorage.removeItem(`sb-${supabaseUrl.split('//')[1].split('.')[0]}-auth-token`);
    
    // Only redirect to login if we're not already there
    if (window.location.pathname !== '/login' && 
        window.location.pathname !== '/register' && 
        window.location.pathname !== '/forgot-password' && 
        window.location.pathname !== '/reset-password') {
      window.location.href = '/login';
    }
  }
});

// Modified fetch error handler to be less aggressive with redirects
const originalFetch = window.fetch;
window.fetch = async (...args) => {
  try {
    const response = await originalFetch(...args);
    
    // Only handle critical auth errors, not all 400-level errors
    if (args[0] && 
        typeof args[0] === 'string' && 
        args[0].includes('supabase.co/auth') && 
        response.status === 403) {
      
      const responseText = await response.clone().text();
      if (responseText.includes('session_not_found') || 
          responseText.includes('Session from session_id claim in JWT does not exist')) {
        
        // Clear invalid session data
        const supabaseProjectId = supabaseUrl.split('//')[1].split('.')[0];
        localStorage.removeItem(`sb-${supabaseProjectId}-auth-token`);
        
        // Sign out the user to clear any remaining session state
        await supabase.auth.signOut();
        
        // Only redirect if we're not already on an auth page
        if (window.location.pathname !== '/login' && 
            window.location.pathname !== '/register' && 
            window.location.pathname !== '/forgot-password' && 
            window.location.pathname !== '/reset-password') {
          window.location.href = '/login';
        }
      }
    }
    
    return response;
  } catch (error) {
    console.error('Fetch error:', error);
    return originalFetch(...args);
  }
};