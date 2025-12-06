"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { hasFeature, hasSuperPremium, getStorageUsed, getStorageLimit, updateStorageUsed } from "@/utils/subscription";
import { loadData, saveData } from "@/utils/storage";
import { GalleryPhoto } from "@/types/gallery";
import AppLayout from "@/components/AppLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import Link from "next/link";

export default function GalleryPage() {
  return (
    <ProtectedRoute>
      <GalleryPageContent />
    </ProtectedRoute>
  );
}

function GalleryPageContent() {
  const router = useRouter();
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [uploading, setUploading] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<GalleryPhoto | null>(null);
  const [caption, setCaption] = useState("");
  const [tags, setTags] = useState("");
  const storageUsed = getStorageUsed();
  const storageLimit = getStorageLimit();
  const isSuperPremium = hasSuperPremium();

  useEffect(() => {
    if (!hasFeature("photoStorage")) {
      router.push("/subscription");
      return;
    }
    
    const savedPhotos = loadData<GalleryPhoto[]>("gallery_photos") || [];
    setPhotos(savedPhotos.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  }, [router]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileSizeMB = file.size / (1024 * 1024);
    
    if (storageUsed + fileSizeMB > storageLimit) {
      alert(`Not enough storage space. You have ${(storageLimit - storageUsed).toFixed(1)}MB remaining.`);
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert("File size must be less than 10MB");
      return;
    }

    setUploading(true);

    // Convert to base64 (in production, upload to Supabase Storage)
    const reader = new FileReader();
    reader.onloadend = () => {
      const newPhoto: GalleryPhoto = {
        id: Date.now().toString(),
        tankId: "main", // TODO: Support multi-tank
        url: reader.result as string,
        caption: caption || "Untitled",
        date: new Date().toISOString(),
        size: file.size,
        tags: tags ? tags.split(",").map(t => t.trim()) : [],
      };

      const updatedPhotos = [newPhoto, ...photos];
      setPhotos(updatedPhotos);
      saveData("gallery_photos", updatedPhotos);

      // Update storage usage
      updateStorageUsed(storageUsed + fileSizeMB);

      setCaption("");
      setTags("");
      setUploading(false);
    };

    reader.readAsDataURL(file);
  };

  const handleDelete = (photoId: string) => {
    if (!confirm("Delete this photo?")) return;

    const photoToDelete = photos.find(p => p.id === photoId);
    if (photoToDelete) {
      const fileSizeMB = photoToDelete.size / (1024 * 1024);
      updateStorageUsed(Math.max(0, storageUsed - fileSizeMB));
    }

    const updatedPhotos = photos.filter(p => p.id !== photoId);
    setPhotos(updatedPhotos);
    saveData("gallery_photos", updatedPhotos);
    setSelectedPhoto(null);
  };

  if (!hasFeature("photoStorage")) {
    return null;
  }

  const storagePercent = (storageUsed / storageLimit) * 100;

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6 animate-slideDown">
          <div>
            <h1 className="text-3xl font-bold text-gradient mb-2">Photo Gallery</h1>
            <p className="text-gray-400 text-sm">
              Document your reef's journey {isSuperPremium && "🚀"}
            </p>
          </div>
          
          {!isSuperPremium && (
            <Link
              href="/subscription"
              className="px-4 py-2 bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 text-white rounded-lg text-sm font-semibold hover:from-pink-700 hover:via-purple-700 hover:to-blue-700 transition"
            >
              Upgrade for More Storage
            </Link>
          )}
        </div>

        {/* Storage Usage */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-lg p-4 mb-6 animate-fadeIn">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Storage Used</span>
            <span className="text-sm font-semibold text-white">
              {storageUsed.toFixed(1)} MB / {storageLimit} MB
            </span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                storagePercent > 90 ? "bg-red-500" : storagePercent > 70 ? "bg-yellow-500" : "bg-gradient-to-r from-purple-600 to-pink-600"
              }`}
              style={{ width: `${Math.min(storagePercent, 100)}%` }}
            />
          </div>
        </div>

        {/* Upload Section */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-lg p-6 mb-6 animate-fadeIn">
          <h2 className="text-xl font-bold text-white mb-4">Upload Photo</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Caption
              </label>
              <input
                type="text"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="e.g., New coral placement"
                className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Tags (comma-separated)
              </label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="e.g., coral, SPS, growth"
                className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block w-full">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  disabled={uploading || storageUsed >= storageLimit}
                  className="hidden"
                />
                <div className={`
                  py-8 border-2 border-dashed rounded-lg text-center cursor-pointer transition
                  ${uploading || storageUsed >= storageLimit 
                    ? "border-gray-600 bg-gray-800 cursor-not-allowed" 
                    : "border-purple-500 bg-purple-900/20 hover:bg-purple-900/30"
                  }
                `}>
                  {uploading ? (
                    <p className="text-gray-400">Uploading...</p>
                  ) : storageUsed >= storageLimit ? (
                    <p className="text-red-400">Storage limit reached</p>
                  ) : (
                    <>
                      <p className="text-purple-400 font-semibold mb-2">Click to upload photo</p>
                      <p className="text-xs text-gray-500">Max 10MB per file</p>
                    </>
                  )}
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Photo Grid */}
        {photos.length === 0 ? (
          <div className="text-center py-16 bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-lg">
            <div className="text-6xl mb-4">📸</div>
            <p className="text-gray-400 mb-2">No photos yet</p>
            <p className="text-sm text-gray-500">Upload your first tank photo above</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {photos.map((photo) => (
              <div
                key={photo.id}
                onClick={() => setSelectedPhoto(photo)}
                className="relative group cursor-pointer rounded-lg overflow-hidden bg-gray-800 aspect-square animate-fadeIn hover:ring-2 hover:ring-purple-500 transition"
              >
                <img
                  src={photo.url}
                  alt={photo.caption}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <p className="text-white text-sm font-semibold truncate">{photo.caption}</p>
                    <p className="text-gray-300 text-xs">
                      {new Date(photo.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Photo Modal */}
        {selectedPhoto && (
          <div
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedPhoto(null)}
          >
            <div
              className="relative max-w-4xl w-full bg-gray-900 rounded-lg overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={selectedPhoto.url}
                alt={selectedPhoto.caption}
                className="w-full max-h-[70vh] object-contain bg-black"
              />
              
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">{selectedPhoto.caption}</h3>
                    <p className="text-sm text-gray-400">
                      {new Date(selectedPhoto.date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  
                  <button
                    onClick={() => setSelectedPhoto(null)}
                    className="text-gray-400 hover:text-white transition text-2xl"
                  >
                    ✕
                  </button>
                </div>

                {selectedPhoto.tags && selectedPhoto.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {selectedPhoto.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-purple-900/30 border border-purple-500/50 rounded text-xs text-purple-300"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => handleDelete(selectedPhoto.id)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm font-semibold"
                  >
                    Delete Photo
                  </button>
                  
                  <button
                    onClick={() => setSelectedPhoto(null)}
                    className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition text-sm"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Demo Note */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500 italic">
            Demo: Photos stored in browser localStorage. In production, use Supabase Storage.
          </p>
        </div>
      </div>
    </AppLayout>
  );
}
