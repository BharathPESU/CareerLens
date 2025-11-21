import './globals.css';
import { AppLayout } from '@/components/app-layout';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseProvider } from '@/lib/firebase-provider';
import { GlobalBackgroundVideo } from '@/components/global-background-video';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" style={{ colorScheme: 'dark' }}>
      <head>
        <title>CareerLens</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased bg-transparent" suppressHydrationWarning>
        {/* Global Background Video - Fixed and Persistent Across All Routes */}
        <GlobalBackgroundVideo />

        {/* Mesh Wave Overlay on top of video for extra visual depth */}
        <div className="fixed top-0 left-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
          <div className="mesh-wave-bg absolute inset-0 opacity-30" />
        </div>

        {/* Main App Content - Rendered Above Video */}
        <div className="relative" style={{ zIndex: 10 }}>
          <FirebaseProvider>
            <AppLayout>{children}</AppLayout>
            <Toaster />
          </FirebaseProvider>
        </div>
      </body>
    </html>
  );
}
