import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@material-tailwind/react";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import ChangePassword from "./pages/ChangePassword";
import EventDetails from "./pages/EventDetails";
import CreateEvent from "./pages/CreateEvent";

import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import Invitation from "./pages/Invitation";

function App() {
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
                    <Route
                        path="/events/:id"
                        element={
                            <ProtectedRoute isLoggedIn={isLoggedIn}>
                                <EventDetails />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/events/new"
                        element={
                            <ProtectedRoute isLoggedIn={isLoggedIn}>
                                <CreateEvent />
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
