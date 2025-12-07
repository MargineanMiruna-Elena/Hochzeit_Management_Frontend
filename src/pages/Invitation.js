import React, {useEffect, useState} from 'react';
import {Button, Card, CardBody, Checkbox, Radio, Typography, Select, Option} from "@material-tailwind/react";
import {CalendarIcon, CheckIcon, MapPinIcon, UserIcon, XMarkIcon} from "@heroicons/react/16/solid";

function Invitation() {
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);
    const [eventDetails, setEventDetails] = useState(null);
    const [accepted, setAccepted] = useState(false);
    const [declined, setDeclined] = useState(false);
    const [foodPreferences, setFoodPreferences] = useState([]);
    const [transportationMethod, setTransportationMethod] = useState("");
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
        try {
            const payload = {
                accept: accepted,
            };
            
            if (accepted && eventDetails.askFoodPreferences) {
                payload.foodPreferences = foodPreferences;
            }
            
            if (accepted && eventDetails.askTransportation) {
                payload.transportationMethod = transportationMethod;
            }
            
            const res = await fetch(`http://localhost:8080/api/invitation/rsvp?token=${token}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

            if (!res.ok) {
                throw new Error('Failed to submit RSVP');
            }

            await res.json();
            setSubmitted(true);
        } catch (err) {
            console.error("Error submitting answer:", err);
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
            const res = await fetch(`/api/invitation/rsvp?token=${token}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ accept: false }),
            });

            if (!res.ok) {
                throw new Error('Failed to submit decline');
            }

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
                <Card className="p-6 text-center bg-green-50 border border-green-200">
                    <CheckIcon className="h-12 w-12 text-green-600 mx-auto mb-4" />
                    <Typography variant="h5" className="font-semibold mb-2">
                        Thank you for your response!
                    </Typography>
                    <Typography color="gray">
                        Your RSVP has been saved successfully.
                    </Typography>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-3xl">
            <Card className="shadow-lg overflow-hidden">
                <div className="relative h-64 w-full">
                    <img
                        src={eventDetails.image}
                        alt="Event"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-4 left-6 text-white">
                        <h1 className="text-3xl font-bold">{eventDetails.title}</h1>
                    </div>
                </div>

                <CardBody className="space-y-6">
                    <p className="leading-relaxed text-gray-700">
                        {eventDetails.description}
                    </p>

                    <div className="space-y-3 border-l-4 border-primary pl-4">
                        <DetailItem
                            icon={<UserIcon className="h-5 w-5 text-primary mt-0.5" />}
                            label="Organizer"
                            value={eventDetails.organizer}
                        />

                        <DetailItem
                            icon={<CalendarIcon className="h-5 w-5 text-primary mt-0.5" />}
                            label="Date & Time"
                            value={eventDetails.date}
                        />

                        <DetailItem
                            icon={<MapPinIcon className="h-5 w-5 text-primary mt-0.5" />}
                            label="Location"
                            value={eventDetails.location}
                        />
                    </div>

                    {!accepted && !declined ? (
                        <div className="grid grid-cols-2 gap-3">
                            <Button
                                color="green"
                                size="lg"
                                className="flex justify-center gap-2"
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
                                className="flex justify-center gap-2"
                            >
                                <XMarkIcon className="h-5 w-5" />
                                Decline
                            </Button>
                        </div>
                    ) : accepted ? (
                        <PreferencesForm
                            eventDetails={eventDetails}
                            foodPreferences={foodPreferences}
                            toggleFoodPreference={toggleFoodPreference}
                            transportationMethod={transportationMethod}
                            setTransportationMethod={setTransportationMethod}
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
                <p className="text-sm text-gray-500">{label}</p>
                <p className="font-medium">{value}</p>
            </div>
        </div>
    );
}

function PreferencesForm({ 
    eventDetails, 
    foodPreferences, 
    toggleFoodPreference, 
    transportationMethod, 
    setTransportationMethod, 
    onSubmit 
}) {
    const canSubmit = 
        (!eventDetails.askFoodPreferences || foodPreferences.length > 0) &&
        (!eventDetails.askTransportation || transportationMethod);

    return (
        <Card className="p-3 bg-pink-50 rounded-lg">
            <CardBody className="space-y-4">
                <Typography variant="h6" className="font-semibold">
                    Please Confirm Your Details
                </Typography>

                {/* Food Preferences */}
                {eventDetails.askFoodPreferences && (
                    <div className="space-y-2">
                        <Typography className="font-medium text-sm text-gray-700">
                            Food Preferences *
                        </Typography>
                        <div className="space-y-2">
                            {eventDetails.availableFoodPreferences?.map((option) => (
                                <label
                                    key={option.value}
                                    className="flex items-center p-3 rounded-md hover:bg-pink-100 cursor-pointer"
                                >
                                    <Checkbox
                                        color="pink"
                                        checked={foodPreferences.includes(option.value)}
                                        onChange={() => toggleFoodPreference(option.value)}
                                    />
                                    <Typography className="ml-2">
                                        {option.label}
                                    </Typography>
                                </label>
                            ))}
                        </div>
                    </div>
                )}

                {/* Transportation Method */}
                {eventDetails.askTransportation && (
                    <div className="space-y-2">
                        <Typography className="font-medium text-sm text-gray-700">
                            Transportation Method *
                        </Typography>
                        <div className="space-y-2">
                            {eventDetails.availableTransportationMethods?.map((option) => (
                                <label
                                    key={option.value}
                                    className="flex items-center p-3 rounded-md hover:bg-pink-100 cursor-pointer"
                                >
                                    <Radio
                                        name="transportation"
                                        color="pink"
                                        checked={transportationMethod === option.value}
                                        onChange={() => setTransportationMethod(option.value)}
                                    />
                                    <Typography className="ml-2">
                                        {option.label}
                                    </Typography>
                                </label>
                            ))}
                        </div>
                    </div>
                )}

                <Button
                    onClick={onSubmit}
                    className="w-full h-12 bg-pink-600"
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