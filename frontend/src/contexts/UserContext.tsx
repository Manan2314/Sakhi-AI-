import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { apiFetch, endpoints } from "@/lib/api";

export interface User {
  id: number;
  name: string;
  username: string;
  preferences: string[];
  contacts?: Array<{ name: string; phone: string }>;
}

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  loading: boolean;
  isLoggedIn: boolean;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async (id: number) => {
    try {
      const data = await apiFetch(endpoints.getUser(id));
      setUser(data);
    } catch (err) {
      console.error("Failed to fetch user", err);
      localStorage.removeItem("sakhi_user_id");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const savedId = localStorage.getItem("sakhi_user_id");
    if (savedId) {
      fetchUser(parseInt(savedId));
    } else {
      setLoading(false);
    }
  }, [fetchUser]);

  const logout = () => {
    setUser(null);
    localStorage.removeItem("sakhi_user_id");
  };

  return (
    <UserContext.Provider value={{ user, setUser, loading, isLoggedIn: !!user, logout }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
