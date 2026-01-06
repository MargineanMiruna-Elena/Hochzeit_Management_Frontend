import React, {useEffect, useMemo, useState} from "react";
import { useNavigate } from "react-router-dom";
import DashboardHeader from "../components/DashboardHeader";
import SearchBar from "../components/SearchBar";
import EventCard from "../components/EventCard";
import EmptyState from "../components/EmptyState";
import MyEventCard from "../components/MyEventCard";

export default function Home() {
    const user = useMemo(() => {
        try {
            return JSON.parse(localStorage.getItem("user"));
        } catch {
            return null;
        }
    }, []);

    const [query, setQuery] = useState("");
    const [myEvents, setMyEvents] = useState([]);
    const [participantsEvents, setParticipantsEvents] = useState([]);
    const [loadingMyEvents, setLoadingMyEvents] = useState(true);
    const [loadingParticipantsEvents, setLoadingParticipantsEvents] = useState(true);
    const [errorMyEvents, setErrorMyEvents] = useState("");
    const [errorParticipantsEvents, setErrorParticipantsEvents] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const fetchMyEvents = async () => {
            setLoadingMyEvents(true);
            setErrorMyEvents("");
            try {
                const token = localStorage.getItem("token");
                const res = await fetch("http://localhost:8080/api/events/my-events", {
                    headers: {
                        "Authorization": `Bearer ${token}`,
                    },
                });
                if (!res.ok) {
                    const errText = await res.text();
                    throw new Error(errText || "Failed to fetch my events");
                }
                const data = await res.json();
                setMyEvents(data);
            } catch (err) {
                console.error(err);
                setErrorMyEvents(err.message);
            } finally {
                setLoadingMyEvents(false);
            }
        };

        const fetchParticipantsEvents = async () => {
            setLoadingParticipantsEvents(true);
            setErrorParticipantsEvents("");
            try {
                const token = localStorage.getItem("token");
                const res = await fetch("http://localhost:8080/api/events/participants-events", {
                    headers: {
                        "Authorization": `Bearer ${token}`,
                    },
                });
                if (!res.ok) {
                    const errText = await res.text();
                    throw new Error(errText || "Failed to fetch my events");
                }
                const data = await res.json();
                setParticipantsEvents(data);
            } catch (err) {
                console.error(err);
                setErrorParticipantsEvents(err.message);
            } finally {
                setLoadingParticipantsEvents(false);
            }
        };

        fetchMyEvents();
        fetchParticipantsEvents();
    }, []);

    const filteredMyEvents = useMemo(() => {
        const searchTerm = query.toLowerCase();
        return myEvents.filter((e) => {
            const titleText = e.name || e.title || "";
            const locationText = e.locationName || e.location || "";

            return (
                titleText.toLowerCase().includes(searchTerm) ||
                locationText.toLowerCase().includes(searchTerm)
            );
        });
    }, [myEvents, query]);

    const filteredParticipantsEvents = useMemo(() => {
        const searchTerm = query.toLowerCase();
        return participantsEvents.filter((e) => {
            const titleText = e.name || e.title || "";
            const locationText = e.locationName || e.location || "";

            return (
                titleText.toLowerCase().includes(searchTerm) ||
                locationText.toLowerCase().includes(searchTerm)
            );
        });
    }, [participantsEvents, query]);

    const now = Date.now();

    const pastEvents = filteredParticipantsEvents.filter((e) => {
        const eventTime = new Date(e.startDate || e.date).getTime();
        return eventTime && eventTime < now;
    });

    const upcomingEvents = filteredParticipantsEvents.filter((e) => {
        const eventTime = new Date(e.startDate || e.date).getTime();
        return eventTime && eventTime >= now;
    });

    return (
        <div className="min-h-screen w-full bg-gray-50">
            <div className="flex flex-col items-center py-5">
                <div className="flex flex-col w-full px-4 sm:px-6 lg:px-8">
                    <DashboardHeader />

                    <main className="mt-8 flex flex-col gap-12 flex-1">
                        <div className="flex items-center justify-between gap-4">
                            <p className="text-4xl font-black text-gray-900">Events</p>
                            <div className="flex items-center gap-4 w-full md:w-auto">
                                <div className="flex-1 w-full max-w-md">
                                    <SearchBar value={query} onChange={setQuery} />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => navigate("/events/new")}
                                    className="flex items-center justify-center gap-2 h-12 px-6 bg-pink-500 text-white font-bold rounded-lg hover:bg-pink-600 transition"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                    </svg>
                                    New Event
                                </button>
                            </div>
                        </div>

                        <section>
                            <h2 className="text-2xl font-bold mb-4">My Events</h2>
                            {myEvents.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {myEvents.map((ev) => (
                                        <MyEventCard key={ev.id} {...ev} />
                                    ))}
                                </div>
                            ) : (
                                <EmptyState onCreate={() => navigate("/events/new")} />
                            )}
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold mb-4">Upcoming Events</h2>
                            {upcomingEvents.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {upcomingEvents.map((ev) => (
                                        <EventCard key={ev.id} {...ev} />
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500">No upcoming events.</p>
                            )}
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold mb-4">Past Events</h2>
                            {pastEvents.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {pastEvents.map((ev) => (
                                        <EventCard key={ev.id} {...ev} />
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500">No past events.</p>
                            )}
                        </section>
                    </main>
                </div>
            </div>
        </div>
    );
}
