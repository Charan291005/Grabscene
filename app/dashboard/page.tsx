"use client";

import React from 'react';
import { BarChart, Activity, Users, Ticket, Plus, ChevronRight } from 'lucide-react';
import Link from 'next/link';

// Mock data for demonstration purposes
const metrics = [
  { label: 'Total Gross Revenue', value: '$124,500', trend: '+14%', positive: true, icon: BarChart },
  { label: 'Total Tickets Sold', value: '1,420', trend: '+8%', positive: true, icon: Ticket },
  { label: 'Avg Occupancy Rate', value: '87%', trend: '-2%', positive: false, icon: Activity },
  { label: 'Active Waitlist Depth', value: '342', trend: '+24%', positive: true, icon: Users },
];

const events = [
  { id: '1', title: 'Hans Zimmer Live', venue: 'O2 Arena', date: 'Aug 21, 2026', occupancy: 100, status: 'Sold Out' },
  { id: '2', title: 'Cyberpunk Symphony', venue: 'CyberDome', date: 'Sep 14, 2026', occupancy: 45, status: 'On Sale' },
  { id: '3', title: 'Jazz Under Stars', venue: 'Grand Horizon', date: 'Oct 02, 2026', occupancy: 0, status: 'Upcoming' },
];

export default function DashboardOverview() {
  return (
    <div className="min-h-screen bg-[#050810] text-zinc-100 p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Organiser Dashboard</h1>
            <p className="text-zinc-400 mt-1">Overview of your events and revenue metrics.</p>
          </div>
          <Link href="/dashboard/events/new" className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-cyan-950 font-semibold rounded-xl flex items-center gap-2 transition-colors">
            <Plus className="w-5 h-5" />
            Create Event
          </Link>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {metrics.map((m, i) => (
            <div key={i} className="bg-[#0c111d] border border-zinc-800 rounded-2xl p-6 shadow-xl relative overflow-hidden group">
              <div className="absolute -right-6 -top-6 w-24 h-24 bg-cyan-500/5 rounded-full blur-xl group-hover:bg-cyan-500/10 transition-colors" />
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-zinc-900 rounded-lg border border-zinc-800">
                  <m.icon className="w-5 h-5 text-cyan-400" />
                </div>
                <span className={`text-sm font-semibold ${m.positive ? 'text-emerald-400' : 'text-red-400'}`}>
                  {m.trend}
                </span>
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
              <button className="text-sm text-cyan-400 hover:text-cyan-300 font-medium">View All</button>
            </div>
            
            <div className="space-y-4">
              {events.map(event => (
                <Link key={event.id} href={`/dashboard/events/${event.id}`} className="block">
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
              ))}
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
