const fs = require('fs');
const path = require('path');

/**
 * Generate simple SVG icons for PWA
 * Creates icons in various sizes for the manifest
 */
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

const svgTemplate = (size) => `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#9333EA;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#EC4899;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="100" fill="url(#grad)"/>
  <text x="50%" y="45%" text-anchor="middle" font-family="Arial, sans-serif" font-size="200" font-weight="bold" fill="white">
    P
  </text>
  <text x="50%" y="80%" text-anchor="middle" font-family="Arial, sans-serif" font-size="80" fill="white" opacity="0.9">
    Party OS
  </text>
</svg>`;

const iconsDir = path.join(__dirname, '../public/icons');

// Create icons directory if it doesn't exist
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Generate SVG icons
sizes.forEach(size => {
  const svg = svgTemplate(size);
  const filename = `icon-${size}x${size}.svg`;
  fs.writeFileSync(path.join(iconsDir, filename), svg);
  console.log(`✅ Created ${filename}`);
});

// Create apple-touch-icon
const appleTouchIcon = svgTemplate(180);
fs.writeFileSync(path.join(iconsDir, 'apple-touch-icon.svg'), appleTouchIcon);
console.log('✅ Created apple-touch-icon.svg');

// Create favicon
const favicon = svgTemplate(32);
fs.writeFileSync(path.join(__dirname, '../public/favicon.svg'), favicon);
console.log('✅ Created favicon.svg');

console.log('\n🎨 All PWA icons generated successfully!');
console.log('📱 Your app is now ready to be installed as a PWA');
