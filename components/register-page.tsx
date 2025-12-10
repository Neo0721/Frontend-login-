"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Check, X } from "lucide-react"
import { Card } from "@/components/ui/card"

interface RegisterPageProps {
  onNavigate: (view: any) => void
  language: "en" | "hi"
}

export default function RegisterPage({ onNavigate, language }: RegisterPageProps) {
  const [formData, setFormData] = useState({
    fullName: "",
    empNo: "",
    mobile: "",
    email: "",
    password: "",
    confirmPassword: "",
    department: "",
    designation: "",
  })

  const [showConfirmation, setShowConfirmation] = useState(false)
  const [passwordValidation, setPasswordValidation] = useState({
    minLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasDigit: false,
    hasSpecialChar: false,
  })
  const [passwordStrength, setPasswordStrength] = useState(0)

  // NEW: errors state for validating mobile, empNo and email
  const [errors, setErrors] = useState<{
    mobile?: string
    empNo?: string
    email?: string
  }>({})

  // -------------------- OTP STATES --------------------
  const [otpSent, setOtpSent] = useState(false)
  const [otpMethod, setOtpMethod] = useState<"mobile" | "email">("mobile")
  const [otpInput, setOtpInput] = useState("")
  const [otpError, setOtpError] = useState<string | null>(null)
  const [otpId, setOtpId] = useState<string | null>(null) // if backend returns an id for verification
  const [resendTimer, setResendTimer] = useState(0)
  const resendIntervalRef = useRef<number | null>(null)

  // For dev fallback when no backend exists (do NOT use in production)
  const [generatedOtp, setGeneratedOtp] = useState<string | null>(null)

  // -----------------------------------------------------

  const validatePassword = (pwd: string) => {
    const validation = {
      minLength: pwd.length >= 8,
      hasUpperCase: /[A-Z]/.test(pwd),
      hasLowerCase: /[a-z]/.test(pwd),
      hasDigit: /\d/.test(pwd),
      hasSpecialChar: /[!@#$%&*]/.test(pwd),
    }
    setPasswordValidation(validation)

    const strength = Object.values(validation).filter(Boolean).length
    setPasswordStrength(strength)

    return Object.values(validation).every(Boolean)
  }

  // NEW: basic email regex for validation (sufficient for typical client-side check)
  const isValidEmail = (email: string) => {
    // simple, commonly used client-side regex (not perfect but practical)
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  // NEW: validate single field and update errors state
  const validateField = (name: string, value: string) => {
    setErrors(prev => {
      const next = { ...prev }

      if (name === "mobile") {
        // No alphabets allowed and must be digits only; length 10 required to be considered valid
        if (/\D/.test(value)) {
          next.mobile = language === "en" ? "Mobile must contain only digits" : "मोबाइल में केवल अंक होने चाहिए"
        } else if (value.length !== 10 && value.length > 0) {
          next.mobile = language === "en" ? "Mobile must be exactly 10 digits" : "मोबाइल सही में 10 अंकों का होना चाहिए"
        } else {
          delete next.mobile
        }
      }

      if (name === "empNo") {
  // Allow only alphabets + numbers
  if (!/^[a-zA-Z0-9]*$/.test(value)) {
    next.empNo =
      language === "en"
        ? "Employee number must be alphanumeric"
        : "कर्मचारी संख्या अल्फ़ान्यूमेरिक होनी चाहिए"
  } else {
    delete next.empNo
  }
}


      if (name === "email") {
        if (value.length === 0) {
          delete next.email
        } else if (!isValidEmail(value)) {
          next.email = language === "en" ? "Enter a valid email address" : "मान्य ईमेल पता दर्ज करें"
        } else {
          delete next.email
        }
      }

      return next
    })
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })

    if (name === "password") {
      validatePassword(value)
    }

    // Run field validation for mobile, empNo, email when changed
    if (name === "mobile" || name === "empNo" || name === "email") {
      validateField(name, value)
    }
  }

  const isPasswordValid = Object.values(passwordValidation).every(Boolean)

  // -------------------- OTP HELPERS --------------------

  // Start resend countdown (30 seconds)
  const startResendTimer = (seconds = 30) => {
    setResendTimer(seconds)
    if (resendIntervalRef.current) {
      window.clearInterval(resendIntervalRef.current)
    }
    resendIntervalRef.current = window.setInterval(() => {
      setResendTimer(prev => {
        if (prev <= 1) {
          if (resendIntervalRef.current) {
            window.clearInterval(resendIntervalRef.current)
            resendIntervalRef.current = null
          }
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  useEffect(() => {
    return () => {
      if (resendIntervalRef.current) {
        window.clearInterval(resendIntervalRef.current)
      }
    }
  }, [])

  // Attempt to call backend to send OTP; if backend fails, fallback to client-side OTP for dev
  const sendOtpRequest = async (method: "mobile" | "email") => {
    // Prepare target contact
    const contact = method === "mobile" ? formData.mobile : formData.email

    try {
      // Try calling a backend endpoint (you should implement these routes on server)
      const res = await fetch("/api/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          method,
          contact,
          empNo: formData.empNo,
        }),
      })

      if (!res.ok) {
        // fallback to client-side OTP
        throw new Error("Backend not available or returned error")
      }

      const data = await res.json()
      // expecting something like { success: true, otpId: 'abc123' }
      setOtpId(data.otpId ?? null)
      setOtpSent(true)
      setOtpError(null)
      startResendTimer(30)
      return true
    } catch (err) {
      // Fallback: generate OTP locally for dev/testing.
      const fallbackOtp = (Math.floor(100000 + Math.random() * 900000)).toString()
      setGeneratedOtp(fallbackOtp)
      // NOTE: in dev, we'll log OTP to console so developer can test verification
      // Remove this in production
      // eslint-disable-next-line no-console
      console.info(`[DEV] Generated fallback OTP for ${method} (${contact}): ${fallbackOtp}`)

      setOtpId(null)
      setOtpSent(true)
      setOtpError(null)
      startResendTimer(30)
      return true
    }
  }

  const verifyOtpRequest = async (enteredOtp: string) => {
    try {
      // If we had an otpId and backend routes, call verify endpoint
      if (otpId) {
        const res = await fetch("/api/verify-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ otpId, otp: enteredOtp }),
        })
        if (!res.ok) {
          throw new Error("Invalid OTP")
        }
        const data = await res.json()
        if (data.success) {
          return true
        }
        throw new Error("Invalid OTP")
      }

      // Otherwise, fallback to verifying against generatedOtp (dev only)
      if (generatedOtp && enteredOtp === generatedOtp) {
        return true
      }

      return false
    } catch (err) {
      return false
    }
  }

  // Public function to trigger OTP sending (chooses mobile first, but user can change)
  const triggerOtpSend = async (method?: "mobile" | "email") => {
    const chosen = method ?? otpMethod
    setOtpMethod(chosen)
    // Basic precheck
    if (chosen === "mobile" && !/^\d{10}$/.test(formData.mobile)) {
      setErrors(prev => ({ ...prev, mobile: language === "en" ? "Mobile must be exactly 10 digits" : "मोबाइल सही में 10 अंकों का होना चाहिए" }))
      return false
    }
    if (chosen === "email" && !isValidEmail(formData.email)) {
      setErrors(prev => ({ ...prev, email: language === "en" ? "Enter a valid email address" : "मान्य ईमेल पता दर्ज करें" }))
      return false
    }

    const ok = await sendOtpRequest(chosen)
    return ok
  }

  const handleVerifyOtp = async () => {
    setOtpError(null)
    if (!otpInput || otpInput.trim().length === 0) {
      setOtpError(language === "en" ? "Please enter the OTP" : "कृपया OTP दर्ज करें")
      return
    }
    const verified = await verifyOtpRequest(otpInput.trim())
    if (verified) {
      // OTP verified: proceed to registration success
      setShowConfirmation(true)
      setOtpSent(false)
      setOtpInput("")
      setGeneratedOtp(null)
      setOtpId(null)
      setOtpError(null)
      if (resendIntervalRef.current) {
        window.clearInterval(resendIntervalRef.current)
        resendIntervalRef.current = null
      }
    } else {
      setOtpError(language === "en" ? "Invalid OTP. Please try again." : "अमान्य OTP। कृपया पुन: प्रयास करें।")
    }
  }

  const handleResendOtp = async () => {
    if (resendTimer > 0) return
    setOtpError(null)
    await triggerOtpSend(otpMethod)
  }

  // -----------------------------------------------------

  const handleSubmit = () => {
    // Re-validate before submit
    validateField("mobile", formData.mobile)
    validateField("empNo", formData.empNo)
    validateField("email", formData.email)

    const hasErrors = Object.keys(errors).length > 0

    // Check mobile length explicitly because user may not have triggered validation message yet
    const mobileOk = /^\d{10}$/.test(formData.mobile)
    const empNoOk = /^[a-zA-Z0-9]+$/.test(formData.empNo)
 || formData.empNo.length === 0 ? /^\d+$/.test(formData.empNo) : false
    const emailOk = isValidEmail(formData.email)

    if (
      formData.fullName &&
      formData.empNo &&
      formData.mobile &&
      formData.email &&
      isPasswordValid &&
      formData.password === formData.confirmPassword &&
      !hasErrors &&
      mobileOk &&
      empNoOk &&
      emailOk
    ) {
      // Instead of directly showing confirmation, trigger OTP verification flow
      // Default to verifying mobile first (you can change to email if desired)
      // If you want to force server-side verification against official HR DB mobile, implement an API to fetch official mobile using empNo
      triggerOtpSend("mobile")
      return
    } else {
      // If there are validation failures, ensure errors state reflects them so user sees messages
      setErrors(prev => {
        const next = { ...prev }
        if (!mobileOk) {
          next.mobile = language === "en" ? "Mobile must be exactly 10 digits and contain only numbers" : "मोबाइल सही में 10 अंकों का होना चाहिए और केवल अंक होने चाहिए"
        }
        if (!empNoOk) {
          next.empNo = language === "en" ? "Employee number must contain only digits" : "कर्मचारी संख्या में केवल अंक होने चाहिए"
        }
        if (!emailOk) {
          next.email = language === "en" ? "Enter a valid email address" : "मान्य ईमेल पता दर्ज करें"
        }
        return next
      })
    }
  }

  if (showConfirmation) {
    return (
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 px-4">
        <Card className="p-12 border border-gray-200 text-center max-w-md">
          <div className="w-16 h-16 bg-[#2E7D32]/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-[#2E7D32]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-[#002B5C] mb-2">
            {language === "en" ? "Registration Successful" : "पंजीकरण सफल"}
          </h2>
          <p className="text-gray-600 mb-6">
            {language === "en"
              ? "Your account has been created successfully. Please login with your credentials."
              : "आपका खाता सफलतापूर्वक बनाया गया है। कृपया अपनी साख के साथ लॉगिन करें।"}
          </p>
          <Button
            onClick={() => onNavigate("login-options")}
            className="w-full bg-[#002B5C] hover:bg-blue-900 text-white"
          >
            {language === "en" ? "Go to Login" : "लॉगिन पर जाएं"}
          </Button>
        </Card>
      </div>
    )
  }

  // If OTP step is active, show OTP UI overlay/card
  if (otpSent) {
    return (
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 px-4">
        <Card className="p-8 border border-gray-200 max-w-md w-full">
          <div className="mb-4">
            <button
              className="text-sm text-[#002B5C] mb-2"
              onClick={() => {
                // allow user to go back to edit form before verification
                setOtpSent(false)
                setOtpInput("")
                setOtpError(null)
                setGeneratedOtp(null)
                setOtpId(null)
                if (resendIntervalRef.current) {
                  window.clearInterval(resendIntervalRef.current)
                  resendIntervalRef.current = null
                }
              }}
            >
              ← {language === "en" ? "Back to Edit" : "संशोधन पर वापस जाएं"}
            </button>
            <h3 className="text-lg font-semibold text-[#002B5C]">
              {language === "en" ? "Verify OTP" : "OTP सत्यापित करें"}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {otpMethod === "mobile"
                ? (language === "en"
                    ? `An OTP has been sent to your mobile number ${formData.mobile}`
                    : `OTP आपके मोबाइल नंबर ${formData.mobile} पर भेजा गया है`)
                : (language === "en"
                    ? `An OTP has been sent to your email ${formData.email}`
                    : `OTP आपके ईमेल ${formData.email} पर भेजा गया है`)}
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {language === "en" ? "Enter OTP" : "OTP दर्ज करें"}
              </label>
              <Input
                type="text"
                name="otp"
                placeholder={language === "en" ? "Enter OTP" : "OTP दर्ज करें"}
                value={otpInput}
                onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ""))}
                className="w-full"
                maxLength={6}
              />
              {otpError && <p className="text-xs text-red-600 mt-2">{otpError}</p>}
              {/* DEV INFO: show generated OTP in console only */}
              {generatedOtp && (
                <p className="text-xs text-gray-400 mt-2">
                  {language === "en"
                    ? "DEV: OTP generated for testing is logged to the console."
                    : "डेव: परीक्षण के लिए OTP कंसोल में लॉग किया गया है।"}
                </p>
              )}
            </div>

            <div className="flex gap-2">
              <Button onClick={handleVerifyOtp} className="flex-1 bg-[#2E7D32] hover:bg-green-700 text-white">
                {language === "en" ? "Verify OTP" : "OTP सत्यापित करें"}
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  // allow switching method (mobile/email) before resending
                  // toggle method (if email exists)
                  if (formData.email) {
                    const newMethod = otpMethod === "mobile" ? "email" : "mobile"
                    setOtpMethod(newMethod)
                  }
                }}
                className="flex-1 border"
              >
                {language === "en" ? (otpMethod === "mobile" ? "Switch to Email" : "Switch to Mobile") : (otpMethod === "mobile" ? "ईमेल पर स्विच करें" : "मोबाइल पर स्विच करें")}
              </Button>
            </div>

            <div className="text-center text-sm text-gray-600">
              {resendTimer > 0 ? (
                <p>
                  {language === "en"
                    ? `You can resend OTP in ${resendTimer}s`
                    : `आप ${resendTimer} सेकंड में OTP पुनः भेज सकते हैं`}
                </p>
              ) : (
                <button onClick={handleResendOtp} className="underline text-sm">
                  {language === "en" ? "Resend OTP" : "OTP पुनः भेजें"}
                </button>
              )}
            </div>
          </div>
        </Card>
      </div>
    )
  }

  // Determine whether submit button should be disabled (includes errors)
  const hasValidationErrors = Object.keys(errors).length > 0
  const mobileIsValidForButton = /^\d{10}$/.test(formData.mobile)
  const empNoIsValidForButton = /^[a-zA-Z0-9]+$/.test(formData.empNo)

  const emailIsValidForButton = isValidEmail(formData.email)

  return (
    <div className="min-h-[calc(100vh-200px)] py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Button variant="ghost" onClick={() => onNavigate("landing")} className="mb-6 text-[#002B5C]">
          <ArrowLeft className="w-4 h-4 mr-2" />
          {language === "en" ? "Back" : "पीछे"}
        </Button>

        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-[#002B5C] mb-3">
            {language === "en" ? "Create New User Account" : "नया उपयोगकर्ता खाता बनाएं"}
          </h2>
          <p className="text-gray-600">
            {language === "en" ? "Please fill in your details to register" : "कृपया पंजीकरण के लिए अपना विवरण भरें"}
          </p>
        </div>

        <Card className="p-8 border border-gray-200">
          <div className="space-y-6">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {language === "en" ? "Full Name" : "पूरा नाम"}
              </label>
              <Input
                type="text"
                name="fullName"
                placeholder={language === "en" ? "Enter full name" : "पूरा नाम दर्ज करें"}
                value={formData.fullName}
                onChange={handleChange}
                className="w-full"
              />
            </div>

            {/* Employee Number and Mobile */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {language === "en" ? "Employee Number" : "कर्मचारी संख्या"}
                </label>
                <Input
                  type="text"
                  name="empNo"
                  placeholder={language === "en" ? "Enter employee number" : "कर्मचारी संख्या दर्ज करें"}
                  value={formData.empNo}
                  onChange={handleChange}
                  className="w-full"
                />
                {errors.empNo && <p className="text-xs text-red-600 mt-2">{errors.empNo}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {language === "en" ? "Mobile Number" : "मोबाइल नंबर"}
                </label>
                <Input
                  type="tel"
                  name="mobile"
                  placeholder={language === "en" ? "Enter mobile number" : "मोबाइल नंबर दर्ज करें"}
                  value={formData.mobile}
                  onChange={handleChange}
                  maxLength={10}
                  className="w-full"
                />
                {errors.mobile && <p className="text-xs text-red-600 mt-2">{errors.mobile}</p>}
              </div>
            </div>

            {/* Email and Department */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {language === "en" ? "Email" : "ईमेल"}
                </label>
                <Input
                  type="email"
                  name="email"
                  placeholder={language === "en" ? "Enter email" : "ईमेल दर्ज करें"}
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full"
                />
                {errors.email && <p className="text-xs text-red-600 mt-2">{errors.email}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {language === "en" ? "Department" : "विभाग"}
                </label>
                <Input
                  type="text"
                  name="department"
                  placeholder={language === "en" ? "Enter department" : "विभाग दर्ज करें"}
                  value={formData.department}
                  onChange={handleChange}
                  className="w-full"
                />
              </div>
            </div>

            {/* Designation */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {language === "en" ? "Designation" : "पदनाम"}
              </label>
              <Input
                type="text"
                name="designation"
                placeholder={language === "en" ? "Enter designation" : "पदनाम दर्ज करें"}
                value={formData.designation}
                onChange={handleChange}
                className="w-full"
              />
            </div>

            {/* Password with real-time validation */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {language === "en" ? "Password" : "पासवर्ड"}
              </label>
              <Input
                type="password"
                name="password"
                placeholder={language === "en" ? "Enter password" : "पासवर्ड दर्ज करें"}
                value={formData.password}
                onChange={handleChange}
                className="w-full"
              />
              {formData.password && (
                <div className="mt-3 p-3 bg-gray-50 rounded">
                  {/* Password Strength Indicator */}
                  <div className="mb-3">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-medium text-gray-700">
                        {language === "en" ? "Password Strength:" : "पासवर्ड शक्ति:"}
                      </span>
                      <span
                        className={`text-xs font-semibold ${
                          passwordStrength <= 2
                            ? "text-red-600"
                            : passwordStrength <= 3
                              ? "text-yellow-600"
                              : passwordStrength < 5
                                ? "text-blue-600"
                                : "text-green-600"
                        }`}
                      >
                        {passwordStrength === 0
                          ? language === "en"
                            ? "Weak"
                            : "कमजोर"
                          : passwordStrength <= 2
                            ? language === "en"
                              ? "Weak"
                              : "कमजोर"
                            : passwordStrength <= 3
                              ? language === "en"
                                ? "Fair"
                                : "उचित"
                              : passwordStrength < 5
                                ? language === "en"
                                  ? "Good"
                                  : "अच्छा"
                                : language === "en"
                                  ? "Strong"
                                  : "मजबूत"}
                      </span>
                    </div>
                    <div className="h-2 bg-gray-300 rounded overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          passwordStrength <= 2
                            ? "bg-red-500 w-1/5"
                            : passwordStrength <= 3
                              ? "bg-yellow-500 w-2/5"
                              : passwordStrength < 5
                                ? "bg-blue-500 w-3/5"
                                : "bg-green-500 w-full"
                        }`}
                      />
                    </div>
                  </div>

                  {/* Validation Checklist */}
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center gap-2">
                      {passwordValidation.minLength ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <X className="w-4 h-4 text-gray-400" />
                      )}
                      <span className={passwordValidation.minLength ? "text-green-700" : "text-gray-600"}>
                        {language === "en" ? "Minimum 8 characters" : "न्यूनतम 8 वर्ण"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {passwordValidation.hasUpperCase ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <X className="w-4 h-4 text-gray-400" />
                      )}
                      <span className={passwordValidation.hasUpperCase ? "text-green-700" : "text-gray-600"}>
                        {language === "en" ? "One uppercase letter" : "एक बड़ा अक्षर"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {passwordValidation.hasLowerCase ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <X className="w-4 h-4 text-gray-400" />
                      )}
                      <span className={passwordValidation.hasLowerCase ? "text-green-700" : "text-gray-600"}>
                        {language === "en" ? "One lowercase letter" : "एक छोटा अक्षर"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {passwordValidation.hasDigit ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <X className="w-4 h-4 text-gray-400" />
                      )}
                      <span className={passwordValidation.hasDigit ? "text-green-700" : "text-gray-600"}>
                        {language === "en" ? "One digit" : "एक अंक"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {passwordValidation.hasSpecialChar ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <X className="w-4 h-4 text-gray-400" />
                      )}
                      <span className={passwordValidation.hasSpecialChar ? "text-green-700" : "text-gray-600"}>
                        {language === "en" ? "One special character (!@#$%&*)" : "एक विशेष वर्ण (!@#$%&*)"}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {language === "en" ? "Confirm Password" : "पासवर्ड की पुष्टि करें"}
              </label>
              <Input
                type="password"
                name="confirmPassword"
                placeholder={language === "en" ? "Confirm password" : "पासवर्ड की पुष्टि करें"}
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full"
              />
              {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                <p className="text-xs text-red-600 mt-2">
                  {language === "en" ? "Passwords do not match" : "पासवर्ड मेल नहीं खाते"}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              onClick={handleSubmit}
              disabled={
                !formData.fullName ||
                !formData.empNo ||
                !formData.mobile ||
                !formData.email ||
                !isPasswordValid ||
                formData.password !== formData.confirmPassword ||
                hasValidationErrors ||
                !mobileIsValidForButton ||
                !empNoIsValidForButton ||
                !emailIsValidForButton
              }
              className="w-full bg-[#2E7D32] hover:bg-green-700 text-white mt-8"
            >
              {language === "en" ? "Register" : "पंजीकरण करें"}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
