import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://cvmylmpsmnialytrunor.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2bXlsbXBzbW5pYWx5dHJ1bm9yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ5NjEzNDYsImV4cCI6MjA5MDUzNzM0Nn0.v9vPGMZlbqTRkmvwxRbAQvprJ1fiFaHZH0lZYWGxsdE'
)

async function test() {
  const { data, error } = await supabase.from('dues_payments').select('id, amount_paid, year_group, payment_status, profiles(name)');
  console.log('dues_payments:', JSON.stringify(data, null, 2));
  console.log('error:', error);
}

test();
