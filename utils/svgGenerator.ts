
import { CardContent, CardStyle, UserInfo } from '../types';

// --- Constants ---
const WIDTH = 750;
const HEIGHT = 1000;
const PADDING = 48;

// --- Helper: Text Measuring & Wrapping ---
const measureTextWidth = (text: string, font: string): number => {
  if (typeof document === 'undefined') return text.length * 12;
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (context) {
    context.font = font;
    return context.measureText(text).width;
  }
  return text.length * 12;
};

const getLines = (text: string, maxWidth: number, font: string): string[] => {
  const words = text.split(''); // Split by char for Chinese support
  const lines: string[] = [];
  let currentLine = words[0] || '';

  for (let i = 1; i < words.length; i++) {
    const word = words[i];
    const width = measureTextWidth(currentLine + word, font);
    if (width < maxWidth) {
      currentLine += word;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }
  lines.push(currentLine);
  return lines;
};

const esc = (unsafe: string | undefined): string => {
  if (!unsafe) return '';
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
};

// --- Style Configurations ---
const getTheme = (style: CardStyle) => {
  switch (style) {
    case CardStyle.MODERN_GRADIENT:
      return {
        // Tailwind: from-violet-600 via-fuchsia-600 to-orange-500
        defs: `
          <linearGradient id="gradBg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#7c3aed" />
            <stop offset="50%" stop-color="#c026d3" />
            <stop offset="100%" stop-color="#f97316" />
          </linearGradient>
          <filter id="glowBlur" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="60" />
          </filter>
        `,
        bg: `
          <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#gradBg)" />
          <!-- Glowing Orbs -->
          <circle cx="0" cy="0" r="400" fill="#a78bfa" fill-opacity="0.2" filter="url(#glowBlur)" />
          <circle cx="${WIDTH}" cy="${HEIGHT}" r="400" fill="#fdba74" fill-opacity="0.2" filter="url(#glowBlur)" />
        `,
        // Use single quotes for font names to avoid XML attribute breaking
        fontTitle: "'Noto Sans SC', sans-serif",
        fontBody: "'Noto Sans SC', sans-serif",
        textMain: '#FFFFFF',
        textSec: '#FFFFFF',
        accent: '#FFFFFF',
        // Glassmorphism box
        box: { 
          fill: '#FFFFFF', opacity: 0.15, 
          stroke: '#FFFFFF', strokeWidth: 1, 
          radius: 24, hasShadow: true 
        }
      };

    case CardStyle.CYBERPUNK:
      return {
        defs: `
          <pattern id="cyberGrid" width="40" height="40" patternUnits="userSpaceOnUse">
             <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#22d3ee" stroke-width="0.5" opacity="0.1"/>
          </pattern>
        `,
        bg: `
          <rect width="${WIDTH}" height="${HEIGHT}" fill="#09090b" />
          <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#cyberGrid)" />
          <path d="M0 0 L${WIDTH} 0" stroke="#22d3ee" stroke-width="4" />
          <!-- Glitch accents -->
          <rect x="-20" y="100" width="40" height="4" fill="#ec4899" opacity="0.8" />
          <rect x="${WIDTH-20}" y="400" width="40" height="4" fill="#22d3ee" opacity="0.8" />
        `,
        fontTitle: "'JetBrains Mono', monospace",
        fontBody: "'JetBrains Mono', monospace",
        textMain: '#ec4899', // Pink-500
        textSec: '#22d3ee', // Cyan-400
        accent: '#22d3ee',
        box: { 
          fill: '#000000', opacity: 0.7, 
          stroke: '#22d3ee', strokeWidth: 1, 
          radius: 0, hasShadow: false 
        }
      };

    case CardStyle.NEO_BRUTALISM:
      return {
        defs: `
          <linearGradient id="gradNeo" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#f093fb" />
            <stop offset="100%" stop-color="#f5576c" />
          </linearGradient>
          <filter id="hardShadow">
            <feDropShadow dx="6" dy="6" stdDeviation="0" flood-color="#000000" flood-opacity="1" />
          </filter>
        `,
        bg: `
          <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#gradNeo)" />
          <rect width="${WIDTH}" height="${HEIGHT}" fill="none" stroke="#000000" stroke-width="12" />
        `,
        fontTitle: "'Noto Sans SC', sans-serif",
        fontBody: "'Noto Sans SC', sans-serif",
        textMain: '#000000',
        textSec: '#000000',
        accent: '#000000',
        box: { 
          fill: '#FFFFFF', opacity: 1, 
          stroke: '#000000', strokeWidth: 4, 
          radius: 0, hasShadow: true, shadowType: 'hard' 
        }
      };

    case CardStyle.ELEGANT_LUXURY:
      return {
        defs: ``,
        bg: `
          <rect width="${WIDTH}" height="${HEIGHT}" fill="#0a0a0a" />
          <rect x="20" y="20" width="${WIDTH-40}" height="${HEIGHT-40}" fill="none" stroke="#C5A059" stroke-width="1" opacity="0.4" />
          <rect x="26" y="26" width="${WIDTH-52}" height="${HEIGHT-52}" fill="none" stroke="#C5A059" stroke-width="1" opacity="0.2" />
        `,
        fontTitle: "'Noto Serif SC', serif",
        fontBody: "'Noto Serif SC', serif",
        textMain: '#f0f0f0',
        textSec: '#C5A059',
        accent: '#C5A059',
        box: { 
          fill: '#1a1a1a', opacity: 0.8, 
          stroke: '#C5A059', strokeWidth: 1, 
          radius: 0, hasShadow: false 
        }
      };

    case CardStyle.NATURE_ORGANIC:
      return {
        defs: `
          <filter id="softBlur">
            <feGaussianBlur stdDeviation="40" />
          </filter>
        `,
        bg: `
          <rect width="${WIDTH}" height="${HEIGHT}" fill="#f5f5f0" />
          <rect width="${WIDTH}" height="${HEIGHT}" fill="none" stroke="#e8e8e0" stroke-width="24" />
          <circle cx="${WIDTH}" cy="0" r="300" fill="#d4e6d4" opacity="0.6" filter="url(#softBlur)" />
          <circle cx="0" cy="${HEIGHT}" r="300" fill="#e6e0d0" opacity="0.6" filter="url(#softBlur)" />
        `,
        fontTitle: "'Noto Serif SC', serif",
        fontBody: "'Noto Sans SC', sans-serif",
        textMain: '#1a2e1a',
        textSec: '#5a6e5a',
        accent: '#6b8e6b',
        box: { 
          fill: '#FFFFFF', opacity: 0.6, 
          stroke: '#FFFFFF', strokeWidth: 2, 
          radius: 24, hasShadow: true 
        }
      };

    case CardStyle.NEWSPAPER:
      return {
        defs: `
          <filter id="paperNoise">
             <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch" />
          </filter>
        `,
        bg: `
          <rect width="${WIDTH}" height="${HEIGHT}" fill="#F0EAD6" />
          <!-- Corrected: Use filter for noise, not fill -->
          <rect width="${WIDTH}" height="${HEIGHT}" fill="transparent" filter="url(#paperNoise)" opacity="0.05" />
          <rect x="0" y="0" width="${WIDTH}" height="8" fill="#2c2c2c" />
        `,
        fontTitle: "'Noto Serif SC', serif",
        fontBody: "'Noto Serif SC', serif",
        textMain: '#2c2c2c',
        textSec: '#2c2c2c',
        accent: '#2c2c2c',
        box: { 
          fill: '#FFFFFF', opacity: 1, 
          stroke: '#2c2c2c', strokeWidth: 3, 
          radius: 0, hasShadow: true, shadowType: 'hard' 
        }
      };

    case CardStyle.GLASSMORPHISM:
      return {
        defs: `
          <linearGradient id="gradGlass" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#4facfe" />
            <stop offset="100%" stop-color="#00f2fe" />
          </linearGradient>
          <filter id="blurOrb">
            <feGaussianBlur stdDeviation="80" />
          </filter>
        `,
        bg: `
          <rect width="${WIDTH}" height="${HEIGHT}" fill="#111827" />
          <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#gradGlass)" opacity="0.8" />
          <circle cx="0" cy="0" r="300" fill="#fa709a" opacity="0.6" filter="url(#blurOrb)" />
          <circle cx="${WIDTH}" cy="${HEIGHT}" r="300" fill="#fee140" opacity="0.5" filter="url(#blurOrb)" />
        `,
        fontTitle: "'Noto Sans SC', sans-serif",
        fontBody: "'Noto Sans SC', sans-serif",
        textMain: '#FFFFFF',
        textSec: '#FFFFFF',
        accent: '#FFFFFF',
        box: { 
          fill: '#FFFFFF', opacity: 0.1, 
          stroke: '#FFFFFF', strokeWidth: 1, 
          radius: 32, hasShadow: true 
        }
      };

    case CardStyle.MINIMALIST:
    default:
      return {
        defs: ``,
        bg: `
          <rect width="${WIDTH}" height="${HEIGHT}" fill="#FFFFFF" />
          <circle cx="${WIDTH}" cy="-100" r="400" fill="#f9fafb" />
        `,
        fontTitle: "'Noto Serif SC', serif",
        fontBody: "'Noto Sans SC', sans-serif",
        textMain: '#111827', // Gray-900
        textSec: '#9ca3af', // Gray-400
        accent: '#111827',
        box: { 
          fill: '#f9fafb', opacity: 1, 
          stroke: '#e5e7eb', strokeWidth: 1, 
          radius: 24, hasShadow: false 
        }
      };
  }
};

// --- Main Generator ---
export const generateStandardSvg = (
  content: CardContent,
  style: CardStyle,
  renderMode: 'cover' | 'slide',
  sectionIndex: number = 0,
  userInfo?: UserInfo
): string => {
  const theme = getTheme(style);
  
  // -- Build Common Filters if not present in theme.defs --
  const commonDefs = `
    <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="4" stdDeviation="8" flood-color="#000000" flood-opacity="0.1" />
    </filter>
    <filter id="hardShadowDef" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="8" dy="8" stdDeviation="0" flood-color="#000000" flood-opacity="1" />
    </filter>
  `;

  // Determine which shadow to use
  let boxFilter = '';
  if (theme.box.hasShadow) {
    boxFilter = theme.box.shadowType === 'hard' ? 'url(#hardShadowDef)' : 'url(#softShadow)';
  }

  let svgBody = '';
  let y = 80;

  // --- 1. Header (Category / Number) ---
  const headerText = renderMode === 'cover' ? content.category : `PART ${sectionIndex + 1}`;
  
  if (style === CardStyle.NEO_BRUTALISM) {
    // Neo-Brutalism: Rotated Badge
    const badgeWidth = measureTextWidth(headerText, `900 20px ${theme.fontBody}`) + 40;
    svgBody += `
      <g transform="translate(${PADDING}, ${y})">
        <rect x="0" y="-30" width="${badgeWidth}" height="40" fill="white" stroke="black" stroke-width="4" filter="url(#hardShadowDef)" />
        <text x="20" y="-4" font-family="${theme.fontBody}" font-weight="900" font-size="20" fill="black">${esc(headerText.toUpperCase())}</text>
      </g>
      <text x="${WIDTH-PADDING}" y="${y+10}" font-family="${theme.fontBody}" font-size="60" fill="black" text-anchor="end" filter="url(#hardShadowDef)">${esc(content.emoji)}</text>
    `;
    y += 80;
  } else if (style === CardStyle.NEWSPAPER) {
    // Newspaper: Header Lines
    svgBody += `
      <line x1="${PADDING}" y1="${y}" x2="${WIDTH-PADDING}" y2="${y}" stroke="${theme.textMain}" stroke-width="4" />
      <text x="${WIDTH/2}" y="${y+30}" font-family="${theme.fontTitle}" font-weight="bold" font-size="24" fill="${theme.textMain}" text-anchor="middle">THE DAILY KNOWLEDGE</text>
      <line x1="${PADDING}" y1="${y+45}" x2="${WIDTH-PADDING}" y2="${y+45}" stroke="${theme.textMain}" stroke-width="1" />
      <text x="${PADDING}" y="${y+65}" font-family="${theme.fontBody}" font-size="16" fill="${theme.textMain}">VOL. ${sectionIndex + 1}</text>
      <text x="${WIDTH-PADDING}" y="${y+65}" font-family="${theme.fontBody}" font-size="16" fill="${theme.textMain}" text-anchor="end">${new Date().toLocaleDateString()}</text>
      <line x1="${PADDING}" y1="${y+80}" x2="${WIDTH-PADDING}" y2="${y+80}" stroke="${theme.textMain}" stroke-width="4" stroke-dasharray="4 2"/>
    `;
    y += 120;
  } else {
    // Standard Header
    svgBody += `
      <text x="${PADDING}" y="${y}" font-family="${theme.fontBody}" font-weight="bold" font-size="18" fill="${theme.textSec}" letter-spacing="2" opacity="0.8">${esc(headerText.toUpperCase())}</text>
      <text x="${WIDTH-PADDING}" y="${y}" font-family="${theme.fontBody}" font-size="40" fill="${theme.textSec}">${esc(content.emoji)}</text>
    `;
    y += 60;
  }

  // --- 2. Main Content ---
  if (renderMode === 'cover') {
    // --- COVER MODE ---
    
    // Title
    const titleFontSize = 56;
    const titleFont = `bold ${titleFontSize}px ${theme.fontTitle}`;
    const titleLines = getLines(content.title, WIDTH - (PADDING * 2), titleFont);
    
    titleLines.forEach(line => {
      if (style === CardStyle.NEO_BRUTALISM) {
         // Neo-Brutalism Title: White background with border, rotated
         const lw = measureTextWidth(line, titleFont) + 20;
         svgBody += `
           <g transform="translate(${PADDING}, ${y}) rotate(-1)">
             <rect x="-10" y="-50" width="${lw}" height="70" fill="white" stroke="black" stroke-width="4" />
             <text x="0" y="0" font-family="${theme.fontTitle}" font-weight="900" font-size="${titleFontSize}" fill="black">${esc(line)}</text>
           </g>
         `;
      } else {
         svgBody += `<text x="${PADDING}" y="${y}" font-family="${theme.fontTitle}" font-weight="bold" font-size="${titleFontSize}" fill="${theme.textMain}">${esc(line)}</text>`;
      }
      y += 72; // Line height
    });
    y += 40;

    // Summary Box
    const summaryFontSize = 28;
    const summaryFont = `${summaryFontSize}px ${theme.fontBody}`;
    const summaryLines = getLines(content.summary, WIDTH - (PADDING * 2) - 60, summaryFont);
    const boxHeight = (summaryLines.length * 44) + 60;

    svgBody += `
      <rect x="${PADDING}" y="${y}" width="${WIDTH - (PADDING * 2)}" height="${boxHeight}" 
            rx="${theme.box.radius}" ry="${theme.box.radius}"
            fill="${theme.box.fill}" fill-opacity="${theme.box.opacity}"
            stroke="${theme.box.stroke}" stroke-width="${theme.box.strokeWidth}"
            filter="${boxFilter}" />
    `;

    // Neo-Brutalism Decor
    if (style === CardStyle.NEO_BRUTALISM) {
      svgBody += `<rect x="${PADDING-10}" y="${y-10}" width="30" height="30" fill="black" stroke="white" stroke-width="3" rx="15" />`;
    }

    summaryLines.forEach((line, i) => {
      svgBody += `<text x="${PADDING + 30}" y="${y + 50 + (i * 44)}" font-family="${theme.fontBody}" font-size="${summaryFontSize}" fill="${theme.textMain}" opacity="0.9">${esc(line)}</text>`;
    });

    y += boxHeight + 60;

    // Key Points
    if (content.keyPoints && content.keyPoints.length > 0) {
       content.keyPoints.forEach(point => {
          const pointLines = getLines(point, WIDTH - (PADDING * 2) - 50, `bold 26px ${theme.fontBody}`);
          svgBody += `<g transform="translate(${PADDING}, ${y})">`;
          
          if (style === CardStyle.NEO_BRUTALISM) {
             svgBody += `<rect x="0" y="-14" width="16" height="16" fill="black" />`;
          } else {
             svgBody += `<circle cx="8" cy="-8" r="4" fill="${theme.accent}" />`;
          }

          pointLines.forEach((line, i) => {
             svgBody += `<text x="30" y="${i * 36}" font-family="${theme.fontBody}" font-weight="bold" font-size="26" fill="${theme.textMain}">${esc(line)}</text>`;
          });
          svgBody += `</g>`;
          y += (pointLines.length * 36) + 20;
       });
    }

  } else {
    // --- SLIDE MODE ---
    const section = content.sections[sectionIndex];
    if (section) {
       // Big Number Watermark
       if (style !== CardStyle.NEWSPAPER) {
          svgBody += `<text x="${WIDTH-PADDING}" y="${y+120}" font-family="${theme.fontTitle}" font-weight="900" font-size="200" fill="${theme.textSec}" fill-opacity="0.1" text-anchor="end">${sectionIndex + 1}</text>`;
       }

       // Title
       const titleFontSize = 48;
       const titleFont = `bold ${titleFontSize}px ${theme.fontTitle}`;
       const titleLines = getLines(section.title, WIDTH - (PADDING * 2), titleFont);

       titleLines.forEach(line => {
         svgBody += `<text x="${PADDING}" y="${y}" font-family="${theme.fontTitle}" font-weight="bold" font-size="${titleFontSize}" fill="${theme.textMain}">${esc(line)}</text>`;
         y += 64;
       });

       y += 20;
       // Separator
       svgBody += `<rect x="${PADDING}" y="${y}" width="100" height="4" fill="${theme.accent}" />`;
       y += 60;

       // Content
       const contentFontSize = 30;
       const contentFont = `${contentFontSize}px ${theme.fontBody}`;
       const contentLines = getLines(section.content, WIDTH - (PADDING * 2), contentFont);

       contentLines.forEach(line => {
         svgBody += `<text x="${PADDING}" y="${y}" font-family="${theme.fontBody}" font-size="${contentFontSize}" fill="${theme.textMain}" opacity="0.95">${esc(line)}</text>`;
         y += 52;
       });
    }
  }

  // --- 3. Footer ---
  const footerY = HEIGHT - PADDING;
  svgBody += `
    <g opacity="0.7">
      <text x="${PADDING}" y="${footerY}" font-family="${theme.fontBody}" font-size="18" fill="${theme.textSec}">${esc(content.authorOrSource)}</text>
      <text x="${WIDTH/2}" y="${footerY}" font-family="${theme.fontBody}" font-size="18" fill="${theme.textSec}" text-anchor="middle">${esc(content.readingTime)} READ</text>
      <text x="${WIDTH-PADDING}" y="${footerY}" font-family="${theme.fontBody}" font-size="18" fill="${theme.textSec}" text-anchor="end">${renderMode === 'cover' ? 'COVER' : `${sectionIndex + 1} / ${content.sections.length}`}</text>
    </g>
  `;

  // --- 4. User Info Watermark ---
  if (userInfo && userInfo.enabled) {
    const isLeft = userInfo.position.includes('left');
    const isTop = userInfo.position.includes('top');
    const custom = userInfo.position === 'custom';
    
    let wx = isLeft ? PADDING : WIDTH - PADDING;
    let wy = isTop ? PADDING + 30 : HEIGHT - PADDING - 40;
    let anchor = isLeft ? 'start' : 'end';

    if (custom) {
       wx = (userInfo.customPos.x / 100) * WIDTH;
       wy = (userInfo.customPos.y / 100) * HEIGHT;
       anchor = 'middle';
    }

    svgBody += `
      <g transform="translate(${wx}, ${wy}) scale(${userInfo.scale})" opacity="${userInfo.opacity}">
         <!-- Optional simple avatar circle placeholder since we can't easily embed external images without base64 bloat issues in some viewers, using text alias -->
         <text font-family="${theme.fontBody}" font-weight="bold" font-size="20" fill="${theme.textMain}" text-anchor="${anchor}" style="text-shadow: 0 1px 2px rgba(0,0,0,0.1);">
            @${esc(userInfo.nickname)}
         </text>
      </g>
    `;
  }

  return `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
  <defs>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;700;900&amp;family=Noto+Serif+SC:wght@400;700&amp;family=JetBrains+Mono:wght@400;700&amp;display=swap');
    </style>
    ${commonDefs}
    ${theme.defs}
  </defs>
  
  <!-- Background -->
  ${theme.bg}

  <!-- Content -->
  ${svgBody}
</svg>`;
};
