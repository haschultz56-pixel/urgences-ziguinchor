// Fills the transparent background of the standard PWA icons in white, and renames the Apple icon.
// Run by `npm run icons` after pwa-assets-generator.
import { renameSync, writeFileSync } from 'node:fs';
import sharp from 'sharp';

const WHITE = '#ffffff';

for (const size of [64, 192, 512]) {
  const file = `public/pwa-${size}x${size}.png`;
  writeFileSync(file, await sharp(file).flatten({ background: WHITE }).png().toBuffer());
}
renameSync('public/apple-touch-icon-180x180.png', 'public/apple-touch-icon.png');
