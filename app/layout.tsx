import type { Metadata } from 'next';
import "./globals.css"
export const metadata: Metadata = {
  title: 'My PWA Camera App',
  description: 'A PWA with camera and offline support',
  manifest: '/manifest.json',
  icons: [
    { rel: 'apple-touch-icon', url: '/icons/photo-camera.png' },
    { rel: 'icon', url: '/icons/photo-camera.png' },
  ],

};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body>{children}</body>
    </html>
  );
}