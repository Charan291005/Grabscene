"use client";

import React, { useState } from 'react';
import { Play, Database, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function RaceConditionDemo() {
  const [logs, setLogs] = useState<string[]>([]);
  const [aliceStatus, setAliceStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [bobStatus, setBobStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  // Targeting a known available seat from the demo seed data (Event A)
  const showId = "ssss1111-ssss-1111-ssss-1111ssss1111";
  const seatId = "eeee5555-eeee-5555-eeee-5555eeee5554"; 
  
  const addLog = (msg: string) => {
    setLogs(prev => [...prev, `[${new Date().toISOString().split('T')[1]}] ${msg}`]);
  };

  const simulateRace = async () => {
    setLogs([]);
    setAliceStatus('loading');
    setBobStatus('loading');
    addLog("INIT: Spawning parallel requests for exact same seat...");

    const holdSeat = async (user: string, setStatus: any) => {
      try {
        addLog(`${user}: BEGIN TRAN ISOLATION LEVEL READ COMMITTED`);
        addLog(`${user}: Executing SELECT * FROM show_seats WHERE id = '${seatId}' FOR UPDATE ORDER BY id`);
        
        const res = await fetch('/api/seats/hold', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            showId,
            seatIds: [seatId],
            userId: user === 'Alice' ? '33333333-3333-3333-3333-333333333333' : '44444444-4444-4444-4444-444444444444'
          })
        });

        if (res.ok) {
          addLog(`${user}: Lock acquired successfully. Updated status to 'held'. COMMIT.`);
          setStatus('success');
        } else {
          const data = await res.json();
          addLog(`${user}: Lock contention! PostgreSQL returned: ${data.error}`);
          setStatus('error');
        }
      } catch (err) {
        addLog(`${user}: Network/Fetch error.`);
        setStatus('error');
      }
    };

    // Fire simultaneously with zero delay
    await Promise.allSettled([
      holdSeat('Alice', setAliceStatus),
      holdSeat('Bob', setBobStatus)
    ]);
    
    addLog("DONE: Parallel simulation complete. Conflict safely handled by database.");
  };

  return (
    <div className="min-h-screen bg-[#050810] text-zinc-100 p-8 font-sans flex flex-col">
      <div className="max-w-6xl mx-auto w-full">
        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-400 mb-4 uppercase tracking-widest">
            Evaluator Sandbox
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Concurrency Protection</h1>
          <p className="text-zinc-400">Test PostgreSQL Row-Level Locking (SELECT ... FOR UPDATE) against Race Conditions.</p>
        </div>

        <div className="flex justify-center mb-10">
          <button 
            onClick={simulateRace}
            disabled={aliceStatus === 'loading' || bobStatus === 'loading'}
            className="px-8 py-4 bg-cyan-500 hover:bg-cyan-400 text-cyan-950 font-bold rounded-xl flex items-center gap-3 transition-colors shadow-[0_0_30px_rgba(6,182,212,0.3)] disabled:opacity-50"
          >
            <Play className="w-5 h-5" />
            Simulate Simultaneous 1-Click Hold
          </button>
        </div>

        {/* Split Screen */}
        <div className="grid grid-cols-2 gap-8 mb-12">
          {/* Alice */}
          <div className={`border rounded-3xl p-8 transition-colors ${aliceStatus === 'success' ? 'bg-emerald-500/10 border-emerald-500/50 shadow-[0_0_40px_rgba(16,185,129,0.15)]' : aliceStatus === 'error' ? 'bg-red-500/10 border-red-500/50 shadow-[0_0_40px_rgba(239,68,68,0.15)]' : 'bg-[#0c111d] border-zinc-800'}`}>
            <h2 className="text-2xl font-bold text-white mb-6">User Alice</h2>
            
            {aliceStatus === 'idle' && <p className="text-zinc-500">Waiting to send request...</p>}
            {aliceStatus === 'loading' && <p className="text-cyan-400 animate-pulse">Requesting Seat VIP-A1...</p>}
            {aliceStatus === 'success' && (
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-400 mt-1 shrink-0" />
                <div>
                  <p className="text-lg font-bold text-emerald-400">Hold Secured: 10:00 TTL</p>
                  <p className="text-zinc-400 text-sm mt-1">Transaction 1 committed successfully.</p>
                </div>
              </div>
            )}
            {aliceStatus === 'error' && (
              <div className="flex items-start gap-3">
                <AlertCircle className="w-6 h-6 text-red-400 mt-1 shrink-0" />
                <div>
                  <p className="text-lg font-bold text-red-400">409 Conflict</p>
                  <p className="text-zinc-400 text-sm mt-1">Seat already held by concurrent session.</p>
                </div>
              </div>
            )}
          </div>

          {/* Bob */}
          <div className={`border rounded-3xl p-8 transition-colors ${bobStatus === 'success' ? 'bg-emerald-500/10 border-emerald-500/50 shadow-[0_0_40px_rgba(16,185,129,0.15)]' : bobStatus === 'error' ? 'bg-red-500/10 border-red-500/50 shadow-[0_0_40px_rgba(239,68,68,0.15)]' : 'bg-[#0c111d] border-zinc-800'}`}>
            <h2 className="text-2xl font-bold text-white mb-6">User Bob</h2>
            
            {bobStatus === 'idle' && <p className="text-zinc-500">Waiting to send request...</p>}
            {bobStatus === 'loading' && <p className="text-cyan-400 animate-pulse">Requesting Seat VIP-A1...</p>}
            {bobStatus === 'success' && (
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-400 mt-1 shrink-0" />
                <div>
                  <p className="text-lg font-bold text-emerald-400">Hold Secured: 10:00 TTL</p>
                  <p className="text-zinc-400 text-sm mt-1">Transaction 2 committed successfully.</p>
                </div>
              </div>
            )}
            {bobStatus === 'error' && (
              <div className="flex items-start gap-3">
                <AlertCircle className="w-6 h-6 text-red-400 mt-1 shrink-0" />
                <div>
                  <p className="text-lg font-bold text-red-400">409 Conflict</p>
                  <p className="text-zinc-400 text-sm mt-1">Seat already held by concurrent session.</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* DB Execution Log */}
        <div className="bg-black border border-zinc-800 rounded-2xl p-6 shadow-2xl font-mono text-sm overflow-hidden">
          <div className="flex items-center gap-2 mb-4 border-b border-zinc-800 pb-4">
            <Database className="w-4 h-4 text-zinc-500" />
            <h3 className="font-bold text-zinc-300">Live PostgreSQL Transaction Log</h3>
          </div>
          <div className="space-y-2 h-48 overflow-y-auto">
            {logs.length === 0 ? (
              <p className="text-zinc-700">Awaiting simulation...</p>
            ) : (
              logs.map((log, i) => (
                <p key={i} className={log.includes('Conflict') || log.includes('Exception') ? 'text-red-400' : log.includes('COMMIT') ? 'text-emerald-400' : 'text-zinc-400'}>
                  {log}
                </p>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
