import React from "react";
import {CustomNavbar} from "../components/CustomNavbar";

export default function Home() {
    const user = JSON.parse(localStorage.getItem("user"));

    return (
        <div>
            <CustomNavbar/>
            <h1>Welcome, {user?.name}!</h1>
            <p>ID: {user?.id}</p>
            <p>Email: {user?.email}</p>
        </div>
    );
}
