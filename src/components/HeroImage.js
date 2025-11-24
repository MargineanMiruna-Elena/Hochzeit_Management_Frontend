import React from "react";

export default function HeroImage({ src, alt = "Event", heightClass = "h-72 md:h-96" }) {
  return (
    <div className={`w-full ${heightClass} rounded-xl overflow-hidden relative`}>
      <div
        className="absolute inset-0 bg-center bg-cover"
        style={{ backgroundImage: `url(${src})` }}
        aria-label={alt}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
    </div>
  );
}
