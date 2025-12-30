import React, { useEffect, useMemo, useRef, useState } from "react";
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@material-tailwind/react";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import PhotoGallery from "../components/PhotoGallery";

const libraries = ["places"];
const mapContainerStyle = {
  width: '100%',
  height: '300px',
  borderRadius: '0.5rem'
};
const defaultCenter = {
  lat: 40.7128,
  lng: -74.0060
};

export default function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [gallery, setGallery] = useState([]);

  const mapRef = useRef(null);

  const eventCoords = useMemo(() => {
    const locString = event?.locationCoordinates;

    if (locString && typeof locString === 'string') {
      const cleanString = locString.replace(/[^\d.,-]/g, '');
      const parts = cleanString.split(',');

      if (parts.length === 2) {
        const lat = parseFloat(parts[0]);
        const lng = parseFloat(parts[1]);

        if (!isNaN(lat) && !isNaN(lng)) {
          return { lat, lng };
        }
      }
    }
    return null;
  }, [event?.locationCoordinates]);

  const onMapLoad = (map) => {
    mapRef.current = map;
    if (eventCoords) {
      map.panTo(eventCoords);
    }
  };

  useEffect(() => {
    if (eventCoords && mapRef.current) {
      mapRef.current.panTo(eventCoords);
    }
  }, [eventCoords]);

  const mapOptions = useMemo(() => ({
    keyboardShortcuts: false,
    clickableIcons: true,
    disableDefaultUI: false,
    zoomControl: true,
    gestureHandling: "cooperative"
  }), []);

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries
  });

  const formatDate = (date) => new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });

  useEffect(() => {
    const fetchEvent = async () => {
      setLoading(true);
      setError("");
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        const eventRes = await fetch(`http://localhost:8080/api/events/${id}`, { headers });

        if (!eventRes.ok) throw new Error("Failed to fetch event");

        const eventData = await eventRes.json();
        setEvent(eventData);

        // Initialize gallery with existing images if any
        // You can modify this based on your backend structure
        setGallery([]);

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  if (loading) return <p className="p-4">Loading event...</p>;
  if (error) return <p className="p-4 text-red-500">Error: {error}</p>;
  if (!event) return <p className="p-4">Event not found.</p>;

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
                className="self-start mb-2 inline-flex items-center px-4 py-2 rounded-md bg-pink-600 text-white text-sm font-medium hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-1" />
              Back to Home
            </Button>

            {/* Hero Image Section */}
            <div className="relative h-64 w-full rounded-xl overflow-hidden shadow-lg">
              <img
                  src={event.image || "https://via.placeholder.com/1200x400"}
                  alt={event.name}
                  className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-4 left-6 text-white">
                <h1 className="text-3xl font-bold drop-shadow-lg">{event.name}</h1>
              </div>
            </div>

            <section className="mt-2 bg-white rounded-xl shadow-sm p-6">
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-4">
                    <div className="bg-card rounded-xl p-6 shadow-card border border-border/50">
                      <h3 className="font-medium text-lg tracking-wide mb-2">Event Description</h3>
                      <p className="text-gray-700">{event.description || "No description available"}</p>
                    </div>

                    <div className="bg-card rounded-xl p-6 shadow-card border border-border/50">
                      <h3 className="font-medium text-lg tracking-wide mb-2">Event Dates</h3>
                      <p className="font-semibold text-md text-gray-800">
                        {formatDate(event.startDate)} - {formatDate(event.endDate)}
                      </p>
                    </div>

                    <div className="bg-card rounded-xl p-6 shadow-card border border-border/50">
                      <h3 className="font-medium text-lg tracking-wide mb-2">Contact Organizers</h3>
                      <div className="space-y-3">
                        {event.emailOrg1 && (
                            <div>
                              <label className="block text-sm font-bold text-gray-700">
                                Organizer 1
                              </label>
                              <div className="text-gray-600" title={event.emailOrg1}>
                                {event.emailOrg1}
                              </div>
                            </div>
                        )}

                        {event.emailOrg2 && (
                            <div className="pt-2 border-t border-gray-100">
                              <label className="block text-sm font-bold text-gray-700">
                                Organizer 2
                              </label>
                              <div className="text-gray-600" title={event.emailOrg2}>
                                {event.emailOrg2}
                              </div>
                            </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="bg-card rounded-xl p-6 shadow-card border border-border/50">
                    <h3 className="font-medium text-lg tracking-wide mb-4">Location</h3>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div>
                          <p className="font-bold text-gray-900">{event.locationName || "No location name"}</p>
                          <p className="text-sm text-gray-600">{event.locationAddress || "No address provided"}</p>
                          <p className="text-xs text-gray-400 font-mono mt-1">
                            [{event.locationCoordinates || "No coordinates"}]
                          </p>
                        </div>
                      </div>

                      <div className="mt-4">
                        {isLoaded ? (
                            <GoogleMap
                                key={eventCoords ? `${eventCoords.lat}-${eventCoords.lng}` : "view"}
                                mapContainerStyle={mapContainerStyle}
                                center={eventCoords || defaultCenter}
                                zoom={15}
                                onLoad={onMapLoad}
                                options={mapOptions}
                            >
                              {eventCoords && <Marker position={eventCoords} />}
                            </GoogleMap>
                        ) : (
                            <div className="h-[300px] w-full bg-gray-200 rounded-lg flex items-center justify-center text-gray-500">
                              Loading Map...
                            </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Photo Gallery Section */}
            <section className="mt-2">
              <PhotoGallery images={gallery} onUpload={handleUpload} />
            </section>
          </div>
        </div>
      </div>
  );
}