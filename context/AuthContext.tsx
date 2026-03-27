"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAdmin: boolean;
  role: string | null;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  const [lastCheckedId, setLastCheckedId] = useState<string | null>(null);
  const router = useRouter();

  const checkUserRole = async (userId: string) => {
    if (lastCheckedId === userId && (isAdmin || role)) return;

    try {
      const { data, error } = await supabase
        .from("admin_users")
        .select("role")
        .eq("id", userId)
        .eq("is_active", true)
        .maybeSingle();

      if (error) {
        console.error("Error fetching user role:", error);
        // On error, default to non-admin
        setIsAdmin(false);
        setRole(null);
      } else if (data) {
        setIsAdmin(true);
        setRole(data.role);
      } else {
        setIsAdmin(false);
        setRole(null);
      }
      setLastCheckedId(userId);
    } catch (error) {
      console.error("Error checking role:", error);
      setIsAdmin(false);
      setRole(null);
    }
  };

  const refreshSession = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        await checkUserRole(session.user.id);
      } else {
        setIsAdmin(false);
        setRole(null);
      }
    } catch (error) {
      console.error("Error refreshing session:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Initial session check
    refreshSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      try {
        if (session?.user) {
          await checkUserRole(session.user.id);
        } else {
          setIsAdmin(false);
          setRole(null);
        }
      } catch (error) {
        console.error("Auth state change error:", error);
      } finally {
        setIsLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      // 1. Clear local application state immediately
      setUser(null);
      setSession(null);
      setIsAdmin(false);
      setRole(null);
      
      // 2. Clear Supabase auth data from localStorage
      Object.keys(localStorage).forEach(key => {
        if (key.includes('supabase.auth.token') || key.startsWith('sb-')) {
          localStorage.removeItem(key);
        }
      });
      
      // 3. Perform official sign out
      await supabase.auth.signOut();
      
      // 4. Force a hard redirect to ensure all memory states are cleared
      window.location.href = "/catalog";
    } catch (error) {
      console.error("Logout error:", error);
      // Fallback redirect
      window.location.href = "/catalog";
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        isAdmin,
        role,
        signOut,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
