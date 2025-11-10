import React, { useMemo, useState } from "react";
import DashboardHeader from "../components/DashboardHeader";
import SearchBar from "../components/SearchBar";
import EventCard from "../components/EventCard";
import EmptyState from "../components/EmptyState";

export default function Home() {
    const user = useMemo(() => {
        try {
            return JSON.parse(localStorage.getItem("user"));
        } catch {
            return null;
        }
    }, []);

    const [query, setQuery] = useState("");
    const [events] = useState([
        {
            id: 1,
            image:
                "https://lh3.googleusercontent.com/aida-public/AB6AXuBobJTu5yqNrsVPCYJcAynk5krrjS8Ovco2boT6NjRJm69zigvgYlZJaec7raLioj4RZU4XFTGCWKl9WvhXaMv4tqHII6ikJNXzFUt7Fxb1U_ZCbF1q45TqvBOggetO9OB_QkppaCZ_cBOBTaHj-QbA8XCF-hxXg6rsxD3xHA9V1Yqz5unJngEPleKEBr-1ZjXssyBxcgUgfGCZM9TgucCfVmEmg7V_htaE3kyc-ucc8Oy6-DlHmnQMNZ5feGQ4pw-1kbW7X-YSn0nS",
            dateText: "In 3 weeks",
            title: "Amelia & Ben's Wedding",
            location: "The Grand Ballroom",
            status: "onTrack",
        },
        {
            id: 2,
            image:
                "https://lh3.googleusercontent.com/aida-public/AB6AXuCWe7aOxVYRRZNxzaWD68HV3DDhSC7hTS03i_xv9N9EmmT-W5mqx41oxjlQ2hayu99VloJVSs0o4Drzwaa-r73Uuba0LTg6mOnLnouqoJDbtdWcuzK4SmvPcAKVSIhl8jyJ8ny41q0BPgRSrnA8ep8lz5kuGwfu398hjxM5sklyEf7eEUqF087PBkrLaZ1s0Q4bUc26239NSGdXeUROldZHK3dwFAzNPX4y6hiL_poWb7xKvb9z9ZI7Eze7SC41O30Cnl03gTHFfY2X",
            dateText: "In 2 months",
            title: "Sophia & Leo's Celebration",
            location: "Vineyard Estates",
            status: "attention",
        },
        {
            id: 3,
            image:
                "https://lh3.googleusercontent.com/aida-public/AB6AXuDWbocaPhfxrlVKp8X1L6pAnNXEemMKGtQ1wuD2PcmPZpi65pxAL2zXpTmWgcGTpGyaF9ZQgPdqHXB78XYQFYGKe8QkKq1GlQv9xjmD629o8VQT3N1Jn7FnKmFX06CUhnrAYfqAkE63n9sE7zEvxj3Sj3Ye82p8prygBJAu5zxnGDRedueelJAALtCTO078qPrqCHZrhE6tOpXO8rplnp3CH4zkFwqh0Me-RMTwSGBVWEIDQrITuyL5OqcTXeso_IQ_8dtQmhP_ZQ9Y",
            dateText: "In 5 months",
            title: "Chloe & Noah's Union",
            location: "Lakeside Pavilion",
            status: "started",
        },
    ]);

    const filtered = events.filter(
        (e) =>
            e.title.toLowerCase().includes(query.toLowerCase()) ||
            e.location.toLowerCase().includes(query.toLowerCase())
    );

    return (
        <div className="min-h-screen w-full bg-gray-50">
            <div className="flex flex-col items-center py-5">
                <div className="flex flex-col w-full max-w-6xl px-4 sm:px-6 lg:px-8">
                    <DashboardHeader />

                    <main className="mt-8 flex flex-col gap-8 flex-1">
                        <div className="flex flex-wrap items-center justify-between gap-4 px-4">
                            <p className="text-4xl font-black leading-tight tracking-tight min-w-72 text-gray-900">
                                Upcoming Events
                            </p>
                            <div className="flex items-center gap-4 w-full md:w-auto">
                                <div className="flex-1 w-full max-w-md">
                                    <SearchBar value={query} onChange={setQuery} />
                                </div>
                                <button className="flex items-center justify-center gap-2 h-12 px-6 bg-pink-500 text-white text-base font-bold rounded-lg shadow-sm hover:bg-pink-600 transition">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                    </svg>
                                    New Event
                                </button>
                            </div>
                        </div>

                        {filtered.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4">
                                {filtered.map((ev) => (
                                    <EventCard key={ev.id} {...ev} />
                                ))}
                            </div>
                        ) : (
                            <div className="px-4">
                                <EmptyState onCreate={() => {}} />
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
}

