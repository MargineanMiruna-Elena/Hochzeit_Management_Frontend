import React, {useState} from 'react';
import {Button, Input, Typography} from "@material-tailwind/react";
import {Link, useNavigate} from 'react-router-dom';

function Register() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [errors, setErrors] = useState({ name: '', email: '', password: '', confirmPassword: '', backend: '' });
    const navigate = useNavigate();

    const validateField = (name, value) => {
        let message = '';

        if (name === 'name' && !value) {
            message = 'Name is required.';
        }

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

    const comparePasswords = (pass, confPass) => {
        let message = '';

        if (pass !== confPass) {
            message = 'Passwords do not match.'
        }

        setErrors(prev => ({ ...prev, confirmPassword: message }));
        return !message;
    }

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

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleBlur = (e) => {
        const { name, value } = e.target;
        validateField(name, value);

        if (name === "confirmPassword" || name === "password") {
            comparePasswords(formData.password, formData.confirmPassword);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const {name, email, password, confirmPassword} = formData;
        const isNameValid = validateField("name", name);
        const isEmailValid = validateField("email", email);
        const isPasswordValid = validateField("password", password);
        const isConfirmPasswordvalid = validateField("confirmPassword", confirmPassword);
        const arePasswordsEqual = comparePasswords(password, confirmPassword);

        if (!isNameValid || !isEmailValid || !isPasswordValid || !isConfirmPasswordvalid) {
            return;
        }

        if (!arePasswordsEqual) {
            return;
        }

        try {
            const res = await fetch("http://localhost:8080/api/auth/register", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({name, email, password}),
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
            setErrors(prev => ({ ...prev, backend: "Cannot connect to server." }));
        }
    };

    return (
        <div style={{maxWidth: 400, margin: '50px auto', padding: 20, border: '1px solid #ccc', borderRadius: 8}}>
            <Typography variant="h3" className="my-8 text-center">
                Sign Up
            </Typography>
            <form onSubmit={handleSubmit}>
                <div className="mb-4 w-full relative">
                    <Input
                        name="name"
                        label="Full Name"
                        value={formData.name}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        required
                    />
                    <Typography className="text-sm h-5 mt-1 ml-2 text-pink-600">
                        {errors.name || " "}
                    </Typography>
                </div>
                <div className="mb-4 w-full relative">
                    <Input
                        type="email"
                        name="email"
                        label="Email"
                        value={formData.email}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        required
                    />
                    <Typography className="text-sm h-5 mt-1 ml-2 text-pink-600">
                        {errors.email || " "}
                    </Typography>
                </div>
                <div className="mb-6 w-full">
                    <Input
                        type="password"
                        name="password"
                        label="Password"
                        value={formData.password}
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
                        name="confirmPassword"
                        label="Confirm Password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        required
                    />
                    <Typography className="text-sm h-5 mt-1 ml-2 text-pink-600">
                        {errors.confirmPassword || " "}
                    </Typography>
                </div>

                <Typography className="text-sm h-5 mt-1 ml-2 text-pink-600">
                    {errors.backend || " "}
                </Typography>

                <Button type="submit" className="mt-4 bg-pink-600" fullWidth>
                    Register
                </Button>

                <Typography color="gray" className="mt-4 text-center font-normal">
                    Already have an account?{" "}
                    <Link to="/login" className="font-medium text-pink-600">
                        Log in.
                    </Link>
                </Typography>
            </form>
        </div>
    );
}

export default Register;
