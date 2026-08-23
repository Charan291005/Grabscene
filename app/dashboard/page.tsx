"use client";

import React, { useEffect, useState } from 'react';
import { BarChart, Activity, Users, Ticket, Plus, ChevronRight, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { BrandLogo } from '../../components/BrandLogo';
import { useAuth } from '@/components/auth/AuthProvider';
import { supabaseBrowser } from '@/lib/supabase-browser';

interface DashboardMetrics {
  totalRevenue: number;
  totalTickets: number;
  avgOccupancy: number;
  waitlistDepth: number;
}

interface DashboardEvent {
  id: string;
  title: string;
  venue: string;
  date: string;
  occupancy: number;
  status: string;
}

export default function DashboardOverview() {
  const { user, profile } = useAuth();
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalRevenue: 0,
    totalTickets: 0,
    avgOccupancy: 0,
    waitlistDepth: 0,
  });
  const [events, setEvents] = useState<DashboardEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user || !profile) return;

    const fetchData = async () => {
      try {
        // Build the base query for events
        let query = supabaseBrowser
          .from('events')
          .select(`
            id, title,
            shows (
              id, start_time,
              venues (name),
              show_seats (id, status, price)
            )
          `);
        
        // If organiser, only fetch their events. Admin gets all.
        if (profile.role === 'organiser') {
          query = query.eq('organiser_id', user.id);
        }

        const { data: eventsData, error } = await query;
        if (error) throw error;

        let totalRev = 0;
        let totalSold = 0;
        let totalSeats = 0;
        const activeEvents: DashboardEvent[] = [];
        const showIds: string[] = [];

        (eventsData || []).forEach((ev: any) => {
          (ev.shows || []).forEach((show: any) => {
            showIds.push(show.id);
            const venueName = show.venues?.name || 'Unknown Venue';
            const seats = show.show_seats || [];
            
            const soldSeats = seats.filter((s: any) => s.status === 'booked');
            const showRev = soldSeats.reduce((sum: number, s: any) => sum + Number(s.price), 0);
            
            totalRev += showRev;
            totalSold += soldSeats.length;
            totalSeats += seats.length;
            
            const occ = seats.length > 0 ? Math.round((soldSeats.length / seats.length) * 100) : 0;
            
            activeEvents.push({
              id: show.id,
              title: ev.title,
              venue: venueName,
              date: new Date(show.start_time).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }),
              occupancy: occ,
              status: occ === 100 ? 'Sold Out' : (new Date(show.start_time) > new Date() ? 'On Sale' : 'Completed'),
            });
          });
        });

        // Waitlist depth
        let wlDepth = 0;
        if (showIds.length > 0) {
          const { count } = await supabaseBrowser
            .from('waitlist')
            .select('*', { count: 'exact', head: true })
            .in('show_id', showIds)
            .eq('status', 'waiting');
          wlDepth = count || 0;
        }

        setMetrics({
          totalRevenue: totalRev,
          totalTickets: totalSold,
          avgOccupancy: totalSeats > 0 ? Math.round((totalSold / totalSeats) * 100) : 0,
          waitlistDepth: wlDepth,
        });

        setEvents(activeEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user, profile]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#050810] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const metricCards = [
    { label: 'Total Gross Revenue', value: `$${metrics.totalRevenue.toLocaleString()}`, trend: '', positive: true, icon: BarChart },
    { label: 'Total Tickets Sold', value: metrics.totalTickets.toLocaleString(), trend: '', positive: true, icon: Ticket },
    { label: 'Avg Occupancy Rate', value: `${metrics.avgOccupancy}%`, trend: '', positive: metrics.avgOccupancy > 70, icon: Activity },
    { label: 'Active Waitlist Depth', value: metrics.waitlistDepth.toString(), trend: '', positive: true, icon: Users },
  ];

  return (
    <div className="min-h-screen bg-[#050810] text-zinc-100 p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <div>
            <BrandLogo compact />
            <h1 className="text-3xl font-bold text-white tracking-tight">Organiser Dashboard</h1>
            <p className="text-zinc-400 mt-1">Overview of your events and revenue metrics.</p>
          </div>
          <div className="flex items-center gap-3">
            {profile?.role === 'admin' && (
              <Link href="/admin/venues" className="px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold rounded-xl flex items-center gap-2 transition-colors border border-zinc-700">
                Manage Venues
              </Link>
            )}
            <Link href="/dashboard/events/new" className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-cyan-950 font-semibold rounded-xl flex items-center gap-2 transition-colors">
              <Plus className="w-5 h-5" />
              Create Event
            </Link>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {metricCards.map((m, i) => (
            <div key={i} className="bg-[#0c111d] border border-zinc-800 rounded-2xl p-6 shadow-xl relative overflow-hidden group">
              <div className="absolute -right-6 -top-6 w-24 h-24 bg-cyan-500/5 rounded-full blur-xl group-hover:bg-cyan-500/10 transition-colors" />
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-zinc-900 rounded-lg border border-zinc-800">
                  <m.icon className="w-5 h-5 text-cyan-400" />
                </div>
              </div>
              <p className="text-sm text-zinc-500 font-medium">{m.label}</p>
              <h3 className="text-3xl font-bold text-white mt-1">{m.value}</h3>
            </div>
          ))}
        </div>

        {/* Charts & Tables Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Active Events List */}
          <div className="lg:col-span-2 bg-[#0c111d] border border-zinc-800 rounded-2xl p-6 shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-white">Active Events</h2>
            </div>
            
            <div className="space-y-4">
              {events.length === 0 ? (
                <p className="text-zinc-500 py-4 text-center">No events found. Create one to get started!</p>
              ) : (
                events.map(event => (
                  <Link key={event.id} href={`/shows/${event.id}`} className="block">
                    <div className="bg-zinc-900/50 hover:bg-zinc-900 border border-zinc-800/50 hover:border-zinc-700 rounded-xl p-4 flex items-center justify-between transition-all">
                      <div>
                        <h3 className="font-bold text-white">{event.title}</h3>
                        <p className="text-sm text-zinc-500">{event.venue} • {event.date}</p>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-xs text-zinc-500 mb-1">Occupancy</p>
                          <div className="flex items-center gap-2">
                            <div className="w-24 h-2 bg-zinc-800 rounded-full overflow-hidden">
                              <div className="h-full bg-cyan-500" style={{ width: `${event.occupancy}%` }} />
                            </div>
                            <span className="text-sm font-medium text-zinc-300 w-8">{event.occupancy}%</span>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-zinc-600" />
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>

          {/* Mini Chart Mock */}
          <div className="bg-[#0c111d] border border-zinc-800 rounded-2xl p-6 shadow-xl flex flex-col">
            <h2 className="text-xl font-semibold text-white mb-6">Weekly Revenue</h2>
            <div className="flex-1 flex items-end gap-2 pt-10">
              {[40, 70, 45, 90, 65, 100, 85].map((h, i) => (
                <div key={i} className="flex-1 bg-gradient-to-t from-cyan-500/20 to-cyan-400/80 rounded-t-sm" style={{ height: `${h}%` }} />
              ))}
            </div>
            <div className="flex justify-between text-xs text-zinc-500 mt-4">
              <span>Mon</span>
              <span>Sun</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
