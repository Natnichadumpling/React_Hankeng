import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bfjdkpoxbvutthuuthrs.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJmamtkcG94YnZ1dHRodXV0aHJzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUyNzczMDgsImV4cCI6MjA3MDg1MzMwOH0.1iaIDeoIiIWhdAFV-v4atCrZpjsL5OptSwtgSlV4Zgk';

export const supabase = createClient(supabaseUrl, supabaseKey);
