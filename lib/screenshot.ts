export async function takeScreenshot(
  url: string,
): Promise<{ base64: string; mediaType: 'image/jpeg' }> {
  const params = new URLSearchParams({
    access_key: process.env.SCREENSHOTONE_API_KEY!,
    url,
    format: 'jpg',
    viewport_width: '1400',
    viewport_height: '800',
    device_scale_factor: '2',
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
    const errorBody = await response.text().catch(() => '(unreadable)');
    // Classify common failure modes for monitoring
    const reason =
      response.status === 403 ? 'bot-blocked (403)' :
      response.status === 422 ? 'invalid-url (422)' :
      response.status === 429 ? 'rate-limited (429)' :
      response.status === 504 ? 'upstream-timeout (504)' :
      `http-${response.status}`;
    console.error(`[SCREENSHOT_FAIL] reason=${reason} url=${url} body=${errorBody.slice(0, 200)}`);
    throw new Error(`Screenshot failed: ${reason}`);
  }

  const buffer = await response.arrayBuffer();
  const base64 = Buffer.from(buffer).toString('base64');
  const kb = Math.round(base64.length / 1024);
  console.log(`[SCREENSHOT_OK] url=${url} size=${kb}KB`);
  return { base64, mediaType: 'image/jpeg' };
}
