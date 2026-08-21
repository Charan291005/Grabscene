"use client";

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, Loader2, Music, Film, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';

interface VenueOption {
  id: string;
  name: string;
  location: string;
}

export default function CreateEventPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [eventType, setEventType] = useState<'movie' | 'concert' | 'other'>('concert');
  const [venueId, setVenueId] = useState('');
  const [dateTime, setDateTime] = useState('');
  const [vipPrice, setVipPrice] = useState('150.00');
  const [premiumPrice, setPremiumPrice] = useState('85.00');
  const [standardPrice, setStandardPrice] = useState('45.00');

  const [venues, setVenues] = useState<VenueOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchVenues = async () => {
      try {
        const res = await fetch('/api/admin/venues');
        const data = await res.json();
        setVenues(data.venues || []);
        if (data.venues?.length > 0) {
          setVenueId(data.venues[0].id);
        }
      } catch {
        // Use fallback venues
        setVenues([
          { id: 'aaaa1111-aaaa-1111-aaaa-1111aaaa1111', name: 'Grand Horizon IMAX Cinema', location: 'New York' },
          { id: 'bbbb2222-bbbb-2222-bbbb-2222bbbb2222', name: 'CyberDome Arena', location: 'London' },
        ]);
        setVenueId('aaaa1111-aaaa-1111-aaaa-1111aaaa1111');
      }
    };
    fetchVenues();
  }, []);

  const handlePublish = async () => {
    if (!title.trim()) {
      setError('Event title is required.');
      return;
    }
    if (!venueId) {
      setError('Please select a venue.');
      return;
    }
    if (!dateTime) {
      setError('Please set a date and time.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/events/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          eventType,
          venueId,
          startTime: new Date(dateTime).toISOString(),
          organiserId: user?.id || '22222222-2222-2222-2222-222222222222',
          pricing: {
            VIP: parseFloat(vipPrice) || 150,
            Premium: parseFloat(premiumPrice) || 85,
            Standard: parseFloat(standardPrice) || 45,
          },
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create event.');
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

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
          <button
            type="button"
            onClick={handlePublish}
            disabled={isLoading || success}
            className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-cyan-950 font-semibold rounded-xl flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : success ? (
              '✓ Published!'
            ) : (
              <>
                <Save className="w-5 h-5" />
                Publish Event
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm" role="alert">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm" role="status">
            Event published successfully! Redirecting to dashboard...
          </div>
        )}

        <div className="space-y-8">
          {/* Basic Info */}
          <div className="bg-[#0c111d] border border-zinc-800 rounded-3xl p-8 shadow-2xl">
            <h2 className="text-xl font-semibold text-white mb-6">Basic Information</h2>
            <div className="space-y-6">
              <div>
                <label htmlFor="event-title" className="block text-sm font-medium text-zinc-400 mb-2">Event Title</label>
                <input
                  id="event-title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                  placeholder="e.g. Hans Zimmer Live"
                />
              </div>
              <div>
                <label htmlFor="event-description" className="block text-sm font-medium text-zinc-400 mb-2">Description</label>
                <textarea
                  id="event-description"
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                  placeholder="Event description..."
                />
              </div>

              {/* Event Type */}
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-3">Event Type</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'concert' as const, label: 'Concert', icon: Music },
                    { id: 'movie' as const, label: 'Movie', icon: Film },
                    { id: 'other' as const, label: 'Other', icon: Sparkles },
                  ].map(({ id, label, icon: Icon }) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setEventType(id)}
                      className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-3 text-sm font-medium transition-colors ${
                        eventType === id
                          ? 'border-cyan-400 bg-cyan-400/10 text-cyan-300'
                          : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:border-zinc-700 hover:text-white'
                      }`}
                    >
                      <Icon className="h-4 w-4" /> {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Schedule & Venue */}
          <div className="bg-[#0c111d] border border-zinc-800 rounded-3xl p-8 shadow-2xl">
            <h2 className="text-xl font-semibold text-white mb-6">Schedule &amp; Location</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="event-venue" className="block text-sm font-medium text-zinc-400 mb-2">Venue</label>
                <select
                  id="event-venue"
                  value={venueId}
                  onChange={(e) => setVenueId(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors appearance-none"
                >
                  {venues.map((v) => (
                    <option key={v.id} value={v.id}>{v.name} — {v.location}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="event-datetime" className="block text-sm font-medium text-zinc-400 mb-2">Date &amp; Time</label>
                <input
                  id="event-datetime"
                  type="datetime-local"
                  value={dateTime}
                  onChange={(e) => setDateTime(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                />
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
                  <input
                    type="number"
                    value={vipPrice}
                    onChange={(e) => setVipPrice(e.target.value)}
                    placeholder="$150.00"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500 text-right"
                  />
                </div>
              </div>
              <div className="flex items-center gap-4 bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
                <div className="w-4 h-4 rounded-full bg-cyan-400"></div>
                <div className="flex-1">
                  <p className="font-medium text-white">Premium Category</p>
                </div>
                <div className="w-32">
                  <input
                    type="number"
                    value={premiumPrice}
                    onChange={(e) => setPremiumPrice(e.target.value)}
                    placeholder="$85.00"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500 text-right"
                  />
                </div>
              </div>
              <div className="flex items-center gap-4 bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
                <div className="w-4 h-4 rounded-full bg-zinc-400"></div>
                <div className="flex-1">
                  <p className="font-medium text-white">Standard Category</p>
                </div>
                <div className="w-32">
                  <input
                    type="number"
                    value={standardPrice}
                    onChange={(e) => setStandardPrice(e.target.value)}
                    placeholder="$45.00"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500 text-right"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
