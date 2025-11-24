import {Button, Input, Typography} from "@material-tailwind/react";
import {Link, useNavigate} from "react-router-dom";
import React, {useEffect, useState} from "react";

function ChangePassword() {
    const [user, setUser] = useState({});
    const [oldPassword, setOldPassword] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errors, setErrors] = useState({oldPassword: '', password: '', backend: ''});
    const navigate = useNavigate();

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
        }
    }, []);

    const validateField = (name, value) => {
        let message = '';

        if (name === 'oldPassword') {
            if (!value) message = 'Old password is required.';
            else if (value.length < 6) message = 'Password must be at least 6 characters.';
        }

        if (name === 'password') {
            if (!value) message = 'New password is required.';
            else if (value.length < 6) message = 'Password must be at least 6 characters.';
        }

        if (name === 'confirmPassword') {
            if (!value) message = 'Password confirmation is required.';
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

    const comparePasswords = (pass, confPass) => {
        let message = '';

        if (pass !== confPass) {
            message = 'Passwords do not match.'
        }

        setErrors(prev => ({...prev, confirmPassword: message}));
        return !message;
    }

    const handleChange = (e) => {
        const {name, value} = e.target;

        if (name === 'oldPassword') setOldPassword(value);
        if (name === 'password') setPassword(value);
        if (name === 'confirmPassword') setConfirmPassword(value);
    };

    const handleBlur = (e) => {
        const {name, value} = e.target;
        validateField(name, value);

        if (name === "confirmPassword" || name === "password") {
            comparePasswords(password, confirmPassword);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const isOldPasswardValid = validateField('oldPassword', oldPassword);
        const isPasswordValid = validateField('password', password);
        const isConfirmPasswordValid = validateField('confirmPassword', confirmPassword);
        const arePasswordsEqual = comparePasswords(password, confirmPassword);

        if (!isOldPasswardValid || !isPasswordValid || !isConfirmPasswordValid) return;

        if (!arePasswordsEqual) return;

        try {
            const res = await fetch(`http://localhost:8080/api/auth/change-password/${user.id}`, {
                method: "PUT",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({ oldPassword: oldPassword, newPassword: password }),
            });


            if (res.ok) {
                navigate("/profile", {replace: true});
            } else {
                const data = await res.json();
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
                    Change password
                </Typography>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4 w-full relative">
                        <Input
                            type="password"
                            label="Old Password"
                            name="oldPassword"
                            value={oldPassword}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            required
                        />
                        <Typography className="text-sm h-5 mt-1 ml-2 text-pink-600">
                            {errors.oldPassword || " "}
                        </Typography>
                    </div>

                    <div className="mb-4 w-full relative">
                        <Input
                            type="password"
                            label="New Password"
                            name="password"
                            value={password}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            required
                        />
                        <Typography className="text-sm h-5 mt-1 ml-2 text-pink-600">
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
                        <Typography className="text-sm h-5 mt-1 ml-2 text-pink-600">
                            {errors.confirmPassword || " "}
                        </Typography>
                    </div>

                    <Typography className="text-sm min-h-5 mt-1 ml-2 text-pink-600">
                        {errors.backend || " "}
                    </Typography>

                    <Button type="submit" className="mt-4 bg-pink-600" fullWidth>
                        Change password
                    </Button>
                </form>
            </div>
        </div>
    );
}

export default ChangePassword;