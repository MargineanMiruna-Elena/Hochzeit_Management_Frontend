import { createContext, useEffect, useState } from "react";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("user")) || null);
    const [token, setToken] = useState(() => localStorage.getItem("token"));
    const [refreshToken, setRefreshToken] = useState(() => localStorage.getItem("refreshToken"));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (token) localStorage.setItem("token", token);
        if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
    }, [token, refreshToken]);

    useEffect(() => {
        if (user) localStorage.setItem("user", JSON.stringify(user));
    }, [user]);

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        setToken(null);
        setRefreshToken(null);
        setUser(null);
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
        if (!token) return null;

        const test = await fetch("http://localhost:8080/api/auth/validate", {
            headers: { Authorization: `Bearer ${token}` },
        });

        if (test.status === 401) {
            return await refreshJwt();
        }

        return token;
    };

    useEffect(() => {
        setLoading(false);
    }, []);

    return (
        <AuthContext.Provider value={{ user, setUser, token, setToken, refreshToken, setRefreshToken, logout, ensureValidToken }}>
            {!loading && children}
        </AuthContext.Provider>
    );
}
