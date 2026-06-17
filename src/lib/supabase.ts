import { createClient } from "@supabase/supabase-js";

const metaEnv = (import.meta as any).env || {};

// Read credentials gracefully with fallbacks to user-provided keys
const supabaseUrl = metaEnv.VITE_SUPABASE_URL || "https://ehqzukmunlyhjxvcsths.supabase.co";
const supabaseAnonKey = metaEnv.VITE_SUPABASE_ANON_KEY || "sb_publishable_1GmoZa-AsEMQLHKtS22JiA_jV5KlZ3j";

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

/**
 * Initiates the Google OAuth flow conforming to AI Studio's iframe-popup protocols.
 * Uses skipBrowserRedirect to obtain the Supabase auth provider URL, which can be opened in a secure popup.
 */
export async function signInWithGoogleSupabase(syncId?: string) {
  if (!isSupabaseConfigured) {
    throw new Error("Supabase não configurado. Por favor, cadastre as chaves ambientais.");
  }

  const redirectUri = syncId 
    ? `${window.location.origin}/auth/callback?syncId=${syncId}`
    : `${window.location.origin}/auth/callback`;
  
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: redirectUri,
      skipBrowserRedirect: true
    }
  });

  if (error) {
    throw error;
  }

  if (!data?.url) {
    throw new Error("Não foi possível gerar a URL de autorização do Google.");
  }

  return data.url;
}
