import { defineConfig, minimal2023Preset } from '@vite-pwa/assets-generator/config';

// public/icon.svg is round on a transparent background. Maskable (Android) and Apple icons are filled
// edge to edge in red, so the launcher's own mask (circle, squircle…) never shows a white border.
const fill = { padding: 0, resizeOptions: { background: '#b91c1c' } };

export default defineConfig({
  preset: {
    ...minimal2023Preset,
    // Extra padding keeps the shield inside the 80 % safe zone of round masks.
    maskable: { ...minimal2023Preset.maskable, ...fill, padding: 0.15 },
    apple: { ...minimal2023Preset.apple, ...fill },
  },
  images: ['public/icon.svg'],
});
