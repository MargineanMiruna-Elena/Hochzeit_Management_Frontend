import React, {useEffect, useState} from 'react';
import {Button, Card, CardBody, Checkbox, Typography} from "@material-tailwind/react";
import {CalendarIcon, CheckIcon, MapPinIcon, UserIcon, XMarkIcon} from "@heroicons/react/16/solid";

function Invitation() {
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);
    const [eventDetails, setEventDetails] = useState(null);
    const [accepted, setAccepted] = useState(false);
    const [declined, setDeclined] = useState(false);
    const [foodPreferences, setFoodPreferences] = useState([]);
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const urlToken = params.get("token");

        if (!urlToken) {
            setLoading(false);
            return;
        }

        setToken(urlToken);
    }, []);

    useEffect(() => {
        if (!token) return;

        const fetchData = async () => {
            try {
                const res = await fetch(`http://localhost:8080/api/invitation?token=${token}`);
                
                if (!res.ok) {
                    throw new Error('Failed to fetch invitation details');
                }
                
                const data = await res.json();
                console.log("Event details:", data);
                setEventDetails(data);
            } catch (err) {
                console.error("Error fetching invitation:", err);
                setEventDetails(null);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [token]);

    const handleSubmit = async () => {
        if (eventDetails.askFoodPreferences && foodPreferences.length === 0) {
            alert("Please select at least one food preference");
            return;
        }

        try {
            const payload = {
                accept: true,
                foodPreferences: foodPreferences
            };
            
            console.log("Submitting RSVP:", payload);
            
            const res = await fetch(`http://localhost:8080/api/invitation/rsvp?token=${token}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                throw new Error('Failed to submit RSVP');
            }

            const data = await res.json();
            console.log("RSVP response:", data);
            setSubmitted(true);
        } catch (err) {
            console.error("Error submitting RSVP:", err);
            alert("Failed to submit RSVP. Please try again.");
        }
    };

    const handleAccept = () => {
        setAccepted(true);
        setDeclined(false);
    };

    const handleDecline = async () => {
        setDeclined(true);
        setAccepted(false);
        
        try {
            const payload = { accept: false };
            
            console.log("Submitting decline:", payload);
            
            const res = await fetch(`http://localhost:8080/api/invitation/rsvp?token=${token}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                throw new Error('Failed to submit decline');
            }

            const data = await res.json();
            console.log("Decline response:", data);
            setSubmitted(true);
        } catch (err) {
            console.error("Error submitting decline:", err);
            alert("Failed to submit response. Please try again.");
        }
    };

    const toggleFoodPreference = (value) => {
        setFoodPreferences(prev => 
            prev.includes(value) 
                ? prev.filter(p => p !== value)
                : [...prev, value]
        );
    };

    if (loading) {
        return (
            <div className="text-center py-20 text-xl text-gray-600">
                Loading invitation...
            </div>
        );
    }

    if (!eventDetails) {
        return (
            <div className="text-center py-20 text-red-600 text-xl">
                Invalid or expired invitation link.
            </div>
        );
    }

    if (submitted) {
        return (
            <div className="container mx-auto px-4 py-20 max-w-xl">
                <Card className={`p-6 text-center ${declined ? 'bg-amber-50 border-amber-200' : 'bg-green-50 border-green-200'} border`}>
                    {declined ? (
                        <>
                            <XMarkIcon className="h-16 w-16 text-amber-600 mx-auto mb-4" />
                            <Typography variant="h4" className="font-bold mb-3 text-gray-800">
                                We're Sorry You Can't Make It
                            </Typography>
                            <Typography className="text-gray-700 mb-2 text-lg">
                                We'll miss you at {eventDetails.title}!
                            </Typography>
                            <Typography color="gray" variant="small" className="mt-4">
                                We hope to see you at future events. Your response has been saved.
                            </Typography>
                        </>
                    ) : (
                        <>
                            <CheckIcon className="h-16 w-16 text-green-600 mx-auto mb-4" />
                            <Typography variant="h4" className="font-bold mb-3 text-gray-800">
                                Thank You for Your Response!
                            </Typography>
                            <Typography className="text-gray-700 text-lg">
                                We're excited to see you at {eventDetails.title}!
                            </Typography>
                            <Typography color="gray" variant="small" className="mt-4">
                                Your RSVP has been saved successfully.
                            </Typography>
                        </>
                    )}
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-3xl">
            <Card className="shadow-lg overflow-hidden">
                {/* Event Image Header */}
                <div className="relative h-64 w-full">
                    <img
                        src={eventDetails.image}
                        alt="Event"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-4 left-6 text-white">
                        <h1 className="text-3xl font-bold drop-shadow-lg">{eventDetails.title}</h1>
                    </div>
                </div>

                <CardBody className="space-y-6">
                    {/* Event Description */}
                    <p className="leading-relaxed text-gray-700 text-lg">
                        {eventDetails.description}
                    </p>

                    {/* Event Details */}
                    <div className="space-y-3 border-l-4 border-pink-500 pl-4">
                        <DetailItem
                            icon={<UserIcon className="h-5 w-5 text-pink-500 mt-0.5" />}
                            label="Organizer"
                            value={eventDetails.organizer}
                        />

                        <DetailItem
                            icon={<CalendarIcon className="h-5 w-5 text-pink-500 mt-0.5" />}
                            label="Date & Time"
                            value={eventDetails.date}
                        />

                        <DetailItem
                            icon={<MapPinIcon className="h-5 w-5 text-pink-500 mt-0.5" />}
                            label="Location"
                            value={eventDetails.location}
                        />
                    </div>

                    {/* Response Buttons or Form */}
                    {!accepted && !declined ? (
                        <div className="grid grid-cols-2 gap-4 pt-4">
                            <Button
                                color="green"
                                size="lg"
                                className="flex justify-center items-center gap-2"
                                onClick={handleAccept}
                            >
                                <CheckIcon className="h-5 w-5" />
                                Accept
                            </Button>

                            <Button
                                onClick={handleDecline}
                                variant="outlined"
                                size="lg"
                                color="red"
                                className="flex justify-center items-center gap-2"
                            >
                                <XMarkIcon className="h-5 w-5" />
                                Decline
                            </Button>
                        </div>
                    ) : accepted ? (
                        <FoodPreferencesForm
                            eventDetails={eventDetails}
                            foodPreferences={foodPreferences}
                            toggleFoodPreference={toggleFoodPreference}
                            onSubmit={handleSubmit}
                        />
                    ) : null}
                </CardBody>
            </Card>
        </div>
    );
}

function DetailItem({ icon, label, value }) {
    return (
        <div className="flex items-start gap-3">
            {icon}
            <div>
                <p className="text-sm text-gray-500 font-medium">{label}</p>
                <p className="font-semibold text-gray-800">{value}</p>
            </div>
        </div>
    );
}

function FoodPreferencesForm({ eventDetails, foodPreferences, toggleFoodPreference, onSubmit }) {
    const canSubmit = !eventDetails.askFoodPreferences || foodPreferences.length > 0;

    return (
        <Card className="p-4 bg-pink-50 rounded-lg border border-pink-200">
            <CardBody className="space-y-4">
                <Typography variant="h6" className="font-bold text-gray-800">
                    Please Confirm Your Details
                </Typography>

                {eventDetails.askFoodPreferences ? (
                    <div className="space-y-3">
                        <Typography className="font-semibold text-sm text-gray-700">
                            Food Preferences * (select at least one)
                        </Typography>
                        <div className="space-y-2">
                            {eventDetails.availableFoodPreferences?.map((option) => (
                                <label
                                    key={option.value}
                                    className="flex items-center p-3 rounded-md hover:bg-pink-100 cursor-pointer transition-colors"
                                >
                                    <Checkbox
                                        color="pink"
                                        checked={foodPreferences.includes(option.value)}
                                        onChange={() => toggleFoodPreference(option.value)}
                                    />
                                    <Typography className="ml-3 font-medium">
                                        {option.label}
                                    </Typography>
                                </label>
                            ))}
                        </div>
                    </div>
                ) : (
                    <Typography color="gray">
                        Click below to confirm your attendance.
                    </Typography>
                )}

                <Button
                    onClick={onSubmit}
                    className="w-full h-12 bg-pink-600 hover:bg-pink-700"
                    size="lg"
                    disabled={!canSubmit}
                >
                    Confirm RSVP
                </Button>
            </CardBody>
        </Card>
    );
}

export default Invitation;