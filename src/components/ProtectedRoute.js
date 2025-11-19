import { useContext, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
    const { token, ensureValidToken } = useContext(AuthContext);
    const [allowed, setAllowed] = useState(null);

    useEffect(() => {
        const check = async () => {
            let jwtToken = token;
            if (!jwtToken) {
                const storedToken = localStorage.getItem("token");
                if (storedToken) jwtToken = storedToken;
            }

            const valid = await ensureValidToken(jwtToken);
            setAllowed(valid);
        };

        check();
    }, [token]);

    if (allowed === null) return <div>Loading...</div>;
    if (!allowed) return <Navigate to="/login" replace />;

    return children;
}
