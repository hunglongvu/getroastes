import { supabase } from '@/lib/supabase';
import { getRoast } from '@/lib/store';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const roast = await getRoast(id);
  if (!roast) return Response.json({ rank: null, total: 0 });

  const { count: worseCount } = await supabase
    .from('roasts')
    .select('*', { count: 'exact', head: true })
    .lt('score', roast.score);

  const { count: total } = await supabase
    .from('roasts')
    .select('*', { count: 'exact', head: true });

  const rank = (total ?? 0) - (worseCount ?? 0);
  const percentileCooked = Math.round(((worseCount ?? 0) / (total ?? 1)) * 100);

  return Response.json({
    rank,
    total: total ?? 0,
    percentileCooked,
    score: roast.score,
  });
}
