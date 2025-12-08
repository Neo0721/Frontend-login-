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

  // NEW: Field validation errors
  const [errors, setErrors] = useState<{
    mobile?: string
    empNo?: string
    email?: string
  }>({})

  // Email validation helper
  const isValidEmail = (value: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
  }

  // Validate each field
  const validateField = (name: string, value: string) => {
    setErrors((prev) => {
      const next = { ...prev }

      if (name === "mobile") {
        if (!/^\d+$/.test(value)) {
          next.mobile =
            language === "en"
              ? "Mobile must contain only digits"
              : "मोबाइल में केवल अंक होने चाहिए"
        } else if (value.length !== 10) {
          next.mobile =
            language === "en"
              ? "Mobile must be exactly 10 digits"
              : "मोबाइल 10 अंकों का होना चाहिए"
        } else delete next.mobile
      }

      if (name === "empNo") {
        if (!/^\d+$/.test(value)) {
          next.empNo =
            language === "en"
              ? "Employee number must contain only digits"
              : "कर्मचारी संख्या में केवल अंक होने चाहिए"
        } else delete next.empNo
      }

      if (name === "email") {
        if (value.length === 0) delete next.email
        else if (!isValidEmail(value)) {
          next.email =
            language === "en"
              ? "Enter a valid email"
              : "मान्य ईमेल दर्ज करें"
        } else delete next.email
      }

      return next
    })
  }

  const handleGetOTP = () => {
    // Validate again before sending OTP
    validateField("empNo", empNo)
    validateField("mobile", mobile)
    validateField("email", email)

    const mobileOk = /^\d{10}$/.test(mobile)
    const empNoOk = /^\d+$/.test(empNo)
    const emailOk = email.length === 0 ? true : isValidEmail(email)

    if (mobileOk && empNoOk && emailOk && !Object.keys(errors).length) {
      setOtpSent(true)
      setTimer(60)

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
        <Button
          variant="ghost"
          onClick={() => onNavigate("login-options")}
          className="mb-6 text-[#002B5C]"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {language === "en" ? "Back" : "पीछे"}
        </Button>

        <Card className="p-8 border border-gray-200">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-[#002B5C] mb-2">
              {language === "en" ? "Sign in with OTP" : "ओटीपी से साइन इन करें"}
            </h2>
            <p className="text-sm text-gray-600">
              {language === "en"
                ? "Enter your details to receive an OTP"
                : "ओटीपी प्राप्त करने के लिए अपना विवरण दर्ज करें"}
            </p>
          </div>

          <div className="space-y-4">
            {!otpSent ? (
              <>
                {/* Employee No */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {language === "en"
                      ? "Employee No / कर्मचारी संख्या"
                      : "कर्मचारी संख्या / Employee No"}
                  </label>
                  <Input
                    type="text"
                    value={empNo}
                    onChange={(e) => {
                      const v = e.target.value.replace(/\D/g, "")
                      setEmpNo(v)
                      validateField("empNo", v)
                    }}
                    placeholder={
                      language === "en"
                        ? "Enter employee number"
                        : "कर्मचारी संख्या दर्ज करें"
                    }
                  />
                  {errors.empNo && (
                    <p className="text-xs text-red-600 mt-1">{errors.empNo}</p>
                  )}
                </div>

                {/* Mobile */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {language === "en"
                      ? "Mobile Number / मोबाइल नंबर"
                      : "मोबाइल नंबर / Mobile Number"}
                  </label>
                  <Input
                    type="tel"
                    value={mobile}
                    onChange={(e) => {
                      const v = e.target.value.replace(/\D/g, "").slice(0, 10)
                      setMobile(v)
                      validateField("mobile", v)
                    }}
                    placeholder={
                      language === "en"
                        ? "Enter mobile number"
                        : "मोबाइल नंबर दर्ज करें"
                    }
                  />
                  {errors.mobile && (
                    <p className="text-xs text-red-600 mt-1">{errors.mobile}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {language === "en"
                      ? "Email (Optional)"
                      : "ईमेल (वैकल्पिक)"}
                  </label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      const v = e.target.value
                      setEmail(v)
                      validateField("email", v)
                    }}
                    placeholder={
                      language === "en" ? "Enter email" : "ईमेल दर्ज करें"
                    }
                  />
                  {errors.email && (
                    <p className="text-xs text-red-600 mt-1">{errors.email}</p>
                  )}
                </div>

                {/* Get OTP Button */}
                <Button
                  onClick={handleGetOTP}
                  disabled={
                    !empNo ||
                    !mobile ||
                    !!errors.empNo ||
                    !!errors.mobile ||
                    !!errors.email
                  }

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

                {/* OTP Input */}
                <Input
                  type="text"
                  value={otp}
                  onChange={(e) =>
                    setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  maxLength={6}
                  placeholder="000000"
                  className="text-center text-2xl tracking-widest"
                />

                {/* Timer / Resend */}
                <div className="text-center text-sm text-gray-600 my-4">
                  {timer > 0 ? (
                    <p>
                      {language === "en"
                        ? `Resend OTP in ${timer}s`
                        : `${timer}s में ओटीपी पुनः भेजें`}
                    </p>
                  ) : (
                    <button
                      onClick={handleGetOTP}
                      className="text-[#2E7D32] hover:underline"
                    >
                      {language === "en"
                        ? "Resend OTP"
                        : "ओटीपी पुनः भेजें"}
                    </button>
                  )}
                </div>

                {/* Verify Button */}
                <Button
                  onClick={handleVerifyOTP}
                  disabled={otp.length !== 6}
                  className="w-full bg-[#002B5C] hover:bg-blue-900 text-white"
                >
                  {language === "en"
                    ? "Verify & Login"
                    : "सत्यापित करें और लॉगिन करें"}
                </Button>
              </>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
