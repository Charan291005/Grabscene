"use client";

import React from 'react';
import { ArrowLeft, Users, CheckCircle, Clock } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function EventAnalyticsPage() {
  const params = useParams();
  const eventId = params.id;

  return (
    <div className="min-h-screen bg-[#050810] text-zinc-100 p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        
        <div className="mb-8">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-white transition-colors mb-4">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
          <div className="flex justify-between items-end">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400 mb-4 uppercase tracking-widest">
                <CheckCircle className="w-3.5 h-3.5" /> Sold Out
              </div>
              <h1 className="text-4xl font-bold text-white tracking-tight">Hans Zimmer Live</h1>
              <p className="text-zinc-400 mt-2 text-lg">O2 Arena • Aug 21, 2026</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-zinc-500">Total Event Revenue</p>
              <p className="text-4xl font-bold text-emerald-400">$84,200</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Revenue Breakdown */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-[#0c111d] border border-zinc-800 rounded-3xl p-8 shadow-2xl">
              <h2 className="text-xl font-semibold text-white mb-6">Inventory Breakdown</h2>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-zinc-500 text-sm border-b border-zinc-800">
                      <th className="pb-4 font-medium">Category</th>
                      <th className="pb-4 font-medium">Price</th>
                      <th className="pb-4 font-medium">Sold</th>
                      <th className="pb-4 font-medium">Held</th>
                      <th className="pb-4 font-medium text-right">Revenue</th>
                    </tr>
                  </thead>
                  <tbody className="text-zinc-300">
                    <tr className="border-b border-zinc-800/50">
                      <td className="py-4 font-medium text-amber-400">VIP</td>
                      <td className="py-4">$150.00</td>
                      <td className="py-4 text-white font-bold">100 / 100</td>
                      <td className="py-4">0</td>
                      <td className="py-4 text-right font-medium">$15,000</td>
                    </tr>
                    <tr className="border-b border-zinc-800/50">
                      <td className="py-4 font-medium text-cyan-400">Premium</td>
                      <td className="py-4">$85.00</td>
                      <td className="py-4 text-white font-bold">380 / 400</td>
                      <td className="py-4 text-amber-500">20</td>
                      <td className="py-4 text-right font-medium">$32,300</td>
                    </tr>
                    <tr>
                      <td className="py-4 font-medium text-zinc-400">Standard</td>
                      <td className="py-4">$45.00</td>
                      <td className="py-4 text-white font-bold">820 / 820</td>
                      <td className="py-4">0</td>
                      <td className="py-4 text-right font-medium">$36,900</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Waitlist Insights */}
            <div className="bg-[#0c111d] border border-zinc-800 rounded-3xl p-8 shadow-2xl flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-white mb-2">Waitlist Analytics</h2>
                <p className="text-zinc-400 text-sm max-w-md">There are currently users waiting for seats. If any current holds expire, they will be automatically reallocated.</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-cyan-400">4</p>
                <p className="text-xs text-zinc-500 uppercase tracking-widest mt-1">Users in Queue</p>
              </div>
            </div>
          </div>

          {/* Live Heatmap Placeholder */}
          <div className="bg-[#0c111d] border border-zinc-800 rounded-3xl p-6 shadow-2xl flex flex-col">
            <h2 className="text-lg font-semibold text-white mb-2">Live Heatmap</h2>
            <p className="text-sm text-zinc-500 mb-6">Real-time venue occupancy.</p>
            
            <div className="flex-1 bg-zinc-900 rounded-2xl border border-zinc-800 flex items-center justify-center p-6 relative overflow-hidden">
              <div className="absolute inset-0 opacity-20" style={{
                backgroundImage: 'radial-gradient(circle at center, #22d3ee 1px, transparent 1px)',
                backgroundSize: '20px 20px'
              }} />
              <div className="text-center relative z-10">
                <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-6 h-6 text-emerald-400" />
                </div>
                <p className="text-emerald-400 font-bold text-2xl">100%</p>
                <p className="text-zinc-500 text-xs mt-1 uppercase tracking-widest">Occupied</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
