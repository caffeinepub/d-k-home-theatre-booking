import React from 'react';
import { Film, Ticket, Settings, LogIn, LogOut, User } from 'lucide-react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: 'browse' | 'booking' | 'admin';
  onNavigate: (page: 'browse' | 'admin') => void;
}

export default function Layout({ children, currentPage, onNavigate }: LayoutProps) {
  const { login, clear, loginStatus, identity, isLoggingIn } = useInternetIdentity();
  const queryClient = useQueryClient();
  const isAuthenticated = !!identity;

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
      queryClient.clear();
    } else {
      try {
        await login();
      } catch (error: unknown) {
        if (error instanceof Error && error.message === 'User is already authenticated') {
          await clear();
          setTimeout(() => login(), 300);
        }
      }
    }
  };

  return (
    <div className="min-h-screen bg-theatre-dark flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-gold-dim bg-theatre-dark/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <button
              onClick={() => onNavigate('browse')}
              className="flex items-center gap-3 group"
            >
              <div className="w-9 h-9 rounded-full gold-gradient flex items-center justify-center shadow-gold">
                <Film className="w-5 h-5 text-theatre-dark" />
              </div>
              <div className="hidden sm:block">
                <div className="font-display text-lg font-bold text-gold leading-tight">D.K Home Theatre</div>
                <div className="text-xs text-muted-foreground tracking-widest uppercase">Premium Screenings</div>
              </div>
            </button>

            {/* Nav */}
            <nav className="flex items-center gap-2">
              <button
                onClick={() => onNavigate('browse')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentPage === 'browse' || currentPage === 'booking'
                    ? 'text-gold bg-theatre-gold/10'
                    : 'text-muted-foreground hover:text-gold hover:bg-theatre-gold/5'
                }`}
              >
                <Ticket className="w-4 h-4" />
                <span className="hidden sm:inline">Screenings</span>
              </button>

              {/* Admin link is always visible so AdminGuard can handle access control */}
              <button
                onClick={() => onNavigate('admin')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentPage === 'admin'
                    ? 'text-gold bg-theatre-gold/10'
                    : 'text-muted-foreground hover:text-gold hover:bg-theatre-gold/5'
                }`}
              >
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline">Admin</span>
              </button>

              {isAuthenticated && (
                <div className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-theatre-surface border border-gold-dim text-xs text-gold-dim">
                  <User className="w-3 h-3" />
                  <span className="hidden sm:inline max-w-[100px] truncate">
                    {identity.getPrincipal().toString().slice(0, 8)}…
                  </span>
                </div>
              )}

              <Button
                onClick={handleAuth}
                disabled={isLoggingIn}
                variant="outline"
                size="sm"
                className="border-gold-dim text-gold hover:bg-theatre-gold/10 hover:border-gold"
              >
                {isLoggingIn ? (
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 border border-gold border-t-transparent rounded-full animate-spin" />
                    <span className="hidden sm:inline">Logging in…</span>
                  </span>
                ) : isAuthenticated ? (
                  <span className="flex items-center gap-1.5">
                    <LogOut className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Logout</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5">
                    <LogIn className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Login</span>
                  </span>
                )}
              </Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-gold-dim bg-theatre-dark py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full gold-gradient flex items-center justify-center">
                <Film className="w-4 h-4 text-theatre-dark" />
              </div>
              <div>
                <div className="font-display text-sm font-semibold text-gold">D.K Home Theatre</div>
                <div className="text-xs text-muted-foreground">© {new Date().getFullYear()} All rights reserved</div>
              </div>
            </div>
            <div className="text-xs text-muted-foreground">
              Built with{' '}
              <span className="text-theatre-red">♥</span>{' '}
              using{' '}
              <a
                href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname || 'dk-home-theatre')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gold hover:underline"
              >
                caffeine.ai
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
