import { createContext, useContext, useMemo, useState } from "react";
import api from "../services/api";
const AuthContext = createContext(null);
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(JSON.parse(sessionStorage.getItem("hometutor_user") || "null"));
  const login = async (payload, isAdmin = false) => {
    const { data } = await api.post(isAdmin ? "/auth/admin/login" : "/auth/login", payload);
    sessionStorage.setItem("hometutor_token", data.token);
    sessionStorage.setItem("hometutor_user", JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };
  const register = async (payload) => {
    const { data } = await api.post("/auth/register", payload);
    sessionStorage.setItem("hometutor_token", data.token);
    sessionStorage.setItem("hometutor_user", JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };
  const logout = () => { sessionStorage.removeItem("hometutor_token"); sessionStorage.removeItem("hometutor_user"); setUser(null); };
  const value = useMemo(() => ({ user, login, register, logout }), [user]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
export const useAuth = () => useContext(AuthContext);
