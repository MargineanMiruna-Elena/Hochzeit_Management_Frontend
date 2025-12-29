import React, {useState, useRef, useEffect, useMemo} from "react";
import {useNavigate} from "react-router-dom";
import {GoogleMap, useJsApiLoader, Marker} from "@react-google-maps/api";
import {ArrowLeftIcon} from "@heroicons/react/24/outline";
import {Button} from "@material-tailwind/react";

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

export default function CreateEvent() {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    // 1. State Definitions
    const [form, setForm] = useState({
        title: "",
        description: "",
        organizer1: "",
        organizer2: "",
        startDate: "",
        endDate: "",
        location: "",
        locationName: "",
        address: "",
        imageFile: null,
        imagePreview: "",
        selectedMenus: [],
        hasParking: false
    });

    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [mapCenter, setMapCenter] = useState(defaultCenter);
    const [markerPosition, setMarkerPosition] = useState(null);

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

    function updateField(name, value) {
        setForm((f) => ({...f, [name]: value}));
    }

    function toggleMenu(menu) {
        setForm((f) => {
            const menus = f.selectedMenus.includes(menu)
                ? f.selectedMenus.filter((m) => m !== menu)
                : [...f.selectedMenus, menu];
            return {...f, selectedMenus: menus};
        });
    }

    function handleFileChange(e) {
        const file = e.target.files?.[0];
        if (!file) return;
        updateField("imageFile", file);
        const url = URL.createObjectURL(file);
        updateField("imagePreview", url);
    }

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem("user"));
        if (user && user.email) {
            updateField("organizer1", user.email);
        }

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const pos = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    };
                    setMapCenter(pos);
                },
                (error) => {
                    console.error("Error getting location: ", error);
                }
            );
        }
    }, []);

    const onMapClick = (e) => {
        if (!e || !window.google) return;

        const lat = e.latLng.lat();
        const lng = e.latLng.lng();
        setMarkerPosition({lat, lng});

        const dummyDiv = document.createElement('div');
        const service = new window.google.maps.places.PlacesService(dummyDiv);

        if (e.placeId) {
            if (e.stop) e.stop();

            service.getDetails({placeId: e.placeId}, (place, status) => {
                if (status === window.google.maps.places.PlacesServiceStatus.OK) {
                    setForm(prev => ({
                        ...prev,
                        location: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
                        locationName: place.name,
                        address: place.formatted_address
                    }));
                }
            });
        } else {
            const geocoder = new window.google.maps.Geocoder();
            geocoder.geocode({location: {lat, lng}}, (results, status) => {
                if (status === "OK" && results[0]) {
                    setForm(prev => ({
                        ...prev,
                        location: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
                        locationName: "Selected Point",
                        address: results[0].formatted_address
                    }));
                }
            });
        }
    };

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

    async function handleSubmit(e) {
        e.preventDefault();
        const v = validate();
        setErrors(v);
        if (Object.keys(v).length) return;
        setSubmitting(true);

        try {
            const user = JSON.parse(localStorage.getItem("user"));
            const token = localStorage.getItem("token");

            if (!user || !token) {
                alert("You must be logged in to create an event.");
                navigate("/login");
                return;
            }

            const location = {
                locationName: form.locationName,
                locationAddress: form.address,
                locationCoordinates: form.location
            }

            const resLoc = await fetch(`http://localhost:8080/api/locations`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(location)
            });

            let locationId;

            if (resLoc.ok) {
                const locationData = await resLoc.json();
                locationId = locationData.id || locationData.locationId;
            } else {
                const errorText = await resLoc.text();
                throw new Error(errorText || "Failed to create location");
            }

            const payload = {
                name: form.title,
                description: form.description || "Event created via frontend",
                startDate: new Date(form.startDate).toISOString(),
                endDate: new Date(form.endDate).toISOString(),
                locationId: locationId,
                emailOrg2: form.organizer2,
                imageUrl: form.imagePreview || "https://via.placeholder.com/400x250.png?text=Event+Image",
                hasParking: form.hasParking,
                menus: form.selectedMenus
            };

            const res = await fetch(`http://localhost:8080/api/events?userId=${user.id}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                const errorText = await res.text();
                throw new Error(errorText || "Failed to create event");
            }

            navigate("/home");
        } catch (err) {
            console.error(err);
            alert("Error creating event: " + err.message);
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="min-h-screen w-full bg-gray-50">
            <div className="flex flex-col items-center py-5">
                <div className="flex flex-col w-full max-w-6xl px-4 sm:px-6 lg:px-8">
                    <Button
                        type="button"
                        onClick={() => navigate("/home")}
                        className="self-start mb-4 inline-flex items-center px-4 py-2 rounded-md bg-pink-600 text-white text-sm font-medium hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                        <ArrowLeftIcon className="h-5 w-5 mr-1"/>
                        Back to Home
                    </Button>

                    <main className="mt-2 flex flex-col gap-6 flex-1">
                        <form onSubmit={handleSubmit}
                              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-6">Create Event</h1>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Left Column */}
                                <div className="space-y-6">
                                    {/* Event Name */}
                                    <div className="bg-card rounded-xl p-6 shadow-card border border-border/50">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Event Title
                                        </label>
                                        <input
                                            type="text"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-pink-500 focus:ring-pink-500"
                                            value={form.title}
                                            onChange={(e) => updateField("title", e.target.value)}
                                            placeholder="e.g. Amelia & Ben's Wedding"
                                        />
                                        {errors.title &&
                                            <span className="mt-1 text-xs text-red-600">{errors.title}</span>}
                                    </div>

                                    {/* Event Description */}
                                    <div className="bg-card rounded-xl p-6 shadow-card border border-border/50">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Event Description
                                        </label>
                                        <textarea
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-pink-500 focus:ring-pink-500"
                                            rows="4"
                                            value={form.description}
                                            onChange={(e) => updateField("description", e.target.value)}
                                            placeholder="Describe your event..."
                                        />
                                    </div>

                                    <div className="bg-card rounded-xl p-6 shadow-card border border-border/50">
                                        <h3 className="font-medium text-lg tracking-wide mb-4">Event Dates</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Start Date
                                                </label>
                                                <input
                                                    type="date"
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-pink-500 focus:ring-pink-500"
                                                    value={form.startDate}
                                                    onChange={(e) => updateField("startDate", e.target.value)}
                                                />
                                                {errors.startDate && <span
                                                    className="mt-1 text-xs text-red-600">{errors.startDate}</span>}
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    End Date
                                                </label>
                                                <input
                                                    type="date"
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-pink-500 focus:ring-pink-500"
                                                    value={form.endDate}
                                                    min={form.startDate}
                                                    onChange={(e) => updateField("endDate", e.target.value)}
                                                />
                                                {errors.endDate &&
                                                    <span className="mt-1 text-xs text-red-600">{errors.endDate}</span>}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Available Menus */}
                                    <div className="bg-card rounded-xl p-6 shadow-card border border-border/50">
                                        <h3 className="font-medium text-lg tracking-wide mb-4">Available Menu Options</h3>
                                        <div className="flex flex-wrap gap-3">
                                            {["Standard", "Vegan", "Kids"].map((label) => {
                                                const value = label.toLowerCase();
                                                const isSelected = form.selectedMenus.includes(value);
                                                return (
                                                    <button
                                                        key={value}
                                                        type="button"
                                                        onClick={() => toggleMenu(value)}
                                                        className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                                                            isSelected
                                                                ? "bg-pink-500 text-white border-pink-500"
                                                                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                                                        }`}
                                                    >
                                                        {label} Menu
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <div className="bg-card rounded-xl p-6 shadow-card border border-border/50">
                                        <h3 className="font-medium text-lg tracking-wide mb-4">Contact Organizers</h3>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Organizer 1 (You)
                                                </label>
                                                <input
                                                    type="text"
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 cursor-not-allowed"
                                                    value={form.organizer1}
                                                    disabled
                                                    placeholder="Lead organizer"
                                                />
                                                {errors.organizer1 && <span
                                                    className="mt-1 text-xs text-red-600">{errors.organizer1}</span>}
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Organizer 2 (Optional)
                                                </label>
                                                <input
                                                    type="text"
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-pink-500 focus:ring-pink-500"
                                                    value={form.organizer2}
                                                    onChange={(e) => updateField("organizer2", e.target.value)}
                                                    placeholder="Co-organizer email"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="bg-card rounded-xl p-6 shadow-card border border-border/50">
                                        <h3 className="font-medium text-lg tracking-wide mb-4">Location Details</h3>

                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Location Name
                                                </label>
                                                <input
                                                    type="text"
                                                    readOnly
                                                    className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-gray-700 cursor-not-allowed"
                                                    value={form.locationName}
                                                    placeholder="Click on map to set location"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Full Address
                                                </label>
                                                <input
                                                    type="text"
                                                    readOnly
                                                    className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-gray-700 cursor-not-allowed"
                                                    value={form.address}
                                                    placeholder="Click on map to set address"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Coordinates (Lat, Lng)
                                                </label>
                                                <input
                                                    type="text"
                                                    readOnly
                                                    className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-gray-700 cursor-not-allowed"
                                                    value={form.location}
                                                    placeholder="Click on map to set coordinates"
                                                />
                                                {errors.location && <span
                                                    className="mt-1 text-xs text-red-600">{errors.location}</span>}
                                            </div>
                                        </div>

                                        <div className="mt-4">
                                            <span className="block text-sm font-medium text-gray-700 mb-2">
                                                Select Location on Map
                                            </span>
                                            {isLoaded ? (
                                                <GoogleMap
                                                    mapContainerStyle={mapContainerStyle}
                                                    center={mapCenter}
                                                    zoom={14}
                                                    onClick={onMapClick}
                                                    options={mapOptions}
                                                >
                                                    {markerPosition && <Marker position={markerPosition}/>}
                                                </GoogleMap>
                                            ) : (
                                                <div
                                                    className="h-[300px] w-full bg-gray-200 rounded-lg flex items-center justify-center text-gray-500">
                                                    Loading Map...
                                                </div>
                                            )}
                                            <p className="text-xs text-gray-500 mt-2">
                                                Click on the map to place a marker and auto-fill location details.
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-2 mt-4">
                                            <input
                                                type="checkbox"
                                                id="hasParking"
                                                className="h-4 w-4 rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                                                checked={form.hasParking}
                                                onChange={(e) => updateField("hasParking", e.target.checked)}
                                            />
                                            <label htmlFor="hasParking"
                                                   className="text-sm font-medium text-gray-700">
                                                Has Parking Available
                                            </label>
                                        </div>
                                    </div>

                                    <div className="bg-card rounded-xl p-6 shadow-card border border-border/50">
                                        <h3 className="font-medium text-lg tracking-wide mb-4">Event Image</h3>
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
                                                    className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm text-gray-700 text-xs px-3 py-1.5 rounded shadow hover:bg-white"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        ) : (
                                            <div
                                                className="flex flex-col items-center justify-center gap-3 border-2 border-dashed border-gray-300 rounded-lg p-8 bg-gray-50">
                                                <p className="text-sm text-gray-600">Upload an image to represent the
                                                    event</p>
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
                                </div>
                            </div>

                            <div className="mt-8 flex justify-end gap-3">
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-6 py-2 rounded-md bg-pink-600 text-white font-medium hover:bg-pink-700 disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    {submitting ? "Creating..." : "Create Event"}
                                </button>
                            </div>
                        </form>
                    </main>
                </div>
            </div>
        </div>
    );
}