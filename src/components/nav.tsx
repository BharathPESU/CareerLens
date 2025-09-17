'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Briefcase,
  Target,
  BookOpen,
  FileText,
  MessageSquare,
  User,
  LayoutDashboard,
} from 'lucide-react';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';

const links = [
  {
    href: '/',
    label: 'Dashboard',
    icon: LayoutDashboard,
  },
  {
    href: '/profile',
    label: 'My Profile',
    icon: User,
  },
  {
    href: '/recommendations',
    label: 'Recommendations',
    icon: Briefcase,
  },
  {
    href: '/skill-gap',
    label: 'Skill Gap Analysis',
    icon: Target,
  },
  {
    href: '/roadmap',
    label: 'Learning Roadmap',
    icon: BookOpen,
  },
  {
    href: '/resume',
    label: 'Resume Builder',
    icon: FileText,
  },
  {
    href: '/interview-prep',
    label: 'Interview Prep',
    icon: MessageSquare,
  },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <div className="flex w-full flex-col gap-2 p-2">
      <SidebarMenu>
        {links.map((link) => (
          <SidebarMenuItem key={link.href}>
            <Link href={link.href} className="w-full">
              <SidebarMenuButton
                isActive={pathname === link.href}
                tooltip={link.label}
              >
                <link.icon className="h-4 w-4" />
                <span>{link.label}</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </div>
  );
}
