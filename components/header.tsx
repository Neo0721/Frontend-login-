"use client"

import { useState } from "react"
import { Globe, HelpCircle, User } from "lucide-react"
import { Button } from "@/components/ui/button"



interface HeaderProps {
  language: "en" | "hi"
  setLanguage: (lang: "en" | "hi") => void
  showUserInfo?: boolean

  isLoggedIn?: boolean       // ADD THIS
  userName?: string          // (already there)
  employeeId?: string        // ADD THIS
  empNo?: string

  onChangePassword?: () => void
  onLogout?: () => void
}



export default function Header({
  language = "en",
  setLanguage,
  showUserInfo = false,
  isLoggedIn,
  userName,
  employeeId,
  empNo,
  onChangePassword,
  onLogout,
}: HeaderProps) {
  const [showLanguageMenu, setShowLanguageMenu] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)

  return (
    <header className="bg-[#002B5C] text-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-2">
        <div className="flex items-center justify-between gap-4">
          {/* Logo and Title - Centered */}
          <div className="flex-1 text-center">
            <div className="flex items-center justify-center gap-2">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-[#002B5C] font-bold text-sm">
                🚂
              </div>
              <h1 className="text-sm md:text-base font-bold text-balance">
                {language === "en" ? "पश्चिम रेलवे   WESTERN RAILWAY" : "पश्चिम रेल्वे – पहचान पत्र"}
              </h1>
            </div>
            <p className="text-xs text-blue-100">{language === "en" ? "Ministry of Railways" : "रेल मंत्रालय"}</p>
          </div>

          {/* Top Right Controls */}
          <div className="flex items-center gap-2">
            {/* Language Toggle */}
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-blue-900 h-8 w-8 p-0"
                onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                aria-label="Language selector"
              >
                <Globe className="w-3 h-3" />
              </Button>
              {showLanguageMenu && (
                <div className="absolute right-0 mt-2 w-28 bg-white text-[#002B5C] rounded shadow-lg py-2 z-10 text-xs">
                  <button
                    onClick={() => {
                      setLanguage("en")
                      setShowLanguageMenu(false)
                    }}
                    className="block w-full text-left px-3 py-2 hover:bg-gray-100"
                  >
                    English
                  </button>
                  <button
                    onClick={() => {
                      setLanguage("hi")
                      setShowLanguageMenu(false)
                    }}
                    className="block w-full text-left px-3 py-2 hover:bg-gray-100"
                  >
                    हिन्दी
                  </button>
                </div>
              )}
            </div>

            {/* Help Icon */}
            <Button variant="ghost" size="sm" className="text-white hover:bg-blue-900 h-8 w-8 p-0" aria-label="Help">
              <HelpCircle className="w-3 h-3" />
            </Button>

            {showUserInfo && (
              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-blue-900 h-8 w-8 p-0"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  aria-label="User menu"
                >
                  <User className="w-4 h-4" />
                </Button>
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white text-[#002B5C] rounded shadow-lg py-2 z-10 text-sm">
                    <div className="px-3 py-2 border-b border-gray-200">
                      <div className="font-semibold text-sm">{userName}</div>
                      <div className="text-xs text-gray-500">ID: {empNo}</div>
                    </div>
                    <button
                      onClick={() => {
                        onChangePassword?.()
                        setShowUserMenu(false)
                      }}
                      className="block w-full text-left px-3 py-2 hover:bg-gray-100"
                    >
                      {language === "en" ? "Change Password" : "पासवर्ड बदलें"}
                    </button>
                    <button
                      onClick={() => {
                        onLogout?.()
                        setShowUserMenu(false)
                      }}
                      className="block w-full text-left px-3 py-2 hover:bg-gray-100 text-red-600"
                    >
                      {language === "en" ? "Logout" : "लॉगआउट"}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
