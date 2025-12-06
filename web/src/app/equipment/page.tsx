"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { hasFeature } from "@/utils/subscription";
import { Equipment, EquipmentCategory } from "@/types/equipment";
import AppLayout from "@/components/AppLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import Link from "next/link";

export default function EquipmentPage() {
  return (
    <ProtectedRoute>
      <EquipmentPageContent />
    </ProtectedRoute>
  );
}

function EquipmentPageContent() {
  const router = useRouter();
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<EquipmentCategory | "all">("all");
  
  const [formData, setFormData] = useState<Partial<Equipment>>({
    name: "",
    category: "lighting",
    brand: "",
    model: "",
    purchaseDate: "",
    purchasePrice: undefined,
    warrantyExpires: "",
    notes: "",
    status: "active",
  });

  useEffect(() => {
    if (!hasFeature("equipmentTracking")) {
      router.push("/subscription");
      return;
    }
    
    loadEquipment();
  }, [router]);

  const loadEquipment = async () => {
    try {
      const response = await fetch('/api/equipment');
      const data = await response.json();
      setEquipment(data);
    } catch (err) {
      console.error('Failed to load equipment:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name) {
      alert("Equipment name is required");
      return;
    }

    try {
      const method = editingId ? 'PUT' : 'POST';
      const url = editingId ? `/api/equipment/${editingId}` : '/api/equipment';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          category: formData.category || "lighting",
          brand: formData.brand,
          model: formData.model,
          purchase_date: formData.purchaseDate,
          purchase_price: formData.purchasePrice,
          warranty_until: formData.warrantyExpires,
          notes: formData.notes,
          tank_id: null,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save equipment');
      }

      await loadEquipment();

      // Reset form
      setFormData({
        name: "",
        category: "lighting",
        brand: "",
        model: "",
        purchaseDate: "",
        purchasePrice: undefined,
        warrantyExpires: "",
        notes: "",
        status: "active",
      });
      setEditingId(null);
      setShowForm(false);
    } catch (err) {
      console.error('Failed to save equipment:', err);
      alert('Failed to save equipment');
    }
  };

  const handleEdit = (equip: Equipment) => {
    setFormData(equip);
    setEditingId(equip.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this equipment?")) return;
    
    try {
      const response = await fetch(`/api/equipment/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete equipment');
      }

      await loadEquipment();
    } catch (err) {
      console.error('Failed to delete equipment:', err);
      alert('Failed to delete equipment');
    }
  };

  if (!hasFeature("equipmentTracking")) {
    return null;
  }

  const filtered = filterCategory === "all" 
    ? equipment 
    : equipment.filter(e => e.category === filterCategory);

  const categories: Array<{value: EquipmentCategory | "all", label: string, icon: string}> = [
    { value: "all", label: "All", icon: "📦" },
    { value: "lighting", label: "Lighting", icon: "💡" },
    { value: "filtration", label: "Filtration", icon: "🔄" },
    { value: "heating", label: "Heating", icon: "🌡️" },
    { value: "controller", label: "Controller", icon: "🎛️" },
    { value: "pump", label: "Pump", icon: "⚙️" },
    { value: "skimmer", label: "Skimmer", icon: "🫧" },
    { value: "other", label: "Other", icon: "🔧" },
  ];

  const totalValue = equipment.reduce((sum, e) => sum + (e.purchasePrice || 0), 0);

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4 animate-slideDown">
          <div>
            <h1 className="text-3xl font-bold text-gradient mb-2">Equipment</h1>
            <p className="text-gray-400 text-sm">
              Track all your reef gear • Total Value: ${totalValue.toFixed(2)}
            </p>
          </div>
          
          <button
            onClick={() => {
              setShowForm(!showForm);
              if (showForm) {
                setEditingId(null);
                setFormData({
                  name: "",
                  category: "lighting",
                  brand: "",
                  model: "",
                  purchaseDate: "",
                  purchasePrice: undefined,
                  warrantyExpires: "",
                  notes: "",
                  status: "active",
                });
              }
            }}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 hover:scale-105"
          >
            {showForm ? "Cancel" : "+ Add Equipment"}
          </button>
        </div>

        {/* Add/Edit Form */}
        {showForm && (
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-lg p-6 mb-6 animate-slideDown">
            <h2 className="text-xl font-bold text-white mb-4">
              {editingId ? "Edit Equipment" : "Add New Equipment"}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Equipment Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="e.g., AI Prime 16HD"
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value as EquipmentCategory})}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="lighting">Lighting</option>
                    <option value="filtration">Filtration</option>
                    <option value="heating">Heating</option>
                    <option value="controller">Controller</option>
                    <option value="pump">Pump</option>
                    <option value="skimmer">Skimmer</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Brand
                  </label>
                  <input
                    type="text"
                    value={formData.brand}
                    onChange={(e) => setFormData({...formData, brand: e.target.value})}
                    placeholder="e.g., AquaIllumination"
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Model
                  </label>
                  <input
                    type="text"
                    value={formData.model}
                    onChange={(e) => setFormData({...formData, model: e.target.value})}
                    placeholder="e.g., Prime 16HD"
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Purchase Date
                  </label>
                  <input
                    type="date"
                    value={formData.purchaseDate}
                    onChange={(e) => setFormData({...formData, purchaseDate: e.target.value})}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Purchase Price
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.purchasePrice || ""}
                    onChange={(e) => setFormData({...formData, purchasePrice: parseFloat(e.target.value) || undefined})}
                    placeholder="0.00"
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Warranty Expires
                  </label>
                  <input
                    type="date"
                    value={formData.warrantyExpires}
                    onChange={(e) => setFormData({...formData, warrantyExpires: e.target.value})}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value as Equipment["status"]})}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="maintenance">Needs Maintenance</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  placeholder="Additional notes, settings, maintenance history..."
                  rows={3}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition"
                >
                  {editingId ? "Update Equipment" : "Add Equipment"}
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

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setFilterCategory(cat.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                filterCategory === cat.value
                  ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700"
              }`}
            >
              {cat.icon} {cat.label}
            </button>
          ))}
        </div>

        {/* Equipment List */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-lg">
            <div className="text-6xl mb-4">🔧</div>
            <p className="text-gray-400 mb-2">No equipment tracked yet</p>
            <p className="text-sm text-gray-500">Add your first piece of equipment to get started</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((equip) => (
              <div
                key={equip.id}
                className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-lg p-5 hover:border-purple-500/50 transition-all duration-300 hover:scale-[1.02] animate-fadeIn"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">
                      {categories.find(c => c.value === equip.category)?.icon || "🔧"}
                    </span>
                    <div>
                      <h3 className="font-bold text-white">{equip.name}</h3>
                      <p className="text-xs text-gray-400">{equip.brand} {equip.model}</p>
                    </div>
                  </div>
                  
                  <div className={`px-2 py-1 rounded text-xs font-semibold ${
                    equip.status === "active" 
                      ? "bg-green-900/30 text-green-400"
                      : equip.status === "maintenance"
                      ? "bg-yellow-900/30 text-yellow-400"
                      : "bg-gray-700 text-gray-400"
                  }`}>
                    {equip.status}
                  </div>
                </div>

                {equip.purchasePrice && (
                  <p className="text-sm text-gray-300 mb-2">
                    💰 ${equip.purchasePrice.toFixed(2)}
                  </p>
                )}

                {equip.purchaseDate && (
                  <p className="text-xs text-gray-400 mb-2">
                    📅 Purchased: {new Date(equip.purchaseDate).toLocaleDateString()}
                  </p>
                )}

                {equip.warrantyExpires && (
                  <p className="text-xs text-gray-400 mb-2">
                    🛡️ Warranty: {new Date(equip.warrantyExpires).toLocaleDateString()}
                  </p>
                )}

                {equip.notes && (
                  <p className="text-xs text-gray-400 mb-3 line-clamp-2">
                    {equip.notes}
                  </p>
                )}

                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => handleEdit(equip)}
                    className="flex-1 px-3 py-2 bg-purple-600 text-white rounded text-xs font-semibold hover:bg-purple-700 transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(equip.id)}
                    className="px-3 py-2 bg-red-600 text-white rounded text-xs font-semibold hover:bg-red-700 transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
