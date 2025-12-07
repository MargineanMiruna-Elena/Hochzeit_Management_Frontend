import { createContext, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("user")) || null);
    const [token, setToken] = useState(() => localStorage.getItem("token"));
    const [refreshToken, setRefreshToken] = useState(() => localStorage.getItem("refreshToken"));
    const [loading, setLoading] = useState(true);
    const location = useLocation();

    const isInvitationPage = location.pathname === '/invitation';

    useEffect(() => {
        if (!isInvitationPage && token) {
            localStorage.setItem("token", token);
        }
        if (!isInvitationPage && refreshToken) {
            localStorage.setItem("refreshToken", refreshToken);
        }
    }, [token, refreshToken, isInvitationPage]);

    useEffect(() => {
        if (isInvitationPage) {
            setLoading(false);
            return;
        }
        
        if (user) localStorage.setItem("user", JSON.stringify(user));
    }, [user, isInvitationPage]);

    const logout = () => {
        if (isInvitationPage) return; 
        
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        setToken(null);
        setRefreshToken(null);
        setUser(null);
    };

    const refreshJwt = async () => {
        if (isInvitationPage) return null; 
        
        if (!refreshToken) {
            logout();
            return null;
        }
        try {
            const res = await fetch("http://localhost:8080/api/auth/refresh", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ refreshToken }),
            });
            if (!res.ok) {
                logout();
                return null;
            }
            const data = await res.json();
            setToken(data.token);
            setRefreshToken(data.refreshToken);
            return data.token;
        } catch (err) {
            logout();
            return null;
        }
    };

    const ensureValidToken = async () => {
        if (isInvitationPage) {
            return null;
        }
        
        if (!token) return null;
        
        try {
            const test = await fetch("http://localhost:8080/api/auth/validate", {
                headers: { Authorization: `Bearer ${token}` },
            });
            
            if (test.status === 401) {
                return await refreshJwt();
            }
            return token;
        } catch (error) {
            console.error("Token validation failed:", error);
            return null;
        }
    };

    useEffect(() => {
        setLoading(false);
    }, []);

    return (
        <AuthContext.Provider value={{ 
            user, 
            setUser, 
            token, 
            setToken, 
            refreshToken, 
            setRefreshToken, 
            logout, 
            ensureValidToken,
            isInvitationPage 
        }}>
            {!loading && children}
        </AuthContext.Provider>
    );
}