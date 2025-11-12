import React, {useEffect, useState} from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@material-tailwind/react";
import "./App.css";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import ProtectedRoute from "./ProtectedRoute";
import ChangePassword from "./pages/ChangePassword";

function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const user = localStorage.getItem("user");
        setIsLoggedIn(!!user);
    }, []);

    return (
        <ThemeProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route
                        path="/changePassword"
                        element={
                            <ProtectedRoute isLoggedIn={isLoggedIn}>
                                <ChangePassword />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/profile"
                        element={
                            <ProtectedRoute isLoggedIn={isLoggedIn}>
                                <Profile />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/home"
                        element={
                            <ProtectedRoute isLoggedIn={isLoggedIn}>
                                <Home />
                            </ProtectedRoute>
                        }
                    />
                    <Route path="*" element={<Navigate to={isLoggedIn ? "/home" : "/login"} />} />
                </Routes>
            </BrowserRouter>
        </ThemeProvider>
    );
}

export default App;