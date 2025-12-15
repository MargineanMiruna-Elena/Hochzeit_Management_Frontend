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
    const [loadingMyEvents, setLoadingMyEvents] = useState(true);
    const [errorMyEvents, setErrorMyEvents] = useState("");
    const navigate = useNavigate();

    // Removed static baseEvents and localStorage createdEvents to rely on backend data.
    
    const events = myEvents;

    const filteredEvents = events.filter(
        (e) =>
            (e.name || e.title || "").toLowerCase().includes(query.toLowerCase()) ||
            (e.location || "").toLowerCase().includes(query.toLowerCase())
    );

    const now = Date.now();
    const pastEvents = filteredEvents.filter((e) => {
        const date = new Date(e.startDate || e.date).getTime();
        return date < now;
    });
    const upcomingEvents = filteredEvents.filter((e) => {
        const date = new Date(e.startDate || e.date).getTime();
        return date >= now;
    });

    // Helper to format date for display
    const formatDate = (dateStr) => {
        if (!dateStr) return "";
        const d = new Date(dateStr);
        return d.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
    };

    useEffect(() => {
        const fetchMyEvents = async () => {
            setLoadingMyEvents(true);
            setErrorMyEvents("");
            try {
                const token = localStorage.getItem("token");
                const user = JSON.parse(localStorage.getItem("user"));
                
                if (!token || !user) return;

                // Fetch events for the logged-in user
                // Adjust endpoint if necessary. Assuming GET /api/events/user/{userId} or similar exists
                // based on typical REST patterns, or using the existing /my-events if that's what the backend provides.
                // The previous code used /api/events/my-events, let's stick to that or try a more standard one if it fails.
                const res = await fetch(`http://localhost:8080/api/events/user/${user.id}`, {
                    headers: {
                        "Authorization": `Bearer ${token}`,
                    },
                });
                
                if (!res.ok) {
                    // Fallback to previous endpoint if the above doesn't exist
                     const res2 = await fetch("http://localhost:8080/api/events/my-events", {
                        headers: {
                            "Authorization": `Bearer ${token}`,
                        },
                    });
                    if(!res2.ok) {
                         const errText = await res2.text();
                         throw new Error(errText || "Failed to fetch my events");
                    }
                    const data = await res2.json();
                    setMyEvents(data);
                    return;
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

        fetchMyEvents();
    }, []);

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

                        {/* My Events */}
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

                        {/* Past Events */}
                        <section>
                            <h2 className="text-2xl font-bold mb-4">Past Events</h2>
                            {pastEvents.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {pastEvents.map((event) => (
                                        <EventCard
                                            key={event.id}
                                            id={event.id}
                                            image={event.imageUrl || event.image}
                                            dateText={formatDate(event.startDate || event.date)}
                                            title={event.name || event.title}
                                            location={event.location || "Unknown Location"}
                                            status={event.status || "started"}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500">No past events.</p>
                            )}
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold mb-4">Upcoming Events</h2>
                            {upcomingEvents.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {upcomingEvents.map((event) => (
                                        <EventCard
                                            key={event.id}
                                            id={event.id}
                                            image={event.imageUrl || event.image}
                                            dateText={formatDate(event.startDate || event.date)}
                                            title={event.name || event.title}
                                            location={event.location || "Unknown Location"}
                                            status={event.status || "started"}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500">No upcoming events.</p>
                            )}
                        </section>
                    </main>
                </div>
            </div>
        </div>
    );
}
