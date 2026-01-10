import React, {useEffect, useMemo, useRef, useState} from "react";
import {GoogleMap, useJsApiLoader, Marker} from "@react-google-maps/api";
import {useParams, useNavigate} from "react-router-dom";
import {
    Input,
    Button,
    Dialog,
    DialogHeader,
    DialogBody,
    DialogFooter
} from "@material-tailwind/react";
import {
    ArrowLeftIcon,
    PencilIcon,
    CheckIcon,
    XMarkIcon,
    UserPlusIcon
} from "@heroicons/react/24/outline";
import ParticipantsManagement from "../components/ParticipantsManagement";
import PhotoGallery from "../components/PhotoGallery";

const libraries = ["places"];
const mapContainerStyle = {
    width: '100%',
    height: '300px',
    borderRadius: '0.5rem'
};
const defaultCenter = {
    lat: 40.7128,
    lng: -74.0060
};

export default function MyEventDetails() {
    const {id} = useParams();
    const navigate = useNavigate();

    const [event, setEvent] = useState(null);
    const [editedEvent, setEditedEvent] = useState(null);
    const [participants, setParticipants] = useState([]);

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newParticipant, setNewParticipant] = useState({name: "", email: ""});
    const [isSendingEmails, setIsSendingEmails] = useState(false);

    const [isEditing, setIsEditing] = useState(false);
    const [loadingEvent, setLoadingEvent] = useState(true);
    const [errorEvent, setErrorEvent] = useState("");

    const [markerPosition, setMarkerPosition] = useState(null);

    const displayEvent = isEditing ? editedEvent : event;

    const eventCoords = useMemo(() => {
        const locString = displayEvent?.locationCoordinates;

        if (locString && typeof locString === 'string') {
            const cleanString = locString.replace(/[^\d.,-]/g, '');
            const parts = cleanString.split(',');

            if (parts.length === 2) {
                const lat = parseFloat(parts[0]);
                const lng = parseFloat(parts[1]);

                if (!isNaN(lat) && !isNaN(lng)) {
                    return {lat, lng};
                }
            }
        }
        return null;
    }, [displayEvent?.locationCoordinates]);

    const mapRef = useRef(null);

    const onMapLoad = (map) => {
        mapRef.current = map;
        if (eventCoords) {
            map.panTo(eventCoords);
        }
    };

    useEffect(() => {
        if (eventCoords && mapRef.current) {
            mapRef.current.panTo(eventCoords);
        }
    }, [eventCoords]);

    const mapOptions = useMemo(() => ({
        keyboardShortcuts: false,
        clickableIcons: true,
        disableDefaultUI: false,
        zoomControl: true,
    }), []);

    const {isLoaded} = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
        libraries
    });

    const onMapClick = (e) => {
        if (!e || !window.google || !isEditing) return;

        const lat = e.latLng.lat();
        const lng = e.latLng.lng();
        const formattedCoords = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;

        setMarkerPosition({lat, lng});

        const geocoder = new window.google.maps.Geocoder();
        const service = new window.google.maps.places.PlacesService(document.createElement('div'));

        if (e.placeId) {
            if (e.stop) e.stop();
            service.getDetails({placeId: e.placeId}, (place, status) => {
                if (status === "OK") {
                    setEditedEvent(prev => ({
                        ...prev,
                        locationCoordinates: formattedCoords,
                        locationName: place.name,
                        locationAddress: place.formatted_address
                    }));
                }
            });
        } else {
            geocoder.geocode({location: {lat, lng}}, (results, status) => {
                if (status === "OK" && results[0]) {
                    setEditedEvent(prev => ({
                        ...prev,
                        locationCoordinates: formattedCoords,
                        locationName: "Selected Point",
                        locationAddress: results[0].formatted_address
                    }));
                } else {
                    setEditedEvent(prev => ({
                        ...prev,
                        locationCoordinates: formattedCoords,
                        locationName: "Custom Location",
                        locationAddress: `Location at ${formattedCoords}`
                    }));
                }
            });
        }
    };

    const formatDate = (date) => new Date(date).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
    const fileInputRef = useRef(null);

    const [image, setImage] = useState("");

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                setImage(reader.result);
                setEditedEvent(prev => ({
                    ...prev,
                    imageUrl: file
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveImage = () => {
        setEditedEvent(prev => ({
            ...prev,
            imageUrl: "null"
        }));

        setImage("");

        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const fetchParticipants = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`http://localhost:8080/api/events/${id}/participants`, {
                headers: {Authorization: `Bearer ${token}`},
            });
            if (res.ok) {
                const data = await res.json();
                setParticipants(data);
                console.log(participants);
            }
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        const fetchEvent = async () => {
            setLoadingEvent(true);
            setErrorEvent("");
            try {
                const token = localStorage.getItem("token");
                const headers = {Authorization: `Bearer ${token}`};

                const eventRes = await fetch(`http://localhost:8080/api/events/${id}`, {headers});

                if (!eventRes.ok) throw new Error("Failed to fetch event");

                const eventData = await eventRes.json();
                setEvent(eventData);
                setEditedEvent(eventData);

                await fetchParticipants();

            } catch (err) {
                setErrorEvent(err.message);
            } finally {
                setLoadingEvent(false);
            }
        };

        fetchEvent();
    }, [id]);

    if (loadingEvent) return <p className="p-4">Loading event...</p>;
    if (errorEvent) return <p className="p-4 text-red-500">Error: {errorEvent}</p>;
    if (!event) return <p className="p-4">Event not found.</p>;


    const handleOpenAddModal = () => setIsAddModalOpen(!isAddModalOpen);

    const handleAddParticipantChange = (e) => {
        const {name, value} = e.target;
        setNewParticipant(prev => ({...prev, [name]: value}));
    };

    const handleSaveParticipant = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`http://localhost:8080/api/participants`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    name: newParticipant.name,
                    email: newParticipant.email,
                    attending: null,
                    eventId: id,
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to add participant");
            }

            await fetchParticipants();
            setNewParticipant({name: "", email: ""});
            setIsAddModalOpen(false);

        } catch (error) {
            alert("Error adding participant: " + error.message);
        }
    };

    const handleUpdateParticipant = async (updatedParticipant) => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`http://localhost:8080/api/participants/${updatedParticipant.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(updatedParticipant),
            });

            if (!res.ok) {
                throw new Error("Failed to update participant");
            }

            await fetchParticipants();

        } catch (err) {
            alert("Error updating: " + err.message);
        }
    };

    const handleDeleteParticipant = async (participantId) => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`http://localhost:8080/api/participants/${participantId}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!res.ok) {
                throw new Error("Failed to delete participant");
            }

            await fetchParticipants();

        } catch (err) {
            alert("Error deleting: " + err.message);
        }
    };

    const handleSend = async (participantId) => {
        if (isSendingEmails) return;

        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`http://localhost:8080/api/events/${id}/send-invitation/${participantId}`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!res.ok) {
                const errorMsg = await res.text();
                throw new Error(errorMsg || "Failed to send invitation");
            }

            alert("Invitation sent successfully!");
        } catch (err) {
            console.error("Error sending individual email:", err);
            alert("Error: " + err.message);
        }
    };

    const handleSendInvitations = async () => {
        setIsSendingEmails(true);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`http://localhost:8080/api/events/${id}/send-invitations`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!res.ok) {
                const errorMsg = await res.text();
                throw new Error(errorMsg || "Failed to send invitations");
            }

            const successMsg = await res.text();
            alert(successMsg);

        } catch (err) {
            alert("Error sending emails: " + err.message);
        } finally {
            setIsSendingEmails(false);
        }
    };

    const handleEdit = () => setIsEditing(true);
    const handleCancel = () => {
        setEditedEvent(event);
        setMarkerPosition(null);
        setIsEditing(false);
    };

    const handleSave = async () => {
        try {
            const token = localStorage.getItem("token");

            // Update event details
            const eventUpdateRes = await fetch(`http://localhost:8080/api/events/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
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
                const errorText = await eventUpdateRes.text();
                throw new Error(`Failed to update event: ${errorText}`);
            }

            // Update location details
            const locationUpdateRes = await fetch(`http://localhost:8080/api/locations/${editedEvent.locationId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    name: editedEvent.locationName,
                    address: editedEvent.locationAddress,
                    coordinates: editedEvent.locationCoordinates
                }),
            });

            if (!locationUpdateRes.ok) {
                const errorText = await locationUpdateRes.text();
                throw new Error(`Failed to update location: ${errorText}`);
            }

            if (editedEvent.imageUrl instanceof File) {
                const formData = new FormData();
                formData.append('file', editedEvent.imageUrl);

                const resCover = await fetch(`http://localhost:8080/api/events/${id}/upload-cover`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` },
                    body: formData,
                });

                if (resCover.ok) {
                    const coverData = await resCover.json();
                    editedEvent.imageUrl = coverData.imageUrl.replace('/uploads/', '');
                } else {
                    console.error("Couldn't save image.");
                }
            }

            setEvent(editedEvent);
            setImage("");
            setMarkerPosition(null);
            setIsEditing(false);

            // Update local state
            setEvent(editedEvent);
            setMarkerPosition(null);
            setIsEditing(false);

            alert("Event updated successfully!");

        } catch (err) {
            console.error('Save error:', err);
            alert(`Error: ${err.message}`);
        }
    };

    const handleChange = (field, value) => {
        setEditedEvent((prev) => ({...prev, [field]: value}));
    };

    return (
        <div className="min-h-screen w-full bg-gray-50">
            <div className="flex flex-col items-center py-5">
                <div className="flex flex-col w-full max-w-6xl px-4 sm:px-6 lg:px-8">
                    <Button
                        type="button"
                        onClick={() => navigate("/home")}
                        className="self-start mb-2 inline-flex items-center px-4 py-2 rounded-md bg-pink-600 text-white text-sm font-medium hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                        <ArrowLeftIcon className="h-5 w-5 mr-1"/>
                        Back to Home
                    </Button>

                    <section className="mt-6 bg-white rounded-xl shadow-sm p-6">
                        <div className="space-y-2">
                            <div className="flex justify-end items-center gap-2 p-2">
                                {isEditing ? (
                                    <>
                                        <Button variant="ghost" onClick={handleCancel}
                                                className="bg-black text-white flex flex-1 justify-center text-sm">
                                            <XMarkIcon className="h-5 w-5 mr-1"/> Cancel </Button>
                                        <Button onClick={handleSave}
                                                className="bg-black text-white flex flex-1 justify-center text-sm">
                                            <CheckIcon className="h-5 w-5 mr-1"/> Save Changes </Button>
                                    </>
                                ) : (
                                    <Button variant="outline" onClick={handleEdit}
                                            className="bg-black text-white flex flex-1 justify-center text-sm">
                                        <PencilIcon className="h-5 w-5 mr-1"/> Edit Event </Button>
                                )}
                            </div>
                            <div>
                                {isEditing ? (
                                    <Input value={editedEvent.name}
                                           onChange={(e) => handleChange("name", e.target.value)}
                                           className="!text-2xl md:!text-3xl !font-extrabold !text-gray-900 !p-4"/>
                                ) : (
                                    <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900">{displayEvent.name}</h1>
                                )}
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <div className="bg-card rounded-xl p-6 shadow-card border border-border/50">
                                        <h3 className="font-medium text-lg tracking-wide">Event Description</h3>
                                        {isEditing ? (
                                            <textarea
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-pink-500 focus:ring-pink-500"
                                                rows="4"
                                                value={editedEvent.description}
                                                onChange={(e) => handleChange("description", e.target.value)}
                                                placeholder="Describe your event..."
                                            />
                                        ) : (
                                            <p>{displayEvent.description}</p>
                                        )}
                                    </div>
                                    <div
                                        className="bg-card rounded-xl p-3 shadow-card border border-border/50 flex flex-column">
                                        <div className="flex-1 space-y-1 p-3">
                                            <h3 className="font-medium text-lg tracking-wide">Event Dates</h3>
                                            {isEditing ? (
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <label
                                                            className="block text-sm font-medium text-gray-700 mb-2">
                                                            Start Date
                                                        </label>
                                                        <input
                                                            type="date"
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-pink-500 focus:ring-pink-500"
                                                            value={editedEvent.startDate}
                                                            onChange={(e) => handleChange("startDate", e.target.value)}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label
                                                            className="block text-sm font-medium text-gray-700 mb-2">
                                                            End Date
                                                        </label>
                                                        <input
                                                            type="date"
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-pink-500 focus:ring-pink-500"
                                                            value={editedEvent.endDate}
                                                            min={editedEvent.startDate}
                                                            onChange={(e) => handleChange("endDate", e.target.value)}
                                                        />
                                                    </div>
                                                </div>
                                            ) : (
                                                <div>
                                                    <p className="font-semibold text-md">{formatDate(displayEvent.startDate)} - {formatDate(displayEvent.endDate)}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="bg-card rounded-xl p-6 shadow-card border border-border/50">
                                        <h3 className="font-medium text-lg tracking-wide mb-4">Event Image</h3>

                                        {isEditing ? (
                                            <div className="space-y-4">
                                                {(editedEvent.imageUrl !== null || image) ? (
                                                    <div className="relative group">
                                                        <img
                                                            src={image || `http://localhost:8080/uploads/${editedEvent.imageUrl}`}
                                                            alt="Preview"
                                                            className="w-full h-56 object-cover rounded-lg border border-gray-200"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={handleRemoveImage}
                                                            className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm text-gray-700 text-xs px-3 py-1.5 rounded shadow hover:bg-white"
                                                        >
                                                            Remove
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col items-center justify-center gap-3 border-2 border-dashed border-gray-300 rounded-lg p-8 bg-gray-50">
                                                        <p className="text-sm text-gray-600">Upload an image to represent the event</p>
                                                        <button
                                                            type="button"
                                                            onClick={() => fileInputRef.current?.click()}
                                                            className="px-4 py-2 rounded-md bg-pink-600 text-white text-sm font-medium hover:bg-pink-700"
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
                                            </div>
                                        ) : (
                                            <div>
                                                {displayEvent.imageUrl !== null ? (
                                                    <img
                                                        src={`http://localhost:8080/uploads/${displayEvent.imageUrl}`}
                                                        alt="Event"
                                                        className="w-full h-56 object-cover rounded-lg border border-gray-200 shadow-sm"
                                                    />
                                                ) : (
                                                    <div className="flex items-center justify-center h-32 bg-gray-100 rounded-lg border border-gray-200">
                                                        <p className="text-gray-500 text-sm italic">No picture yet</p>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div
                                    className="bg-card rounded-xl p-3 shadow-card border border-border/50 flex flex-column">
                                    <div className="flex-1 space-y-4 p-3">
                                        <h3 className="font-medium text-lg tracking-wide">Location</h3>
                                        {isEditing ? (
                                            <div>
                                                <div className="space-y-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">Location
                                                            Name</label>
                                                        <input type="text" readOnly
                                                               className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-gray-700 cursor-not-allowed"
                                                               value={editedEvent.locationName || ""}
                                                               placeholder="Click on map..."/>
                                                    </div>
                                                    <div>
                                                        <label
                                                            className="block text-sm font-medium text-gray-700 mb-1">Full
                                                            Address</label>
                                                        <input type="text" readOnly
                                                               className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-gray-700 cursor-not-allowed"
                                                               value={editedEvent.locationAddress || ""}
                                                               placeholder="Click on map..."/>
                                                    </div>
                                                    <div>
                                                        <label
                                                            className="block text-sm font-medium text-gray-700 mb-1">Coordinates
                                                            (Lat, Lng)</label>
                                                        <input type="text" readOnly
                                                               className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-gray-700 cursor-not-allowed"
                                                               value={editedEvent.locationCoordinates || ""}
                                                               placeholder="Click on map..."/>
                                                    </div>
                                                </div>

                                                <div className="mt-4">
                                                    <span className="block text-sm font-medium text-gray-700 mb-2">Select Location on Map</span>
                                                    {isLoaded ? (
                                                        <GoogleMap
                                                            key={eventCoords ? `${eventCoords.lat}-${eventCoords.lng}` : "loading"}
                                                            mapContainerStyle={mapContainerStyle}
                                                            center={eventCoords || defaultCenter}
                                                            zoom={15}
                                                            onLoad={onMapLoad}
                                                            onClick={onMapClick}
                                                            options={mapOptions}
                                                        >
                                                            {(markerPosition || eventCoords) && (
                                                                <Marker position={markerPosition || eventCoords}/>
                                                            )}
                                                        </GoogleMap>
                                                    ) : (
                                                        <div
                                                            className="h-[300px] w-full bg-gray-200 rounded-lg flex items-center justify-center text-gray-500">Loading
                                                            Map...</div>
                                                    )}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                <div className="space-y-1">
                                                    <div className="flex items-start gap-2">
                                                        <div>
                                                            <p className="font-bold text-gray-900">{displayEvent.locationName || "No location name"}</p>
                                                            <p className="text-sm text-gray-600">{displayEvent.locationAddress || "No address provided"}</p>
                                                            <p className="text-xs text-gray-400 font-mono mt-1">[{displayEvent.locationCoordinates || "No coordinates"}]</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="mt-4">
                                                    {isLoaded ? (
                                                        <GoogleMap
                                                            key={eventCoords ? `${eventCoords.lat}-${eventCoords.lng}` : "view"}
                                                            mapContainerStyle={mapContainerStyle}
                                                            center={eventCoords || defaultCenter}
                                                            zoom={15}
                                                            onLoad={onMapLoad}
                                                            options={{
                                                                ...mapOptions,
                                                                gestureHandling: "cooperative"
                                                            }}
                                                        >
                                                            {eventCoords && <Marker position={eventCoords}/>}
                                                        </GoogleMap>
                                                    ) : (
                                                        <div
                                                            className="h-[300px] w-full bg-gray-200 rounded-lg flex items-center justify-center text-gray-500">
                                                            Loading Map...
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="bg-card rounded-xl p-6 shadow-card border border-border/50">
                                <h3 className="font-medium text-lg tracking-wide">Contact Organizers</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {displayEvent.emailOrg1 && (
                                        <div className="py-2 space-y-1">
                                            <label className="block text-sm font-bold text-gray-700">
                                                Organizer 1
                                            </label>
                                            <div className="text-gray-600 truncate" title={displayEvent.emailOrg1}>
                                                {displayEvent.emailOrg1}
                                            </div>
                                        </div>
                                    )}

                                    {displayEvent.emailOrg2 && (
                                        <div className="py-2 space-y-1 border-t md:border-t-0 md:border-l md:pl-4 border-gray-100">
                                            <label className="block text-sm font-bold text-gray-700">
                                                Organizer 2
                                            </label>
                                            <div className="text-gray-600 truncate" title={displayEvent.emailOrg2}>
                                                {displayEvent.emailOrg2}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="bg-white rounded-xl mt-2 p-6 shadow-sm">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">Participants</h2>
                            <Button onClick={handleOpenAddModal} className="flex items-center gap-2 bg-pink-600">
                                <UserPlusIcon className="h-5 w-5"/>
                                Add Participant
                            </Button>
                        </div>

                        <ParticipantsManagement
                            participants={participants}
                            onUpdate={handleUpdateParticipant}
                            onDelete={handleDeleteParticipant}
                            onSendEmails={handleSendInvitations}
                            onSendEmail={handleSend}
                            isSendingEmails={isSendingEmails}
                        />
                    </section>
                    <section className="mt-2">
                        <PhotoGallery eventId={id} org1={displayEvent.emailOrg1} org2={displayEvent.emailOrg2}/>
                    </section>
                </div>
            </div>

            <Dialog open={isAddModalOpen} handler={handleOpenAddModal}>
                <DialogHeader>Add New Participant</DialogHeader>
                <DialogBody divider className="flex flex-col gap-4">
                    <Input
                        label="Full Name"
                        name="name"
                        value={newParticipant.name}
                        onChange={handleAddParticipantChange}
                    />
                    <Input
                        label="Email Address"
                        name="email"
                        type="email"
                        value={newParticipant.email}
                        onChange={handleAddParticipantChange}
                    />
                </DialogBody>
                <DialogFooter className="space-x-2">
                    <Button variant="text" color="blue-gray" onClick={handleOpenAddModal}>
                        Cancel
                    </Button>
                    <Button variant="gradient" color="pink" onClick={handleSaveParticipant}>
                        Save
                    </Button>
                </DialogFooter>
            </Dialog>
        </div>
    );
}