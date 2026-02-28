import React, { useState } from 'react';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from 'next-themes';
import Layout from './components/Layout';
import Browse from './pages/Browse';
import BookingFlow from './pages/BookingFlow';
import AdminPanel from './pages/AdminPanel';
import type { Screening } from './backend';

type Page = 'browse' | 'booking' | 'admin';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('browse');
  const [selectedScreening, setSelectedScreening] = useState<Screening | null>(null);

  const handleSelectScreening = (screening: Screening) => {
    setSelectedScreening(screening);
    setCurrentPage('booking');
  };

  const handleNavigate = (page: 'browse' | 'admin') => {
    setCurrentPage(page);
    if (page === 'browse') setSelectedScreening(null);
  };

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} forcedTheme="dark">
      <Layout currentPage={currentPage} onNavigate={handleNavigate}>
        {currentPage === 'browse' && (
          <Browse onSelectScreening={handleSelectScreening} />
        )}

        {currentPage === 'booking' && selectedScreening && (
          <BookingFlow
            screening={selectedScreening}
            onBack={() => handleNavigate('browse')}
          />
        )}

        {currentPage === 'admin' && (
          <AdminPanel />
        )}
      </Layout>

      <Toaster
        theme="dark"
        toastOptions={{
          style: {
            background: 'oklch(0.14 0 0)',
            border: '1px solid oklch(0.65 0.1 85 / 0.4)',
            color: 'oklch(0.95 0.02 85)',
          },
        }}
      />
    </ThemeProvider>
  );
}
