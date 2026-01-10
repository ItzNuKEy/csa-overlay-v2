import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { DiscordUser } from "../types/global.t";

interface AuthContextType {
  user: DiscordUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: () => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<DiscordUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load saved user from localStorage on mount and verify access
  useEffect(() => {
    const checkSavedUser = async () => {
      const savedUser = localStorage.getItem("discord_user");
      if (savedUser) {
        try {
          const parsed = JSON.parse(savedUser);
          
          // Verify user still has access
          const stillHasAccess = await window.auth?.isUserAllowed?.(parsed.id);
          
          if (stillHasAccess) {
            // User still has access, keep them logged in
            setUser(parsed);
          } else {
            // User no longer has access, log them out
            console.log("User no longer has access, logging out");
            localStorage.removeItem("discord_user");
            setUser(null);
          }
        } catch (err) {
          console.error("Failed to parse or verify saved user:", err);
          localStorage.removeItem("discord_user");
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    checkSavedUser();
  }, []);

  const login = async () => {
    try {
      setIsLoading(true);
      const result = await window.auth?.login();
      
      if (result?.success && result.user) {
        setUser(result.user);
        localStorage.setItem("discord_user", JSON.stringify(result.user));
      } else {
        throw new Error(result?.error || "Authentication failed");
      }
    } catch (error: any) {
      console.error("Login error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("discord_user");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
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

