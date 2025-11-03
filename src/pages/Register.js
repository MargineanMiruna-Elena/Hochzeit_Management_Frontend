import React, { useState } from 'react';
import { Button, Input, Typography } from "@material-tailwind/react";
import { Link } from 'react-router-dom';

function Register() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');

        const { name, email, password, confirmPassword } = formData;

        if (!name || !email || !password || !confirmPassword) {
            setError('Please fill in all fields.');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        // TODO: Add registration logic (API call)
        console.log('Registered:', formData);
    };

    return (
        <div style={{ maxWidth: 400, margin: '50px auto', padding: 20, border: '1px solid #ccc', borderRadius: 8 }}>
            <Typography variant="h3" className="my-8 text-center">
                Sign Up
            </Typography>
            <form onSubmit={handleSubmit}>
                <div className="mb-6 w-full">
                    <Input
                        name="name"
                        label="Full Name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="mb-6 w-full">
                    <Input
                        type="email"
                        name="email"
                        label="Email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="mb-6 w-full">
                    <Input
                        type="password"
                        name="password"
                        label="Password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="mb-6 w-full">
                    <Input
                        type="password"
                        name="confirmPassword"
                        label="Confirm Password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                    />
                </div>

                {error && (
                    <Typography color="red" className="text-center mb-4 text-sm">
                        {error}
                    </Typography>
                )}

                <Button type="submit" className="mt-4" fullWidth>
                    Register
                </Button>

                <Typography color="gray" className="mt-4 text-center font-normal">
                    Already have an account?{" "}
                    <Link to="/login" className="font-medium text-gray-900">
                        Log in.
                    </Link>
                </Typography>
            </form>
        </div>
    );
}

export default Register;
