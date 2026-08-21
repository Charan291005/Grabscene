"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Ticket, Search, MapPin, Calendar, Music, Sparkles, LayoutDashboard, ShieldCheck } from 'lucide-react';

// Mock data for trending events
const trendingEvents = [
  {
    id: '55551111-5555-1111-5555-111155551111',
    title: 'Hans Zimmer Live',
    date: 'Friday, Aug 21, 2026',
    venue: 'O2 Arena, London',
    image: 'https://images.unsplash.com/photo-1540039155733-d7696d819920?w=800&q=80',
    tags: ['Orchestral', 'Live Music'],
    featured: true
  },
  {
    id: 'mock-2',
    title: 'Fred Again..',
    date: 'Saturday, Sep 05, 2026',
    venue: 'Wembley Stadium, London',
    image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80',
    tags: ['Electronic', 'Dance'],
    featured: false
  },
  {
    id: 'mock-3',
    title: 'The Weeknd: After Hours',
    date: 'Monday, Oct 12, 2026',
    venue: 'Madison Square Garden, NY',
    image: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&q=80',
    tags: ['Pop', 'R&B'],
    featured: false
  },
  {
    id: 'mock-4',
    title: 'Coldplay: Spheres Tour',
    date: 'Wednesday, Nov 18, 2026',
    venue: 'Estadio Nacional, Lima',
    image: 'https://images.unsplash.com/photo-1470229722913-7c092dbbba3a?w=800&q=80',
    tags: ['Rock', 'Stadium'],
    featured: false
  }
];

export default function Home() {
  const [isAdminMenuOpen, setIsAdminMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#050810] text-zinc-100 font-sans selection:bg-cyan-500/30 overflow-hidden relative pb-32">
      {/* Background ambient glow */}
      <div className="absolute top-[-20%] left-[20%] w-[60%] h-[50%] bg-cyan-500/10 blur-[150px] rounded-full pointer-events-none"></div>

      {/* Navigation */}
      <nav className="border-b border-zinc-800/50 bg-[#050810]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Ticket className="w-6 h-6 text-cyan-400" />
            <span className="text-xl font-bold tracking-tight text-white">GrabScene</span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-zinc-400">
            <a href="#" className="text-white">Concerts</a>
            <a href="#" className="hover:text-white transition-colors">Sports</a>
            <a href="#" className="hover:text-white transition-colors">Theater</a>
            <a href="#" className="hover:text-white transition-colors">Festivals</a>
          </div>
          <div className="flex items-center gap-4">
            <button className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">Sign In</button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 pt-12 relative z-10">
        
        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-12 relative">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search className="w-5 h-5 text-zinc-500" />
          </div>
          <input 
            type="text" 
            placeholder="Search for artists, venues, or events..." 
            className="w-full bg-zinc-900/50 border border-zinc-800 rounded-full py-4 pl-12 pr-6 text-white placeholder:text-zinc-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all shadow-xl"
          />
        </div>

        {/* Featured Hero (Hans Zimmer) */}
        <Link href={`/shows/${trendingEvents[0].id}`} className="group block mb-16 relative rounded-3xl overflow-hidden border border-zinc-800/50 hover:border-cyan-500/30 transition-all duration-500 shadow-2xl hover:shadow-[0_0_40px_rgba(6,182,212,0.15)] animate-in fade-in slide-in-from-bottom-8">
          <div className="absolute inset-0 bg-gradient-to-t from-[#050810] via-[#050810]/60 to-transparent z-10"></div>
          <img 
            src={trendingEvents[0].image} 
            alt={trendingEvents[0].title}
            className="w-full h-[500px] object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          />
          <div className="absolute bottom-0 left-0 p-8 md:p-12 z-20 w-full flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-cyan-500/20 border border-cyan-500/30 px-3 py-1 text-xs font-semibold text-cyan-400 mb-4 backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5" /> High Demand Event
              </div>
              <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight mb-3">
                {trendingEvents[0].title}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-zinc-300 font-medium">
                <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-zinc-500" /> {trendingEvents[0].date}</span>
                <span className="hidden md:block w-1 h-1 rounded-full bg-zinc-600"></span>
                <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-zinc-500" /> {trendingEvents[0].venue}</span>
              </div>
            </div>
            <button className="px-8 py-4 rounded-xl font-bold bg-white text-black hover:bg-zinc-200 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.1)] whitespace-nowrap">
              Get Tickets Now
            </button>
          </div>
        </Link>

        {/* Trending Grid */}
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Music className="w-6 h-6 text-cyan-500" /> Trending Near You
          </h2>
          <button className="text-sm font-medium text-cyan-400 hover:text-cyan-300">View All</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {trendingEvents.slice(1).map((event) => (
            <Link key={event.id} href={`/shows/${event.id}`} className="group block bg-zinc-900/40 border border-zinc-800/50 rounded-2xl overflow-hidden hover:border-zinc-700 transition-all duration-300 hover:-translate-y-1">
              <div className="relative h-48 overflow-hidden">
                <img src={event.image} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#090D16] to-transparent"></div>
              </div>
              <div className="p-6 relative bg-[#090D16]">
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors">{event.title}</h3>
                <div className="space-y-2 mb-6">
                  <p className="text-sm text-zinc-400 flex items-center gap-2"><Calendar className="w-4 h-4" /> {event.date}</p>
                  <p className="text-sm text-zinc-400 flex items-center gap-2"><MapPin className="w-4 h-4" /> {event.venue}</p>
                </div>
                <div className="flex gap-2">
                  {event.tags.map(tag => (
                    <span key={tag} className="text-xs font-medium text-zinc-500 bg-zinc-800/50 px-2 py-1 rounded-md">{tag}</span>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>

      {/* Hidden Evaluator / Admin Toggle */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
        {isAdminMenuOpen && (
          <div className="bg-[#0c111d] border border-zinc-800 shadow-2xl rounded-2xl p-4 flex flex-col gap-2 animate-in slide-in-from-bottom-4 fade-in duration-200 min-w-[200px]">
            <div className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 px-2">Evaluator Tools</div>
            <Link href="/demo/race-condition" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-zinc-800/50 text-sm font-medium text-amber-400 transition-colors">
              <ShieldCheck className="w-4 h-4" /> Concurrency Test
            </Link>
            <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-zinc-800/50 text-sm font-medium text-indigo-400 transition-colors">
              <LayoutDashboard className="w-4 h-4" /> Dashboard
            </Link>
          </div>
        )}
        
        <button 
          onClick={() => setIsAdminMenuOpen(!isAdminMenuOpen)}
          className="w-12 h-12 bg-zinc-800/80 backdrop-blur border border-zinc-700 hover:border-zinc-500 rounded-full flex items-center justify-center text-zinc-400 hover:text-white transition-all shadow-lg"
          title="Evaluation Tools"
        >
          <LayoutDashboard className="w-5 h-5" />
        </button>
      </div>

    </div>
  );
}
