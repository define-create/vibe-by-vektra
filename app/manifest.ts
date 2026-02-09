import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Vibe by Vektra',
    short_name: 'Vibe',
    description: 'Private post-session reflection instrument for tracking activity patterns',
    start_url: '/',
    display: 'standalone',
    background_color: '#0a0a0a',
    theme_color: '#171717',
    orientation: 'portrait',
    categories: ['health', 'lifestyle', 'productivity'],
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
    ],
  };
}
