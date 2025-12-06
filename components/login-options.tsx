"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Smartphone, Lock, ArrowLeft } from "lucide-react"

interface LoginOptionsProps {
  onNavigate: (view: any) => void
  language: "en" | "hi"
}

export default function LoginOptions({ onNavigate, language }: LoginOptionsProps) {
  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 px-4">
      <div className="max-w-3xl w-full">
        <div className="text-center mb-12">
          <Button variant="ghost" onClick={() => onNavigate("landing")} className="mb-6 text-[#002B5C]">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {language === "en" ? "Back" : "पीछे"}
          </Button>
          <h2 className="text-3xl font-bold text-[#002B5C] mb-3">
            {language === "en" ? "Login Options" : "लॉगिन विकल्प"}
          </h2>
          <p className="text-gray-600">
            {language === "en" ? "Choose your preferred login method" : "अपनी पसंदीदा लॉगिन विधि चुनें"}
          </p>
        </div>

        {/* Login Method Cards - Centered */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* OTP Login Card */}
          <Card className="p-8 hover:shadow-lg transition-shadow cursor-pointer border border-green-200 bg-green-50">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-[#2E7D32]/20 rounded-full flex items-center justify-center">
                  <Smartphone className="w-8 h-8 text-[#2E7D32]" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-[#2E7D32] mb-3">
                {language === "en" ? "Login with OTP" : "ओटीपी से लॉगिन"}
              </h3>
              <p className="text-gray-600 mb-6">
                {language === "en"
                  ? "Receive a One-Time Password on your mobile"
                  : "अपने मोबाइल पर एक बार का पासवर्ड प्राप्त करें"}
              </p>
              <Button
                onClick={() => onNavigate("login-otp")}
                className="w-full bg-[#2E7D32] hover:bg-green-700 text-white"
              >
                {language === "en" ? "Continue with OTP" : "ओटीपी के साथ जारी रखें"}
              </Button>
            </div>
          </Card>

          {/* Password Login Card */}
          <Card className="p-8 hover:shadow-lg transition-shadow cursor-pointer border border-blue-200 bg-blue-50">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-[#002B5C]/20 rounded-full flex items-center justify-center">
                  <Lock className="w-8 h-8 text-[#002B5C]" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-[#002B5C] mb-3">
                {language === "en" ? "Login with Password" : "पासवर्ड से लॉगिन"}
              </h3>
              <p className="text-gray-600 mb-6">
                {language === "en"
                  ? "Sign in with your Employee ID and Password"
                  : "अपने कर्मचारी आईडी और पासवर्ड के साथ साइन इन करें"}
              </p>
              <Button
                onClick={() => onNavigate("login-password")}
                className="w-full bg-[#002B5C] hover:bg-blue-900 text-white"
              >
                {language === "en" ? "Continue with Password" : "पासवर्ड के साथ जारी रखें"}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
