import React from "react";

export default function SearchBar({ value, onChange, placeholder = "Find an event or couple's name..." }) {
  return (
    <label className="flex flex-col min-w-40 h-12 w-full">
      <div className="flex w-full flex-1 items-stretch rounded-lg h-full bg-white">
        <div className="flex items-center justify-center pl-4 rounded-l-lg text-gray-500">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z" />
          </svg>
        </div>
        <input
          className="form-input flex w-full min-w-0 flex-1 rounded-r-lg text-gray-900 focus:outline-0 focus:ring-2 focus:ring-pink-300 border-none bg-white h-full placeholder:text-gray-500 px-4"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
        />
      </div>
    </label>
  );
}
