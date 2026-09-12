"use client";

import React, { useMemo, useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { BrandLogo } from "@/components/BrandLogo";
import { useEvents } from "@/hooks/useEvents";
import { useAuth } from "@/components/auth/AuthProvider";
import {
  Search,
  MapPin,
  Calendar,
  Music,
  ArrowRight,
  Ticket,
  LayoutDashboard,
  LogOut,
  User,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Menu,
  Star,
  TrendingUp,
  Flame,
  X,
} from "lucide-react";

/* ── Scroll-triggered animation hook ──── */
function useInView(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setIsInView(true); observer.unobserve(el); } },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);
  return { ref, isInView };
}

export default function Home() {
  const { user, profile, isLoading: authLoading, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState("Movies");
  const [query, setQuery] = useState("");
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const { events, isLoading: eventsLoading } = useEvents();
  const gridRef = useInView(0.05);

  const featuredEvents = useMemo(() => events.filter(e => e.featured), [events]);

  /* ── Auto-advance carousel ──── */
  useEffect(() => {
    if (featuredEvents.length === 0) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % featuredEvents.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [featuredEvents]);

  /* ── Scroll-aware header ──── */
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /* ── Close user menu on outside click ──── */
  useEffect(() => {
    if (!isUserMenuOpen) return;
    const handleClick = () => setIsUserMenuOpen(false);
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [isUserMenuOpen]);

  const filteredEvents = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return events.filter(
      (e) =>
        (activeTab === "All" || e.category === activeTab || (activeTab === "Events" && e.category === "Concerts")) &&
        (e.title.toLowerCase().includes(normalizedQuery) ||
          e.venue.toLowerCase().includes(normalizedQuery) ||
          e.city.toLowerCase().includes(normalizedQuery))
    );
  }, [activeTab, query, events]);

  const nextSlide = () => setCurrentSlide((p) => (p + 1) % featuredEvents.length);
  const prevSlide = () => setCurrentSlide((p) => (p - 1 + featuredEvents.length) % featuredEvents.length);

  const tabs = ["Movies", "Stream", "Events", "Plays", "Sports", "Activities"];

  return (
    <div className="min-h-screen bg-[#F4F4F5] text-slate-900 font-sans selection:bg-bms-red/30">

      {/* ═══ PREMIUM HEADER ═══ */}
      <header className={`bg-[#333545] text-white sticky top-0 z-50 transition-all duration-500 ${isScrolled ? 'header-scrolled shadow-2xl' : 'shadow-md'}`}>
        <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between transition-all duration-500 ${isScrolled ? 'h-[60px]' : 'h-[72px]'}`}>
          <div className="flex items-center gap-8 flex-1">
            <div className={`transition-transform duration-500 ${isScrolled ? 'scale-90' : 'scale-100'}`}>
              <BrandLogo dark />
            </div>
            
            {/* Search Bar with focus glow */}
            <div className={`hidden md:flex relative max-w-[600px] w-full transition-all duration-300 ${isSearchFocused ? 'scale-[1.02]' : ''}`}>
              <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-300 ${isSearchFocused ? 'text-bms-red' : 'text-slate-400'}`} />
              <input
                type="text"
                placeholder="Search for Movies, Events, Plays, Sports and Activities"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                className={`w-full bg-white border rounded-lg pl-11 pr-4 py-2.5 text-[14px] text-slate-900 placeholder-slate-400 focus:outline-none transition-all duration-300 shadow-sm ${isSearchFocused ? 'border-bms-red ring-2 ring-bms-red/30 shadow-[0_0_20px_rgba(248,68,100,0.15)]' : 'border-transparent'}`}
              />
              {query && (
                <button onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            {/* Mobile search toggle */}
            <button className="md:hidden text-white hover:text-white/80 transition-colors" onClick={() => setMobileSearchOpen(!mobileSearchOpen)}>
              <Search className="w-5 h-5" />
            </button>

            <button className="hidden md:flex items-center gap-1.5 text-[14px] font-medium hover:text-white/80 transition-colors group">
              Mumbai <ChevronDown className="w-4 h-4 opacity-70 group-hover:rotate-180 transition-transform duration-300" />
            </button>
            
            {!authLoading && !user && (
              <Link
                href="/auth/login"
                className="text-[13px] font-bold bg-bms-red text-white hover:bg-bms-red-hover transition-all duration-300 px-5 py-2 rounded-lg shadow-[0_4px_14px_0_rgba(248,68,100,0.39)] hover:shadow-[0_6px_20px_rgba(248,68,100,0.23)] hover:-translate-y-[1px] btn-press"
              >
                Sign in
              </Link>
            )}
            
            {!authLoading && user && (
              <div className="relative">
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setIsUserMenuOpen(!isUserMenuOpen); }}
                  className="flex items-center gap-2 text-sm font-medium text-white hover:text-white/80 transition-all duration-300 bg-white/10 px-3 py-1.5 rounded-full hover:bg-white/20"
                >
                  <div className="w-6 h-6 rounded-full bg-bms-red flex items-center justify-center shadow-inner">
                    <User className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span className="hidden md:inline max-w-[120px] truncate">{profile?.email || user.email}</span>
                </button>
                {isUserMenuOpen && (
                  <div className="absolute right-0 top-full mt-3 w-56 bg-white border border-slate-100 rounded-xl shadow-2xl py-2 z-50 animate-slideDown" onClick={(e) => e.stopPropagation()}>
                    <Link href="/bookings" onClick={() => setIsUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-[14px] font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                      <Ticket className="w-4 h-4 text-slate-400" /> My Bookings
                    </Link>
                    {(profile?.role === 'organiser' || profile?.role === 'admin') && (
                      <Link href="/dashboard" onClick={() => setIsUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-[14px] font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                        <LayoutDashboard className="w-4 h-4 text-slate-400" /> Dashboard
                      </Link>
                    )}
                    <div className="border-t border-slate-100 my-1" />
                    <button type="button" onClick={() => { signOut(); setIsUserMenuOpen(false); }} className="flex items-center gap-3 px-4 py-2.5 text-[14px] font-medium text-red-500 hover:bg-red-50 w-full transition-colors">
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            )}

            <button className="text-white hover:text-white/80 transition-colors hover:rotate-90 duration-300">
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Mobile Search Drawer */}
        <div className={`md:hidden overflow-hidden transition-all duration-300 ${mobileSearchOpen ? 'max-h-16 opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="px-4 pb-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search events..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full bg-white/10 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-white/50 focus:outline-none focus:border-bms-red"
              />
            </div>
          </div>
        </div>
        
        {/* Sub Navigation with animated indicator */}
        <div className="bg-[#1f2533] hidden md:block border-t border-white/5 shadow-inner">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-11 flex items-center justify-between text-[14px] text-slate-300">
            <div className="flex gap-7">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`hover:text-white transition-all duration-300 relative h-11 ${activeTab === tab ? 'text-white font-semibold' : ''}`}
                >
                  {tab}
                  {activeTab === tab && (
                    <span className="absolute bottom-0 left-0 w-full h-[3px] bg-bms-red rounded-t-md shadow-[0_-2px_10px_rgba(248,68,100,0.5)]" style={{ animation: 'slideIndicator 0.3s cubic-bezier(0.16, 1, 0.3, 1) both' }}></span>
                  )}
                </button>
              ))}
            </div>
            <div className="flex gap-6 text-[13px] font-medium">
              <button className="hover:text-white transition-colors duration-300">ListYourShow</button>
              <button className="hover:text-white transition-colors duration-300">Corporates</button>
              <button className="hover:text-white transition-colors duration-300">Offers</button>
              <button className="hover:text-white transition-colors duration-300">Gift Cards</button>
            </div>
          </div>
        </div>
      </header>

      <main className="pb-24">
        
        {/* ═══ CINEMATIC HERO CAROUSEL ═══ */}
        <div className="bg-slate-200">
          <div className="w-full">
            {featuredEvents.length > 0 && (
              <section className="relative w-full h-[400px] md:h-[500px] overflow-hidden group bg-slate-900">
                {featuredEvents.map((event, idx) => (
                  <div 
                    key={event.id}
                    className={`absolute inset-0 transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                      idx === currentSlide ? 'opacity-100 z-10 scale-100' : 'opacity-0 z-0 scale-105'
                    }`}
                  >
                    {/* Ken Burns animated blurred background */}
                    <div className="absolute inset-0 z-0 overflow-hidden">
                       <Image
                          src={event.image}
                          alt=""
                          fill
                          className={`object-cover blur-2xl opacity-40 scale-125 ${idx === currentSlide ? 'animate-kenBurns' : ''}`}
                          priority={idx === 0}
                          quality={10}
                        />
                       {/* Breathing glow overlay */}
                       <div className="absolute inset-0 bg-gradient-to-r from-bms-red/10 via-transparent to-purple-500/10 animate-breathe" />
                    </div>

                    {/* Centered crisp image */}
                    <div className="absolute inset-0 z-10 flex items-center justify-center pt-8 pb-12">
                      <div className="relative w-[85%] md:w-[70%] max-w-5xl h-full rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10">
                        <Image
                          src={event.image}
                          alt={event.title}
                          fill
                          className="object-cover cursor-pointer hover:scale-105 transition-transform duration-[1.5s] ease-out"
                          priority={idx === 0}
                          quality={100}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
                        
                        {/* Animated text overlay */}
                        <div className="absolute inset-x-0 bottom-0 p-8 md:p-12 text-white flex flex-col justify-end pointer-events-none">
                          <div className={`flex items-center gap-3 mb-3 transition-all duration-700 ${idx === currentSlide ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`} style={{ transitionDelay: '200ms' }}>
                            <span className="bg-bms-red px-3 py-1 text-[11px] font-bold tracking-wider uppercase rounded-sm shadow-md">
                              {event.category}
                            </span>
                            <div className="flex items-center gap-1 bg-black/40 backdrop-blur-md px-3 py-1 rounded-sm text-[12px] font-semibold border border-white/10">
                              <Star className="w-3.5 h-3.5 text-bms-red fill-bms-red" />
                              <span>Must Attend</span>
                            </div>
                          </div>
                          <h1 className={`text-3xl md:text-5xl font-black mb-3 drop-shadow-xl tracking-tight leading-tight transition-all duration-700 ${idx === currentSlide ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'}`} style={{ transitionDelay: '400ms' }}>
                            {event.title}
                          </h1>
                          <div className={`flex flex-wrap items-center gap-4 text-[14px] font-medium text-slate-200 transition-all duration-700 ${idx === currentSlide ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`} style={{ transitionDelay: '600ms' }}>
                            <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 opacity-80" /> {event.date}</span>
                            <span className="w-1.5 h-1.5 rounded-full bg-white/30" />
                            <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 opacity-80" /> {event.venue}, {event.city}</span>
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
                      className="absolute left-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 flex items-center justify-center bg-white/10 backdrop-blur-md hover:bg-white/25 text-white border border-white/20 opacity-0 group-hover:opacity-100 transition-all duration-500 rounded-full shadow-lg transform -translate-x-4 group-hover:translate-x-0 btn-press"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button 
                      onClick={nextSlide}
                      className="absolute right-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 flex items-center justify-center bg-white/10 backdrop-blur-md hover:bg-white/25 text-white border border-white/20 opacity-0 group-hover:opacity-100 transition-all duration-500 rounded-full shadow-lg transform translate-x-4 group-hover:translate-x-0 btn-press"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>

                    {/* Dot indicators + progress bar */}
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2.5">
                      {featuredEvents.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setCurrentSlide(idx)}
                          className={`h-2 rounded-full transition-all duration-500 shadow-sm ${
                            idx === currentSlide ? 'bg-bms-red w-8' : 'bg-white/50 w-2 hover:bg-white/80'
                          }`}
                        />
                      ))}
                    </div>

                    {/* Auto-fill progress bar */}
                    <div className="absolute bottom-0 left-0 w-full h-[3px] bg-white/10 z-20">
                      <div 
                        key={currentSlide} 
                        className="h-full bg-bms-red carousel-progress"
                      />
                    </div>
                  </>
                )}
              </section>
            )}
          </div>
        </div>

        {/* ═══ CATEGORY QUICK-FILTER CHIPS ═══ */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {["All", ...tabs].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`shrink-0 px-5 py-2 rounded-full text-[13px] font-semibold transition-all duration-300 border btn-press ${
                  activeTab === tab
                    ? 'bg-bms-red text-white border-bms-red shadow-[0_4px_14px_0_rgba(248,68,100,0.3)]'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-bms-red/30 hover:text-bms-red'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* ═══ PREMIUM EVENT GRID ═══ */}
        <section ref={gridRef.ref} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
          <div className="flex items-center justify-between mb-8">
            <h2 className={`text-[24px] font-bold text-[#333333] tracking-tight transition-all duration-700 ${gridRef.isInView ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
              {activeTab === "All" ? "Recommended Events" : `Recommended ${activeTab}`}
            </h2>
            <Link href="#" className="text-[14px] font-semibold text-bms-red hover:text-bms-red-hover flex items-center gap-1 group transition-colors">
              See All <ChevronRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-7">
            {filteredEvents.map((event, idx) => (
              <Link
                href={`/shows/${event.id}`}
                key={event.id}
                className={`group flex flex-col cursor-pointer animate-fadeInUp ${gridRef.isInView ? '' : 'opacity-0'}`}
                style={{ animationDelay: `${Math.min(idx * 0.08, 0.8)}s`, animationFillMode: 'both' }}
              >
                <div className="relative aspect-[3/4] overflow-hidden rounded-[12px] bg-slate-200 mb-4 card-hover-lift">
                  <Image
                    src={event.image}
                    alt={event.title}
                    fill
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                    sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 20vw"
                  />
                  
                  {/* Gradient overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  {/* "Book Now" CTA slides up */}
                  <div className="absolute bottom-0 inset-x-0 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]">
                    <div className="bg-bms-red py-3 text-center text-white text-[13px] font-bold uppercase tracking-wider flex items-center justify-center gap-2">
                      Book Now <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>

                  {/* Trending badge */}
                  {idx < 3 && (
                    <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold text-white border border-white/10">
                      <Flame className="w-3 h-3 text-orange-400" />
                      Trending
                    </div>
                  )}
                </div>

                <div className="flex flex-col px-1">
                  <h3 className="font-bold text-[#333333] text-[16px] line-clamp-2 leading-snug group-hover:text-bms-red transition-colors duration-300">
                    {event.title}
                  </h3>
                  <p className="text-[14px] text-[#666666] mt-1.5 truncate">
                    {event.venue}
                  </p>
                  <p className="text-[14px] text-[#666666] truncate mt-0.5">
                    {event.category}
                  </p>
                </div>
              </Link>
            ))}
          </div>

          {filteredEvents.length === 0 && (
            <div className="text-center py-24 bg-white border border-slate-200 rounded-2xl shadow-sm animate-fadeInUp">
              <Music className="w-16 h-16 text-slate-200 mx-auto mb-5 animate-float" />
              <h3 className="text-2xl font-bold text-slate-700 mb-2">No events found</h3>
              <p className="text-slate-500 text-[15px]">Try exploring a different category or adjusting your search.</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
