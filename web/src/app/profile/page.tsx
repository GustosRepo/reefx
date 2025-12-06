"use client";

import { useState, useEffect } from "react";
import { getCurrentUser, updateProfile } from "@/utils/auth";
import { useRouter } from "next/navigation";
import AppLayout from "@/components/AppLayout";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfilePageContent />
    </ProtectedRoute>
  );
}

function ProfilePageContent() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await getCurrentUser();
      if (currentUser) {
        setName(currentUser.name);
        setEmail(currentUser.email);
      }
    };
    loadUser();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    const result = await updateProfile(name);

    if (result.success) {
      setMessage("Profile updated successfully!");
      setTimeout(() => {
        router.push("/settings");
      }, 1500);
    } else {
      setMessage(result.error || "Update failed");
    }

    setIsLoading(false);
  };

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gradient mb-6">Edit Profile</h1>

        <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {message && (
              <div
                className={`rounded-lg p-3 ${
                  message.includes("success")
                    ? "bg-green-900/30 border border-green-500/50 text-green-400"
                    : "bg-red-900/30 border border-red-500/50 text-red-400"
                }`}
              >
                <p className="text-sm">{message}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-cyan-400 mb-2">
                Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full bg-gray-950 border border-gray-600 rounded px-4 py-3 text-white text-base focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-cyan-400 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-gray-950 border border-gray-600 rounded px-4 py-3 text-white text-base focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <button
                type="submit"
                disabled={isLoading}
                className={`flex-1 py-4 rounded-lg font-semibold text-base transition ${
                  isLoading
                    ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-cyan-500 to-blue-500 text-white active:from-cyan-600 active:to-blue-600"
                }`}
              >
                {isLoading ? "Saving..." : "Save Changes"}
              </button>
              <button
                type="button"
                onClick={() => router.push("/settings")}
                className="px-6 py-4 bg-gray-700 text-white rounded-lg active:bg-gray-600 transition text-base"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}
