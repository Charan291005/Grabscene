"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BrandLogo } from "@/components/BrandLogo";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { LogIn, Loader2, Mail, Lock, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitLogin(email, password);
  };

  const submitLogin = async (loginEmail: string, loginPass: string) => {
    setIsLoading(true);
    setError(null);

    const { error: authError } = await supabaseBrowser.auth.signInWithPassword({
      email: loginEmail,
      password: loginPass,
    });

    if (authError) {
      setError(authError.message);
      setIsLoading(false);
      return;
    }

    router.push("/");
    router.refresh();
  };

  const handleDemoLogin = (role: 'admin' | 'organiser' | 'customer') => {
    const creds = {
      admin: { e: 'admin@grabscene.app', p: 'test1234' },
      organiser: { e: 'organiser@grabscene.app', p: 'test1234' },
      customer: { e: 'customer1@example.com', p: 'test1234' }
    };
    setEmail(creds[role].e);
    setPassword(creds[role].p);
    submitLogin(creds[role].e, creds[role].p);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans overflow-hidden">
      {/* Background accents — slow floating drift */}
      <div
        className="fixed inset-0 pointer-events-none"
        aria-hidden="true"
      >
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-bms-red/[0.07] rounded-full blur-[120px] animate-floatSlow" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-bms-navy/[0.05] rounded-full blur-[100px] animate-floatSlow" style={{ animationDelay: '3s' }} />
      </div>

      <div className={`w-full max-w-md relative z-10 ${mounted ? 'animate-fadeInUp' : 'opacity-0'}`}>
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <BrandLogo compact />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Welcome back</h1>
          <p className="text-slate-500 mt-2">Sign in to your GrabScene account</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-2xl">
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2 input-focus-line">
              <label htmlFor="login-email" className="text-sm font-medium text-slate-500">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" aria-hidden="true" />
                <input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-bms-red focus:ring-1 focus:ring-bms-red transition-all duration-300"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div className="space-y-2 input-focus-line">
              <label htmlFor="login-password" className="text-sm font-medium text-slate-500">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" aria-hidden="true" />
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-12 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-bms-red focus:ring-1 focus:ring-bms-red transition-all duration-300"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-3.5 text-slate-400 hover:text-slate-600 transition-colors duration-300"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-sm animate-shake" role="alert">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-xl font-semibold flex justify-center items-center gap-2 transition-all duration-300 btn-shimmer btn-press
                bg-bms-red text-white hover:bg-bms-red-hover disabled:opacity-50 disabled:cursor-not-allowed
                shadow-sm hover:shadow-[0_6px_20px_rgba(248,68,100,0.3)] hover:scale-[1.02]"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  Sign In
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-500">
              Don&apos;t have an account?{" "}
              <Link href="/auth/register" className="text-bms-red hover:text-bms-red-hover font-medium transition-colors">
                Create one
              </Link>
            </p>
          </div>
          <div className="mt-8 pt-6 border-t border-slate-200">
            <p className="text-center text-sm font-medium text-slate-500 mb-4">
              Judge Evaluation (1-Click Logins)
            </p>
            <div className="flex flex-col gap-3">
              {[
                { role: 'customer' as const, label: 'Login as Demo Customer' },
                { role: 'organiser' as const, label: 'Login as Demo Organiser' },
                { role: 'admin' as const, label: 'Login as Demo Admin' },
              ].map(({ role, label }, idx) => (
                <button
                  key={role}
                  onClick={() => handleDemoLogin(role)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 transition-all duration-300 hover:scale-[1.02] btn-press animate-fadeInUp"
                  style={{ animationDelay: `${0.5 + idx * 0.1}s` }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          Demo mode: Use any seeded email (e.g. customer1@example.com) or register a new account.
        </p>
      </div>
    </div>
  );
}
