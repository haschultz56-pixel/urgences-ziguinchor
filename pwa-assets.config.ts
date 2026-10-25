import { defineConfig, minimal2023Preset } from '@vite-pwa/assets-generator/config';

// public/icon.svg is the shield alone on a transparent background. Every PNG icon (standard, maskable, Apple)
// gets a white background (pwa-*.png by scripts/flatten-icons.mjs, since the generator keeps them transparent):
// Samsung launchers put web app icons on a white oval, so white is part of the design.
const fill = { padding: 0, resizeOptions: { background: '#ffffff' } };

export default defineConfig({
  preset: {
    ...minimal2023Preset,
    // Extra padding keeps the shield inside the 80 % safe zone of round masks.
    maskable: { ...minimal2023Preset.maskable, ...fill, padding: 0.15 },
    apple: { ...minimal2023Preset.apple, ...fill, padding: 0.1 },
  },
  images: ['public/icon.svg'],
});
