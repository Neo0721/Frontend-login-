"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft } from "lucide-react";

interface ChangePasswordProps {
  onNavigate?: (view?: any) => void;
  language?: "en" | "hi";
}

export default function ChangePassword({
  onNavigate,
  language = "en",
}: ChangePasswordProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  function validate() {
    setError(null);
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("Please fill all fields.");
      return false;
    }
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return false;
    }
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return false;
    }
    return true;
  }

  async function handleSubmit(e: any) {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (!res.ok) throw new Error("Failed to update password");

      setSuccess("Password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 flex justify-center items-start">
      <div className="w-full max-w-xl">
        
        {/* Back Button */}
        <button
          onClick={() => onNavigate?.("dashboard")}
          className="flex items-center gap-2 text-slate-600 hover:text-black mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <div className="bg-white shadow-md rounded-2xl p-8 border border-gray-200">
          <h2 className="text-2xl font-extrabold text-[#002B5C] text-center mb-6">
            Change Password
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Current Password */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Current Password
              </label>
              <Input
                type="password"
                placeholder="Enter current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>

            {/* New Password */}
            <div>
              <label className="block text-sm font-medium mb-2">
                New Password
              </label>
              <Input
                type="password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Confirm New Password
              </label>
              <Input
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            {/* Error message */}
            {error && <p className="text-red-600 text-sm">{error}</p>}

            {/* Success message */}
            {success && <p className="text-green-700 text-sm">{success}</p>}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3"
            >
              {loading ? "Updating..." : "Update Password"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
