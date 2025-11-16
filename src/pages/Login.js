import React, {useState} from 'react';
import {Button, Input, Typography} from "@material-tailwind/react";
import {Link, useNavigate} from 'react-router-dom';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState({email: '', password: '', backend: ''});
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

        setErrors(prev => ({...prev, [name]: message}));
        return !message;
    };

    const backendErrorMessage = (data, res) => {
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

        setErrors(prev => ({...prev, backend: message}));
    }

    const handleChange = (e) => {
        const {name, value} = e.target;

        if (name === 'email') setEmail(value);
        if (name === 'password') setPassword(value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const isEmailValid = validateField('email', email);
        const isPasswordValid = validateField('password', password);

        if (!isEmailValid || !isPasswordValid) return;

        try {
            const res = await fetch("http://localhost:8080/api/auth/login", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({email, password}),
            });

            const data = await res.json();
            if (res.ok) {
                localStorage.setItem("user", JSON.stringify({
                    id: data.id,
                    name: data.name,
                    email: data.email
                }));
                navigate("/home", {replace: true});
            } else {
                backendErrorMessage(data, res);
            }
        } catch (err) {
            console.error("Network error:", err);
            setErrors(prev => ({...prev, backend: "Cannot connect to server."}));
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <div className="w-full max-w-md p-6 border border-gray-300 rounded-lg bg-white shadow-md">
                <Typography variant="h3" className="my-8 text-center font-bold text-4xl font-black leading-tight tracking-tight min-w-72 text-gray-900">
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
                            onBlur={(e) => validateField(e.target.name, e.target.value)}
                            required
                        />
                        <Typography className="text-sm h-5 mt-1 ml-2 text-pink-600">
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
                            onBlur={(e) => validateField(e.target.name, e.target.value)}
                            required
                        />
                        <Typography className="text-sm h-5 mt-1 ml-2 text-pink-600">
                            {errors.password || " "}
                        </Typography>
                    </div>

                    <Typography className="text-sm h-5 mt-1 ml-2 text-pink-600">
                        {errors.backend || " "}
                    </Typography>

                    <Button type="submit" className="mt-4 bg-pink-600" fullWidth>
                        Log in
                    </Button>

                    <Typography color="gray" className="mt-4 text-center font-normal">
                        Don’t have an account?{" "}
                        <Link to="/register" className="font-medium text-pink-600">
                            Sign up.
                        </Link>
                    </Typography>
                </form>
            </div>
        </div>
    );
}

export default Login;
