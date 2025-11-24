import React from "react";

export default function EventInfoBlock({ title, dateRange, location, organizers = [] }) {
  return (
    <section className="mt-6 bg-white rounded-xl shadow-sm p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900">{title}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-4 text-gray-600">
            <div className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M6.75 3a.75.75 0 01.75.75V6h9V3.75a.75.75 0 011.5 0V6h.75A2.25 2.25 0 0121 8.25v9A2.25 2.25 0 0118.75 19.5H5.25A2.25 2.25 0 013 17.25v-9A2.25 2.25 0 015.25 6h.75V3.75A.75.75 0 016.75 3zm0 7.5a.75.75 0 100 1.5h10.5a.75.75 0 000-1.5H6.75z" />
              </svg>
              <span>{dateRange}</span>
            </div>
            <div className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21.75c2.548-2.295 6.375-6.87 6.375-10.592 0-3.53-2.84-6.395-6.375-6.395S5.625 7.629 5.625 11.158c0 3.722 3.827 8.297 6.375 10.592z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 13.125a1.875 1.875 0 100-3.75 1.875 1.875 0 000 3.75z" />
              </svg>
              <span>{location}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {organizers.map((o, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <div
                className="h-10 w-10 rounded-full bg-cover bg-center"
                style={{ backgroundImage: `url(${o.avatar})` }}
                title={o.name}
              />
              <span className="hidden sm:inline text-sm text-gray-700">{o.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
