import React from "react";
import { Link } from "react-router-dom";

const statusStyles = {
  onTrack: {
    wrapper: "bg-theme-green/20 text-theme-green",
    dot: "bg-theme-green",
    label: "On Track",
  },
  attention: {
    wrapper: "bg-theme-pink/20 text-theme-pink",
    dot: "bg-theme-pink",
    label: "Needs Attention",
  },
  started: {
    wrapper: "bg-gray-200 text-gray-700",
    dot: "bg-gray-500",
    label: "Just Started",
  },
};

export default function EventCard({ id, image, dateText, title, location, status = "onTrack" }) {
  const s = statusStyles[status] || statusStyles.onTrack;
  return (
    <div className="p-4">
      <div className="flex flex-col rounded-xl shadow transition-transform transition-shadow duration-300 ease-out hover:-translate-y-2 hover:shadow-xl bg-white">
        <div
          className="w-full bg-center bg-no-repeat aspect-[16/10] bg-cover rounded-t-xl"
          style={{ backgroundImage: `url(${image})` }}
        />
        <div className="flex flex-col gap-4 p-4">
          <div>
            <p className="text-gray-500 text-sm">{dateText}</p>
            <p className="text-lg font-bold leading-tight text-gray-900">{title}</p>
          </div>
          <div className="flex items-center gap-2 text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 21.75c2.548-2.295 6.375-6.87 6.375-10.592 0-3.53-2.84-6.395-6.375-6.395S5.625 7.629 5.625 11.158c0 3.722 3.827 8.297 6.375 10.592z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 13.125a1.875 1.875 0 100-3.75 1.875 1.875 0 000 3.75z" />
            </svg>
            <p className="text-sm">{location}</p>
          </div>
          <div className="flex items-center gap-3 justify-between mt-2">
            <div className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium ${s.wrapper}`}>
              <span className={`size-2 rounded-full ${s.dot}`}></span>
              {s.label}
            </div>
            <Link
              to={`/events/${id}`}
              className="flex items-center justify-center h-10 px-4 rounded-lg bg-theme-pink text-white text-sm font-semibold hover:opacity-90 transition"
            >
              View Details
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
