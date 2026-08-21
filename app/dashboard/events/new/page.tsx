"use client";

import React from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';

export default function CreateEventPage() {
  return (
    <div className="min-h-screen bg-[#050810] text-zinc-100 p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-white transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
        
        <div className="mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Create New Event</h1>
            <p className="text-zinc-400 mt-1">Configure event details, venue layout, and pricing.</p>
          </div>
          <button className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-cyan-950 font-semibold rounded-xl flex items-center gap-2 transition-colors">
            <Save className="w-5 h-5" />
            Publish Event
          </button>
        </div>

        <div className="space-y-8">
          {/* Basic Info */}
          <div className="bg-[#0c111d] border border-zinc-800 rounded-3xl p-8 shadow-2xl">
            <h2 className="text-xl font-semibold text-white mb-6">Basic Information</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">Event Title</label>
                <input type="text" className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors" placeholder="e.g. Hans Zimmer Live" />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">Description</label>
                <textarea rows={4} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors" placeholder="Event description..."></textarea>
              </div>
            </div>
          </div>

          {/* Schedule & Venue */}
          <div className="bg-[#0c111d] border border-zinc-800 rounded-3xl p-8 shadow-2xl">
            <h2 className="text-xl font-semibold text-white mb-6">Schedule & Location</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">Venue</label>
                <select className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors appearance-none">
                  <option>Grand Horizon IMAX Cinema</option>
                  <option>CyberDome Arena</option>
                  <option>O2 Arena</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">Date & Time</label>
                <input type="datetime-local" className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors" />
              </div>
            </div>
          </div>

          {/* Pricing Config */}
          <div className="bg-[#0c111d] border border-zinc-800 rounded-3xl p-8 shadow-2xl">
            <h2 className="text-xl font-semibold text-white mb-6">Pricing Configuration</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-4 bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
                <div className="w-4 h-4 rounded-full bg-amber-400"></div>
                <div className="flex-1">
                  <p className="font-medium text-white">VIP Category</p>
                </div>
                <div className="w-32">
                  <input type="number" placeholder="$150.00" className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500 text-right" />
                </div>
              </div>
              <div className="flex items-center gap-4 bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
                <div className="w-4 h-4 rounded-full bg-cyan-400"></div>
                <div className="flex-1">
                  <p className="font-medium text-white">Premium Category</p>
                </div>
                <div className="w-32">
                  <input type="number" placeholder="$85.00" className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500 text-right" />
                </div>
              </div>
              <div className="flex items-center gap-4 bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
                <div className="w-4 h-4 rounded-full bg-zinc-400"></div>
                <div className="flex-1">
                  <p className="font-medium text-white">Standard Category</p>
                </div>
                <div className="w-32">
                  <input type="number" placeholder="$45.00" className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500 text-right" />
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
