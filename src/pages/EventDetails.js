import React from "react";
import HeroImage from "../components/HeroImage";
import EventInfoBlock from "../components/EventInfoBlock";
import PhotoGallery from "../components/PhotoGallery";
import { useParams, Navigate, useNavigate } from "react-router-dom";
import {ArrowLeftIcon} from "@heroicons/react/24/outline";
import {Button} from "@material-tailwind/react";

//TODO: Test with actual events from the database
//TODO: Add editing option for the event
//TODO: 
const SAMPLE_EVENTS = [
  {
    id: 1,
    hero:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBobJTu5yqNrsVPCYJcAynk5krrjS8Ovco2boT6NjRJm69zigvgYlZJaec7raLioj4RZU4XFTGCWKl9WvhXaMv4tqHII6ikJNXzFUt7Fxb1U_ZCbF1q45TqvBOggetO9OB_QkppaCZ_cBOBTaHj-QbA8XCF-hxXg6rsxD3xHA9V1Yqz5unJngEPleKEBr-1ZjXssyBxcgUgfGCZM9TgucCfVmEmg7V_htaE3kyc-ucc8Oy6-DlHmnQMNZ5feGQ4pw-1kbW7X-YSn0nS",
    title: "Amelia & Ben's Wedding",
    dateRange: "Apr 12–14, 2026",
    location: "The Grand Ballroom",
    organizers: [
      { name: "Amelia", avatar: "https://i.pravatar.cc/100?img=5" },
      { name: "Ben", avatar: "https://i.pravatar.cc/100?img=6" },
      { name: "Planner", avatar: "https://i.pravatar.cc/100?img=7" },
    ],
    gallery: [
      "https://images.unsplash.com/photo-1521335629791-ce4aec67dd53?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=800&auto=format&fit=crop",
    ],
  },
  {
    id: 2,
    hero:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCWe7aOxVYRRZNxzaWD68HV3DDhSC7hTS03i_xv9N9EmmT-W5mqx41oxjlQ2hayu99VloJVSs0o4Drzwaa-r73Uuba0LTg6mOnLnouqoJDbtdWcuzK4SmvPcAKVSIhl8jyJ8ny41q0BPgRSrnA8ep8lz5kuGwfu398hjxM5sklyEf7eEUqF087PBkrLaZ1s0Q4bUc26239NSGdXeUROldZHK3dwFAzNPX4y6hiL_poWb7xKvb9z9ZI7Eze7SC41O30Cnl03gTHFfY2X",
    title: "Sophia & Leo's Celebration",
    dateRange: "Jun 01–03, 2026",
    location: "Vineyard Estates",
    organizers: [
      { name: "Sophia", avatar: "https://i.pravatar.cc/100?img=8" },
      { name: "Leo", avatar: "https://i.pravatar.cc/100?img=9" },
      { name: "Planner", avatar: "https://i.pravatar.cc/100?img=10" },
    ],
    gallery: [
      "https://images.unsplash.com/photo-1519744792095-2f2205e87b6f?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1511287381795-6083d1b1a63a?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1460364157752-926555421a7e?q=80&w=800&auto=format&fit=crop",
    ],
  },
  {
    id: 3,
    hero:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDWbocaPhfxrlVKp8X1L6pAnNXEemMKGtQ1wuD2PcmPZpi65pxAL2zXpTmWgcGTpGyaF9ZQgPdqHXB78XYQFYGKe8QkKq1GlQv9xjmD629o8VQT3N1Jn7FnKmFX06CUhnrAYfqAkE63n9sE7zEvxj3Sj3Ye82p8prygBJAu5zxnGDRedueelJAALtCTO078qPrqCHZrhE6tOpXO8rplnp3CH4zkFwqh0Me-RMTwSGBVWEIDQrITuyL5OqcTXeso_IQ_8dtQmhP_ZQ9Y",
    title: "Chloe & Noah's Union",
    dateRange: "Sep 10–12, 2026",
    location: "Lakeside Pavilion",
    organizers: [
      { name: "Chloe", avatar: "https://i.pravatar.cc/100?img=11" },
      { name: "Noah", avatar: "https://i.pravatar.cc/100?img=12" },
      { name: "Planner", avatar: "https://i.pravatar.cc/100?img=13" },
    ],
    gallery: [
      "https://images.unsplash.com/photo-1519222970733-f546218fa6d7?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?q=80&w=800&auto=format&fit=crop",
    ],
  },
];

export default function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const numericId = Number(id);
  const event = SAMPLE_EVENTS.find((e) => e.id === numericId);
  const [gallery, setGallery] = React.useState(event ? event.gallery : []);

  if (!event) {
    return <Navigate to="/home" replace />;
  }

  const handleUpload = (files) => {
    const urls = files.map((f) => URL.createObjectURL(f));
    setGallery((prev) => [...urls, ...prev]);
  };

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
          <HeroImage src={event.hero} alt={event.title} />
          <EventInfoBlock
            title={event.title}
            dateRange={event.dateRange}
            location={event.location}
            organizers={event.organizers}
          />
          <PhotoGallery images={gallery} onUpload={handleUpload} />
        </div>
      </div>
    </div>
  );
}
