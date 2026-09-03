"use client";

import React, { useMemo, useState, useEffect } from "react";
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
  Star
} from "lucide-react";

export default function Home() {
  const { user, profile, isLoading: authLoading, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState("Movies");
  const [query, setQuery] = useState("");
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const { events, isLoading: eventsLoading } = useEvents();

  const featuredEvents = useMemo(() => events.filter(e => e.featured), [events]);

  useEffect(() => {
    if (featuredEvents.length === 0) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % featuredEvents.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [featuredEvents]);

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

  return (
    <div className="min-h-screen bg-[#F4F4F5] text-slate-900 font-sans selection:bg-bms-red/30">
      {/* Premium Header */}
      <header className="bg-[#333545] text-white sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-[72px] flex items-center justify-between">
          <div className="flex items-center gap-8 flex-1">
            <BrandLogo dark />
            
            {/* Ultra-clean Search Bar */}
            <div className="hidden md:flex relative max-w-[600px] w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search for Movies, Events, Plays, Sports and Activities"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full bg-white border border-transparent rounded-md pl-11 pr-4 py-2.5 text-[14px] text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-bms-red/50 shadow-sm transition-all"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <button className="hidden md:flex items-center gap-1.5 text-[14px] font-medium hover:text-white/80 transition-colors">
              Mumbai <ChevronDown className="w-4 h-4 opacity-70" />
            </button>
            
            {!authLoading && !user && (
              <Link
                href="/auth/login"
                className="text-[13px] font-bold bg-bms-red text-white hover:bg-bms-red-hover transition-all px-5 py-2 rounded-md shadow-[0_4px_14px_0_rgba(248,68,100,0.39)] hover:shadow-[0_6px_20px_rgba(248,68,100,0.23)] hover:-translate-y-[1px]"
              >
                Sign in
              </Link>
            )}
            
            {!authLoading && user && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 text-sm font-medium text-white hover:text-white/80 transition-colors bg-white/10 px-3 py-1.5 rounded-full hover:bg-white/20"
                >
                  <div className="w-6 h-6 rounded-full bg-bms-red flex items-center justify-center shadow-inner">
                    <User className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span className="hidden md:inline max-w-[120px] truncate">{profile?.email || user.email}</span>
                </button>
                {isUserMenuOpen && (
                  <div className="absolute right-0 top-full mt-3 w-56 bg-white border border-slate-100 rounded-xl shadow-2xl py-2 z-50 transform origin-top-right transition-all">
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

            <button className="text-white hover:text-white/80">
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
        
        {/* Sub Navigation - Ultra Crisp */}
        <div className="bg-[#1f2533] hidden md:block border-t border-white/5 shadow-inner">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-11 flex items-center justify-between text-[14px] text-slate-300">
            <div className="flex gap-7">
              {["Movies", "Stream", "Events", "Plays", "Sports", "Activities"].map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`hover:text-white transition-colors relative h-11 ${activeTab === tab ? 'text-white font-semibold' : ''}`}
                >
                  {tab}
                  {activeTab === tab && (
                    <span className="absolute bottom-0 left-0 w-full h-[3px] bg-bms-red rounded-t-md shadow-[0_-2px_10px_rgba(248,68,100,0.5)]"></span>
                  )}
                </button>
              ))}
            </div>
            <div className="flex gap-6 text-[13px] font-medium">
              <button className="hover:text-white transition-colors">ListYourShow</button>
              <button className="hover:text-white transition-colors">Corporates</button>
              <button className="hover:text-white transition-colors">Offers</button>
              <button className="hover:text-white transition-colors">Gift Cards</button>
            </div>
          </div>
        </div>
      </header>

      <main className="pb-24">
        
        {/* Ultra Premium Hero Carousel */}
        <div className="bg-slate-200">
          <div className="w-full">
            {featuredEvents.length > 0 && (
              <section className="relative w-full h-[400px] md:h-[500px] overflow-hidden group bg-slate-900">
                {featuredEvents.map((event, idx) => (
                  <div 
                    key={event.id}
                    className={`absolute inset-0 transition-opacity duration-1000 ${
                      idx === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
                    }`}
                  >
                    {/* Blurred Background for depth */}
                    <div className="absolute inset-0 z-0 overflow-hidden">
                       <Image
                          src={event.image}
                          alt=""
                          fill
                          className="object-cover blur-2xl opacity-40 scale-110"
                          priority={idx === 0}
                          quality={10}
                        />
                    </div>

                    {/* Centered crisp image */}
                    <div className="absolute inset-0 z-10 flex items-center justify-center pt-8 pb-12">
                      <div className="relative w-[85%] md:w-[70%] max-w-5xl h-full rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10">
                        <Image
                          src={event.image}
                          alt={event.title}
                          fill
                          className="object-cover cursor-pointer hover:scale-105 transition-transform duration-1000"
                          priority={idx === 0}
                          quality={100}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
                        
                        <div className="absolute inset-x-0 bottom-0 p-8 md:p-12 text-white flex flex-col justify-end pointer-events-none">
                          <div className="flex items-center gap-3 mb-3">
                            <span className="bg-bms-red px-3 py-1 text-[11px] font-bold tracking-wider uppercase rounded-sm shadow-md">
                              {event.category}
                            </span>
                            <div className="flex items-center gap-1 bg-black/40 backdrop-blur-md px-3 py-1 rounded-sm text-[12px] font-semibold border border-white/10">
                              <Star className="w-3.5 h-3.5 text-bms-red fill-bms-red" />
                              <span>Must Attend</span>
                            </div>
                          </div>
                          <h1 className="text-3xl md:text-5xl font-black mb-3 drop-shadow-xl tracking-tight leading-tight">{event.title}</h1>
                          <div className="flex flex-wrap items-center gap-4 text-[14px] font-medium text-slate-200">
                            <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 opacity-80" /> {event.date}</span>
                            <span className="w-1.5 h-1.5 rounded-full bg-white/30" />
                            <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 opacity-80" /> {event.venue}, {event.city}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Elegant Carousel Controls */}
                {featuredEvents.length > 1 && (
                  <>
                    <button 
                      onClick={prevSlide}
                      className="absolute left-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 flex items-center justify-center bg-white/10 backdrop-blur-md hover:bg-white/20 text-white border border-white/20 opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-full shadow-lg transform -translate-x-4 group-hover:translate-x-0"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button 
                      onClick={nextSlide}
                      className="absolute right-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 flex items-center justify-center bg-white/10 backdrop-blur-md hover:bg-white/20 text-white border border-white/20 opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-full shadow-lg transform translate-x-4 group-hover:translate-x-0"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2.5">
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
                  </>
                )}
              </section>
            )}
          </div>
        </div>

        {/* Premium Event Grid */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-14">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-[24px] font-bold text-[#333333] tracking-tight">
              {activeTab === "All" ? "Recommended Events" : `Recommended ${activeTab}`}
            </h2>
            <Link href="#" className="text-[14px] font-semibold text-bms-red hover:text-bms-red-hover flex items-center gap-1 group">
              See All <ChevronRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-7">
            {filteredEvents.map((event) => (
              <Link
                href={`/shows/${event.id}`}
                key={event.id}
                className="group flex flex-col cursor-pointer"
              >
                <div className="relative aspect-[3/4] overflow-hidden rounded-[10px] bg-slate-200 mb-4 shadow-sm group-hover:shadow-xl transition-all duration-300 transform group-hover:-translate-y-1">
                  <Image
                    src={event.image}
                    alt={event.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 20vw"
                  />
                  <div className="absolute bottom-0 inset-x-0 h-1/2 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                     <div className="w-full bg-bms-red py-2.5 text-center text-white text-[13px] font-bold uppercase tracking-wider translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                       Book Tickets
                     </div>
                  </div>
                </div>

                <div className="flex flex-col px-1">
                  <h3 className="font-bold text-[#333333] text-[16px] line-clamp-2 leading-snug group-hover:text-bms-red transition-colors">
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
            <div className="text-center py-24 bg-white border border-slate-200 rounded-2xl shadow-sm">
              <Music className="w-16 h-16 text-slate-200 mx-auto mb-5" />
              <h3 className="text-2xl font-bold text-slate-700 mb-2">No events found</h3>
              <p className="text-slate-500 text-[15px]">Try exploring a different category or adjusting your search.</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
