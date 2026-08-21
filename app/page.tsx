"use client";

import React, { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { BrandLogo } from "@/components/BrandLogo";
import { events, formatPrice } from "@/lib/events";
import { useAuth } from "@/components/auth/AuthProvider";
import {
  Search,
  MapPin,
  Calendar,
  Music,
  Sparkles,
  ArrowRight,
  Ticket,
  LayoutDashboard,
  LogOut,
  User,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export default function Home() {
  const { user, profile, isLoading: authLoading, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState("Concerts");
  const [query, setQuery] = useState("");
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  const featuredEvents = useMemo(() => events.filter(e => e.featured), []);

  useEffect(() => {
    if (featuredEvents.length === 0) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % featuredEvents.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [featuredEvents]);

  const filteredEvents = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return events.filter(
      (e) =>
        (activeTab === "All" || e.category === activeTab) &&
        (e.title.toLowerCase().includes(normalizedQuery) ||
          e.venue.toLowerCase().includes(normalizedQuery) ||
          e.city.toLowerCase().includes(normalizedQuery))
    );
  }, [activeTab, query]);

  const nextSlide = () => setCurrentSlide((p) => (p + 1) % featuredEvents.length);
  const prevSlide = () => setCurrentSlide((p) => (p - 1 + featuredEvents.length) % featuredEvents.length);

  return (
    <div className="min-h-screen bg-[#050810] text-zinc-100 font-sans selection:bg-cyan-500/30">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-[#050810]/80 backdrop-blur-xl border-b border-white/[0.05]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <BrandLogo />
          
          <div className="hidden md:flex items-center gap-1 bg-white/[0.03] p-1 rounded-full border border-white/[0.05]">
            {["Concerts", "Theater", "Sports", "Festivals"].map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                  activeTab === tab
                    ? "bg-white text-black shadow-lg"
                    : "text-zinc-400 hover:text-white hover:bg-white/5"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          
          <div className="flex items-center gap-4">
            {!authLoading && !user && (
              <>
                <Link
                  href="/auth/login"
                  className="text-sm font-medium text-zinc-300 hover:text-white transition-colors px-4 py-2"
                >
                  Log in
                </Link>
                <Link
                  href="/auth/register"
                  className="text-sm font-medium bg-cyan-500 text-cyan-950 hover:bg-cyan-400 transition-colors px-5 py-2.5 rounded-full shadow-[0_0_20px_rgba(34,211,238,0.2)]"
                >
                  Sign up
                </Link>
              </>
            )}
            {!authLoading && user && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 text-sm font-medium text-zinc-300 hover:text-white transition-colors px-3 py-2 rounded-full border border-white/[0.08] hover:border-white/[0.15] bg-white/[0.03]"
                >
                  <div className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center">
                    <User className="w-4 h-4 text-cyan-400" />
                  </div>
                  <span className="hidden md:inline max-w-[120px] truncate">{profile?.email || user.email}</span>
                  <ChevronDown className="w-4 h-4 text-zinc-500" />
                </button>
                {isUserMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-[#0c111d] border border-zinc-800 rounded-xl shadow-2xl py-2 z-50">
                    <Link href="/bookings" onClick={() => setIsUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-300 hover:bg-white/5 hover:text-white transition-colors">
                      <Ticket className="w-4 h-4 text-zinc-500" /> My Bookings
                    </Link>
                    {(profile?.role === 'organiser' || profile?.role === 'admin') && (
                      <Link href="/dashboard" onClick={() => setIsUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-300 hover:bg-white/5 hover:text-white transition-colors">
                        <LayoutDashboard className="w-4 h-4 text-zinc-500" /> Dashboard
                      </Link>
                    )}
                    <div className="border-t border-zinc-800 my-1" />
                    <button type="button" onClick={() => { signOut(); setIsUserMenuOpen(false); }} className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 w-full transition-colors">
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </nav>

      <main className="pb-24">
        
        {/* Hero Carousel */}
        {featuredEvents.length > 0 && (
          <section className="relative w-full h-[70vh] min-h-[500px] overflow-hidden bg-black group">
            {featuredEvents.map((event, idx) => (
              <div 
                key={event.id}
                className={`absolute inset-0 transition-opacity duration-1000 ${
                  idx === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
                }`}
              >
                <Image
                  src={event.image}
                  alt={event.title}
                  fill
                  className="object-cover object-top opacity-60"
                  priority={idx === 0}
                  quality={90}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#050810] via-[#050810]/40 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#050810] via-transparent to-transparent opacity-80" />
                
                <div className="absolute inset-0 flex items-center">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full translate-y-10">
                    <div className="max-w-2xl space-y-4">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-400 text-xs font-bold tracking-widest uppercase border border-cyan-500/30 backdrop-blur-md">
                        <Sparkles className="w-3.5 h-3.5" /> Featured Event
                      </span>
                      <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-tight drop-shadow-2xl">
                        {event.title}
                      </h1>
                      <div className="flex flex-wrap items-center gap-4 text-zinc-300 text-lg">
                        <span className="flex items-center gap-2"><MapPin className="w-5 h-5 text-cyan-400" /> {event.venue}, {event.city}</span>
                        <span className="hidden md:inline text-zinc-600">•</span>
                        <span className="flex items-center gap-2"><Calendar className="w-5 h-5 text-cyan-400" /> {event.date}</span>
                      </div>
                      <p className="text-xl text-zinc-400 max-w-xl hidden md:block">
                        {event.description}
                      </p>
                      <div className="pt-4">
                        <Link 
                          href={`/shows/${event.id}`}
                          className="inline-flex items-center gap-3 px-8 py-4 bg-white text-black font-bold rounded-full hover:bg-zinc-200 transition-colors shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:scale-105"
                        >
                          Book Tickets Now <ArrowRight className="w-5 h-5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Carousel Controls */}
            {featuredEvents.length > 1 && (
              <>
                <button 
                  onClick={prevSlide}
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 flex items-center justify-center rounded-full bg-black/20 hover:bg-black/40 backdrop-blur-md border border-white/10 text-white transition-colors opacity-0 group-hover:opacity-100"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button 
                  onClick={nextSlide}
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 flex items-center justify-center rounded-full bg-black/20 hover:bg-black/40 backdrop-blur-md border border-white/10 text-white transition-colors opacity-0 group-hover:opacity-100"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                  {featuredEvents.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentSlide(idx)}
                      className={`w-2.5 h-2.5 rounded-full transition-all ${
                        idx === currentSlide ? 'bg-white w-8' : 'bg-white/30 hover:bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </section>
        )}

        {/* Filters and Grid */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
            <h2 className="text-3xl font-bold text-white tracking-tight">
              {activeTab === "All" ? "Upcoming Events" : `${activeTab} near you`}
            </h2>
            <div className="relative max-w-sm w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                placeholder="Search events, artists, or venues..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full bg-[#0c111d] border border-zinc-800 rounded-full pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredEvents.map((event) => (
              <Link
                href={`/shows/${event.id}`}
                key={event.id}
                className="group flex flex-col bg-[#0c111d] border border-zinc-800 rounded-2xl overflow-hidden hover:border-zinc-700 transition-all hover:shadow-[0_0_30px_rgba(34,211,238,0.1)] hover:-translate-y-1"
              >
                <div className="relative aspect-[4/5] overflow-hidden bg-zinc-900">
                  <Image
                    src={event.image}
                    alt={event.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0c111d] via-transparent to-transparent opacity-80" />
                  <div className="absolute top-3 left-3 flex gap-2">
                    <span className="px-2.5 py-1 bg-black/60 backdrop-blur-md rounded-lg text-xs font-bold text-white border border-white/10 uppercase tracking-widest">
                      {event.category}
                    </span>
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between -mt-6 relative z-10">
                  <div>
                    <h3 className="font-bold text-xl text-white mb-2 line-clamp-2 leading-tight group-hover:text-cyan-400 transition-colors">
                      {event.title}
                    </h3>
                    <div className="space-y-1.5 mb-4">
                      <p className="text-sm text-zinc-400 flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-zinc-500" />
                        <span className="truncate">{event.venue}, {event.city}</span>
                      </p>
                      <p className="text-sm text-zinc-400 flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-zinc-500" />
                        {event.date} • {event.time}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-zinc-800/50">
                    <div className="flex flex-col">
                      <span className="text-xs text-zinc-500 font-medium">Starting from</span>
                      <span className="text-lg font-bold text-emerald-400">{formatPrice(event.priceFrom)}</span>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-cyan-500 transition-colors">
                      <ArrowRight className="w-4 h-4 text-zinc-300 group-hover:text-cyan-950" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {filteredEvents.length === 0 && (
            <div className="text-center py-20 bg-[#0c111d] border border-zinc-800 rounded-3xl">
              <Music className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">No events found</h3>
              <p className="text-zinc-500">Try adjusting your search or filtering options.</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
