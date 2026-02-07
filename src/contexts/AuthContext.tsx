import { createContext, useContext, useState, ReactNode } from "react";

type UserRole = "admin" | "user";

interface User {
  email: string;
  name: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

const DEMO_USERS = [
  { email: "admin@admin.com", password: "admin123", name: "Admin", role: "admin" as UserRole },
  { email: "user@user.com", password: "user123", name: "Usuário", role: "user" as UserRole },
];

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = (email: string, password: string): boolean => {
    const found = DEMO_USERS.find(u => u.email === email && u.password === password);
    if (found) {
      setUser({ email: found.email, name: found.name, role: found.role });
      return true;
    }
    return false;
  };

  const logout = () => setUser(null);

  const value = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === "admin",
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
