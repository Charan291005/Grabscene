"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Ticket,
  Search,
  MapPin,
  Calendar,
  Music,
  Sparkles,
  LayoutDashboard,
  ShieldCheck,
  X,
} from "lucide-react";

const SHOW_ID = "55551111-5555-1111-5555-111155551111";

const trendingEvents = [
  {
    id: SHOW_ID,
    title: "Hans Zimmer Live",
    date: "Friday, Aug 21, 2026",
    venue: "O2 Arena, London",
    image:
      "https://images.unsplash.com/photo-1540039155733-d7696d819920?w=800&q=80",
    tags: ["Orchestral", "Live Music"],
    price: "From $45",
    featured: true,
  },
  {
    id: "mock-2",
    title: "Fred Again..",
    date: "Saturday, Sep 05, 2026",
    venue: "Wembley Stadium, London",
    image:
      "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80",
    tags: ["Electronic", "Dance"],
    price: "From $60",
    featured: false,
  },
  {
    id: "mock-3",
    title: "The Weeknd: After Hours",
    date: "Monday, Oct 12, 2026",
    venue: "Madison Square Garden, NY",
    image:
      "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&q=80",
    tags: ["Pop", "R&B"],
    price: "From $75",
    featured: false,
  },
  {
    id: "mock-4",
    title: "Coldplay: Spheres Tour",
    date: "Wednesday, Nov 18, 2026",
    venue: "Estadio Nacional, Lima",
    image:
      "https://images.unsplash.com/photo-1470229722913-7c092dbbba3a?w=800&q=80",
    tags: ["Rock", "Stadium"],
    price: "From $55",
    featured: false,
  },
];

