import { supabase } from '@/lib/supabase';

// Temporary diagnostic endpoint — delete after use
export async function GET() {
  const { data, error } = await supabase
    .from('roasts')
    .select('id, domain, created_at, screenshot_base64')
    .order('created_at', { ascending: false })
    .limit(5);

  if (error) {
    return Response.json({ error: error.message, hint: error.hint, code: error.code });
  }

  return Response.json(
    data?.map((r) => ({
      id: r.id,
      domain: r.domain,
      created_at: r.created_at,
      screenshot_base64_length: r.screenshot_base64?.length ?? null,
      has_screenshot: r.screenshot_base64 != null,
    })),
  );
}
