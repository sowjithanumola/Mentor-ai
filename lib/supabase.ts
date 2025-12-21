
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zforbljedmhznfzrplyy.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpmb3JibGplZG1oem5menJwbHl5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYyOTg0MTksImV4cCI6MjA4MTg3NDQxOX0.CsYJXd1fvwPrHqHUotU-JOR1XctThtp2Ko-zMdXi1ME';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
