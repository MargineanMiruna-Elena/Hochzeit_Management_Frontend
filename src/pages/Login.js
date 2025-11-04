import React, { useState } from 'react';
import { Button, Input, Typography } from "@material-tailwind/react";
import { Link, useNavigate } from 'react-router-dom';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState({ email: '', password: '', backend: '' });
    const navigate = useNavigate();

    const validateField = (name, value) => {
        let message = '';

        if (name === 'email') {
            if (!value) message = 'Email is required.';
            else if (!/\S+@\S+\.\S+/.test(value)) message = 'Invalid email address.';
        }

        if (name === 'password') {
            if (!value) message = 'Password is required.';
            else if (value.length < 6) message = 'Password must be at least 6 characters.';
        }

        setErrors(prev => ({ ...prev, [name]: message }));
        return !message;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === 'email') setEmail(value);
        if (name === 'password') setPassword(value);

        validateField(name, value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const isEmailValid = validateField('email', email);
        const isPasswordValid = validateField('password', password);

        if (!isEmailValid || !isPasswordValid) return;

        try {
            const res = await fetch("http://localhost:8080/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();
            if (res.ok) {
                localStorage.setItem("user", JSON.stringify({
                    id: data.id,
                    name: data.name,
                    email: data.email
                }));
                navigate("/home", { replace: true });
            } else {
                let message;
                switch (data.status || res.status) {
                    case 400:
                        message = "Bad request. Please check your input.";
                        break;
                    case 401:
                        message = "Invalid email or password.";
                        break;
                    case 403:
                        message = "You don't have permission to access this resource.";
                        break;
                    case 404:
                        message = "Server endpoint not found. Contact support.";
                        break;
                    case 500:
                        message = "Internal server error. Please try again later.";
                        break;
                    default:
                        message = data.message || data.error || "An unexpected error occurred.";
                }

                setErrors(prev => ({ ...prev, backend: message }));
            }
        } catch (err) {
            console.error("Network error:", err);
            setErrors(prev => ({ ...prev, backend: "Cannot connect to server." }));
        }
    };

    return (
        <div style={{ maxWidth: 400, margin: '50px auto', padding: 20, border: '1px solid #ccc', borderRadius: 8 }}>
            <Typography variant="h3" className="my-8 text-center">
                Log in
            </Typography>
            <form onSubmit={handleSubmit}>
                <div className="mb-4 w-full relative">
                    <Input
                        type="email"
                        label="Email"
                        name="email"
                        value={email}
                        onChange={handleChange}
                        required
                    />
                    <Typography color="red" className="text-sm h-5 mt-1 ml-2">
                        {errors.email || " "}
                    </Typography>
                </div>

                <div className="mb-4 w-full relative">
                    <Input
                        type="password"
                        label="Password"
                        name="password"
                        value={password}
                        onChange={handleChange}
                        required
                    />
                    <Typography color="red" className="text-sm h-5 mt-1 ml-2">
                        {errors.password || " "}
                    </Typography>
                </div>

                {errors.backend && (
                    <Typography color="red" className="text-sm h-5 mt-1 ml-2">
                        {errors.backend}
                    </Typography>
                )}

                <Button type="submit" className="mt-4" fullWidth>
                    Log in
                </Button>

                <Typography color="gray" className="mt-4 text-center font-normal">
                    Don’t have an account?{" "}
                    <Link to="/register" className="font-medium text-gray-900">
                        Sign up.
                    </Link>
                </Typography>
            </form>
        </div>
    );
}

export default Login;
