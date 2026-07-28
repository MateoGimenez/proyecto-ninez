import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Supabase URL o Key mal configuradas.");
} else {
  console.log("Supabase URL y Key configuradas correctamente.");
}


const clientSupabase = createClient(supabaseUrl, supabaseKey);

export default clientSupabase;