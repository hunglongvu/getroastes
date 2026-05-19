import { getRoast } from '@/lib/store';

function getBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_BASE_URL) return process.env.NEXT_PUBLIC_BASE_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return 'http://localhost:3000';
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const roast = await getRoast(id);
  if (!roast) return new Response('Not found', { status: 404 });

  const apiKey = process.env.SCREENSHOTONE_API_KEY!;
  const baseUrl = getBaseUrl();

  const qs = new URLSearchParams({
    access_key: apiKey,
    url: `${baseUrl}/roast/${id}`,
    selector: '#roast-card',
    viewport_width: '600',
    viewport_height: '900',
    device_scale_factor: '2',
    format: 'png',
    image_quality: '95',
    block_ads: 'true',
    block_cookie_banners: 'true',
    block_trackers: 'true',
    delay: '1',
    timeout: '15',
    dark_mode: 'true',
  });

  const response = await fetch(
    `https://api.screenshotone.com/take?${qs.toString()}`,
    { signal: AbortSignal.timeout(20000) },
  );

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    console.error('ScreenshotOne error:', response.status, body);
    return new Response('Screenshot failed', { status: 500 });
  }

  const buffer = await response.arrayBuffer();

  return new Response(buffer, {
    headers: {
      'Content-Type': 'image/png',
      'Content-Disposition': `attachment; filename="roast-${roast.domain}.png"`,
      'Cache-Control': 'no-store',
    },
  });
}
