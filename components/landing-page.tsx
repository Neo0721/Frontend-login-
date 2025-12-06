"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { UserPlus, Lock } from "lucide-react"
import InstructionsModal from "@/components/instructions-modal"
import { useState } from "react"

interface LandingPageProps {
  onNavigate: (view: any) => void
  language: "en" | "hi"
}

export default function LandingPage({ onNavigate, language }: LandingPageProps) {
  const [showInstructions, setShowInstructions] = useState(false)

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 px-4">
      <div className="max-w-5xl w-full">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-[#002B5C] mb-4">
            {language === "en"
              ? "Welcome to Western Railway Identity Card System"
              : "पश्चिम रेल्वे पहचान पत्र प्रणाली में स्वागत है"}
          </h2>
          <p className="text-lg text-gray-600">
            {language === "en"
              ? "Apply for your identity card or access your existing account"
              : "अपना पहचान पत्र के लिए आवेदन करें या अपने खाते को एक्सेस करें"}
          </p>
        </div>

        {/* Cards Section - Centered */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Register Card - Button now says "Register as New User" */}
          <Card className="p-8 hover:shadow-lg transition-shadow cursor-pointer border border-gray-200">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-[#2E7D32]/10 rounded-full flex items-center justify-center">
                  <UserPlus className="w-8 h-8 text-[#2E7D32]" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-[#002B5C] mb-2">{language === "en" ? "Register" : "पंजीकरण करें"}</h3>
              <p className="text-gray-600 mb-6">
                {language === "en" ? "Create a new user account" : "नया उपयोगकर्ता खाता बनाएं"}
              </p>
              <Button
                onClick={() => onNavigate("register")}
                className="w-full bg-[#2E7D32] hover:bg-green-700 text-white"
              >
                {language === "en" ? "Register as New User" : "नए उपयोगकर्ता के रूप में पंजीकरण करें"}
              </Button>
            </div>
          </Card>

          {/* Login Card */}
          <Card className="p-8 hover:shadow-lg transition-shadow cursor-pointer border border-gray-200">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-[#002B5C]/10 rounded-full flex items-center justify-center">
                  <Lock className="w-8 h-8 text-[#002B5C]" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-[#002B5C] mb-2">{language === "en" ? "Login" : "लॉगिन करें"}</h3>
              <p className="text-gray-600 mb-6">
                {language === "en" ? "Access your existing account" : "अपने मौजूदा खाते को एक्सेस करें"}
              </p>
              <Button
                onClick={() => onNavigate("login-options")}
                className="w-full bg-[#002B5C] hover:bg-blue-900 text-white"
              >
                {language === "en" ? "Login Now" : "अभी लॉगिन करें"}
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Instructions Modal */}
      <InstructionsModal isOpen={showInstructions} onClose={() => setShowInstructions(false)} language={language} />
    </div>
  )
}
