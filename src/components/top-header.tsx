'use client';

import { Sparkles, LogOut } from 'lucide-react';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import type { User } from 'firebase/auth';

interface TopHeaderProps {
    user: User | null;
    handleLogout: () => void;
    isLoggingOut: boolean;
}

export function TopHeader({ user, handleLogout, isLoggingOut }: TopHeaderProps) {
    return (
        <header className="fixed top-0 left-0 lg:left-64 right-0 z-30 h-16 bg-white/[0.08] backdrop-blur-xl border-b border-white/[0.16] px-6">
            <div className="flex items-center justify-between h-full">
                {/* Logo - Only visible on mobile - Glassmorphism */}
                <div className="flex items-center gap-3 lg:hidden">
                    <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-neon-cyan via-neon-purple to-neon-emerald flex items-center justify-center shadow-neon-cyan animate-glow">
                        <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
                            <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="white" opacity="0.95" />
                            <path d="M2 17L12 22L22 17V7L12 12L2 7V17Z" fill="white" opacity="0.85" />
                            <circle cx="12" cy="12" r="2" fill="white" />
                        </svg>
                    </div>
                    <h1 className="text-xl font-bold text-white font-headline">CareerLens</h1>
                </div>

                {/* Spacer for desktop */}
                <div className="hidden lg:block flex-1" />

                {/* Right section - Glass Elements */}
                <div className="flex items-center gap-4">
                    {user && (
                        <>
                            <span className="text-sm text-white/65 font-medium hidden md:block">
                                {user.displayName || user.email}
                            </span>
                            <Avatar className="w-9 h-9 border-2 border-neon-cyan/30 shadow-neon-cyan/20 shadow-lg ring-2 ring-white/10">
                                {user.photoURL && <AvatarImage src={user.photoURL} alt={user.displayName || 'User'} />}
                                <AvatarFallback className="bg-gradient-to-br from-neon-cyan via-neon-purple to-neon-emerald text-white text-sm font-bold">
                                    {(user.displayName || user.email)?.charAt(0).toUpperCase() || 'U'}
                                </AvatarFallback>
                            </Avatar>
                        </>
                    )}
                    <Button
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                        variant="ghost"
                        size="sm"
                        className="glass-btn text-white/65 hover:text-white gap-2 rounded-full px-4 py-2 border border-white/10 hover:border-white/20"
                    >
                        <LogOut className="w-4 h-4" />
                        <span className="hidden sm:inline text-sm font-medium">{isLoggingOut ? 'Logging out...' : 'Log Out'}</span>
                    </Button>
                </div>
            </div>
        </header>
    );
}
