// supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ubafgwzktgbdcxvenpnp.supabase.co'
const supabaseKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InViYWZnd3prdGdiZGN4dmVucG5wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4MDQ1MzEsImV4cCI6MjA3MTM4MDUzMX0.0pRrhfDtn8fbdixaE_zL5DhxxRR_eiqpL94dd2rhGMg'

export const supabase = createClient(supabaseUrl, supabaseKey)
