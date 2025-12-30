import React from "react";

export default function PhotoGallery({ images = [], onUpload }) {
  const fileInputRef = React.useRef(null);

  const handleClick = () => fileInputRef.current?.click();
  const handleChange = (e) => {
    const files = Array.from(e.target.files || []);
    onUpload?.(files);
    e.target.value = ""; // reset
  };

  return (
    <section className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">Photo Gallery</h2>
        <button
          type="button"
          onClick={handleClick}
          className="inline-flex items-center gap-2 px-4 h-10 rounded-lg bg-theme-pink text-white font-semibold hover:opacity-90 transition"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Upload Photos
        </button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={handleChange}
        />
      </div>
      {images.length === 0 ? (
        <div className="text-gray-500 text-sm">No photos yet. Be the first to upload.</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {images.map((src, idx) => (
            <div key={idx} className="relative group rounded-lg overflow-hidden">
              <img src={src} alt={`gallery-${idx}`} className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300 ease-out" />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
