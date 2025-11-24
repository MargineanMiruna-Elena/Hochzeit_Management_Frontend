import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import DashboardHeader from "../components/DashboardHeader";

export default function CreateEvent() {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    const [form, setForm] = useState({
        title: "",
        organizer1: "",
        organizer2: "",
        startDate: "",
        endDate: "",
        location: "",
        imageFile: null,
        imagePreview: ""
    });

    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);

    function updateField(name, value) {
        setForm((f) => ({ ...f, [name]: value }));
    }

    function handleFileChange(e) {
        const file = e.target.files?.[0];
        if (!file) return;
        updateField("imageFile", file);
        const url = URL.createObjectURL(file);
        updateField("imagePreview", url);
    }

    function validate() {
        const newErrors = {};
        if (!form.title.trim()) newErrors.title = "Title required";
        if (!form.organizer1.trim()) newErrors.organizer1 = "Organizer 1 required";
        if (!form.startDate) newErrors.startDate = "Start date required";
        if (!form.endDate) newErrors.endDate = "End date required";
        if (form.startDate && form.endDate && form.startDate > form.endDate) newErrors.endDate = "End must be after start";
        if (!form.location.trim()) newErrors.location = "Location required";
        return newErrors;
    }

    function handleSubmit(e) {
        e.preventDefault();
        const v = validate();
        setErrors(v);
        if (Object.keys(v).length) return;
        setSubmitting(true);

        // Simulate event creation & store locally
        const newEvent = {
            id: Date.now(),
            title: form.title,
            organizer1: form.organizer1,
            organizer2: form.organizer2,
            startDate: form.startDate,
            endDate: form.endDate,
            location: form.location,
            image: form.imagePreview || "https://via.placeholder.com/400x250.png?text=Event+Image",
            // Simple derived date text (difference in days)
            dateText: deriveDateText(form.startDate),
            status: "started"
        };

        try {
            const existing = JSON.parse(localStorage.getItem("createdEvents")) || [];
            localStorage.setItem("createdEvents", JSON.stringify([newEvent, ...existing]));
        } catch {
            // ignore
        }

        setTimeout(() => {
            setSubmitting(false);
            navigate("/home");
        }, 500);
    }

    function deriveDateText(startDate) {
        if (!startDate) return "";
        const now = new Date();
        const start = new Date(startDate);
        const diffMs = start.getTime() - now.getTime();
        const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        if (diffDays <= 0) return "Happening";
        if (diffDays < 7) return `In ${diffDays} day${diffDays === 1 ? "" : "s"}`;
        const weeks = Math.round(diffDays / 7);
        if (weeks < 5) return `In ${weeks} week${weeks === 1 ? "" : "s"}`;
        const months = Math.round(diffDays / 30);
        return `In ${months} month${months === 1 ? "" : "s"}`;
    }

    return (
        <div className="min-h-screen w-full bg-gray-50">
            <div className="flex flex-col items-center py-5">
                <div className="flex flex-col w-full px-4 sm:px-6 lg:px-8 max-w-6xl">
                    <DashboardHeader />
                    <main className="mt-8 flex flex-col gap-8 flex-1">
                        <div className="flex items-center justify-between gap-4 px-1">
                            <h1 className="text-4xl font-black tracking-tight text-gray-900">Create Event</h1>
                            <button
                                type="button"
                                onClick={() => navigate(-1)}
                                className="h-11 px-5 rounded-lg border border-gray-300 bg-white text-gray-700 font-medium hover:bg-gray-100 transition"
                            >
                                Cancel
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="flex flex-col gap-6">
                                <Field label="Title" error={errors.title}>
                                    <input
                                        type="text"
                                        className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500"
                                        value={form.title}
                                        onChange={(e) => updateField("title", e.target.value)}
                                        placeholder="e.g. Amelia & Ben's Wedding"
                                    />
                                </Field>
                                <Field label="Organizer 1" error={errors.organizer1}>
                                    <input
                                        type="text"
                                        className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500"
                                        value={form.organizer1}
                                        onChange={(e) => updateField("organizer1", e.target.value)}
                                        placeholder="Lead organizer"
                                    />
                                </Field>
                                <Field label="Organizer 2">
                                    <input
                                        type="text"
                                        className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500"
                                        value={form.organizer2}
                                        onChange={(e) => updateField("organizer2", e.target.value)}
                                        placeholder="Co-organizer (optional)"
                                    />
                                </Field>
                                <Field label="Location" error={errors.location}>
                                    <input
                                        type="text"
                                        className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500"
                                        value={form.location}
                                        onChange={(e) => updateField("location", e.target.value)}
                                        placeholder="Venue or address"
                                    />
                                </Field>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Field label="Start Date" error={errors.startDate}>
                                        <input
                                            type="date"
                                            className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500"
                                            value={form.startDate}
                                            onChange={(e) => updateField("startDate", e.target.value)}
                                        />
                                    </Field>
                                    <Field label="End Date" error={errors.endDate}>
                                        <input
                                            type="date"
                                            className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500"
                                            value={form.endDate}
                                            onChange={(e) => updateField("endDate", e.target.value)}
                                        />
                                    </Field>
                                </div>
                            </div>
                            <div className="flex flex-col gap-6">
                                <Field label="Event Image">
                                    {form.imagePreview ? (
                                        <div className="relative group">
                                            <img
                                                src={form.imagePreview}
                                                alt="Preview"
                                                className="w-full h-56 object-cover rounded-lg border border-gray-200"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    updateField("imageFile", null);
                                                    updateField("imagePreview", "");
                                                    if (fileInputRef.current) fileInputRef.current.value = "";
                                                }}
                                                className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm text-gray-700 text-xs px-2 py-1 rounded shadow hover:bg-white"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center gap-3 border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50">
                                            <p className="text-sm text-gray-600">Upload an image to represent the event</p>
                                            <button
                                                type="button"
                                                onClick={() => fileInputRef.current?.click()}
                                                className="px-4 py-2 rounded-md bg-pink-500 text-white text-sm font-semibold hover:bg-pink-600"
                                            >
                                                Choose Image
                                            </button>
                                        </div>
                                    )}
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        className="hidden"
                                    />
                                </Field>
                                <div className="mt-auto flex flex-col gap-3">
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="h-12 w-full rounded-lg bg-pink-500 text-white font-bold shadow-sm hover:bg-pink-600 disabled:opacity-60 disabled:cursor-not-allowed"
                                    >
                                        {submitting ? "Saving..." : "Create Event"}
                                    </button>
                                    <p className="text-xs text-gray-500">Your event will appear in the overview after creation.</p>
                                </div>
                            </div>
                        </form>
                    </main>
                </div>
            </div>
        </div>
    );
}

function Field({ label, children, error }) {
    return (
        <label className="flex flex-col text-sm font-medium text-gray-700">
            {label}
            {children}
            {error && <span className="mt-1 text-xs text-red-600 font-normal">{error}</span>}
        </label>
    );
}
