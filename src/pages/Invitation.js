import React, {useEffect, useState} from 'react';
import {Button, Card, CardBody, Radio, Typography} from "@material-tailwind/react";
import {CalendarIcon, CheckIcon, MapPinIcon, UserIcon, XMarkIcon} from "@heroicons/react/16/solid";

function Invitation() {
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);
    const [eventDetails, setEventDetails] = useState(null);
    const [accepted, setAccepted] = useState(false);
    const [declined, setDeclined] = useState(false);
    const [menuType, setMenuType] = useState("");
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
                const res = await fetch(`/api/invitation?token=${token}`);
                const data = await res.json();
                setEventDetails(data);
            } catch (err) {
                console.error("Error fetching invitation:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [token]);

    useEffect(() => {
        if (loading === false && !eventDetails) {
            setEventDetails({
                image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBobJTu5yqNrsVPCYJcAynk5krrjS8Ovco2boT6NjRJm69zigvgYlZJaec7raLioj4RZU4XFTGCWKl9WvhXaMv4tqHII6ikJNXzFUt7Fxb1U_ZCbF1q45TqvBOggetO9OB_QkppaCZ_cBOBTaHj-QbA8XCF-hxXg6rsxD3xHA9V1Yqz5unJngEPleKEBr-1ZjXssyBxcgUgfGCZM9TgucCfVmEmg7V_htaE3kyc-ucc8Oy6-DlHmnQMNZ5feGQ4pw-1kbW7X-YSn0nS",
                title: "Amelia and Ben's Wedding",
                organizer: "Amelia and Ben",
                date: "19 July 2026",
                location: "The Grand Ballroom",
                description: "We are thrilled to have you..."
            });
        }
    }, [loading, eventDetails]);

    const handleSubmit = async () => {
        if (!menuType && accepted) return;

        try {
            const res = await fetch("/api/invitation/rsvp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    token,
                    accept: accepted,
                    menu: menuType || null,
                }),
            });

            await res.json();
            setSubmitted(true);
        } catch (err) {
            console.error("Error submitting answer:", err);
        }
    };

    const handleAccept = () => {
        setAccepted(true);
        setDeclined(false);
    };

    const handleDecline = () => {
        setDeclined(true);
        setAccepted(false);
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
                    <div className="absolute bottom-4 left-6 text-pink-600">
                        <h1 className="text-3xl font-bold">{eventDetails.title}</h1>
                    </div>
                </div>

                <CardBody className="space-y-6">

                    <p className="leading-relaxed text-gray-700">
                        {eventDetails.description}
                    </p>

                    {/* DETAILS */}
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
                    ) : declined ? (
                        <DeclinedCard />
                    ) : (
                        <MenuSelector
                            menuType={menuType}
                            setMenuType={setMenuType}
                            onSubmit={handleSubmit}
                        />
                    )}
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

function DeclinedCard() {
    return (
        <Card className="p-6 bg-red-50 border border-red-200 text-center">
            <CardBody>
                <XMarkIcon className="h-12 w-12 text-red-600 mx-auto mb-3" />
                <Typography variant="h6" className="mb-2 font-semibold">
                    Invitation Declined
                </Typography>
                <Typography color="gray">
                    You've declined this invitation. We hope to see you at future events!
                </Typography>
            </CardBody>
        </Card>
    );
}

function MenuSelector({ menuType, setMenuType, onSubmit }) {
    const menus = [
        {
            key: "vegetarian menu",
            desc: "Plant-based dishes with fresh seasonal vegetables",
        },
        {
            key: "meat menu",
            desc: "Grilled meats with traditional sides",
        },
        {
            key: "children menu",
            desc: "Kid-friendly meals with familiar flavors",
        },
    ];

    return (
        <Card className="p-3 bg-pink-50 rounded-lg">
            <CardBody className="space-y-2">
                <Typography variant="h6" className="font-semibold">
                    Select Your Menu Preference
                </Typography>

                <div className="space-y-1">
                    {menus.map((m) => (
                        <label
                            key={m.key}
                            className="flex items-start p-3 rounded-md hover:bg-pink-100 cursor-pointer"
                        >
                            <Radio
                                name="menu"
                                value={m.key}
                                checked={menuType === m.key}
                                onChange={() => setMenuType(m.key)}
                                color="pink"
                                className="accent-pink-600 w-5 h-5"
                            />
                            <div className="ml-3">
                                <Typography className="font-medium capitalize">
                                    {m.key}
                                </Typography>
                                <Typography color="gray" variant="small">
                                    {m.desc}
                                </Typography>
                            </div>
                        </label>
                    ))}
                </div>

                <Button
                    onClick={onSubmit}
                    className="w-full h-12 bg-pink-600"
                    size="lg"
                >
                    Confirm RSVP
                </Button>
            </CardBody>
        </Card>
    );
}

export default Invitation;