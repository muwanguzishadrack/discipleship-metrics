import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'

const supabaseUrl = 'https://hmbveuawwmbymvyqemjp.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhtYnZldWF3d21ieW12eXFlbWpwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ4NDUwMDksImV4cCI6MjA3MDQyMTAwOX0.z3M7vbeM7cOax6mgwtFUL2T8JlQs9dsng9YoDNowJXA'

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)