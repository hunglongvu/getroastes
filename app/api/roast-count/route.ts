import { supabase } from '@/lib/supabase';

export async function GET() {
  const { count } = await supabase
    .from('roasts')
    .select('*', { count: 'exact', head: true });

  return Response.json({ count: count ?? 0 });
}
