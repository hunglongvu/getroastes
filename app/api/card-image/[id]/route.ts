import { type NextRequest } from 'next/server';
import sharp from 'sharp';
import { getRoast } from '@/lib/store';
import { RARITY_STYLES } from '@/lib/rarity';

function scoreColor(score: number): string {
  if (score <= 40) return '#E24B4A';
  if (score <= 70) return '#EF9F27';
  return '#639922';
}

function getExitCode(score: number): string {
  if (score <= 15) return 'SEGFAULT: NO_VALUE_PROP';
  if (score <= 30) return 'exit code: COOKED';
  if (score <= 50) return 'WARNING: NEEDS_REFACTOR';
  if (score <= 70) return 'status: ships but barely';
  if (score <= 85) return 'build: passing';
  return 'merge approved';
}

function wrapText(text: string, maxChars: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length > maxChars && current) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function esc(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const roast = await getRoast(id);

  if (!roast) {
    return new Response('Not found', { status: 404 });
  }

  const rarityStyle = RARITY_STYLES[roast.rarity];
  const scoreCol = scoreColor(roast.score);
  const code = getExitCode(roast.score);
  const borderColor = rarityStyle.border;

  const W = 800;
  const SIDE = 48;

  const roastLines = wrapText(`"${roast.roast}"`, 54);
  const stderrClean = roast.stderr.replace(/\*\*/g, '');
  const stderrLines = wrapText(stderrClean, 78);
  const tagStr = roast.tags
    .slice(0, 4)
    .map((t) => `${t.type === 'err' ? '✗' : t.type === 'warn' ? '⚠' : '✓'} ${t.label}`)
    .join('    ');

  // Layout
  const yRarity = 60;
  const yCharDesc = 82;
  const yDiv1 = 102;
  const yCommand = 130;
  const yScore = 256;
  const yCode = 282;
  const yRoastStart = 326;
  const roastLineH = 36;
  const yAfterRoast = yRoastStart + roastLines.length * roastLineH;
  const yTags = yAfterRoast + 28;
  const yDiv2 = yTags + 22;
  const yStderrLabel = yDiv2 + 28;
  const yStderrStart = yStderrLabel + 24;
  const stderrLineH = 26;
  const yFooter = yStderrStart + stderrLines.length * stderrLineH + 36;
  const H = yFooter + 32;

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${W}" height="${H}" fill="#080808" rx="8" ry="8"/>
  <rect x="1" y="1" width="${W - 2}" height="${H - 2}" fill="none" stroke="${borderColor}" stroke-width="2" rx="8" ry="8"/>

  <text x="${SIDE}" y="${yRarity}"
    font-family="Courier New,Courier,monospace"
    font-size="14" font-weight="bold" fill="${borderColor}">
    ✦ ${esc(roast.rarity)} · ${esc(roast.characterName)} ${esc(roast.characterEmoji)}
  </text>

  <text x="${SIDE}" y="${yCharDesc}"
    font-family="Georgia,Times New Roman,serif"
    font-size="12" font-style="italic" fill="${borderColor}" opacity="0.55">
    ${esc(roast.characterDescription)}
  </text>

  <line x1="${SIDE}" y1="${yDiv1}" x2="${W - SIDE}" y2="${yDiv1}" stroke="#222" stroke-width="1"/>

  <text x="${SIDE}" y="${yCommand}"
    font-family="Courier New,Courier,monospace"
    font-size="13" fill="#52525b">
    $ roast --url <tspan fill="#d4d4d8">${esc(roast.domain)}</tspan> --no-mercy
  </text>

  <text x="${W / 2}" y="${yScore}"
    font-family="Courier New,Courier,monospace"
    font-size="130" font-weight="bold" fill="${scoreCol}" text-anchor="middle">
    ${roast.score}
  </text>

  <text x="${W / 2}" y="${yCode}"
    font-family="Courier New,Courier,monospace"
    font-size="12" fill="${scoreCol}" text-anchor="middle" letter-spacing="3">
    ${esc(code.toUpperCase())}
  </text>

  ${roastLines
    .map(
      (line, i) =>
        `<text x="${W / 2}" y="${yRoastStart + i * roastLineH}"
    font-family="Georgia,Times New Roman,serif"
    font-size="21" fill="#ffffff" text-anchor="middle" font-style="italic">
    ${esc(line)}
  </text>`
    )
    .join('\n  ')}

  <text x="${W / 2}" y="${yTags}"
    font-family="Courier New,Courier,monospace"
    font-size="11" fill="#3f3f46" text-anchor="middle">
    ${esc(tagStr)}
  </text>

  <line x1="${SIDE}" y1="${yDiv2}" x2="${W - SIDE}" y2="${yDiv2}" stroke="#222" stroke-width="1"/>

  <text x="${SIDE}" y="${yStderrLabel}"
    font-family="Courier New,Courier,monospace"
    font-size="11" fill="#E24B4A">
    stderr:
  </text>

  ${stderrLines
    .map(
      (line, i) =>
        `<text x="${SIDE}" y="${yStderrStart + i * stderrLineH}"
    font-family="Georgia,Times New Roman,serif"
    font-size="13" fill="#71717a">
    ${esc(line)}
  </text>`
    )
    .join('\n  ')}

  <text x="${W / 2}" y="${yFooter}"
    font-family="Courier New,Courier,monospace"
    font-size="12" fill="#3f3f46" text-anchor="middle">
    getroasted.wtf
  </text>
</svg>`;

  try {
    const png = await sharp(Buffer.from(svg)).png().toBuffer();

    return new Response(new Uint8Array(png), {
      headers: {
        'Content-Type': 'image/png',
        'Content-Disposition': `attachment; filename="roast-${roast.domain}.png"`,
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (err) {
    console.error('sharp render error:', err);
    return new Response('Failed to generate image', { status: 500 });
  }
}
