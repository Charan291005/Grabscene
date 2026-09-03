import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const newImage = "https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Bungy_jumping_in_Queenstown%2C_New_Zealand_-_20070830.jpg/640px-Bungy_jumping_in_Queenstown%2C_New_Zealand_-_20070830.jpg";
  await supabase.from('events').update({ image_url: newImage }).ilike('title', '%Bungee%');
  console.log("Updated Bungee Image");
}
run();
