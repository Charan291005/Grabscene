"use client";

import React from 'react';
import Link from 'next/link';
import { Ticket, Activity, LayoutDashboard, Zap, ShieldCheck, ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#050810] text-zinc-100 font-sans selection:bg-cyan-500/30 overflow-hidden relative">
      {/* Background glow effects */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-cyan-500/10 blur-[150px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-500/10 blur-[150px] rounded-full pointer-events-none"></div>

      <div className="max-w-6xl mx-auto px-6 py-20 relative z-10">
        
        {/* Hero Section */}
        <div className="text-center mb-24 mt-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-1.5 text-sm font-medium text-cyan-400 mb-8 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
            <Zap className="w-4 h-4" /> Production Submission Ready
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight mb-6 leading-tight">
            The Future of <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500">
              High-Concurrency Ticketing
            </span>
          </h1>
          <p className="text-xl text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            GrabScene is a production-grade engine built to withstand massive demand spikes with strict ACID compliance, dynamic row-level locking, and real-time WebSockets.
          </p>
        </div>

        {/* Evaluation Portals */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-24">
          
          <Link href="/shows/ssss1111-ssss-1111-ssss-1111ssss1111" className="group block">
            <div className="h-full bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8 hover:bg-zinc-800/80 hover:border-cyan-500/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(6,182,212,0.1)] hover:-translate-y-1 relative overflow-hidden">
              <div className="w-12 h-12 bg-cyan-500/10 border border-cyan-500/30 rounded-2xl flex items-center justify-center mb-6 text-cyan-400">
                <Ticket className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-3 flex items-center justify-between">
                Live Booking Flow
                <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all text-cyan-400" />
              </h2>
              <p className="text-zinc-400 leading-relaxed">
                Experience the real-time seat map. Watch seats instantly lock for others via WebSockets while you hold them. Proceed through the full checkout & digital pass flow.
              </p>
            </div>
          </Link>

          <Link href="/demo/race-condition" className="group block">
            <div className="h-full bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8 hover:bg-zinc-800/80 hover:border-amber-500/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(245,158,11,0.1)] hover:-translate-y-1 relative overflow-hidden">
              <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-center mb-6 text-amber-400">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-3 flex items-center justify-between">
                Concurrency Sandbox
                <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all text-amber-400" />
              </h2>
              <p className="text-zinc-400 leading-relaxed">
                Test the robust PostgreSQL row-level locks. Simulate simultaneous network requests and watch GrabScene gracefully handle 409 Conflicts with zero deadlocks.
              </p>
            </div>
          </Link>

          <Link href="/dashboard" className="group block">
            <div className="h-full bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8 hover:bg-zinc-800/80 hover:border-indigo-500/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(99,102,241,0.1)] hover:-translate-y-1 relative overflow-hidden">
              <div className="w-12 h-12 bg-indigo-500/10 border border-indigo-500/30 rounded-2xl flex items-center justify-center mb-6 text-indigo-400">
                <LayoutDashboard className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-3 flex items-center justify-between">
                Organiser Dashboard
                <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all text-indigo-400" />
              </h2>
              <p className="text-zinc-400 leading-relaxed">
                View real-time analytics, revenue breakdowns, and dynamic seat heatmaps. Manage your venues and track the live waitlist depth.
              </p>
            </div>
          </Link>

        </div>

        {/* Feature Grid */}
        <div className="border-t border-zinc-800/50 pt-16">
          <div className="text-center mb-12">
            <h3 className="text-xl font-semibold text-white">Under the Hood</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="p-4 rounded-2xl bg-zinc-900/30 border border-zinc-800/50 text-zinc-400 font-medium">
              <span className="text-white block text-lg mb-1">pg_cron</span>
              Automated TTL Sweeps
            </div>
            <div className="p-4 rounded-2xl bg-zinc-900/30 border border-zinc-800/50 text-zinc-400 font-medium">
              <span className="text-white block text-lg mb-1">ACID</span>
              SELECT ... FOR UPDATE
            </div>
            <div className="p-4 rounded-2xl bg-zinc-900/30 border border-zinc-800/50 text-zinc-400 font-medium">
              <span className="text-white block text-lg mb-1">FIFO</span>
              Strict Waitlist Ordering
            </div>
            <div className="p-4 rounded-2xl bg-zinc-900/30 border border-zinc-800/50 text-zinc-400 font-medium">
              <span className="text-white block text-lg mb-1">WebSockets</span>
              Sub-second UI Sync
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
}
