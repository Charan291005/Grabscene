"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { BrandLogo } from "@/components/BrandLogo";
import { events, formatPrice } from "@/lib/events";
import {
  Search,
  MapPin,
  Calendar,
  Music,
  Sparkles,
  ArrowRight
} from "lucide-react";

export default function Home() {
  const [activeTab, setActiveTab] = useState("Concerts");
  const [query, setQuery] = useState("");

  const filteredEvents = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return events.filter((event) => {
      const matchesCategory = activeTab === "All" || event.category === activeTab;
      const searchableText = `${event.title} ${event.venue} ${event.city} ${event.tags.join(" ")}`.toLowerCase();
      return matchesCategory && (!normalizedQuery || searchableText.includes(normalizedQuery));
    });
  }, [activeTab, query]);

  const featuredEvent = filteredEvents[0] ?? events[0];
  const gridEvents = filteredEvents.slice(1);

  return (
    <div className="min-h-screen bg-[#071217] text-zinc-100 font-sans selection:bg-cyan-500/30">
      {/* Navigation */}
      <nav
        className="border-b border-white/[0.08] bg-black/50 backdrop-blur-xl sticky top-0 z-50"
        aria-label="Primary navigation"
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <BrandLogo compact />
          <div className="hidden md:flex items-center gap-1 text-sm font-medium">
            {['All', 'Concerts', 'Sports', 'Theater', 'Festivals'].map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-full transition-all duration-200 ${
                  activeTab === tab
                    ? "bg-white/10 text-white"
                    : "text-zinc-400 hover:text-white hover:bg-white/5"
                }`}
                aria-current={activeTab === tab ? "page" : undefined}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-4">
            <button
              type="button"
              className="text-sm font-medium text-zinc-300 hover:text-white transition-colors px-4 py-2"
            >
              Log in
            </button>
            <button
              type="button"
              className="text-sm font-medium bg-white text-black hover:bg-zinc-200 transition-colors px-4 py-2 rounded-full"
            >
              Sign up
            </button>
          </div>
        </div>
      </nav>

      <main id="main-content" className="max-w-7xl mx-auto px-6 pt-12 md:pt-20 pb-32">
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-white mb-6">
            Your ticket to the <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">front row.</span>
          </h1>
          <p className="text-lg md:text-xl text-zinc-400 mb-10">
            High-demand events, fair queuing, and seamless checkout.
            Discover the next unforgettable experience near you.
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto relative group" role="search">
            <label htmlFor="event-search" className="sr-only">
              Search for artists, venues, or events
            </label>
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Search className="w-5 h-5 text-zinc-400 group-focus-within:text-cyan-400 transition-colors" aria-hidden="true" />
            </div>
            <input
              id="event-search"
              type="search"
              placeholder="Search for artists, venues, or events..."
              className="w-full bg-white/[0.03] border border-white/[0.08] rounded-2xl py-4 pl-12 pr-6 text-white placeholder:text-zinc-500 focus:outline-none focus:border-cyan-500/50 focus:bg-white/[0.05] transition-all"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
        </div>

        {/* Featured Hero */}
        {filteredEvents.length > 0 && <section aria-labelledby="featured-heading" className="mb-20">
          <h2 id="featured-heading" className="sr-only">
            Featured Event
          </h2>
          <Link
            href={`/shows/${featuredEvent.id}`}
            className="group block relative rounded-[2rem] overflow-hidden border border-white/[0.08] hover:border-white/[0.15] transition-all duration-500 bg-zinc-900/50"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-10" aria-hidden="true" />
            <div className="relative h-[600px] w-full">
              <Image
                src={featuredEvent.image}
                alt={`Promotional artwork for ${featuredEvent.title}`}
                fill
                priority
                className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                sizes="(max-width: 1280px) 100vw, 1280px"
              />
            </div>
            <div className="absolute bottom-0 left-0 p-8 md:p-12 z-20 w-full flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 border border-white/10 px-3 py-1 text-xs font-medium text-white mb-6 backdrop-blur-md">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" aria-hidden="true" /> High Demand Event
                </div>
                <h3 className="text-4xl md:text-6xl font-bold text-white tracking-tight mb-4">
                  {featuredEvent.title}
                </h3>
                <div className="flex flex-wrap items-center gap-4 text-zinc-300 font-medium">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-zinc-500" aria-hidden="true" />
                    <time>{featuredEvent.date}</time>
                  </span>
                  <span className="hidden md:block w-1 h-1 rounded-full bg-zinc-600" aria-hidden="true" />
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-zinc-500" aria-hidden="true" />
                    {featuredEvent.venue}, {featuredEvent.city}
                  </span>
                </div>
              </div>
              <span
                className="px-8 py-4 rounded-full font-semibold bg-white text-black group-hover:bg-zinc-200 transition-colors whitespace-nowrap text-center flex items-center justify-center gap-2"
                aria-hidden="true"
              >
                Get Tickets <ArrowRight className="w-4 h-4" />
              </span>
            </div>
          </Link>
        </section>}

        {/* Trending Grid */}
        <section aria-labelledby="trending-heading">
          <div className="mb-8 flex items-center justify-between">
            <h2 id="trending-heading" className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <Music className="w-5 h-5 text-zinc-400" aria-hidden="true" />
              Trending Near You
            </h2>
            <button type="button" onClick={() => { setActiveTab("All"); setQuery(""); }} className="text-sm font-medium text-cyan-400 hover:text-cyan-300 transition-colors">
              View all
            </button>
          </div>

          {filteredEvents.length > 0 && <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {gridEvents.map((event) => (
              <Link
                key={event.id}
                href={`/shows/${event.id}`}
                className="group block bg-white/[0.02] border border-white/[0.05] rounded-2xl overflow-hidden hover:bg-white/[0.04] transition-all duration-300 focus-visible:ring-2 focus-visible:ring-cyan-400"
              >
                <div className="relative h-48 w-full overflow-hidden bg-zinc-900">
                  <Image
                    src={event.image}
                    alt={`Promotional image for ${event.title}`}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent opacity-80" aria-hidden="true" />
                  <div className="absolute bottom-4 right-4 bg-white px-3 py-1 rounded-full text-xs font-semibold text-black">
                    {formatPrice(event.priceFrom)}
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-white mb-3 group-hover:text-cyan-400 transition-colors tracking-tight">
                    {event.title}
                  </h3>
                  <div className="space-y-2">
                    <p className="text-sm text-zinc-400 flex items-center gap-2">
                      <Calendar className="w-4 h-4" aria-hidden="true" />
                      <time>{event.date}</time>
                    </p>
                    <p className="text-sm text-zinc-400 flex items-center gap-2">
                      <MapPin className="w-4 h-4" aria-hidden="true" />
                      {event.venue}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>}
          {filteredEvents.length === 0 && (
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-10 text-center">
              <p className="text-lg font-semibold text-white">No events found</p>
              <p className="mt-2 text-zinc-400">Try another artist, city, or category.</p>
              <button type="button" onClick={() => { setActiveTab("All"); setQuery(""); }} className="mt-6 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-black hover:bg-zinc-200">
                Clear filters
              </button>
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/[0.08] bg-black">
        <div className="max-w-7xl mx-auto px-6 py-12 md:py-16">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2 text-zinc-400">
              <BrandLogo compact href={undefined} />
              <span className="text-sm ml-2">© 2026 GrabScene Inc.</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-zinc-500">
              <Link href="#" className="hover:text-white transition-colors">Terms</Link>
              <Link href="#" className="hover:text-white transition-colors">Privacy</Link>
              <Link href="#" className="hover:text-white transition-colors">Support</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
