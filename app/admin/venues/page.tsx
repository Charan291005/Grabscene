"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { BrandLogo } from "@/components/BrandLogo";
import {
  Building2,
  Plus,
  MapPin,
  Loader2,
  Trash2,
  LayoutGrid,
  ArrowLeft,
  Save,
  X,
} from "lucide-react";

interface VenueSection {
  id: string;
  name: string;
  seatCount: number;
}

interface Venue {
  id: string;
  name: string;
  location: string;
  sections: VenueSection[];
}

interface NewSection {
  name: string;
  rows: number;
  seatsPerRow: number;
}

export default function AdminVenuesPage() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Create form state
  const [newVenueName, setNewVenueName] = useState("");
  const [newVenueLocation, setNewVenueLocation] = useState("");
  const [newSections, setNewSections] = useState<NewSection[]>([
    { name: "VIP", rows: 3, seatsPerRow: 10 },
    { name: "Standard", rows: 5, seatsPerRow: 15 },
  ]);
  const [isCreating, setIsCreating] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    fetchVenues();
  }, []);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const fetchVenues = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/venues");
      const data = await res.json();
      setVenues(data.venues || []);
    } catch {
      console.error("Failed to fetch venues");
    } finally {
      setIsLoading(false);
    }
  };

  const addSection = () => {
    setNewSections((prev) => [...prev, { name: "", rows: 5, seatsPerRow: 10 }]);
  };

  const removeSection = (index: number) => {
    setNewSections((prev) => prev.filter((_, i) => i !== index));
  };

  const updateSection = (index: number, field: keyof NewSection, value: string | number) => {
    setNewSections((prev) =>
      prev.map((s, i) => (i === index ? { ...s, [field]: value } : s))
    );
  };

  const handleCreate = async () => {
    if (!newVenueName.trim()) {
      setToast({ message: "Venue name is required.", type: "error" });
      return;
    }
    if (newSections.length === 0 || newSections.some((s) => !s.name.trim())) {
      setToast({ message: "All sections must have a name.", type: "error" });
      return;
    }

    setIsCreating(true);
    try {
      const res = await fetch("/api/admin/venues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newVenueName,
          location: newVenueLocation,
          sections: newSections,
        }),
      });

      if (res.ok) {
        setToast({ message: "Venue created successfully!", type: "success" });
        setShowCreateForm(false);
        setNewVenueName("");
        setNewVenueLocation("");
        setNewSections([
          { name: "VIP", rows: 3, seatsPerRow: 10 },
          { name: "Standard", rows: 5, seatsPerRow: 15 },
        ]);
        fetchVenues();
      } else {
        const data = await res.json();
        setToast({ message: data.error || "Failed to create venue.", type: "error" });
      }
    } catch {
      setToast({ message: "An unexpected error occurred.", type: "error" });
    } finally {
      setIsCreating(false);
    }
  };

  const totalSeats = (sections: NewSection[]) =>
    sections.reduce((sum, s) => sum + s.rows * s.seatsPerRow, 0);

  return (
    <div className="min-h-screen bg-[#050810] text-zinc-100 p-4 md:p-8 font-sans">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
          <div className="flex justify-between items-center">
            <div>
              <BrandLogo compact />
              <h1 className="text-3xl font-bold text-white tracking-tight mt-2">Venue Management</h1>
              <p className="text-zinc-400 mt-1">Create and manage venues with seat layouts.</p>
            </div>
            <button
              type="button"
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-cyan-950 font-semibold rounded-xl flex items-center gap-2 transition-colors"
            >
              {showCreateForm ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
              {showCreateForm ? "Cancel" : "Create Venue"}
            </button>
          </div>
        </div>

        {/* Create Form */}
        {showCreateForm && (
          <div className="bg-[#0c111d] border border-zinc-800 rounded-3xl p-8 shadow-2xl mb-8 space-y-6">
            <h2 className="text-xl font-semibold text-white">New Venue</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="venue-name" className="text-sm font-medium text-zinc-400">
                  Venue Name
                </label>
                <input
                  id="venue-name"
                  type="text"
                  value={newVenueName}
                  onChange={(e) => setNewVenueName(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                  placeholder="e.g. Grand Horizon IMAX"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="venue-location" className="text-sm font-medium text-zinc-400">
                  Location
                </label>
                <input
                  id="venue-location"
                  type="text"
                  value={newVenueLocation}
                  onChange={(e) => setNewVenueLocation(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                  placeholder="e.g. New York"
                />
              </div>
            </div>

            {/* Sections */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-white">Seat Sections</h3>
                <span className="text-sm text-cyan-400 font-medium">
                  {totalSeats(newSections)} total seats
                </span>
              </div>
              <div className="space-y-3">
                {newSections.map((section, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-4 bg-zinc-900/50 border border-zinc-800 rounded-xl p-4"
                  >
                    <input
                      type="text"
                      value={section.name}
                      onChange={(e) => updateSection(idx, "name", e.target.value)}
                      className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500 text-sm"
                      placeholder="Section name (e.g. VIP)"
                    />
                    <div className="flex items-center gap-2">
                      <label className="text-xs text-zinc-500 whitespace-nowrap">Rows</label>
                      <input
                        type="number"
                        min={1}
                        max={26}
                        value={section.rows}
                        onChange={(e) => updateSection(idx, "rows", parseInt(e.target.value) || 1)}
                        className="w-16 bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-2 text-white text-center text-sm focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="text-xs text-zinc-500 whitespace-nowrap">Seats/Row</label>
                      <input
                        type="number"
                        min={1}
                        max={50}
                        value={section.seatsPerRow}
                        onChange={(e) =>
                          updateSection(idx, "seatsPerRow", parseInt(e.target.value) || 1)
                        }
                        className="w-16 bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-2 text-white text-center text-sm focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                    <span className="text-xs text-zinc-500 w-16 text-right shrink-0">
                      {section.rows * section.seatsPerRow} seats
                    </span>
                    <button
                      type="button"
                      onClick={() => removeSection(idx)}
                      className="p-1 text-zinc-600 hover:text-red-400 transition-colors"
                      aria-label="Remove section"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={addSection}
                className="mt-3 text-sm text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
              >
                + Add Section
              </button>
            </div>

            <div className="pt-4 border-t border-zinc-800">
              <button
                type="button"
                onClick={handleCreate}
                disabled={isCreating}
                className="px-6 py-3 bg-white text-black font-semibold rounded-xl flex items-center gap-2 transition-all hover:bg-zinc-200 disabled:opacity-50"
              >
                {isCreating ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Save className="w-5 h-5" />
                )}
                Create Venue
              </button>
            </div>
          </div>
        )}

        {/* Venues List */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mb-4" />
            <p className="text-zinc-500">Loading venues...</p>
          </div>
        )}

        {!isLoading && venues.length === 0 && !showCreateForm && (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-zinc-800/50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Building2 className="w-8 h-8 text-zinc-600" />
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">No venues configured</h2>
            <p className="text-zinc-500 mb-8">Create your first venue with a seat layout.</p>
          </div>
        )}

        {!isLoading && venues.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {venues.map((venue) => (
              <div
                key={venue.id}
                className="bg-[#0c111d] border border-zinc-800 rounded-2xl p-6 shadow-xl hover:border-zinc-700 transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-white">{venue.name}</h3>
                    <p className="text-sm text-zinc-400 flex items-center gap-1.5 mt-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {venue.location || "No location set"}
                    </p>
                  </div>
                  <div className="p-2 bg-zinc-900 rounded-lg border border-zinc-800">
                    <Building2 className="w-5 h-5 text-cyan-400" />
                  </div>
                </div>

                <div className="space-y-2">
                  {venue.sections.map((section) => (
                    <div
                      key={section.id}
                      className="flex items-center justify-between bg-zinc-900/50 border border-zinc-800/50 rounded-lg px-3 py-2"
                    >
                      <span className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                        <LayoutGrid className="w-3.5 h-3.5 text-zinc-500" />
                        {section.name}
                      </span>
                      <span className="text-xs text-zinc-500">{section.seatCount} seats</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Toast */}
        <div
          className={`fixed bottom-8 left-1/2 -translate-x-1/2 transition-all duration-300 z-50 ${
            toast ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0 pointer-events-none"
          }`}
        >
          {toast && (
            <div
              className={`px-6 py-4 rounded-xl shadow-2xl border flex items-center gap-3 backdrop-blur-md font-medium ${
                toast.type === "error"
                  ? "bg-red-500/10 border-red-500/50 text-red-200"
                  : "bg-emerald-500/10 border-emerald-500/50 text-emerald-200"
              }`}
            >
              {toast.message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
