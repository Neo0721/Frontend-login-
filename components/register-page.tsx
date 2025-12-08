"use client"

import type React from "react"
import { useState } from "react"
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
        // Employee number: disallow alphabetic characters (allow digits only)
        if (/\D/.test(value)) {
          next.empNo = language === "en" ? "Employee number must contain only digits" : "कर्मचारी संख्या में केवल अंक होने चाहिए"
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

  const handleSubmit = () => {
    // Re-validate before submit
    validateField("mobile", formData.mobile)
    validateField("empNo", formData.empNo)
    validateField("email", formData.email)

    const hasErrors = Object.keys(errors).length > 0

    // Check mobile length explicitly because user may not have triggered validation message yet
    const mobileOk = /^\d{10}$/.test(formData.mobile)
    const empNoOk = /^\d+$/.test(formData.empNo) || formData.empNo.length === 0 ? /^\d+$/.test(formData.empNo) : false
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
      setShowConfirmation(true)
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

  // Determine whether submit button should be disabled (includes errors)
  const hasValidationErrors = Object.keys(errors).length > 0
  const mobileIsValidForButton = /^\d{10}$/.test(formData.mobile)
  const empNoIsValidForButton = /^\d+$/.test(formData.empNo)
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
