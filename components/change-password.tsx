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
  // helper to choose text based on language
  const txt = (en: string, hi?: string) => (language === "en" ? en : hi ?? en);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  function validate() {
    setError(null);
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError(txt("Please fill all fields.", "कृपया सभी फ़ील्ड भरें।"));
      return false;
    }
    if (newPassword.length < 8) {
      setError(txt("Password must be at least 8 characters.", "पासवर्ड कम से कम 8 अंकों का होना चाहिए।"));
      return false;
    }
    if (newPassword !== confirmPassword) {
      setError(txt("New passwords do not match.", "नए पासवर्ड मेल नहीं खाते।"));
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

    // try to parse JSON body (if any)
    let body: any = null;
    try {
      body = await res.json();
    } catch (parseErr) {
      // not JSON or empty body — that's OK
      console.info("change-password: response had no JSON body");
    }

    console.log("change-password response:", res.status, body);

    if (!res.ok) {
      // Prefer server message if available (body.message or body.error), else use status text
      const serverMsg = (body && (body.message || body.error)) ?? res.statusText ?? txt("Failed to update password", "पासवर्ड अपडेट करने में विफल");
      setError(typeof serverMsg === "string" ? serverMsg : String(serverMsg));
      return;
    }

    // Success
    setSuccess(txt("Password updated successfully!", "पासवर्ड सफलतापूर्वक अपडेट हो गया!"));
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");

    // navigate back after short delay so user sees success message
    setTimeout(() => {
      try {
        if (typeof onNavigate === "function") {
          onNavigate("dashboard");
        } else {
          // fallback: try history back / root
          window.location.href = "/dashboard";
        }
      } catch (navErr) {
        console.warn("Navigation after password update failed:", navErr);
      }
    }, 900);

  } catch (err: any) {
    console.error("change-password failed:", err);
    setError(err?.message ?? txt("Something went wrong.", "कुछ गलत हो गया।"));
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
          type="button"
        >
          <ArrowLeft className="w-4 h-4" />
          {txt("Back", "वापस")}
        </button>

        <div className="bg-white shadow-md rounded-2xl p-8 border border-gray-200">
          <h2 className="text-2xl font-extrabold text-[#002B5C] text-center mb-6">
            {txt("Change Password", "पासवर्ड बदलें")}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Current Password */}
            <div>
              <label className="block text-sm font-medium mb-2">
                {txt("Current Password", "वर्तमान पासवर्ड")}
              </label>
              <Input
                type="password"
                placeholder={txt("Enter current password", "वर्तमान पासवर्ड दर्ज करें")}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>

            {/* New Password */}
            <div>
              <label className="block text-sm font-medium mb-2">
                {txt("New Password", "नया पासवर्ड")}
              </label>
              <Input
                type="password"
                placeholder={txt("Enter new password", "नया पासवर्ड दर्ज करें")}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium mb-2">
                {txt("Confirm New Password", "नया पासवर्ड सत्यापित करें")}
              </label>
              <Input
                type="password"
                placeholder={txt("Confirm new password", "नया पासवर्ड सत्यापित करें")}
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
              {loading ? txt("Updating...", "अपडेट किया जा रहा है...") : txt("Update Password", "पासवर्ड अपडेट करें")}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
