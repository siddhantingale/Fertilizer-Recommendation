import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import { Toaster } from "@/components/ui/toaster"
import { LanguageProvider } from "@/lib/language-context"
import "./globals.css"

export const metadata: Metadata = {
  title: "FertilizerPro - Smart Fertilizer Recommendations",
  description: "Smart fertilizer recommendation system for farmers based on soil analysis and environmental factors",
  generator: "v0.app",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "FertilizerPro",
  },
  formatDetection: {
    telephone: false,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#166534" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="FertilizerPro" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/icon-192x192.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/icon-512x512.png" />
      </head>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable} antialiased`}>
        <LanguageProvider>
          <Suspense fallback={null}>{children}</Suspense>
          <Toaster />
          <Analytics />
        </LanguageProvider>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                  navigator.serviceWorker.register('/service-worker.js')
                    .then(reg => {
                      console.log('[v0] Service Worker registered successfully:', reg);
                    })
                    .catch(err => {
                      console.log('[v0] Service Worker registration failed:', err);
                    });
                });
              }

              let deferredPrompt;
              window.addEventListener('beforeinstallprompt', (e) => {
                e.preventDefault();
                deferredPrompt = e;
                console.log('[v0] PWA install prompt ready');
                window.dispatchEvent(new CustomEvent('pwa-installable', { detail: { prompt: deferredPrompt } }));
              });

              window.addEventListener('appinstalled', () => {
                console.log('[v0] PWA installed successfully');
                deferredPrompt = null;
              });
            `,
          }}
        />
      </body>
    </html>
  )
}
