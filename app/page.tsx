"use client";

import { useState } from "react";
import Header from "@/components/header";
import LandingPage from "@/components/landing-page";
import LoginOptions from "@/components/login-options";
import LoginOTP from "@/components/login-otp";
import LoginPassword from "@/components/login-password";
import RegisterPage from "@/components/register-page";
import Dashboard from "@/components/dashboard";
import ChangePassword from "@/components/change-password";  // ✅ NEW IMPORT
import Footer from "@/components/footer";
import ForgotPassword from "@/components/forgot-password"



type PageView =
  | "landing"
  | "login-options"
  | "login-otp"
  | "login-password"
  | "register"
  | "dashboard"
  | "change-password"
  | "forgot-password";     // ✅ NEW VIEW

export default function Page() {
  const [currentView, setCurrentView] = useState<PageView>("landing");
  const [language, setLanguage] = useState<"en" | "hi">("en");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("John Doe");
  const [empNo, setEmpNo] = useState("EMP001");

  const handleNavigate = (view: PageView) => {
    if (view === "dashboard") {
      setIsLoggedIn(true);
    } else if (view === "landing") {
      setIsLoggedIn(false);
    }
    setCurrentView(view);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header
        language={language}
        setLanguage={setLanguage}
        showUserInfo={isLoggedIn}
        userName={userName}
        empNo={empNo}
        onChangePassword={() => handleNavigate("change-password")}  // ✅ FIXED
        onLogout={() => handleNavigate("landing")}
      />

      <main className="flex-1">
        {currentView === "landing" && (
          <LandingPage onNavigate={handleNavigate} language={language} />
        )}

        {currentView === "login-options" && (
          <LoginOptions onNavigate={handleNavigate} language={language} />
        )}

        {currentView === "login-otp" && (
          <LoginOTP onNavigate={handleNavigate} language={language} />
        )}

        {currentView === "login-password" && (
          <LoginPassword onNavigate={handleNavigate} language={language} />
        )}

        {currentView === "register" && (
          <RegisterPage onNavigate={handleNavigate} language={language} />
        )}

        {currentView === "forgot-password" && (
          <ForgotPassword onNavigate={handleNavigate} language={language} />
        )}


        {currentView === "dashboard" && (
          <Dashboard
            onNavigate={handleNavigate}
            language={language}
            userName={userName}
            empNo={empNo}
          />
        )}

        {currentView === "change-password" && (
          <ChangePassword onNavigate={handleNavigate} language={language} />
        )}
      </main>

      <Footer language={language} />
    </div>
  );
}
