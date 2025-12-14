import React, {useEffect, useRef, useState} from "react";
import {useParams, useNavigate} from "react-router-dom";
import {Input, Textarea, Button} from "@material-tailwind/react";
import {
    EnvelopeIcon,
    CalendarIcon,
    MapPinIcon,
    ArrowLeftIcon,
    PencilIcon,
    CheckIcon,
    XMarkIcon,
} from "@heroicons/react/24/outline";
import ParticipantsManagement from "../components/ParticipantsManagement";

export default function MyEventDetails() {
    const {id} = useParams();
    const navigate = useNavigate();

    const [event, setEvent] = useState(null);
    const [editedEvent, setEditedEvent] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [loadingEvent, setLoadingEvent] = useState(true);
    const [errorEvent, setErrorEvent] = useState("");
    const formatDate = (date) => new Date(date).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
    const fileInputRef = useRef(null);

    const handleButtonClick = () => {
        fileInputRef.current.click();
    };

    const [image, setImage] = useState("");
    const [previewVisible, setPreviewVisible] = useState(false);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => setImage(reader.result);
            reader.readAsDataURL(file);
        }
    };

    useEffect(() => {
        const fetchEvent = async () => {
            setLoadingEvent(true);
            setErrorEvent("");
            try {
                const token = localStorage.getItem("token");
                const res = await fetch(`http://localhost:8080/api/events/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                if (!res.ok) {
                    const errText = await res.text();
                    throw new Error(errText || "Failed to fetch the event");
                }
                const data = await res.json();
                setEvent(data);
                setEditedEvent(data);
            } catch (err) {
                console.error(err);
                setErrorEvent(err.message);
            } finally {
                setLoadingEvent(false);
            }
        };

        fetchEvent();
    }, [id]);

    const handleEdit = () => setIsEditing(true);
    const handleCancel = () => {
        setEditedEvent(event);
        setIsEditing(false);
    };
    const handleSave = async () => {
        try {
            const token = localStorage.getItem("token");

            const eventUpdateRes = await fetch(`http://localhost:8080/api/events/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    name: editedEvent.name,
                    description: editedEvent.description,
                    startDate: editedEvent.startDate,
                    endDate: editedEvent.endDate,
                    locationId: editedEvent.locationId
                }),
            });

            if (!eventUpdateRes.ok) {
                throw new Error("Failed to update the event");
            }

            const locationUpdateRes = await fetch(
                `http://localhost:8080/api/locations/${editedEvent.locationId}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        name: editedEvent.locationName,
                        address: editedEvent.locationAddress,
                    }),
                }
            );

            if (!locationUpdateRes.ok) {
                throw new Error("Failed to update the location");
            }

            setEvent(editedEvent);
            setIsEditing(false);
        } catch (err) {
            console.error(err);
            alert(err.message);
        }
    };

    const handleChange = (field, value) => {
        setEditedEvent((prev) => ({...prev, [field]: value}));
    };

    if (loadingEvent) return <p className="p-4">Loading event...</p>;
    if (errorEvent) return <p className="p-4 text-red-500">Error: {errorEvent}</p>;
    if (!event) return <p className="p-4">Event not found.</p>;

    const displayEvent = isEditing ? editedEvent : event;

    const today = new Date();
    const start = new Date(displayEvent.startDate);
    const end = new Date(displayEvent.endDate);
    let status;
    if (end < today) status = "past";
    else if (start > today) status = "upcoming";
    else status = "ongoing";

    return (
        <div className="min-h-screen w-full bg-gray-50">
            <div className="flex flex-col items-center py-5">
                <div className="flex flex-col w-full max-w-6xl px-4 sm:px-6 lg:px-8">
                    <Button
                        type="button"
                        onClick={() => navigate("/home")}
                        className="self-start mb-4 inline-flex items-center px-4 py-2 rounded-md bg-pink-600 text-white text-sm font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                        <ArrowLeftIcon className="h-5 w-5 mr-1"/>
                        Back to Home
                    </Button>

                    <section className="mt-6 bg-white rounded-xl shadow-sm p-6">
                        <div className="space-y-2">
                            <div className="flex justify-end items-center gap-2 p-2">
                                {isEditing ? (
                                    <>
                                        <Button
                                            variant="ghost"
                                            onClick={handleCancel}
                                            className="self-start mb-4 inline-flex items-center px-4 py-2 rounded-md bg-black text-white text-sm font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                        >
                                            <XMarkIcon className="h-5 w-5 mr-1"/>
                                            Cancel
                                        </Button>
                                        <Button
                                            onClick={handleSave}
                                            className="self-start mb-4 inline-flex items-center px-4 py-2 rounded-md bg-black text-white text-sm font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                        >
                                            <CheckIcon className="h-5 w-5 mr-1"/>
                                            Save Changes
                                        </Button>
                                    </>
                                ) : (
                                    <Button
                                        variant="outline"
                                        onClick={handleEdit}
                                        className="self-start mb-4 inline-flex items-center px-4 py-2 rounded-md bg-black text-white text-sm font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                    >
                                        <PencilIcon className="h-5 w-5 mr-1"/>
                                        Edit Event
                                    </Button>
                                )}
                            </div>
                            <div>
                                {isEditing ? (
                                    <Input
                                        value={editedEvent.name}
                                        onChange={(e) => handleChange("name", e.target.value)}
                                        className="!text-2xl md:!text-3xl !font-extrabold !text-gray-900 !p-4"
                                    />
                                ) : (
                                    <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900">{displayEvent.name}</h1>
                                )}
                            </div>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <div
                                        className="bg-card rounded-xl p-3 shadow-card border border-border/50 flex flex-column">
                                        <div className="px-3 pt-3 rounded-lg bg-accent">
                                            <CalendarIcon className="h-6 w-6 text-pink-600"/>
                                        </div>
                                        <div className="flex-1 space-y-1 p-3">
                                            <h3 className="font-medium text-lg tracking-wide">Event Dates</h3>
                                            {isEditing ? (
                                                <div className="space-y-2">
                                                    <Input
                                                        type="date"
                                                        value={editedEvent.startDate}
                                                        onChange={(e) => handleChange("startDate", e.target.value)}
                                                    />
                                                    <Input
                                                        type="date"
                                                        value={editedEvent.endDate}
                                                        onChange={(e) => handleChange("endDate", e.target.value)}
                                                    />
                                                    <p className="text-sm">
                                                        Status: {status === "past" ? "Past" : status === "ongoing" ? "Ongoing" : "Upcoming"}
                                                    </p>
                                                </div>
                                            ) : (
                                                <div>
                                                    <p className="font-semibold text-md">{formatDate(displayEvent.startDate)} - {formatDate(displayEvent.endDate)}</p>
                                                    <p className="text-sm">
                                                        Status: {status === "past" ? "Past" : status === "ongoing" ? "Ongoing" : "Upcoming"}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div
                                        className="bg-card rounded-xl p-3 shadow-card border border-border/50 flex flex-column">
                                        <div className="px-3 pt-3 rounded-lg bg-accent">
                                            <MapPinIcon className="h-6 w-6 text-pink-600"/>
                                        </div>
                                        <div className="flex-1 space-y-1 p-3">
                                            <h3 className="font-medium text-lg tracking-wide">Location</h3>
                                            {isEditing ? (
                                                <div className="space-y-2">
                                                    <Input
                                                        value={editedEvent.locationName}
                                                        onChange={(e) => handleChange("locationName", e.target.value)}
                                                        placeholder="Venue name"
                                                    />
                                                    <Input
                                                        value={editedEvent.locationAddress}
                                                        onChange={(e) => handleChange("locationAddress", e.target.value)}
                                                        placeholder="Address"
                                                    />
                                                </div>
                                            ) : (
                                                <div>
                                                    <p className="font-medium">{displayEvent.locationName}</p>
                                                    <p className="text-sm">{displayEvent.locationAddress}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="bg-card rounded-xl p-6 shadow-card border border-border/50">
                                        <h3 className="font-medium text-lg tracking-wide">Event Description</h3>
                                        {isEditing ? (
                                            <Textarea value={editedEvent.description}
                                                      onChange={(e) => handleChange("description", e.target.value)}/>
                                        ) : (
                                            <p>{displayEvent.description}</p>
                                        )}
                                    </div>
                                </div>
                                <div className="bg-card rounded-xl p-6 shadow-card border border-border/50">
                                    <h3 className="font-medium text-lg tracking-wide">Event Image</h3>
                                    <div className="space-y-4">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            ref={fileInputRef}
                                            className="hidden"
                                            onChange={handleFileChange}
                                        />

                                        {isEditing && (
                                            <Button onClick={handleButtonClick}
                                                    className="text-pink-600 p-3 mx-1 rounded">
                                                Choose File
                                            </Button>
                                        )}

                                        {image && (
                                            <Button
                                                onClick={() => setPreviewVisible(!previewVisible)}
                                                className="bg-pink-600 text-white p-3 mx-1 rounded"
                                            >
                                                {previewVisible ? "Close" : "Preview"}
                                            </Button>
                                        )}

                                        {!isEditing && !image && (
                                            <div className="text-gray-500 text-sm">No image yet.</div>
                                        )}

                                        {previewVisible && image && (
                                            <div className="mt-2">
                                                <img
                                                    src={image}
                                                    alt="Preview"
                                                    className="max-w-full h-auto rounded border border-gray-300 shadow"
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>


                            <div className="bg-card rounded-xl p-6 shadow-card border border-border/50">
                                <h3 className="font-medium text-lg tracking-wide">Contact Organizers</h3>
                                <div>
                                    {displayEvent.emailOrg1 && (
                                        <div
                                            className="px-3 py-1 bg-secondary rounded-lg flex items-center gap-1">
                                            <EnvelopeIcon className="h-5 w-5 text-pink-600"/> {displayEvent.emailOrg1}
                                        </div>
                                    )}
                                    {displayEvent.emailOrg2 && (
                                        <div
                                            className="px-3 py-1 bg-secondary rounded-lg flex items-center gap-1">
                                            <EnvelopeIcon className="h-5 w-5 text-pink-600"/> {displayEvent.emailOrg2}
                                        </div>
                                    )}
                                </div>
                            </div>


                            <div className="bg-card rounded-xl p-6 shadow-card border border-border/50">
                                <ParticipantsManagement/>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
