


// // supabase.ts
// import { createClient } from '@supabase/supabase-js'

// const supabaseUrl = process.env.https://sjqcrbiuifddfqdbwgno.supabase.co
// const supabaseKey = process.env.eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNqcWNyYml1aWZkZGZxZGJ3Z25vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYzMTE2NTUsImV4cCI6MjA3MTg4NzY1NX0.QslqgVx9G6OUIVy8XQ0IHKU3PP_Z-o5rTYIsJsA04VQ
// export const supabase = createClient(supabaseUrl, supabaseKey)

// supabase.ts
import { createClient } from '@supabase/supabase-js'
// import dotenv from 'dotenv';

// โหลดค่าจากไฟล์ .env
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);
