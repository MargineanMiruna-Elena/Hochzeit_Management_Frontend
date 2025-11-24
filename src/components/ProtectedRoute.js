import { useContext, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
    const ctx = useContext(AuthContext);
    const [allowed, setAllowed] = useState(null);

    useEffect(() => {
        let active = true;
        const check = async () => {
            // If context missing, mark as not allowed.
            if (!ctx) {
                if (active) setAllowed(false);
                return;
            }
            const { token, ensureValidToken } = ctx;
            let jwtToken = token || localStorage.getItem("token");
            // ensureValidToken already reads from context token; ignore parameter.
            const valid = await ensureValidToken();
            if (active) setAllowed(!!valid);
        };
        check();
        return () => { active = false; };
    }, [ctx]);

    if (allowed === null) return <div>Loading...</div>;
    if (!allowed) return <Navigate to="/login" replace />;
    return children;
}
