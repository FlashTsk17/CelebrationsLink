import { supabase, isSupabaseConfigured } from './supabase.js'

export async function getCurrentUser() {
  if (!isSupabaseConfigured || !supabase) return null
  const { data, error } = await supabase.auth.getUser()
  if (error) return null
  return data.user || null
}

export async function signUpMember({ email, password, name }) {
  if (!supabase) throw new Error('Le service membre n’est pas encore configuré.')

  const cleanEmail = email.trim().toLowerCase()
  const cleanName = name.trim()
  if (!cleanEmail || !password || !cleanName) throw new Error('Remplis tous les champs.')
  if (password.length < 8) throw new Error('Le mot de passe doit contenir au moins 8 caractères.')

  const { data, error } = await supabase.auth.signUp({
    email: cleanEmail,
    password,
    options: { data: { display_name: cleanName } },
  })

  if (error) throw error
  return data
}

export async function signInMember({ email, password }) {
  if (!supabase) throw new Error('Le service membre n’est pas encore configuré.')
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  })
  if (error) throw error
  return data
}

export async function signOutMember() {
  if (!supabase) return
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export function onAuthStateChange(callback) {
  if (!supabase) return () => {}
  const { data } = supabase.auth.onAuthStateChange((event, session) => callback(event, session))
  return () => data.subscription.unsubscribe()
}
