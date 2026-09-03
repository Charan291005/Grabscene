"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";
import type { User, Session } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: { id: string; email: string; role: string } | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  profile: null,
  isLoading: true,
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ 
  children,
  initialSession = null,
  initialProfile = null
}: { 
  children: React.ReactNode;
  initialSession?: Session | null;
  initialProfile?: AuthContextType["profile"] | null;
}) {
  const [user, setUser] = useState<User | null>(initialSession?.user ?? null);
  const [session, setSession] = useState<Session | null>(initialSession);
  const [profile, setProfile] = useState<AuthContextType["profile"]>(initialProfile);
  const [isLoading, setIsLoading] = useState(false); // Initial state is now ready from server

  const fetchProfile = async (userId: string) => {
    const { data } = await supabaseBrowser
      .from("profiles")
      .select("id, email, role")
      .eq("id", userId)
      .single();

    if (data) {
      setProfile(data);
    }
  };

  useEffect(() => {
    // Only fetch if no initial session was provided (fallback)
    if (!initialSession) {
      setIsLoading(true);
      supabaseBrowser.auth.getSession().then(({ data: { session: s } }) => {
        setSession(s);
        setUser(s?.user ?? null);
        if (s?.user) {
          fetchProfile(s.user.id);
        }
        setIsLoading(false);
      });
    }

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabaseBrowser.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) {
        fetchProfile(s.user.id);
      } else {
        setProfile(null);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [initialSession]);



  const signOut = async () => {
    await supabaseBrowser.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, profile, isLoading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
