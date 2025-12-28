"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useSubscription } from "@/context/SubscriptionContext";
import { useTank } from "@/context/TankContext";
import { hasFeatureAccess } from "@/utils/subscription";
import { Livestock, LivestockType, LivestockStatus } from "@/types/livestock";
import AppLayout from "@/components/AppLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import Link from "next/link";
import Image from "next/image";

export default function LivestockPage() {
  return (
    <ProtectedRoute>
      <LivestockPageContent />
    </ProtectedRoute>
  );
}

function LivestockPageContent() {
  const [livestock, setLivestock] = useState<Livestock[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<LivestockType | "all">("all");
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLivestockId, setDeleteLivestockId] = useState<string | null>(null);
  const { currentTank, tanks } = useTank();
  const [uploadingPhoto, setUploadingPhoto] = useState<string | null>(null);
  const [viewingPhoto, setViewingPhoto] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState<Partial<Livestock>>({
    name: "",
    type: "fish",
    species: "",
    scientificName: "",
    dateAdded: new Date().toISOString().split("T")[0],
    source: "",
    cost: undefined,
    notes: "",
    status: "healthy",
    size: "",
    temperament: "peaceful",
  });

  const { subscription } = useSubscription();

  useEffect(() => {
    const access = hasFeatureAccess(subscription.tier, 'LIVESTOCK_INVENTORY');
    setHasAccess(access);
    
    if (access) {
      loadLivestock();
    }
  }, [subscription.tier]);

  const loadLivestock = async () => {
    try {
      const response = await fetch('/api/livestock');
      const data = await response.json();
      // Map snake_case from API to camelCase for frontend
      const mapped = data.map((item: Record<string, unknown>) => ({
        id: item.id,
        tankId: item.tank_id,
        tankName: item.tank_name,
        name: item.name,
        type: item.type,
        species: item.species,
        scientificName: item.scientific_name,
        dateAdded: item.date_added,
        source: item.source,
        cost: item.cost,
        notes: item.notes,
        photoUrl: item.photo_url,
        status: item.status,
        size: item.size,
        temperament: item.temperament,
      }));
      setLivestock(mapped);
    } catch (err) {
      console.error('Failed to load livestock:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name) {
      toast.error("Name is required");
      return;
    }

    try {
      const method = editingId ? 'PUT' : 'POST';
      const url = editingId ? `/api/livestock/${editingId}` : '/api/livestock';

      if (!currentTank) {
        toast.error('No tank selected. Please select a tank first.');
        return;
      }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          type: formData.type || "fish",
          species: formData.species,
          added_date: formData.dateAdded || new Date().toISOString().split("T")[0],
          vendor: formData.source,
          purchase_price: formData.cost,
          notes: formData.notes,
          health_status: formData.status || "healthy",
          tank_id: currentTank.id,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save livestock');
      }

      await loadLivestock();

      // Reset form
      setFormData({
        name: "",
        type: "fish",
        species: "",
        scientificName: "",
        dateAdded: new Date().toISOString().split("T")[0],
        source: "",
        cost: undefined,
        notes: "",
        status: "healthy",
        size: "",
        temperament: "peaceful",
      });
      setEditingId(null);
      setShowForm(false);
    } catch (err) {
      console.error('Failed to save livestock:', err);
      toast.error('Failed to save livestock');
    }
  };

  const handleEdit = (item: Livestock) => {
    setFormData(item);
    setEditingId(item.id);
    setShowForm(true);
  };

  const handleDeleteClick = (id: string) => {
    setDeleteLivestockId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deleteLivestockId) return;
    
    try {
      const response = await fetch(`/api/livestock/${deleteLivestockId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete livestock');
      }

      await loadLivestock();
    } catch (err) {
      console.error('Failed to delete livestock:', err);
      toast.error('Failed to remove livestock');
    } finally {
      setShowDeleteModal(false);
      setDeleteLivestockId(null);
    }
  };

  const handlePhotoUpload = async (livestockId: string, file: File) => {
    setUploadingPhoto(livestockId);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch(`/api/livestock/${livestockId}/photo`, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to upload photo');
      }
      
      toast.success('Photo uploaded!');
      await loadLivestock();
    } catch (err) {
      console.error('Photo upload error:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to upload photo');
    } finally {
      setUploadingPhoto(null);
    }
  };

  const handlePhotoDelete = async (livestockId: string) => {
    try {
      const response = await fetch(`/api/livestock/${livestockId}/photo`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete photo');
      }
      
      toast.success('Photo removed');
      setViewingPhoto(null);
      await loadLivestock();
    } catch (err) {
      console.error('Photo delete error:', err);
      toast.error('Failed to remove photo');
    }
  };

  // Show loading state
  if (hasAccess === null) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <p className="text-gray-400">Loading...</p>
        </div>
      </AppLayout>
    );
  }

  // Show upgrade prompt if no access
  if (!hasAccess) {
    return (
      <AppLayout>
        <div className="max-w-2xl mx-auto text-center py-12">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-3xl font-bold text-white mb-4">Super Premium Feature</h1>
          <p className="text-gray-400 text-lg mb-8">
            Livestock inventory is exclusively available for Super Premium members.
          </p>
          <Link
            href="/subscription"
            className="inline-block px-8 py-3 bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 text-white rounded-lg font-semibold hover:from-pink-700 hover:via-purple-700 hover:to-blue-700 transition"
          >
            Upgrade to Super Premium - $9.99/mo
          </Link>
        </div>
      </AppLayout>
    );
  }

  const filtered = filterType === "all" 
    ? livestock 
    : livestock.filter(l => l.type === filterType);

  const stats = {
    fish: livestock.filter(l => l.type === "fish").length,
    coral: livestock.filter(l => l.type === "coral").length,
    invert: livestock.filter(l => l.type === "invert").length,
    total: livestock.length,
  };

  const typeIcons = {
    fish: "🐠",
    coral: "🪸",
    invert: "🦐",
  };

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4 animate-slideDown">
          <div>
            <h1 className="text-3xl font-bold text-gradient mb-2">Livestock Inventory</h1>
            <p className="text-gray-400 text-sm">
              {stats.fish} Fish • {stats.coral} Corals • {stats.invert} Inverts
            </p>
          </div>
          
          <button
            onClick={() => {
              setShowForm(!showForm);
              if (showForm) {
                setEditingId(null);
                setFormData({
                  name: "",
                  type: "fish",
                  species: "",
                  scientificName: "",
                  dateAdded: new Date().toISOString().split("T")[0],
                  source: "",
                  cost: undefined,
                  notes: "",
                  status: "healthy",
                  size: "",
                  temperament: "peaceful",
                });
              }
            }}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 hover:scale-105"
          >
            {showForm ? "Cancel" : "+ Add Livestock"}
          </button>
        </div>

        {/* Add/Edit Form */}
        {showForm && (
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-lg p-6 mb-6 animate-slideDown">
            <h2 className="text-xl font-bold text-white mb-4">
              {editingId ? "Edit Livestock" : "Add New Livestock"}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="e.g., Nemo, Blue Acro"
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value as LivestockType})}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="fish">🐠 Fish</option>
                    <option value="coral">🪸 Coral</option>
                    <option value="invert">🦐 Invertebrate</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Common Species
                  </label>
                  <input
                    type="text"
                    value={formData.species}
                    onChange={(e) => setFormData({...formData, species: e.target.value})}
                    placeholder="e.g., Clownfish, Acropora"
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Scientific Name
                  </label>
                  <input
                    type="text"
                    value={formData.scientificName}
                    onChange={(e) => setFormData({...formData, scientificName: e.target.value})}
                    placeholder="e.g., Amphiprion ocellaris"
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Date Added
                  </label>
                  <input
                    type="date"
                    value={formData.dateAdded}
                    onChange={(e) => setFormData({...formData, dateAdded: e.target.value})}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Source
                  </label>
                  <input
                    type="text"
                    value={formData.source}
                    onChange={(e) => setFormData({...formData, source: e.target.value})}
                    placeholder="e.g., LFS, Online, Frag Swap"
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Cost
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.cost || ""}
                    onChange={(e) => setFormData({...formData, cost: parseFloat(e.target.value) || undefined})}
                    placeholder="0.00"
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value as LivestockStatus})}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="healthy">Healthy</option>
                    <option value="quarantine">Quarantine</option>
                    <option value="sick">Sick</option>
                    <option value="deceased">Deceased</option>
                  </select>
                </div>

                {formData.type === "fish" && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Size
                      </label>
                      <input
                        type="text"
                        value={formData.size}
                        onChange={(e) => setFormData({...formData, size: e.target.value})}
                        placeholder="e.g., 2 inches"
                        className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Temperament
                      </label>
                      <select
                        value={formData.temperament}
                        onChange={(e) => setFormData({...formData, temperament: e.target.value as Livestock["temperament"]})}
                        className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="peaceful">Peaceful</option>
                        <option value="semi-aggressive">Semi-Aggressive</option>
                        <option value="aggressive">Aggressive</option>
                      </select>
                    </div>
                  </>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  placeholder="Feeding habits, behavior, special care notes..."
                  rows={3}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition"
                >
                  {editingId ? "Update" : "Add to Inventory"}
                </button>
                
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                  }}
                  className="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Type Filter */}
        <div className="flex flex-wrap gap-2 mb-6">
          {(["all", "fish", "coral", "invert"] as const).map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                filterType === type
                  ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700"
              }`}
            >
              {type === "all" ? "📦 All" : `${typeIcons[type]} ${type.charAt(0).toUpperCase() + type.slice(1)}`}
            </button>
          ))}
        </div>

        {/* Livestock Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-lg">
            <div className="text-6xl mb-4">🐠</div>
            <p className="text-gray-400 mb-2">No livestock in inventory</p>
            <p className="text-sm text-gray-500">Add your first fish, coral, or invert to get started</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((item) => (
              <div
                key={item.id}
                className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-lg overflow-hidden hover:border-purple-500/50 transition-all duration-300 hover:scale-[1.02] animate-fadeIn"
              >
                {/* Photo Section */}
                {item.photoUrl ? (
                  <div 
                    className="relative h-40 bg-gray-800 cursor-pointer group"
                    onClick={() => setViewingPhoto(item.id)}
                  >
                    <Image
                      src={item.photoUrl}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
                      <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity text-sm">
                        🔍 View
                      </span>
                    </div>
                  </div>
                ) : (
                  <label className="relative h-32 bg-gray-800/50 border-b border-gray-700 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-800 transition group">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handlePhotoUpload(item.id, file);
                      }}
                      disabled={uploadingPhoto === item.id}
                    />
                    {uploadingPhoto === item.id ? (
                      <div className="animate-spin text-2xl">⏳</div>
                    ) : (
                      <>
                        <span className="text-3xl mb-1 group-hover:scale-110 transition-transform">📷</span>
                        <span className="text-xs text-gray-500">Add photo</span>
                      </>
                    )}
                  </label>
                )}

                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-3xl">{typeIcons[item.type]}</span>
                      <div>
                        <h3 className="font-bold text-white">{item.name}</h3>
                        {item.species && (
                          <p className="text-xs text-gray-400">{item.species}</p>
                        )}
                        {item.scientificName && (
                          <p className="text-xs text-gray-500 italic">{item.scientificName}</p>
                        )}
                        {tanks.length > 1 && item.tankName && (
                          <p className="text-xs text-cyan-400 mt-0.5">🐠 {item.tankName}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className={`px-2 py-1 rounded text-xs font-semibold ${
                      item.status === "healthy" 
                        ? "bg-green-900/30 text-green-400"
                        : item.status === "quarantine"
                        ? "bg-yellow-900/30 text-yellow-400"
                        : item.status === "sick"
                        ? "bg-red-900/30 text-red-400"
                        : "bg-gray-700 text-gray-400"
                    }`}>
                      {item.status}
                    </div>
                  </div>

                  <div className="space-y-1 mb-3 text-sm text-gray-300">
                    <p>📅 Added: {new Date(item.dateAdded).toLocaleDateString()}</p>
                    
                    {item.source && <p>🏪 From: {item.source}</p>}
                    
                    {item.cost && <p>💰 ${item.cost.toFixed(2)}</p>}
                    
                    {item.size && <p>📏 Size: {item.size}</p>}
                    
                    {item.temperament && item.type === "fish" && (
                      <p>
                        {item.temperament === "peaceful" ? "😊" : item.temperament === "semi-aggressive" ? "😐" : "😠"} 
                        {" "}{item.temperament.charAt(0).toUpperCase() + item.temperament.slice(1)}
                      </p>
                    )}
                  </div>

                  {item.notes && (
                    <p className="text-xs text-gray-400 mb-3 line-clamp-2">
                      {item.notes}
                    </p>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(item)}
                      className="flex-1 px-3 py-2 bg-purple-600 text-white rounded text-xs font-semibold hover:bg-purple-700 transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteClick(item.id)}
                      className="px-3 py-2 bg-red-600 text-white rounded text-xs font-semibold hover:bg-red-700 transition"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowDeleteModal(false)}>
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-red-500/50 rounded-lg p-6 max-w-md w-full animate-fadeIn" onClick={(e) => e.stopPropagation()}>
              <div className="text-center mb-6">
                <div className="text-4xl mb-3">🗑️</div>
                <h3 className="text-xl font-bold text-white mb-2">Remove from Inventory?</h3>
                <p className="text-gray-400">This action cannot be undone.</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition font-semibold"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Photo Viewer Modal */}
        {viewingPhoto && (() => {
          const item = livestock.find(l => l.id === viewingPhoto);
          if (!item?.photoUrl) return null;
          
          return (
            <div 
              className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" 
              onClick={() => setViewingPhoto(null)}
            >
              <div 
                className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-lg max-w-3xl w-full overflow-hidden animate-fadeIn" 
                onClick={(e) => e.stopPropagation()}
              >
                <div className="relative aspect-video bg-gray-900">
                  <Image
                    src={item.photoUrl}
                    alt={item.name}
                    fill
                    className="object-contain"
                  />
                </div>
                
                <div className="p-4 border-t border-gray-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-white text-lg">{item.name}</h3>
                      {item.species && (
                        <p className="text-sm text-gray-400">{item.species}</p>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      <label className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-semibold transition cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              handlePhotoUpload(item.id, file);
                              setViewingPhoto(null);
                            }
                          }}
                        />
                        Replace Photo
                      </label>
                      <button
                        onClick={() => handlePhotoDelete(item.id)}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition"
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => setViewingPhoto(null)}
                        className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-semibold transition"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    </AppLayout>
  );
}
