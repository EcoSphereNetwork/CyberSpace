import React, { createContext, useContext, useState } from "react";

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: {
    id: "1",
    name: "Test User",
    email: "test@example.com",
  },
  login: async () => {},
  logout: async () => {},
});

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>({
    id: "1",
    name: "Test User",
    email: "test@example.com",
  });

  const login = async (email: string, password: string) => {
    // Mock login implementation
    setUser({
      id: "1",
      name: "Test User",
      email: email,
    });
  };

  const logout = async () => {
    // Mock logout implementation
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
