import { type NextRequest } from 'next/server';
import { excludeFromLeaderboard } from '@/lib/store';

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id) {
    return Response.json({ error: 'ID required.' }, { status: 400 });
  }

  await excludeFromLeaderboard(id);
  return Response.json({ ok: true });
}
