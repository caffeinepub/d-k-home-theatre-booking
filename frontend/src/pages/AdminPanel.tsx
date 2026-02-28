import React, { useState } from 'react';
import { Film, LayoutGrid, Users, Settings } from 'lucide-react';
import AdminGuard from '../components/admin/AdminGuard';
import ScreeningManager from '../components/admin/ScreeningManager';
import SeatPlanEditor from '../components/admin/SeatPlanEditor';
import ReservationManager from '../components/admin/ReservationManager';
import type { Screening } from '../backend';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function AdminPanel() {
  const [selectedScreening, setSelectedScreening] = useState<Screening | null>(null);

  return (
    <AdminGuard>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-lg gold-gradient flex items-center justify-center">
              <Settings className="w-5 h-5 text-theatre-dark" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold text-gold">Admin Panel</h1>
              <p className="text-xs text-muted-foreground">D.K Home Theatre Management</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Screening list */}
          <div className="lg:col-span-1">
            <div className="theatre-card rounded-xl p-5">
              <ScreeningManager
                onSelectScreening={setSelectedScreening}
                selectedScreeningId={selectedScreening?.id ?? null}
              />
            </div>
          </div>

          {/* Right: Seat plan + reservations */}
          <div className="lg:col-span-2">
            {!selectedScreening ? (
              <div className="theatre-card rounded-xl p-8 flex flex-col items-center justify-center min-h-[300px] text-center">
                <div className="w-16 h-16 rounded-full bg-theatre-surface border border-gold-dim flex items-center justify-center mb-4">
                  <Film className="w-8 h-8 text-gold opacity-50" />
                </div>
                <h3 className="font-display text-lg text-muted-foreground mb-1">Select a Screening</h3>
                <p className="text-sm text-muted-foreground">
                  Choose a screening from the left to manage its seat plan and reservations.
                </p>
              </div>
            ) : (
              <div className="theatre-card rounded-xl overflow-hidden">
                {/* Screening title bar */}
                <div className="gold-gradient px-5 py-3">
                  <h3 className="font-display font-bold text-theatre-dark truncate">{selectedScreening.title}</h3>
                </div>

                <div className="p-5">
                  <Tabs defaultValue="seats">
                    <TabsList className="bg-theatre-dark border border-gold-dim mb-5 w-full">
                      <TabsTrigger
                        value="seats"
                        className="flex-1 data-[state=active]:bg-theatre-gold/20 data-[state=active]:text-gold text-muted-foreground"
                      >
                        <LayoutGrid className="w-4 h-4 mr-1.5" />
                        Seat Plan
                      </TabsTrigger>
                      <TabsTrigger
                        value="reservations"
                        className="flex-1 data-[state=active]:bg-theatre-gold/20 data-[state=active]:text-gold text-muted-foreground"
                      >
                        <Users className="w-4 h-4 mr-1.5" />
                        Reservations
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="seats">
                      <SeatPlanEditor screeningId={selectedScreening.id} />
                    </TabsContent>

                    <TabsContent value="reservations">
                      <ReservationManager screeningId={selectedScreening.id} />
                    </TabsContent>
                  </Tabs>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminGuard>
  );
}
