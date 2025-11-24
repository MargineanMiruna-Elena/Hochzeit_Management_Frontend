import React, {useState} from "react";
import {Button} from "@material-tailwind/react";
import {UserCircleIcon} from "@heroicons/react/24/solid";
import {Link, useNavigate} from "react-router-dom";
import {BellIcon} from "@heroicons/react/16/solid";

export default function DashboardHeader() {
    const navigate = useNavigate();
    const [active, setActive] = useState(false);

    return (
        <header
            className="w-full flex items-center justify-between whitespace-nowrap border-b border-solid border-gray-200 px-6 py-4 rounded-xl bg-white shadow-sm">
            <div className="flex items-center gap-4 text-gray-900">
                <img src={"/assets/logo.svg"} alt="EverAfter Planner" className="w-8 h-8" />
                <Link to="/home" className="text-xl font-bold leading-tight tracking-tight hover:text-pink-600">
                    EverAfter Planner
                </Link>
            </div>
            <div className="flex items-center gap-4">
                <Button
                    variant="filled"
                    size="sm"
                    className={`h-10 w-10 p-0 rounded-full flex items-center justify-center ${active ? "bg-gray-200 hover:bg-gray-400" : "bg-pink-600 hover:bg-pink-700"} `}
                    aria-label="Notifications"
                    onClick={() => setActive(!active)}
                >
                    <BellIcon className={`w-5 h-5 ${active ? "text-pink-600" : "text-white"}`} />
                </Button>
                <Button
                    variant="filled"
                    color="pink"
                    size="sm"
                    className="h-10 w-10 p-0 rounded-full flex items-center justify-center hover:bg-pink-700"
                    aria-label="Profile"
                    onClick={() => navigate("/profile", {replace: true})}
                >
                    <UserCircleIcon className="w-8 h-8 text-white"/>
                </Button>
            </div>
        </header>
    );
}
