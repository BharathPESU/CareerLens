import './globals.css';
import { AppLayout } from '@/components/app-layout';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseProvider } from '@/lib/firebase-provider';

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
      <body className="font-body antialiased bg-[#0E0F12]" suppressHydrationWarning>
        {/* Animated Mesh Wave Background */}
        <div className="fixed top-0 left-0 w-full h-full -z-30 overflow-hidden">
          <div className="mesh-wave-bg absolute inset-0" />
        </div>
        
        {/* Custom Background Image Layer (Optional) */}
        <div 
          className="fixed top-0 left-0 w-full h-full -z-20 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url(/background.jpg)', // Change to /background.gif for animated backgrounds
            opacity: 0.15, // Adjust opacity (0.1 to 0.3 recommended for readability)
          }}
        />
        
        {/* Animated Gradient Overlay */}
        <div className="animated-gradient fixed top-0 left-0 w-full h-full -z-10 opacity-80" />
        
        <FirebaseProvider>
          <AppLayout>{children}</AppLayout>
          <Toaster />
        </FirebaseProvider>
      </body>
    </html>
  );
}
