import {
  useContext,
  createContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import type { AuthResponse, User } from "../Types/types";
import { API_URL } from "../Auth/ApiURL";

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext({
  isAuthenticated: false,
  getAccessToken: () => {},
  saveUser: (userData: AuthResponse) => {},
  user: null as User | null,
  signOut: () => {},
});

export default function AuthProvider({ children }: AuthProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [accessToken, setAccessToken] = useState<string>("");
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      const response = await fetch(`${API_URL}/refresh-token`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (response.ok) {
        const json = (await response.json()) as AuthResponse;
        saveUser(json);
      }
    } catch (error) {
      console.error("Error verifying session:", error);
    } finally {
      setIsLoading(false);
    }
  }

  function getAccessToken() {
    return accessToken;
  }

  function saveUser(userData: AuthResponse) {
    setAccessToken(userData.body.accessToken);
    setUser(userData.body.user);
    setIsAuthenticated(true);
  }

  async function signOut() {
    try {
      const response = await fetch(`${API_URL}/signout`, {
        method: "DELETE",
        credentials: "include",
      });

      if (response.ok) {
        // Limpiamos todo el estado de React
        setIsAuthenticated(false);
        setAccessToken("");
        setUser(null);
      }
    } catch (error) {
      console.error("Error logging out:", error);
    }
  }

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, saveUser, getAccessToken, user, signOut }}
    >
      {isLoading ? <div>Cargando sesión...</div> : children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
