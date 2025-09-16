// Utility to generate PWA icons programmatically
// This would typically be run during build time

export function generatePWAIcon(size: number): string {
  // Create SVG icon with MicroGreens theme
  const svg = `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#22c55e;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#16a34a;stop-opacity:1" />
        </linearGradient>
      </defs>

      <!-- Background circle -->
      <circle cx="${size/2}" cy="${size/2}" r="${size/2 - 2}" fill="url(#grad)"/>

      <!-- Plant icon -->
      <g transform="translate(${size*0.2}, ${size*0.2}) scale(${size/128})">
        <!-- Pot -->
        <path d="M35 85 L85 85 L80 95 L40 95 Z" fill="#8B4513"/>

        <!-- Soil -->
        <ellipse cx="60" cy="85" rx="22" ry="3" fill="#654321"/>

        <!-- Main stem -->
        <line x1="60" y1="85" x2="60" y2="45" stroke="#228B22" stroke-width="3"/>

        <!-- Left leaf -->
        <path d="M60 55 Q45 45 40 35 Q45 40 60 50" fill="#32CD32"/>

        <!-- Right leaf -->
        <path d="M60 55 Q75 45 80 35 Q75 40 60 50" fill="#32CD32"/>

        <!-- Top leaves -->
        <path d="M60 45 Q50 35 45 25 Q50 30 60 40" fill="#22c55e"/>
        <path d="M60 45 Q70 35 75 25 Q70 30 60 40" fill="#22c55e"/>

        <!-- Center sprout -->
        <circle cx="60" cy="35" r="2" fill="#FFD700"/>
      </g>
    </svg>
  `;

  return svg;
}

export function createFavicon(): string {
  return `
    <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="15" fill="#22c55e"/>
      <g transform="translate(6, 6) scale(0.15)">
        <!-- Simplified plant -->
        <path d="M60 85 L60 45" stroke="#fff" stroke-width="4"/>
        <path d="M60 55 Q45 45 40 35 Q50 40 60 50" fill="#fff"/>
        <path d="M60 55 Q75 45 80 35 Q70 40 60 50" fill="#fff"/>
        <circle cx="60" cy="40" r="3" fill="#FFD700"/>
      </g>
    </svg>
  `;
}

// Utility to convert SVG to data URL for favicon
export function svgToDataUrl(svg: string): string {
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}