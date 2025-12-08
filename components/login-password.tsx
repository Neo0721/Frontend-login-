"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Eye, EyeOff, Check, X } from "lucide-react"
import { Card } from "@/components/ui/card"
import ForgotPassword from "./forgot-password"

interface LoginPasswordProps {
  onNavigate: (view: any) => void
  language: "en" | "hi"
}

export default function LoginPassword({ onNavigate, language }: LoginPasswordProps) {
  const [empNo, setEmpNo] = useState("")
  const [empError, setEmpError] = useState<string | null>(null)
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [passwordValidation, setPasswordValidation] = useState({
    minLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasDigit: false,
    hasSpecialChar: false,
  })
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

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

  // --- New emp input helpers ---
  function sanitizeToDigits(value: string) {
    return value.replace(/\D/g, "")
  }

  function handleEmpChange(e: React.ChangeEvent<HTMLInputElement>) {
    const digitsOnly = sanitizeToDigits(e.target.value)
    setEmpNo(digitsOnly)
    if (empError) setEmpError(null)
  }

  function handleEmpKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    // Allow control keys
    const allowed = ["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab", "Home", "End"]
    if (allowed.includes(e.key)) return

    // Allow digits only
    if (!/^[0-9]$/.test(e.key)) {
      e.preventDefault()
    }
  }

  function handleEmpPaste(e: React.ClipboardEvent<HTMLInputElement>) {
    const paste = e.clipboardData.getData("text")
    const digits = sanitizeToDigits(paste)
    if (!digits) {
      e.preventDefault()
      return
    }
    // replace paste with sanitized digits
    e.preventDefault()
    // append sanitized digits to current caret position — simplest: set value to current + digits
    // (for more precise caret handling you could compute selectionStart/End)
    setEmpNo((prev) => (prev + digits).slice(0, 20)) // optional max length 20
    if (empError) setEmpError(null)
  }

  function isEmpValid(value: string) {
    return value.length > 0 && /^\d+$/.test(value)
  }

  // --- Login handler updated to enforce numeric empNo ---
  const handleLogin = () => {
    // validate empNo
    if (!isEmpValid(empNo)) {
      setEmpError(language === "en" ? "Please enter a valid employee number (numbers only)." : "कृपया एक मान्य कर्मचारी संख्या दर्ज करें (केवल अंक)।")
      return
    }
    if (!password) {
      setEmpError(language === "en" ? "Please enter your password." : "कृपया अपना पासवर्ड दर्ज करें।")
      return
    }

    // Clear error and proceed
    setEmpError(null)
    // Your navigation or authentication call
    onNavigate("dashboard")
  }

  const isPasswordValid = Object.values(passwordValidation).every(Boolean)

  if (isChangingPassword) {
    return (
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full">
          <Button variant="ghost" onClick={() => setIsChangingPassword(false)} className="mb-6 text-[#002B5C]">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {language === "en" ? "Back" : "पीछे"}
          </Button>

          <Card className="p-8 border border-gray-200">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-[#002B5C] mb-2">
                {language === "en" ? "Change Password" : "पासवर्ड बदलें"}
              </h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {language === "en" ? "Current Password" : "वर्तमान पासवर्ड"}
                </label>
                <Input
                  type="password"
                  placeholder={language === "en" ? "Enter current password" : "वर्तमान पासवर्ड दर्ज करें"}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {language === "en" ? "New Password" : "नया पासवर्ड"}
                </label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value)
                    validatePassword(e.target.value)
                  }}
                  placeholder={language === "en" ? "Enter new password" : "नया पासवर्ड दर्ज करें"}
                  className="w-full"
                />
                {newPassword && (
                  <div className="mt-3 p-3 bg-gray-50 rounded">
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
                    <div className="space-y-2 text-xs">
                      {[
                        { key: "minLength", label: language === "en" ? "Minimum 8 characters" : "न्यूनतम 8 वर्ण" },
                        { key: "hasUpperCase", label: language === "en" ? "One uppercase letter" : "एक बड़ा अक्षर" },
                        { key: "hasLowerCase", label: language === "en" ? "One lowercase letter" : "एक छोटा अक्षर" },
                        { key: "hasDigit", label: language === "en" ? "One digit" : "एक अंक" },
                        {
                          key: "hasSpecialChar",
                          label: language === "en" ? "One special character (!@#$%&*)" : "एक विशेष वर्ण (!@#$%&*)",
                        },
                      ].map((item) => (
                        <div key={item.key} className="flex items-center gap-2">
                          {passwordValidation[item.key as keyof typeof passwordValidation] ? (
                            <Check className="w-4 h-4 text-green-600" />
                          ) : (
                            <X className="w-4 h-4 text-gray-400" />
                          )}
                          <span
                            className={
                              passwordValidation[item.key as keyof typeof passwordValidation]
                                ? "text-green-700"
                                : "text-gray-600"
                            }
                          >
                            {item.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {language === "en" ? "Confirm New Password" : "नए पासवर्ड की पुष्टि करें"}
                </label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={language === "en" ? "Confirm new password" : "नए पासवर्ड की पुष्टि करें"}
                  className="w-full"
                />
                {confirmPassword && newPassword !== confirmPassword && (
                  <p className="text-xs text-red-600 mt-2">
                    {language === "en" ? "Passwords do not match" : "पासवर्ड मेल नहीं खाते"}
                  </p>
                )}
              </div>

              <Button
                onClick={() => setIsChangingPassword(false)}
                disabled={!isPasswordValid || newPassword !== confirmPassword}
                className="w-full bg-[#2E7D32] hover:bg-green-700 text-white"
              >
                {language === "en" ? "Update Password" : "पासवर्ड अपडेट करें"}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    )
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
              {language === "en" ? "Sign in with Password" : "पासवर्ड से साइन इन करें"}
            </h2>
            <p className="text-sm text-gray-600">
              {language === "en" ? "Enter your credentials to login" : "लॉगिन करने के लिए अपनी साख दर्ज करें"}
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {language === "en" ? "Employee No / कर्मचारी संख्या" : "कर्मचारी संख्या / Employee No"}
              </label>
              <Input
                type="text"
                inputMode="numeric"
                pattern="\d*"
                placeholder={language === "en" ? "Enter employee number" : "कर्मचारी संख्या दर्ज करें"}
                value={empNo}
                onChange={handleEmpChange}
                onKeyDown={handleEmpKeyDown}
                onPaste={handleEmpPaste}
                className="w-full"
                maxLength={20}
              />
              {empError && <p className="text-xs text-red-600 mt-2">{empError}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {language === "en" ? "Password / पासवर्ड" : "पासवर्ड / Password"}
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder={language === "en" ? "Enter password" : "पासवर्ड दर्ज करें"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pr-10"
                />
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                  aria-label="Toggle password visibility"
                  type="button"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4"
              />
              <label htmlFor="remember" className="text-sm text-gray-700">
                {language === "en" ? "Remember me" : "मुझे याद रखें"}
              </label>
            </div>

            <div className="text-right mb-4">
              <button
                onClick={() => onNavigate("forgot-password")}
                className="text-sm text-[#2E7D32] hover:underline"
                type="button"
              >
                {language === "en" ? "Forgot Password?" : "पासवर्ड भूल गए?"}
              </button>

            </div>

            <Button
              onClick={handleLogin}
              disabled={!isEmpValid(empNo) || !password}
              className="w-full bg-[#002B5C] hover:bg-blue-900 text-white"
            >
              {language === "en" ? "Sign In" : "साइन इन"}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
