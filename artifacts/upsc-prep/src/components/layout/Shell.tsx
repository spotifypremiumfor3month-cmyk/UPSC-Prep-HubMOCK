import React from 'react';
import { Link, useLocation } from 'wouter';
import { BookOpen, FileText, CalendarDays, BarChart2, ShieldAlert, LogOut, Search, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

interface ShellProps {
  children: React.ReactNode;
}

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: BarChart2 },
  { href: '/tests', label: 'Mock Tests', icon: FileText },
  { href: '/daily', label: 'Daily Practice', icon: CalendarDays },
  { href: '/pdfs', label: 'Study Materials', icon: BookOpen },
];

const adminItems = [
  { href: '/admin', label: 'Admin Hub', icon: ShieldAlert },
];

export function Shell({ children }: ShellProps) {
  const [location] = useLocation();
  const { user, isAdmin, logOut } = useAuth();

  return (
    <div className="flex min-h-screen w-full bg-background flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r bg-card flex-shrink-0 flex flex-col hidden md:flex">
        <div className="h-16 flex items-center px-6 border-b border-border">
          <Link href="/" className="flex items-center gap-2 font-serif font-bold text-xl text-primary">
            <span className="text-accent">●</span> Sarthak
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto py-6 flex flex-col gap-6">
          <nav className="px-4 flex flex-col gap-1">
            <div className="px-2 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Student
            </div>
            {navItems.map((item) => {
              const isActive = location.startsWith(item.href);
              return (
                <Link key={item.href} href={item.href}>
                  <div
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-foreground hover:bg-muted"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </div>
                </Link>
              );
            })}
          </nav>

          {/* Admin section — only visible to admin email */}
          {isAdmin && (
            <nav className="px-4 flex flex-col gap-1">
              <div className="px-2 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Admin Area
              </div>
              {adminItems.map((item) => {
                const isActive = location.startsWith(item.href);
                return (
                  <Link key={item.href} href={item.href}>
                    <div
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer",
                        isActive
                          ? "bg-accent text-accent-foreground"
                          : "text-foreground hover:bg-muted"
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                      {item.label}
                    </div>
                  </Link>
                );
              })}
            </nav>
          )}
        </div>

        <div className="p-4 border-t border-border mt-auto">
          {user ? (
            <div className="flex items-center gap-3 px-3 py-2">
              {user.photoURL ? (
                <img src={user.photoURL} alt="profile" className="h-8 w-8 rounded-full object-cover" />
              ) : (
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                  <User className="h-4 w-4" />
                </div>
              )}
              <div className="flex flex-col flex-1 overflow-hidden">
                <span className="text-sm font-medium truncate">{user.displayName ?? 'Aspirant'}</span>
                <span className="text-xs text-muted-foreground truncate">{user.email}</span>
              </div>
              <Button variant="ghost" size="icon" title="Log out" onClick={logOut}>
                <LogOut className="h-4 w-4 text-muted-foreground" />
              </Button>
            </div>
          ) : (
            <div className="px-3 py-2">
              <Link href="/login">
                <Button variant="outline" size="sm" className="w-full">Sign In</Button>
              </Link>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 flex items-center justify-between px-6 border-b border-border bg-card">
          <div className="flex items-center gap-2 md:hidden">
            <Link href="/" className="font-serif font-bold text-xl text-primary">
              <span className="text-accent">●</span> Sarthak
            </Link>
          </div>

          <div className="flex items-center flex-1 justify-end gap-4">
            <div className="relative hidden md:block max-w-sm w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="search"
                placeholder="Search topics, tests..."
                className="h-9 w-full rounded-md border border-input bg-background pl-9 pr-4 text-sm outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <Button variant="outline" size="sm" className="hidden sm:flex">
              Target 2025
            </Button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="mx-auto max-w-5xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
