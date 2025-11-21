'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    User as UserIcon,
    Briefcase,
    Target,
    BookOpen,
    FileText,
    MessageSquare,
    Sparkles,
    Bot,
    LibrarySquare,
    Newspaper,
    Calendar,
    Users,
    GraduationCap,
    TrendingUp,
    LogOut,
    Activity,
    Navigation,
    Languages,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { User } from 'firebase/auth';
import { Button } from './ui/button';

const navItems = [
    { href: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/profile', icon: UserIcon, label: 'Profile' },
    { href: '/career-navigator', icon: Navigation, label: 'Career Navigator' },
    { href: '/career-graph', icon: Activity, label: 'Career Graph' },
    { href: '/calendar', icon: Calendar, label: 'AI Calendar' },
    { href: '/career-updates', icon: TrendingUp, label: 'Career Updates' },
    { href: '/recommendations', icon: Briefcase, label: 'Careers' },
    { href: '/skill-gap', icon: Target, label: 'Skill Gap' },
    { href: '/roadmap', icon: BookOpen, label: 'Roadmap' },
    { href: '/resume', icon: FileText, label: 'Resume' },
    { href: '/interview-prep', icon: MessageSquare, label: 'Interview' },
    { href: '/learning-helper', icon: Sparkles, label: 'AI Helper' },
    { href: '/ai-interviewer', icon: Bot, label: 'AI Interviewer' },
    { href: '/english-helper', icon: Languages, label: 'English Helper' },
    { href: '/library-finder', icon: LibrarySquare, label: 'Libraries' },
    { href: '/ebooks', icon: BookOpen, label: 'eBooks' },
    { href: '/news', icon: Newspaper, label: 'News' },
    { href: '/community', icon: Users, label: 'Community' },
    { href: '/resources', icon: GraduationCap, label: 'Resources' },
    { href: '/mentors', icon: MessageSquare, label: 'Find Mentor' },
];

interface NavProps {
    handleLogout: () => void;
    isLoggingOut: boolean;
    user: User | null;
}

export function Nav({ handleLogout, isLoggingOut, user }: NavProps) {
    const pathname = usePathname();

    return (
        <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-white/[0.08] backdrop-blur-xl border-r border-white/[0.16] overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
            <div className="flex flex-col h-full">
                {/* Logo/Brand - Glassmorphism */}
                <div className="p-6 border-b border-white/[0.16]">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-neon-cyan via-neon-purple to-neon-emerald flex items-center justify-center shadow-neon-cyan animate-glow">
                            <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
                                <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="white" opacity="0.95" />
                                <path d="M2 17L12 22L22 17V7L12 12L2 7V17Z" fill="white" opacity="0.85" />
                                <circle cx="12" cy="12" r="2" fill="white" />
                            </svg>
                        </div>
                        <h1 className="text-xl font-bold text-white font-headline tracking-tight">
                            CareerLens
                        </h1>
                    </div>
                </div>

                {/* Navigation - Glass Items */}
                <nav className="flex-1 p-4">
                    <div className="space-y-1.5">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link key={item.href} href={item.href}>
                                    <div
                                        className={cn(
                                            'flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 group relative overflow-hidden',
                                            isActive
                                                ? 'bg-white/[0.15] text-neon-cyan border border-neon-cyan/30 shadow-neon-cyan/20 shadow-lg'
                                                : 'text-white/65 hover:bg-white/[0.12] hover:text-white border border-transparent hover:border-white/10'
                                        )}
                                    >
                                        {/* Active indicator glow */}
                                        {isActive && (
                                            <div className="absolute inset-0 bg-gradient-to-r from-neon-cyan/10 to-transparent rounded-2xl" />
                                        )}
                                        
                                        <item.icon className={cn(
                                            'w-5 h-5 transition-transform group-hover:scale-110 relative z-10',
                                            isActive && 'text-neon-cyan drop-shadow-[0_0_8px_rgba(0,229,255,0.6)]'
                                        )} />
                                        <span className="text-sm font-medium relative z-10">{item.label}</span>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </nav>

                {/* User Section - Glass Panel */}
                <div className="p-4 border-t border-white/[0.16] space-y-3">
                    {user && (
                        <div className="px-4 py-3 bg-white/[0.08] border border-white/[0.16] rounded-2xl backdrop-blur-lg">
                            <p className="text-sm font-medium text-white truncate">{user.email}</p>
                            <div className="flex items-center gap-1.5 mt-1">
                                <div className="w-2 h-2 rounded-full bg-neon-emerald animate-pulse shadow-neon-emerald" />
                                <p className="text-xs text-white/65">Active</p>
                            </div>
                        </div>
                    )}
                    <Button
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                        variant="ghost"
                        className="w-full justify-start gap-3 text-white/65 hover:text-white hover:bg-white/[0.12] rounded-2xl transition-all duration-300 border border-transparent hover:border-white/10"
                    >
                        <LogOut className="w-5 h-5" />
                        <span className="text-sm font-medium">{isLoggingOut ? 'Logging out...' : 'Log Out'}</span>
                    </Button>
                </div>
            </div>
        </aside>
    );
}
