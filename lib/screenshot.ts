export async function takeScreenshot(
  url: string,
): Promise<{ base64: string; mediaType: 'image/jpeg' }> {
  const params = new URLSearchParams({
    access_key: process.env.SCREENSHOTONE_API_KEY!,
    url,
    format: 'jpg',
    viewport_width: '800',
    viewport_height: '600',
    full_page: 'false',
    block_ads: 'true',
    block_cookie_banners: 'true',
    block_trackers: 'true',
    delay: '2',
    timeout: '60',
    image_quality: '65',
  });

  const response = await fetch(`https://api.screenshotone.com/take?${params}`, {
    signal: AbortSignal.timeout(35000),
  });

  if (!response.ok) {
    throw new Error(`Screenshot failed: HTTP ${response.status}`);
  }

  const buffer = await response.arrayBuffer();
  const base64 = Buffer.from(buffer).toString('base64');
  return { base64, mediaType: 'image/jpeg' };
}
