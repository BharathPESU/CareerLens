'use client';
import { Nav } from '@/components/nav';
import { TopHeader } from '@/components/top-header';
import { useAuth } from '@/hooks/use-auth';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { NavMobile } from './nav-mobile';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const isAuthPage = pathname === '/login' || pathname === '/signup';

  useEffect(() => {
    if (!authLoading && !user && !isAuthPage) {
      router.replace('/login');
    }
  }, [authLoading, user, router, isAuthPage, pathname]);

  const handleLogout = async () => {
    if (!auth) return;
    setIsLoggingOut(true);
    try {
      await signOut(auth);
      router.replace('/login');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (authLoading || (!user && !isAuthPage)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isAuthPage) {
    return <div className="flex min-h-screen items-center justify-center">{children}</div>;
  }

  if (user) {
    return (
      <>
        <div className="hidden lg:block">
          <Nav handleLogout={handleLogout} isLoggingOut={isLoggingOut} user={user} />
        </div>
        <div className="block lg:hidden">
          <NavMobile handleLogout={handleLogout} isLoggingOut={isLoggingOut} user={user} />
        </div>
        <TopHeader user={user} handleLogout={handleLogout} isLoggingOut={isLoggingOut} />
        <main className="lg:pl-64 pt-16 pb-24 lg:pb-8">
          {children}
        </main>
      </>
    );
  }

  return null;
}
