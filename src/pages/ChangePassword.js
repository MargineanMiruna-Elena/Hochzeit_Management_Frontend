import {Button, Input, Typography} from "@material-tailwind/react";
import {Link, useNavigate} from "react-router-dom";
import React, {useState} from "react";

function ChangePassword() {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
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

        if (name === 'confirmPassword') {
            if (!value) message = 'Password confirmation is required.';
            else if (value.length < 6) message = 'Password must be at least 6 characters.';
        }

        setErrors(prev => ({ ...prev, [name]: message }));
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

        setErrors(prev => ({ ...prev, backend: message }));
    }

    const comparePasswords = (pass, confPass) => {
        let message = '';

        if (pass !== confPass) {
            message = 'Passwords do not match.'
        }

        setErrors(prev => ({ ...prev, confirmPassword: message }));
        return !message;
    }

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === 'email') setEmail(value);
        if (name === 'password') setPassword(value);
        if (name === 'confirmPassword') setConfirmPassword(value);
    };

    const handleBlur = (e) => {
        const { name, value } = e.target;
        validateField(name, value);

        if (name === "confirmPassword" || name === "password") {
            comparePasswords(password, confirmPassword);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const isEmailValid = validateField('email', email);
        const isPasswordValid = validateField('password', password);
        const isConfirmPasswordValid = validateField('confirmPassword', confirmPassword);
        const arePasswordsEqual = comparePasswords(password, confirmPassword);

        if (!isEmailValid || !isPasswordValid || !isConfirmPasswordValid) return;

        if (!arePasswordsEqual) return;

        try {
            const res = await fetch("http://localhost:8080/api/auth/change_password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();
            if (res.ok) {
                navigate("/login", { replace: true });
            } else {
                backendErrorMessage(data, res);
            }
        } catch (err) {
            console.error("Network error:", err);
            setErrors(prev => ({ ...prev, backend: "Cannot connect to server." }));
        }
    };

    return (
        <div style={{ maxWidth: 400, margin: '50px auto', padding: 20, border: '1px solid #ccc', borderRadius: 8 }}>
            <Typography variant="h3" className="my-8 text-center">
                Change password
            </Typography>
            <form onSubmit={handleSubmit}>
                <div className="mb-4 w-full relative">
                    <Input
                        type="email"
                        label="Email"
                        name="email"
                        value={email}
                        onChange={handleChange}
                        onBlur={handleBlur}
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
                        onBlur={handleBlur}
                        required
                    />
                    <Typography color="red" className="text-sm h-5 mt-1 ml-2">
                        {errors.password || " "}
                    </Typography>
                </div>

                <div className="mb-4 w-full relative">
                    <Input
                        type="password"
                        label="Confirm Password"
                        name="confirmPassword"
                        value={confirmPassword}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        required
                    />
                    <Typography color="red" className="text-sm h-5 mt-1 ml-2">
                        {errors.confirmPassword || " "}
                    </Typography>
                </div>

                <Typography color="red" className="text-sm min-h-5 mt-1 ml-2">
                    {errors.backend || " "}
                </Typography>

                <Button type="submit" className="mt-4" fullWidth>
                    Change password
                </Button>
            </form>
        </div>
    );
}

export default ChangePassword;