import { createContext, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("user")) || null);
    const [token, setToken] = useState(() => localStorage.getItem("token"));
    const [refreshToken, setRefreshToken] = useState(() => localStorage.getItem("refreshToken"));
    const [loading, setLoading] = useState(true);

    const location = useLocation();
    const navigate = useNavigate();

    const isInvitationPage = location.pathname === '/invitation';

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        setToken(null);
        setRefreshToken(null);
        setUser(null);

        if (!isInvitationPage && location.pathname !== '/login') {
            navigate("/login");
        }
    };

    const refreshJwt = async () => {
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
        if (isInvitationPage || !token) return null;

        const payload = JSON.parse(atob(token.split('.')[1]));
        const isExpired = Date.now() >= payload.exp * 1000;

        if (isExpired) {
            console.log("Token expirat, încercăm refresh...");
            return await refreshJwt();
        }

        return token;
    };

    useEffect(() => {
        if (token) localStorage.setItem("token", token);
        if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
        if (user) localStorage.setItem("user", JSON.stringify(user));
    }, [token, refreshToken, user]);

    useEffect(() => {
        setLoading(false);
    }, []);

    return (
        <AuthContext.Provider value={{
            user, setUser, token, setToken, refreshToken, setRefreshToken,
            logout, ensureValidToken, isInvitationPage
        }}>
            {!loading && children}
        </AuthContext.Provider>
    );
}