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
  ChevronUp,
  LibrarySquare,
  Newspaper,
  Calendar,
  Users,
  GraduationCap,
  UserPlus,
  TrendingUp,
  Languages,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { User } from 'firebase/auth';
import React, { useState } from 'react';
import useMeasure from 'react-use-measure';

const mainNavItems = [
  { href: '/', icon: <LayoutDashboard />, label: 'Dashboard' },
  { href: '/profile', icon: <UserIcon />, label: 'Profile' },
  { href: '/career-updates', icon: <TrendingUp />, label: 'Updates' },
  { href: '/recommendations', icon: <Briefcase />, label: 'Careers' },
];

const toolNavItems = [
  { href: '/skill-gap', icon: <Target />, label: 'Skill Gap' },
  { href: '/roadmap', icon: <BookOpen />, label: 'Roadmap' },
  { href: '/resume', icon: <FileText />, label: 'Resume' },
  { href: '/interview-prep', icon: <MessageSquare />, label: 'Interview' },
  { href: '/learning-helper', icon: <Sparkles />, label: 'AI Helper' },
  { href: '/ai-interviewer', icon: <Bot />, label: 'AI Interviewer' },
  { href: '/english-helper', icon: <Languages />, label: 'English' },
  { href: '/library-finder', icon: <LibrarySquare />, label: 'Libraries' },
  { href: '/calendar', icon: <Calendar />, label: 'AI Calendar' },
  { href: '/community', icon: <Users />, label: 'Community' },
  { href: '/resources', icon: <GraduationCap />, label: 'Resources' },
  { href: '/mentors', icon: <UserPlus />, label: 'Find Mentor' },
  { href: '/ebooks', icon: <BookOpen />, label: 'eBooks' },
  { href: '/news', icon: <Newspaper />, label: 'News' },
];

interface NavProps {
  handleLogout: () => void;
  isLoggingOut: boolean;
  user: User | null;
}

export function NavMobile({ handleLogout, isLoggingOut, user }: NavProps) {
  const pathname = usePathname();
  const [isToolsOpen, setIsToolsOpen] = useState(false);
  let [ref, bounds] = useMeasure();

  return (
    <>
      <motion.div
        animate={{ height: isToolsOpen ? bounds.height : 0 }}
        className="fixed bottom-24 left-4 right-4 z-40 overflow-hidden rounded-3xl bg-white/[0.08] backdrop-blur-xl border border-white/[0.16] shadow-glass-lg"
      >
        <div ref={ref} className="p-4 space-y-2">
          <h3 className="font-semibold text-center text-sm text-white/65 mb-2">Career Tools</h3>
          <div className="grid grid-cols-4 gap-2">
            {toolNavItems.map((item) => (
              <Link href={item.href} key={item.label} onClick={() => setIsToolsOpen(false)}>
                <div className={cn(
                  "flex flex-col items-center justify-center h-full w-full rounded-2xl p-2 gap-1 text-sm transition-all duration-300",
                  pathname === item.href 
                    ? "bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/30 shadow-neon-cyan/20 shadow-sm" 
                    : "text-white/65 hover:bg-white/[0.12] hover:text-white border border-transparent"
                )}>
                  {item.icon}
                  <span className="text-xs text-center font-medium">{item.label}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 120, damping: 20 }}
        className="fixed bottom-4 left-4 right-4 z-50 h-20 bg-white/[0.08] backdrop-blur-xl border border-white/[0.16] shadow-glass-lg rounded-3xl"
      >
        <div className="flex h-full w-full justify-evenly items-center px-2">
          {mainNavItems.map((item) => (
            <Link href={item.href} key={item.label} className="flex-1">
              <button
                className={cn(
                  "flex flex-col items-center justify-center h-full w-full rounded-2xl transition-all duration-300 gap-1.5 relative",
                  pathname === item.href
                    ? "text-neon-cyan scale-105"
                    : "text-white/65 hover:text-white hover:bg-white/[0.08]"
                )}
              >
                {pathname === item.href && (
                  <motion.div 
                    layoutId="mobile-nav-indicator"
                    className="absolute inset-0 bg-neon-cyan/10 rounded-2xl border border-neon-cyan/30"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <div className={cn(
                  "relative z-10",
                  pathname === item.href && "drop-shadow-[0_0_6px_rgba(0,229,255,0.6)]"
                )}>
                  {item.icon}
                </div>
                <span className="text-xs font-medium relative z-10">{item.label}</span>
              </button>
            </Link>
          ))}
          <div className="flex-1">
            <button
              onClick={() => setIsToolsOpen(!isToolsOpen)}
              className={cn(
                "flex flex-col items-center justify-center h-full w-full rounded-2xl transition-all duration-300 gap-1.5 relative",
                isToolsOpen || toolNavItems.some(i => i.href === pathname)
                  ? "text-neon-purple scale-105"
                  : "text-white/65 hover:text-white hover:bg-white/[0.08]"
              )}
            >
              {(isToolsOpen || toolNavItems.some(i => i.href === pathname)) && (
                <div className="absolute inset-0 bg-neon-purple/10 rounded-2xl border border-neon-purple/30" />
              )}
              <motion.div 
                animate={{ rotate: isToolsOpen ? 180 : 0 }}
                className={cn(
                  "relative z-10",
                  (isToolsOpen || toolNavItems.some(i => i.href === pathname)) && "drop-shadow-[0_0_6px_rgba(165,124,255,0.6)]"
                )}
              >
                <ChevronUp />
              </motion.div>
              <span className="text-xs font-medium relative z-10">Tools</span>
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
}
