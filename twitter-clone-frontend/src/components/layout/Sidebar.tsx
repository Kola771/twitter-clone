'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useUnreadCount } from '@/hooks/useNotifications';
import Avatar from '@/components/ui/Avatar';
import { cn } from '@/lib/utils';

const navItems = [
  {
    href: '/home',
    label: 'Accueil',
    icon: (active: boolean) => (
      <svg viewBox="0 0 24 24" className={cn('h-6 w-6', active ? 'fill-current' : 'fill-none stroke-current stroke-2')}>
        <path d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
      </svg>
    ),
  },
  {
    href: '/explore',
    label: 'Explorer',
    icon: (active: boolean) => (
      <svg viewBox="0 0 24 24" className={cn('h-6 w-6', active ? 'fill-current' : 'fill-none stroke-current stroke-2')}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803a7.5 7.5 0 0010.607 0z" />
      </svg>
    ),
  },
  {
    href: '/notifications',
    label: 'Notifications',
    icon: (active: boolean) => (
      <svg viewBox="0 0 24 24" className={cn('h-6 w-6', active ? 'fill-current' : 'fill-none stroke-current stroke-2')}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
      </svg>
    ),
  },
  {
    href: '/profile',
    label: 'Profil',
    icon: (active: boolean) => (
      <svg viewBox="0 0 24 24" className={cn('h-6 w-6', active ? 'fill-current' : 'fill-none stroke-current stroke-2')}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
      </svg>
    ),
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { data: unreadCount = 0 } = useUnreadCount();

  function handleLogout() {
    logout();
    document.cookie = 'access_token=; path=/; max-age=0';
    router.push('/login');
  }

  return (
    <aside className="hidden lg:flex flex-col h-screen sticky top-0 w-16 xl:w-64 px-2 xl:px-4 py-3 border-r border-slate-800">
      {/* Logo */}
      <Link href="/home" className="p-3 rounded-full hover:bg-slate-800 w-fit mb-2">
        <svg viewBox="0 0 24 24" className="h-7 w-7 fill-current text-sky-400">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.259 5.63 5.905-5.63Zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      </Link>

      {/* Nav */}
      <nav className="flex flex-col gap-1 flex-1">
        {navItems.map(({ href, label, icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          const profileHref = user ? `/profile/${user.username}` : '/profile';
          const resolvedHref = href === '/profile' ? profileHref : href;

          return (
            <Link
              key={href}
              href={resolvedHref}
              className={cn(
                'flex items-center gap-4 p-3 rounded-full transition-colors hover:bg-slate-800 xl:pr-5',
                active && 'font-bold'
              )}
            >
              <span className="relative">
                {icon(active)}
                {href === '/notifications' && unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-sky-500 px-1 text-[10px] font-bold text-white">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </span>
              <span className="hidden xl:block text-base">{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User info + logout */}
      {user && (
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 p-3 rounded-full hover:bg-slate-800 transition-colors w-full text-left mt-2"
        >
          <Avatar src={user.avatarUrl} alt={user.name} size="sm" />
          <div className="hidden xl:flex flex-col min-w-0">
            <span className="text-sm font-semibold truncate">{user.name}</span>
            <span className="text-xs text-slate-400 truncate">@{user.username}</span>
          </div>
          <svg
            viewBox="0 0 24 24"
            className="hidden xl:block h-5 w-5 fill-none stroke-current stroke-2 ml-auto text-slate-400"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
      )}
    </aside>
  );
}
