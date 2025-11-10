import React from "react";

export default function EmptyState({ onCreate }) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-12 mt-10 border-2 border-dashed border-gray-300 rounded-xl bg-white">
      <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 text-pink-500 mb-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
      </svg>
      <h3 className="text-2xl font-bold text-gray-900 mb-2">Ready to Plan?</h3>
      <p className="text-gray-500 max-w-md mb-6">You don't have any upcoming events yet. Get started by creating a new event for a happy couple!</p>
      <button
        onClick={onCreate}
        className="flex items-center justify-center gap-2 h-12 px-6 bg-pink-500 text-white text-base font-bold rounded-lg shadow-sm hover:bg-pink-600 transition"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
        Create Your First Event
      </button>
    </div>
  );
}
