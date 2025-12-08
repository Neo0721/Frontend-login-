"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Eye, EyeOff, Check, X } from "lucide-react"
import { Card } from "@/components/ui/card"

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

  // KEEP password change constraints (for change-password screen)
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

  // Password validator used ONLY for change-password screen
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

  // ----------------------
  // EMP NO VALIDATION LOGIC
  // ----------------------
  function sanitizeToDigits(v: string) {
    return v.replace(/\D/g, "")
  }

  function handleEmpChange(e: React.ChangeEvent<HTMLInputElement>) {
  const raw = e.target.value
  const digitsOnly = raw.replace(/\D/g, "").slice(0, 20) // keep your max length
  setEmpNo(digitsOnly)

  // Show error only when raw input actually had non-digit characters
  if (raw !== digitsOnly) {
    setEmpError(
      language === "en"
        ? "Employee number must contain only digits"
        : "कर्मचारी संख्या में केवल अंक होने चाहिए"
    )
  } else {
    setEmpError(null)
  }
}

function handleEmpKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
  // Allow control/navigation keys
  const allowed = ["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab", "Home", "End"]
  if (allowed.includes(e.key)) return

  // Prevent non-digit keypresses, but DON'T set an error here.
  // Setting an error here can persist even after the next valid change.
  if (!/^[0-9]$/.test(e.key)) {
    e.preventDefault()
  }
}

function handleEmpPaste(e: React.ClipboardEvent<HTMLInputElement>) {
  const paste = e.clipboardData.getData("text")
  const digits = paste.replace(/\D/g, "")

  // Prevent default paste and insert only digits
  e.preventDefault()
  setEmpNo((prev) => (prev + digits).slice(0, 20))

  // Show an informative message only if the pasted text contained non-digits
  if (paste !== digits) {
    setEmpError(
      language === "en"
        ? "Pasted content contained non-digit characters — they were removed"
        : "पेस्ट की गई सामग्री में गैर-अंक वर्ण थे — उन्हें हटा दिया गया है"
    )
    // clear the message shortly after so the user isn't stuck with it
    setTimeout(() => setEmpError(null), 3000)
  } else {
    setEmpError(null)
  }



    e.preventDefault()
    setEmpNo((prev) => (prev + digits).slice(0, 20))
  }

  function isEmpValid(v: string) {
    return v.length > 0 && /^\d+$/.test(v)
  }

  // ---------------------------
  // LOGIN HANDLER (NO PASSWORD RULES)
  // ---------------------------
  const handleLogin = () => {
    if (!isEmpValid(empNo)) {
      setEmpError(language === "en" ? "Please enter a valid employee number." : "कृपया एक मान्य कर्मचारी संख्या दर्ज करें।")
      return
    }

    if (!password) {
      alert(language === "en" ? "Please enter your password." : "कृपया अपना पासवर्ड दर्ज करें।")
      return
    }

    // NO PASSWORD RULES → LOGIN SUCCESS
    onNavigate("dashboard")
  }

  const isPasswordValid = Object.values(passwordValidation).every(Boolean)

  // ---------------------------
  // CHANGE PASSWORD SCREEN (UNCHANGED)
  // ---------------------------
  if (isChangingPassword) {
    return (
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 px-4">
        {/* unchanged code… */}
      </div>
    )
  }

  // ---------------------------
  // LOGIN SCREEN
  // ---------------------------
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
            {/* EMP NO FIELD */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {language === "en" ? "Employee Number" : "कर्मचारी संख्या"}
              </label>
              <Input
                type="text"
                inputMode="numeric"
                value={empNo}
                onChange={handleEmpChange}
                onKeyDown={handleEmpKeyDown}
                onPaste={handleEmpPaste}
                placeholder={language === "en" ? "Enter employee number" : "कर्मचारी संख्या दर्ज करें"}
                maxLength={20}
                className="w-full"
              />
              {empError && <p className="text-xs text-red-600 mt-2">{empError}</p>}
            </div>

            {/* PASSWORD FIELD (NO RULES) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {language === "en" ? "Password" : "पासवर्ड"}
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={language === "en" ? "Enter password" : "पासवर्ड दर्ज करें"}
                  className="w-full pr-10"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-5 h-5 text-gray-500" /> : <Eye className="w-5 h-5 text-gray-500" />}
                </button>
              </div>
            </div>

            {/* REMEMBER ME */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4"
              />
              <label className="text-sm text-gray-700">
                {language === "en" ? "Remember me" : "मुझे याद रखें"}
              </label>
            </div>

            {/* FORGOT PASSWORD */}
            <div className="text-right">
              <button
                onClick={() => onNavigate("forgot-password")}
                className="text-sm text-[#2E7D32] hover:underline"
              >
                {language === "en" ? "Forgot Password?" : "पासवर्ड भूल गए?"}
              </button>
            </div>

            {/* LOGIN BUTTON */}
            <Button
              onClick={handleLogin}
              disabled={!isEmpValid(empNo) || !password}
              className="w-full bg-[#002B5C] text-white hover:bg-blue-900"
            >
              {language === "en" ? "Sign In" : "साइन इन"}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
