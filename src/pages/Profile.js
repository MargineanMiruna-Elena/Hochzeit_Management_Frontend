import React, {useEffect, useState} from "react";
import DashboardHeader from "../components/DashboardHeader";
import {
    Button, Card, CardBody, CardHeader, Input, Typography,
} from "@material-tailwind/react";
import {Link, useNavigate} from "react-router-dom";
import {
    ArrowRightStartOnRectangleIcon, CheckIcon, EnvelopeIcon, KeyIcon, PencilIcon, XMarkIcon,
} from "@heroicons/react/16/solid";
import {UserCircleIcon} from "@heroicons/react/24/solid";

function Profile() {
    const [user, setUser] = useState({});
    const [form, setForm] = useState({name: "", email: ""});
    const [errors, setErrors] = useState({name: "", email: "", backend: ""});
    const [isEditing, setIsEditing] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
            setForm(parsedUser);
        }
    }, []);

    const validateField = (name, value) => {
        let message = "";

        if (name === "name" && !value) {
            message = "Name is required.";
        }

        if (name === "email") {
            if (!value) message = "Email is required."; else if (!/\S+@\S+\.\S+/.test(value)) message = "Invalid email address.";
        }

        setErrors((prev) => ({...prev, [name]: message}));
        return !message;
    };

    const backendErrorMessage = (data, res) => {
        let message;
        switch (data.status || res.status) {
            case 400:
                message = "Bad request. Please check your input.";
                break;
            case 401:
                message = "Unauthorized. Please log in again.";
                break;
            case 404:
                message = "User not found.";
                break;
            case 500:
                message = "Internal server error. Try again later.";
                break;
            default:
                message = data.message || data.error || "An unexpected error occurred.";
        }
        setErrors((prev) => ({...prev, backend: message}));
    };

    const handleChange = (e) => {
        const {name, value} = e.target;
        setForm((prev) => ({...prev, [name]: value}));
        setErrors((prev) => ({...prev, [name]: ""}));
    };

    const handleEditToggle = async (e) => {
        e.preventDefault();

        if (isEditing) {
            const isNameValid = validateField("name", form.name);
            const isEmailValid = validateField("email", form.email);

            if (!isNameValid || !isEmailValid) return;

            try {
                const res = await fetch(`http://localhost:8080/api/users/${user.id}`, {
                    method: "PUT",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify({name: form.name, email: form.email}),
                });

                const data = await res.json();

                if (res.ok) {
                    localStorage.setItem("user", JSON.stringify(data));
                    setUser(data);
                    setIsEditing(false);
                    setErrors({name: "", email: "", backend: ""});
                } else {
                    backendErrorMessage(data, res);
                }
            } catch (err) {
                console.error("Network error:", err);
                setErrors((prev) => ({
                    ...prev, backend: "Cannot connect to server.",
                }));
            }
        } else {
            setIsEditing(true);
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        setForm(user);
        setErrors({name: "", email: "", backend: ""});
    };

    const handleLogout = () => {
        localStorage.removeItem("user");
        navigate("/login", { replace: true });
    };

    return (
        <div className="min-h-screen w-full bg-gray-50">
            <div className="flex flex-col items-center py-5">
                <div className="flex flex-col w-full px-4 sm:px-6 lg:px-8">
                    <DashboardHeader/>

                    <main className="w-full max-w-2xl mx-auto mt-6">
                        <Typography
                            variant="h3"
                            className="mb-6 font-bold text-4xl font-black leading-tight tracking-tight min-w-72 text-gray-900"
                        >
                            Profile
                        </Typography>

                        <Card className="w-full max-w-2xl mx-auto shadow-md">
                            <CardHeader
                                floated={false}
                                shadow={false}
                                className="bg-transparent px-6 pt-6 pb-2"
                            >
                                <Typography variant="h5" color="blue-gray">
                                    Personal Information
                                </Typography>
                                <Typography variant="small" color="gray">
                                    View and manage your profile details
                                </Typography>
                            </CardHeader>

                            <CardBody className="space-y-1 px-6 pb-6">
                                <div>
                                    <Typography
                                        variant="small"
                                        color="gray"
                                        className="flex items-center gap-2 mb-1"
                                    >
                                        <UserCircleIcon className="h-5 w-5 text-pink-600"/>
                                        Name
                                    </Typography>
                                    <Input
                                        name="name"
                                        id="name"
                                        crossOrigin={undefined}
                                        labelProps={{className: "hidden"}}
                                        value={form.name}
                                        onChange={handleChange}
                                        onBlur={(e) => isEditing && validateField(e.target.name, e.target.value)}
                                        disabled={!isEditing}
                                        className={`border ${
                                            !isEditing ? "bg-gray-100 text-gray-500" : "border-pink-600"
                                        }`}
                                    />
                                    <Typography className="text-sm h-5 mt-1 ml-2 text-pink-600">
                                        {errors.name || " "}
                                    </Typography>
                                </div>

                                <div>
                                    <Typography
                                        variant="small"
                                        color="gray"
                                        className="flex items-center gap-2 mb-1"
                                    >
                                        <EnvelopeIcon className="h-5 w-5 text-pink-600"/>
                                        Email
                                    </Typography>
                                    <Input
                                        name="email"
                                        id="email"
                                        crossOrigin={undefined}
                                        labelProps={{className: "hidden"}}
                                        value={form.email}
                                        onChange={handleChange}
                                        onBlur={(e) => isEditing && validateField(e.target.name, e.target.value)}
                                        disabled={!isEditing}
                                        className={`border ${
                                            !isEditing ? "bg-gray-100 text-gray-500" : "border-pink-600"
                                        }`}

                                    />
                                    <Typography className="text-sm h-5 mt-1 ml-2 text-pink-600">
                                        {errors.email || " "}
                                    </Typography>
                                </div>

                                <Typography className="text-sm h-5 ml-2 text-pink-600">
                                    {errors.backend || " "}
                                </Typography>

                                <div className="flex gap-4 pt-2">
                                    {isEditing ? (<>
                                            <Button
                                                fullWidth
                                                color="green"
                                                variant="filled"
                                                className="flex items-center justify-center gap-2"
                                                onClick={handleEditToggle}
                                            >
                                                <CheckIcon className="h-5 w-5"/>
                                                Save
                                            </Button>
                                            <Button
                                                fullWidth
                                                color="red"
                                                variant="outlined"
                                                className="flex items-center justify-center gap-2"
                                                onClick={handleCancel}
                                            >
                                                <XMarkIcon className="h-5 w-5"/>
                                                Cancel
                                            </Button>
                                        </>) : (<>
                                            <Button
                                                fullWidth
                                                color="black"
                                                variant="filled"
                                                className="flex items-center justify-center gap-2"
                                                onClick={handleEditToggle}
                                            >
                                                <PencilIcon className="h-5 w-5"/>
                                                Edit Profile
                                            </Button>

                                            <Link to="/changePassword" className="w-full">
                                                <Button
                                                    fullWidth
                                                    variant="outlined"
                                                    color="black"
                                                    className="flex items-center justify-center gap-2"
                                                >
                                                    <KeyIcon className="h-5 w-5"/>
                                                    Change Password
                                                </Button>
                                            </Link>
                                        </>)}
                                </div>

                                <Button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 bg-pink-600" >
                                    <ArrowRightStartOnRectangleIcon className="h-5 w-5"/>
                                    Log out
                                </Button>
                            </CardBody>
                        </Card>
                    </main>
                </div>
            </div>
        </div>);
}

export default Profile;
