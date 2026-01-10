import React, {useState, useEffect, useContext} from "react";
import {ArrowUpOnSquareIcon, ChevronLeftIcon, ChevronRightIcon, PlusIcon, XMarkIcon} from "@heroicons/react/16/solid";
import {TrashIcon} from "@heroicons/react/24/outline";
import {AuthContext} from "../context/AuthContext";
import {Button} from "@material-tailwind/react";

export default function PhotoGallery({ eventId, org1, org2 }) {
  const { user } = useContext(AuthContext);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const fileInputRef = React.useRef(null);

  const canDelete = (img) => {
    if (!user) return false;

    if (user.id !== img.userId) {
      if (user.email !== org1 || user.email !== org2) {
        return false;
      }
    }

    return true;
  }

  useEffect(() => {
    fetchImages();
  }, [eventId]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!selectedImage) return;
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "Escape") setSelectedImage(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedImage, images]);

  const fetchImages = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:8080/api/images/event/${eventId}`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setImages(data);
      }
    } catch (error) {
      console.error('Error fetching images:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClick = () => fileInputRef.current?.click();

  const handleChange = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setUploading(true);

    try {
      const token = localStorage.getItem("token");
      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`http://localhost:8080/api/images/upload/${eventId}`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: formData,
        });

        if (!response.ok) alert(`Failed to upload ${file.name}`);
      }
      await fetchImages();
    } catch (error) {
      console.error('Error uploading:', error);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleDelete = async (imgId) => {
    if (!window.confirm('Are you sure you want to delete this image?')) return;
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:8080/api/images/${imgId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        handleNext();
        if (images.length <= 1) setSelectedImage(null);
        await fetchImages();
      }
    } catch (error) {
      alert('Failed to delete image');
    }
  };

  const handleNext = (e) => {
    e?.stopPropagation();
    if (images.length === 0) return;
    const currentIndex = images.findIndex(img => img.id === selectedImage.id);
    const nextIndex = (currentIndex + 1) % images.length;
    setSelectedImage(images[nextIndex]);
  };

  const handlePrev = (e) => {
    e?.stopPropagation();
    if (images.length === 0) return;
    const currentIndex = images.findIndex(img => img.id === selectedImage.id);
    const prevIndex = (currentIndex - 1 + images.length) % images.length;
    setSelectedImage(images[prevIndex]);
  };

  return (
      <section className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Photo Gallery</h2>
          <Button
              onClick={handleClick}
              disabled={uploading}
              className="flex items-center gap-2 bg-pink-600"
          >
            <ArrowUpOnSquareIcon className="size-5"></ArrowUpOnSquareIcon> {uploading ? 'Uploading...' : 'Upload Photos'}
          </Button>
          <input ref={fileInputRef} type="file" multiple accept="image/*" className="hidden" onChange={handleChange} />
        </div>

        {loading ? (
            <div className="text-center py-10 text-gray-500">Loading gallery...</div>
        ) : images.length === 0 ? (
            <div className="text-gray-400 text-sm text-center py-8">
              No photos yet.
            </div>
        ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {images.map((img) => (
                  <div
                      key={img.id}
                      className="group cursor-pointer rounded-xl overflow-hidden h-40 bg-gray-100 shadow-sm hover:shadow-md transition-all"
                      onClick={() => setSelectedImage(img)}
                  >
                    <img
                        src={`http://localhost:8080${img.fileName}`}
                        className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                        alt="gallery"
                    />
                  </div>
              ))}
            </div>
        )}

        {selectedImage && (
            <div
                className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-300"
                onClick={() => setSelectedImage(null)}
            >
              <div
                  className="relative flex flex-col md:flex-row max-w-6xl w-full rounded-3xl overflow-hidden max-h-[90vh] shadow-2xl"
                  onClick={(e) => e.stopPropagation()}
              >

                <div className="relative flex-1 flex items-center justify-center bg-white overflow-hidden group">
                  <button
                      onClick={handlePrev}
                      className="absolute left-4 z-10 p-3 rounded-full bg-pink-400 hover:bg-pink-600 text-white transition-all opacity-0 group-hover:opacity-100 backdrop-blur-md"
                  >
                    <ChevronLeftIcon className="size-7"></ChevronLeftIcon>
                  </button>

                  <img
                      src={`http://localhost:8080${selectedImage.fileName}`}
                      className="max-w-full max-h-[85vh] object-contain"
                      alt="Full preview"
                  />

                  <button
                      onClick={handleNext}
                      className="absolute right-4 z-10 p-3 rounded-full bg-pink-400 hover:bg-pink-600 text-white transition-all opacity-0 group-hover:opacity-100 backdrop-blur-md"
                  >
                    <ChevronRightIcon className="size-7"></ChevronRightIcon>
                  </button>
                </div>

                <div className="w-full md:w-24 bg-pink-400 flex md:flex-col items-center justify-center gap-8 p-6 border-t md:border-t-0 md:border-l border-gray-700">

                  <button onClick={() => { handleClick(); setSelectedImage(null); }} className="flex flex-col items-center gap-2 group">
                    <div className="p-3 bg-green-500 text-white rounded-2xl">
                      <PlusIcon className="size-7"></PlusIcon>
                    </div>
                  </button>

                  {canDelete(selectedImage) &&
                      (
                          <button onClick={() => handleDelete(selectedImage.id)} className="flex flex-col items-center gap-2 group">
                            <div className="p-3 bg-red-500 text-white rounded-2xl">
                              <TrashIcon className="size-7"></TrashIcon>
                            </div>
                          </button>
                      )}

                  <button onClick={() => setSelectedImage(null)} className="flex flex-col items-center gap-2 group">
                    <div className="p-3 text-gray-300 rounded-2xl bg-gray-600">
                      <XMarkIcon className="size-7"></XMarkIcon>
                    </div>
                  </button>

                </div>
              </div>
            </div>
        )}
      </section>
  );
}