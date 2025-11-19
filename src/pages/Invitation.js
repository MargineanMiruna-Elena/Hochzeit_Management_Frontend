import React, {useState} from 'react';
import {Button, Card, CardBody, CardHeader, Radio, Typography} from "@material-tailwind/react";
import {CalendarIcon, CheckIcon, MapPinIcon, UserIcon, XMarkIcon} from "@heroicons/react/16/solid";

function Invitation() {
    const [accepted, setAccepted] = useState(false);
    const [declined, setDeclined] = useState(false);
    const [menuType, setMenuType] = useState("");

    const eventDetails = {
        title: "Summer Garden Party",
        organizer: "Sarah Johnson",
        date: "Saturday, July 15, 2024 at 6:00 PM",
        location: "The Garden Terrace, 123 Rose Street",
        image: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?q=80&w=2070",
        description: "Join us for an evening of celebration under the stars! We're excited to host this special gathering with good food, great company, and unforgettable memories."
    };

    const handleAccept = () => {
        setAccepted(true);
        setDeclined(false);
    };

    const handleDecline = () => {
        setDeclined(true);
        setAccepted(false);
    };

    const handleSubmit = () => {
        if (!menuType) {
            return;
        }
    };

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
                    <p className="text-muted-foreground leading-relaxed">
                        {eventDetails.description}
                    </p>

                    <div className="space-y-3 border-l-4 border-primary pl-4">
                        <div className="flex items-start gap-3">
                            <UserIcon className="h-5 w-5 text-primary mt-0.5" />
                            <div>
                                <p className="text-sm text-muted-foreground">Organizer</p>
                                <p className="font-medium">{eventDetails.organizer}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <CalendarIcon className="h-5 w-5 text-primary mt-0.5" />
                            <div>
                                <p className="text-sm text-muted-foreground">Date & Time</p>
                                <p className="font-medium">{eventDetails.date}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <MapPinIcon className="h-5 w-5 text-primary mt-0.5" />
                            <div>
                                <p className="text-sm text-muted-foreground">Location</p>
                                <p className="font-medium">{eventDetails.location}</p>
                            </div>
                        </div>
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
                                className="flex justify-center gap-2"
                                size="lg"
                                color="red"
                            >
                                <XMarkIcon className="h-5 w-5" />
                                Decline
                            </Button>
                        </div>
                    ) : declined ? (
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
                    ) : (
                        <Card className="p-3 bg-pink-50 rounded-lg">
                            <CardBody className="space-y-2">
                                <Typography variant="h6" className="font-semibold">
                                    Select Your Menu Preference
                                </Typography>
                                <div className="space-y-1">
                                    {["vegetarian menu", "meat menu", "children menu"].map((type) => (
                                        <label
                                            key={type}
                                            className="flex items-start p-3 rounded-md hover:bg-pink-100 cursor-pointer"
                                        >
                                            <Radio
                                                name="menu"
                                                value={type}
                                                checked={menuType === type}
                                                onChange={() => setMenuType(type)}
                                                color="pink"
                                                className="accent-pink-600 w-5 h-5"
                                            />
                                            <div className="ml-3">
                                                <Typography className="font-medium capitalize">{type}</Typography>
                                                <Typography color="gray" variant="small">
                                                    {{
                                                        "vegetarian menu": "Plant-based dishes with fresh seasonal vegetables",
                                                        "meat menu": "Grilled meats with traditional sides",
                                                        "children menu": "Kid-friendly meals with familiar flavors and smaller portions, perfect for little appetites"
                                                    }[type]}
                                                </Typography>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                                <Button
                                    onClick={handleSubmit}
                                    className="w-full h-12 bg-pink-600"
                                    size="lg"
                                >
                                    Confirm RSVP
                                </Button>
                            </CardBody>
                        </Card>
                    )}
                </CardBody>
            </Card>
        </div>
    );
}

export default Invitation;