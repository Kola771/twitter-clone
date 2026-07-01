'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils';

const navItems = [
  {
    href: '/home',
    label: 'Accueil',
    icon: (active: boolean) => (
      <svg viewBox="0 0 24 24" className={cn('h-6 w-6', active ? 'fill-current' : 'fill-none stroke-current stroke-[1.8]')}>
        <path d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
      </svg>
    ),
  },
  {
    href: '/explore',
    label: 'Explorer',
    icon: (active: boolean) => (
      <svg viewBox="0 0 24 24" className={cn('h-6 w-6', active ? 'fill-current' : 'fill-none stroke-current stroke-[1.8]')}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803a7.5 7.5 0 0010.607 0z" />
      </svg>
    ),
  },
  {
    href: '/notifications',
    label: 'Notifs',
    icon: (active: boolean) => (
      <svg viewBox="0 0 24 24" className={cn('h-6 w-6', active ? 'fill-current' : 'fill-none stroke-current stroke-[1.8]')}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
      </svg>
    ),
  },
  {
    href: '/profile',
    label: 'Profil',
    icon: (active: boolean) => (
      <svg viewBox="0 0 24 24" className={cn('h-6 w-6', active ? 'fill-current' : 'fill-none stroke-current stroke-[1.8]')}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
      </svg>
    ),
  },
];

export default function MobileNav() {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-20 bg-slate-950/95 backdrop-blur-sm border-t border-slate-800 flex items-center justify-around px-2 py-1 safe-area-bottom">
      {navItems.map(({ href, label, icon }) => {
        const resolvedHref = href === '/profile' && user ? `/profile/${user.username}` : href;
        const active =
          pathname === resolvedHref ||
          (href !== '/profile' && pathname.startsWith(`${href}/`)) ||
          (href === '/profile' && pathname.startsWith('/profile/'));

        return (
          <Link
            key={href}
            href={resolvedHref}
            className={cn(
              'flex flex-col items-center gap-0.5 p-2 rounded-xl transition-colors min-w-[3rem]',
              active ? 'text-sky-400' : 'text-slate-400 hover:text-slate-200'
            )}
          >
            {icon(active)}
            <span className="text-[10px] font-medium">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