export default function Home() {
  const [isAdminMenuOpen, setIsAdminMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#050810] text-zinc-100 font-sans overflow-hidden relative pb-32">
      {/* Background ambient glow */}
      <div
        className="absolute top-[-20%] left-[20%] w-[60%] h-[50%] bg-cyan-500/10 blur-[150px] rounded-full pointer-events-none"
        aria-hidden="true"
      />

      {/* Navigation */}
      <nav
        className="border-b border-zinc-800/50 bg-[#050810]/80 backdrop-blur-md sticky top-0 z-50"
        aria-label="Primary navigation"
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 rounded-lg"
            aria-label="GrabScene home"
          >
            <Ticket className="w-6 h-6 text-cyan-400" aria-hidden="true" />
            <span className="text-xl font-bold tracking-tight text-white">
              GrabScene
            </span>
          </Link>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-zinc-400">
            <Link
              href="#"
              className="text-white hover:text-cyan-400 transition-colors"
              aria-current="page"
            >
              Concerts
            </Link>
            <Link
              href="#"
              className="hover:text-white transition-colors"
            >
              Sports
            </Link>
            <Link
              href="#"
              className="hover:text-white transition-colors"
            >
              Theater
            </Link>
            <Link
              href="#"
              className="hover:text-white transition-colors"
            >
              Festivals
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <button
              type="button"
              className="text-sm font-medium text-zinc-400 hover:text-white transition-colors"
            >
              Sign In
            </button>
          </div>
        </div>
      </nav>

      <main id="main-content" className="max-w-7xl mx-auto px-6 pt-12 relative z-10">
        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-12 relative" role="search">
          <label htmlFor="event-search" className="sr-only">
            Search for artists, venues, or events
          </label>
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search className="w-5 h-5 text-zinc-500" aria-hidden="true" />
          </div>
          <input
            id="event-search"
            type="search"
            placeholder="Search for artists, venues, or events..."
            className="w-full bg-zinc-900/50 border border-zinc-800 rounded-full py-4 pl-12 pr-6 text-white placeholder:text-zinc-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/50 transition-all shadow-xl"
          />
        </div>

        {/* Featured Hero */}
        <section aria-labelledby="featured-heading" className="mb-16">
          <h2 id="featured-heading" className="sr-only">
            Featured Event
          </h2>
          <Link
            href={`/shows/${trendingEvents[0].id}`}
            className="group block relative rounded-3xl overflow-hidden border border-zinc-800/50 hover:border-cyan-500/30 transition-all duration-500 shadow-2xl hover:shadow-[0_0_40px_rgba(6,182,212,0.15)]"
          >
            <div
              className="absolute inset-0 bg-gradient-to-t from-[#050810] via-[#050810]/60 to-transparent z-10"
              aria-hidden="true"
            />
            <img
              src={trendingEvents[0].image}
              alt={`Concert stage for ${trendingEvents[0].title}`}
              className="w-full h-[500px] object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              loading="eager"
            />
            <div className="absolute bottom-0 left-0 p-8 md:p-12 z-20 w-full flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-cyan-500/20 border border-cyan-500/30 px-3 py-1 text-xs font-semibold text-cyan-400 mb-4 backdrop-blur-md">
                  <Sparkles className="w-3.5 h-3.5" aria-hidden="true" /> High
                  Demand Event
                </div>
                <h3 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight mb-3">
                  {trendingEvents[0].title}
                </h3>
                <div className="flex flex-wrap items-center gap-4 text-zinc-300 font-medium">
                  <span className="flex items-center gap-1.5">
                    <Calendar
                      className="w-4 h-4 text-zinc-500"
                      aria-hidden="true"
                    />{" "}
                    <time>{trendingEvents[0].date}</time>
                  </span>
                  <span
                    className="hidden md:block w-1 h-1 rounded-full bg-zinc-600"
                    aria-hidden="true"
                  />
                  <span className="flex items-center gap-1.5">
                    <MapPin
                      className="w-4 h-4 text-zinc-500"
                      aria-hidden="true"
                    />{" "}
                    {trendingEvents[0].venue}
                  </span>
                </div>
              </div>
              <span
                className="px-8 py-4 rounded-xl font-bold bg-white text-black group-hover:bg-zinc-200 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.1)] whitespace-nowrap text-center"
                aria-hidden="true"
              >
                Get Tickets Now
              </span>
            </div>
          </Link>
        </section>

        {/* Trending Grid */}
        <section aria-labelledby="trending-heading">
          <div className="mb-8 flex items-center justify-between">
            <h2
              id="trending-heading"
              className="text-2xl font-bold text-white flex items-center gap-2"
            >
              <Music className="w-6 h-6 text-cyan-500" aria-hidden="true" />{" "}
              Trending Near You
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {trendingEvents.slice(1).map((event) => (
              <Link
                key={event.id}
                href={`/shows/${event.id}`}
                className="group block bg-zinc-900/40 border border-zinc-800/50 rounded-2xl overflow-hidden hover:border-zinc-700 transition-all duration-300 hover:-translate-y-1 focus-visible:ring-2 focus-visible:ring-cyan-400"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={event.image}
                    alt={`Promotional image for ${event.title}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div
                    className="absolute inset-0 bg-gradient-to-t from-[#090D16] to-transparent"
                    aria-hidden="true"
                  />
                  <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-emerald-400 border border-emerald-500/30">
                    {event.price}
                  </div>
                </div>
                <div className="p-6 relative bg-[#090D16]">
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors">
                    {event.title}
                  </h3>
                  <div className="space-y-2 mb-6">
                    <p className="text-sm text-zinc-400 flex items-center gap-2">
                      <Calendar className="w-4 h-4" aria-hidden="true" />{" "}
                      <time>{event.date}</time>
                    </p>
                    <p className="text-sm text-zinc-400 flex items-center gap-2">
                      <MapPin className="w-4 h-4" aria-hidden="true" />{" "}
                      {event.venue}
                    </p>
                  </div>
                  <div className="flex gap-2" aria-label="Event categories">
                    {event.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs font-medium text-zinc-500 bg-zinc-800/50 px-2 py-1 rounded-md"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>

      {/* Evaluator / Admin FAB */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
        {isAdminMenuOpen && (
          <nav
            className="bg-[#0c111d] border border-zinc-800 shadow-2xl rounded-2xl p-4 flex flex-col gap-2 min-w-[200px]"
            aria-label="Evaluator tools"
          >
            <div className="flex items-center justify-between mb-2 px-2">
              <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                Evaluator Tools
              </span>
              <button
                type="button"
                onClick={() => setIsAdminMenuOpen(false)}
                className="text-zinc-500 hover:text-white transition-colors"
                aria-label="Close evaluator menu"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <Link
              href="/demo/race-condition"
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-zinc-800/50 text-sm font-medium text-amber-400 transition-colors"
            >
              <ShieldCheck className="w-4 h-4" aria-hidden="true" /> Concurrency
              Test
            </Link>
            <Link
              href="/dashboard"
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-zinc-800/50 text-sm font-medium text-indigo-400 transition-colors"
            >
              <LayoutDashboard className="w-4 h-4" aria-hidden="true" />{" "}
              Dashboard
            </Link>
          </nav>
        )}

        <button
          type="button"
          onClick={() => setIsAdminMenuOpen(!isAdminMenuOpen)}
          className="w-12 h-12 bg-zinc-800/80 backdrop-blur border border-zinc-700 hover:border-zinc-500 rounded-full flex items-center justify-center text-zinc-400 hover:text-white transition-all shadow-lg"
          aria-label={
            isAdminMenuOpen ? "Close evaluator tools" : "Open evaluator tools"
          }
          aria-expanded={isAdminMenuOpen}
        >
          <LayoutDashboard className="w-5 h-5" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
