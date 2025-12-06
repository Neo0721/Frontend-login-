"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft } from "lucide-react"
import { Card } from "@/components/ui/card"

interface LoginOTPProps {
  onNavigate: (view: any) => void
  language: "en" | "hi"
}

export default function LoginOTP({ onNavigate, language }: LoginOTPProps) {
  const [empNo, setEmpNo] = useState("")
  const [mobile, setMobile] = useState("")
  const [email, setEmail] = useState("")
  const [otpSent, setOtpSent] = useState(false)
  const [otp, setOtp] = useState("")
  const [timer, setTimer] = useState(0)

  const handleGetOTP = () => {
    if (empNo && mobile) {
      setOtpSent(true)
      setTimer(60)
      // Timer countdown
      const interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
  }

  const handleVerifyOTP = () => {
    if (otp.length === 6) {
      onNavigate("dashboard")
    }
  }

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <Button variant="ghost" onClick={() => onNavigate("login-options")} className="mb-6 text-[#002B5C]">
          <ArrowLeft className="w-4 h-4 mr-2" />
          {language === "en" ? "Back" : "पीछे"}
        </Button>

        <Card className="p-8 border border-gray-200">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-[#002B5C] mb-2">
              {language === "en" ? "Sign in with OTP" : "ओटीपी से साइन इन करें"}
            </h2>
            <p className="text-sm text-gray-600">
              {language === "en" ? "Enter your details to receive an OTP" : "ओटीपी प्राप्त करने के लिए अपना विवरण दर्ज करें"}
            </p>
          </div>

          <div className="space-y-4">
            {!otpSent ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {language === "en" ? "Employee No / कर्मचारी संख्या" : "कर्मचारी संख्या / Employee No"}
                  </label>
                  <Input
                    type="text"
                    placeholder={language === "en" ? "Enter employee number" : "कर्मचारी संख्या दर्ज करें"}
                    value={empNo}
                    onChange={(e) => setEmpNo(e.target.value)}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {language === "en" ? "Mobile Number / मोबाइल नंबर" : "मोबाइल नंबर / Mobile Number"}
                  </label>
                  <Input
                    type="tel"
                    placeholder={language === "en" ? "Enter mobile number" : "मोबाइल नंबर दर्ज करें"}
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value.slice(0, 10))}
                    maxLength={10}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {language === "en" ? "Email (Optional) / ईमेल (वैकल्पिक)" : "ईमेल (वैकल्पिक) / Email (Optional)"}
                  </label>
                  <Input
                    type="email"
                    placeholder={language === "en" ? "Enter email" : "ईमेल दर्ज करें"}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full"
                  />
                </div>

                <Button
                  onClick={handleGetOTP}
                  disabled={!empNo || !mobile}
                  className="w-full bg-[#2E7D32] hover:bg-green-700 text-white mt-6"
                >
                  {language === "en" ? "Get OTP" : "ओटीपी प्राप्त करें"}
                </Button>
              </>
            ) : (
              <>
                <p className="text-center text-sm text-gray-600 mb-4">
                  {language === "en"
                    ? "Enter the 6-digit OTP sent to your mobile"
                    : "अपने मोबाइल पर भेजा गया 6-अंकीय ओटीपी दर्ज करें"}
                </p>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 text-center">
                    {language === "en" ? "OTP / ओटीपी" : "ओटीपी / OTP"}
                  </label>
                  <Input
                    type="text"
                    placeholder="000000"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.slice(0, 6))}
                    maxLength={6}
                    className="w-full text-center text-2xl tracking-widest"
                  />
                </div>

                <div className="text-center text-sm text-gray-600 my-4">
                  {timer > 0 ? (
                    <p>{language === "en" ? `Resend OTP in ${timer}s` : `${timer}s में ओटीपी पुनः भेजें`}</p>
                  ) : (
                    <button onClick={() => handleGetOTP()} className="text-[#2E7D32] hover:underline font-medium">
                      {language === "en" ? "Resend OTP" : "ओटीपी पुनः भेजें"}
                    </button>
                  )}
                </div>

                <Button
                  onClick={handleVerifyOTP}
                  disabled={otp.length !== 6}
                  className="w-full bg-[#002B5C] hover:bg-blue-900 text-white"
                >
                  {language === "en" ? "Verify & Login" : "सत्यापित करें और लॉगिन करें"}
                </Button>
              </>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
