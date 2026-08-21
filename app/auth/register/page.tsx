"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BrandLogo } from "@/components/BrandLogo";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { UserPlus, Loader2, Mail, Lock, Eye, EyeOff, User, Briefcase } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<"customer" | "organiser">("customer");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      setIsLoading(false);
      return;
    }

    const { data, error: authError } = await supabaseBrowser.auth.signUp({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setIsLoading(false);
      return;
    }

    // Create profile with chosen role
    if (data.user) {
      const { error: profileError } = await supabaseBrowser.from("profiles").upsert({
        id: data.user.id,
        email,
        role,
      });

      if (profileError) {
        console.error("Profile creation error:", profileError);
      }
    }

    router.push("/");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-[#050810] flex items-center justify-center p-4 font-sans">
      {/* Background accents */}
      <div className="fixed inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-emerald-500/[0.06] rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-cyan-500/[0.05] rounded-full blur-[100px]" />
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <BrandLogo compact />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Create your account</h1>
          <p className="text-zinc-400 mt-2">Join GrabScene and never miss a show</p>
        </div>

        <div className="bg-[#0c111d] border border-zinc-800 rounded-3xl p-8 shadow-2xl">
          <form onSubmit={handleRegister} className="space-y-5">
            {/* Role Selector */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-400">I want to</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole("customer")}
                  className={`flex items-center gap-3 p-4 rounded-xl border transition-all duration-200 ${
                    role === "customer"
                      ? "border-cyan-500 bg-cyan-500/10 text-white shadow-[0_0_15px_rgba(6,182,212,0.15)]"
                      : "border-zinc-800 bg-zinc-900 text-zinc-400 hover:border-zinc-700"
                  }`}
                >
                  <User className={`w-5 h-5 ${role === "customer" ? "text-cyan-400" : ""}`} />
                  <div className="text-left">
                    <p className="font-medium text-sm">Buy Tickets</p>
                    <p className="text-xs text-zinc-500">Customer</p>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setRole("organiser")}
                  className={`flex items-center gap-3 p-4 rounded-xl border transition-all duration-200 ${
                    role === "organiser"
                      ? "border-cyan-500 bg-cyan-500/10 text-white shadow-[0_0_15px_rgba(6,182,212,0.15)]"
                      : "border-zinc-800 bg-zinc-900 text-zinc-400 hover:border-zinc-700"
                  }`}
                >
                  <Briefcase className={`w-5 h-5 ${role === "organiser" ? "text-cyan-400" : ""}`} />
                  <div className="text-left">
                    <p className="font-medium text-sm">Host Events</p>
                    <p className="text-xs text-zinc-500">Organiser</p>
                  </div>
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="register-email" className="text-sm font-medium text-zinc-400">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 h-4 w-4 text-zinc-500" aria-hidden="true" />
                <input
                  id="register-email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-11 pr-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="register-password" className="text-sm font-medium text-zinc-400">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 h-4 w-4 text-zinc-500" aria-hidden="true" />
                <input
                  id="register-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-11 pr-12 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                  placeholder="Minimum 6 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-3.5 text-zinc-500 hover:text-zinc-300 transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm" role="alert">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-xl font-semibold flex justify-center items-center gap-2 transition-all duration-200
                bg-white text-black hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed
                shadow-[0_0_20px_rgba(255,255,255,0.05)] hover:shadow-[0_0_30px_rgba(255,255,255,0.1)]"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  Create Account
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-zinc-500">
              Already have an account?{" "}
              <Link href="/auth/login" className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
