"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { ArrowLeft } from "lucide-react";

interface ForgotPasswordProps {
  onNavigate: (view: any, payload?: any) => void;
  language: "en" | "hi";
}

export default function ForgotPassword({ onNavigate, language }: ForgotPasswordProps) {
  const [step, setStep] = useState<"mobile" | "otp" | "reset">("mobile");
  const [mobile, setMobile] = useState<string>("");
  const [otp, setOtp] = useState<string>("");
  const [newPwd, setNewPwd] = useState<string>("");
  const [confirmPwd, setConfirmPwd] = useState<string>("");

  // validation state
  const [errors, setErrors] = useState<{
    mobile?: string;
    otp?: string;
    newPwd?: string;
    confirmPwd?: string;
  }>({});

  const [passwordValidation, setPasswordValidation] = useState({
    minLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasDigit: false,
    hasSpecialChar: false,
  });
  const [passwordStrength, setPasswordStrength] = useState(0);

  const txt = {
    back: language === "en" ? "Back" : "वापस",
    forgotPassword: language === "en" ? "Forgot Password" : "पासवर्ड भूल गए",
    enterMobile: language === "en" ? "Enter Mobile Number" : "मोबाइल नंबर दर्ज करें",
    enterOTP: language === "en" ? "Enter OTP" : "OTP दर्ज करें",
    resetPassword: language === "en" ? "Reset Password" : "पासवर्ड रीसेट करें",
    sendOTP: language === "en" ? "Send OTP" : "OTP भेजें",
    verifyOTP: language === "en" ? "Verify OTP" : "OTP सत्यापित करें",
    newPassword: language === "en" ? "New Password" : "नया पासवर्ड",
    confirmPassword: language === "en" ? "Confirm Password" : "पासवर्ड की पुष्टि करें",
    enterMobileAlert: language === "en" ? "Enter mobile number" : "मोबाइल नंबर दर्ज करें",
    invalidMobile: language === "en" ? "Enter a valid 10-digit mobile number" : "मान्य 10-अंकीय मोबाइल नंबर दर्ज करें",
    enterOTPAlert: language === "en" ? "Enter OTP" : "OTP दर्ज करें",
    passwordResetSuccess: language === "en" ? "Password reset successfully!" : "पासवर्ड सफलतापूर्वक रीसेट हुआ!",
    fillAllFields: language === "en" ? "Fill all fields" : "सभी फ़ील्ड भरें",
    passwordsNotMatch: language === "en" ? "Passwords do not match" : "पासवर्ड मेल नहीं खाते",
    employeeMobileNote: language === "en" ? "OTP will be sent to the mobile number" : "OTP मोबाइल नंबर पर भेजा जाएगा",
  };

  const validatePassword = (pwd: string) => {
    const validation = {
      minLength: pwd.length >= 8,
      hasUpperCase: /[A-Z]/.test(pwd),
      hasLowerCase: /[a-z]/.test(pwd),
      hasDigit: /\d/.test(pwd),
      hasSpecialChar: /[!@#$%&*]/.test(pwd),
    };
    setPasswordValidation(validation);
    const strength = Object.values(validation).filter(Boolean).length;
    setPasswordStrength(strength);

    setErrors((prev) => {
      const next = { ...prev };
      if (!validation.minLength) next.newPwd = language === "en" ? "Password must be at least 8 characters" : "पासवर्ड कम से कम 8 वर्ण का होना चाहिए";
      else if (!validation.hasUpperCase) next.newPwd = language === "en" ? "Include at least one uppercase letter" : "कम से कम एक बड़ा अक्षर शामिल करें";
      else if (!validation.hasLowerCase) next.newPwd = language === "en" ? "Include at least one lowercase letter" : "कम से कम एक छोटा अक्षर शामिल करें";
      else if (!validation.hasDigit) next.newPwd = language === "en" ? "Include at least one digit" : "कम से कम एक अंक शामिल करें";
      else if (!validation.hasSpecialChar) next.newPwd = language === "en" ? "Include at least one special character (!@#$%&*)" : "कम से कम एक विशेष वर्ण शामिल करें (!@#$%&*)";
      else delete next.newPwd;
      return next;
    });

    return Object.values(validation).every(Boolean);
  };

  // helpers for inputs
  const sanitizeDigits = (v: string) => v.replace(/\D/g, "");

  /* -------------------------
      STEP 1 → Enter Mobile Number
  --------------------------*/
  if (step === "mobile") {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-md w-full">
          <Button variant="ghost" onClick={() => onNavigate("login-password")} className="mb-6 text-[#002B5C]">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {txt.back}
          </Button>

          <div className="bg-white shadow-md p-8 rounded-xl border">
            <h2 className="text-2xl font-bold text-center text-[#002B5C] mb-4">
              {txt.forgotPassword}
            </h2>

            <Input
              placeholder={txt.enterMobile}
              value={mobile}
              onChange={(e) => {
                const digits = sanitizeDigits(e.target.value).slice(0, 10); // limit length to 10
                setMobile(digits);
                setErrors((prev) => {
                  const next = { ...prev };
                  if (!digits) next.mobile = language === "en" ? "Mobile number is required" : "मोबाइल नंबर आवश्यक है";
                  else if (!/^\d{10}$/.test(digits)) next.mobile = txt.invalidMobile;
                  else delete next.mobile;
                  return next;
                });
              }}
              inputMode="numeric"
              className="mb-4"
              maxLength={10}
            />
            {errors.mobile && <p className="text-xs text-red-600 mb-3">{errors.mobile}</p>}

            <div className="text-xs text-gray-500 mb-3">{txt.employeeMobileNote}</div>

            <Button
              onClick={() => {
                if (!mobile) {
                  setErrors((prev) => ({ ...prev, mobile: txt.enterMobileAlert }));
                  return;
                }
                // final check: 10 digits
                if (!/^\d{10}$/.test(mobile)) {
                  setErrors((prev) => ({ ...prev, mobile: txt.invalidMobile }));
                  return;
                }

                // proceed to OTP step (in real app you'd request/send OTP to the mobile)
                setErrors({});
                // Here you would call your API to send OTP to the mobile number
                setStep("otp");
              }}
              className="w-full bg-[#002B5C] hover:bg-blue-900 text-white"
            >
              {txt.sendOTP}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  /* -------------------------
      STEP 2 → OTP Screen
  --------------------------*/
  if (step === "otp") {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-md w-full">

          <Button variant="ghost" onClick={() => setStep("mobile")} className="mb-6 text-[#002B5C]">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {txt.back}
          </Button>

          <div className="bg-white shadow-md p-8 rounded-xl border">
            <h2 className="text-2xl font-bold text-center text-[#002B5C] mb-4">
              {txt.enterOTP}
            </h2>

            <div className="text-center text-sm text-slate-600 mb-4">
              {language === "en"
                ? `OTP sent to +91-${mobile.slice(0, 3)}-${mobile.slice(3, 6)}-${mobile.slice(6)}`
                : `OTP भेजा गया: +91-${mobile.slice(0, 3)}-${mobile.slice(3, 6)}-${mobile.slice(6)}`}
            </div>

            <Input
              placeholder={txt.enterOTP}
              value={otp}
              onChange={(e) => setOtp(sanitizeDigits(e.target.value).slice(0, 6))}
              className="mb-4"
              maxLength={6}
              inputMode="numeric"
            />

            <Button
              onClick={() => {
                if (!otp) {
                  alert(txt.enterOTPAlert);
                  return;
                }
                // No restrictions — allow any OTP for now (replace with real verification)
                setStep("reset");
              }}
              className="w-full bg-[#002B5C] hover:bg-blue-900 text-white"
            >
              {txt.verifyOTP}
            </Button>
          </div>

        </div>
      </div>
    );
  }

  /* -------------------------
      STEP 3 → Reset Password
  --------------------------*/
  if (step === "reset") {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-md w-full">
          <Button variant="ghost" onClick={() => setStep("otp")} className="mb-6 text-[#002B5C]">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {txt.back}
          </Button>

          <div className="bg-white shadow-md p-8 rounded-xl border">
            <h2 className="text-2xl font-bold text-center text-[#002B5C] mb-4">
              {txt.resetPassword}
            </h2>

            <Input
              type="password"
              placeholder={txt.newPassword}
              value={newPwd}
              onChange={(e) => {
                const v = e.target.value;
                setNewPwd(v);
                validatePassword(v);
                setErrors((prev) => {
                  const next = { ...prev };
                  if (!v) next.newPwd = language === "en" ? "New password is required" : "नया पासवर्ड आवश्यक है";
                  else {
                    // validatePassword sets detailed newPwd error already; keep confirm check separate
                    delete next.newPwd;
                  }
                  // keep confirm mismatch if exists
                  if (confirmPwd && v !== confirmPwd) next.confirmPwd = language === "en" ? "Passwords do not match" : "पासवर्ड मेल नहीं खाते";
                  else delete next.confirmPwd;
                  return next;
                });
              }}
              className="mb-3"
            />

            {/* password checklist & strength */}
            {newPwd && (
              <div className="mb-3 p-3 bg-gray-50 rounded text-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-700">{language === "en" ? "Password Strength:" : "पासवर्ड शक्ति:"}</span>
                  <span className={`text-xs font-semibold ${
                    passwordStrength <= 2 ? "text-red-600" :
                    passwordStrength <= 3 ? "text-yellow-600" :
                    passwordStrength < 5 ? "text-blue-600" : "text-green-600"
                  }`}>
                    {passwordStrength <= 2 ? (language === "en" ? "Weak" : "कमजोर")
                      : passwordStrength <= 3 ? (language === "en" ? "Fair" : "उचित")
                      : passwordStrength < 5 ? (language === "en" ? "Good" : "अच्छा")
                      : (language === "en" ? "Strong" : "मजबूत")}
                  </span>
                </div>

                <div className="space-y-1 text-xs">
                  <div className={passwordValidation.minLength ? "text-green-700" : "text-gray-600"}> {language === "en" ? "Minimum 8 characters" : "न्यूनतम 8 वर्ण"} </div>
                  <div className={passwordValidation.hasUpperCase ? "text-green-700" : "text-gray-600"}> {language === "en" ? "One uppercase letter" : "एक बड़ा अक्षर"} </div>
                  <div className={passwordValidation.hasLowerCase ? "text-green-700" : "text-gray-600"}> {language === "en" ? "One lowercase letter" : "एक छोटा अक्षर"} </div>
                  <div className={passwordValidation.hasDigit ? "text-green-700" : "text-gray-600"}> {language === "en" ? "One digit" : "एक अंक"} </div>
                  <div className={passwordValidation.hasSpecialChar ? "text-green-700" : "text-gray-600"}> {language === "en" ? "One special character (!@#$%&*)" : "एक विशेष वर्ण (!@#$%&*)"} </div>
                </div>
              </div>
            )}

            <Input
              type="password"
              placeholder={txt.confirmPassword}
              value={confirmPwd}
              onChange={(e) => {
                const v = e.target.value;
                setConfirmPwd(v);
                setErrors((prev) => {
                  const next = { ...prev };
                  if (!v) next.confirmPwd = language === "en" ? "Please confirm your password" : "कृपया अपना पासवर्ड पुष्टि करें";
                  else if (newPwd && v !== newPwd) next.confirmPwd = language === "en" ? "Passwords do not match" : "पासवर्ड मेल नहीं खाते";
                  else delete next.confirmPwd;
                  return next;
                });
              }}
              className="mb-4"
            />
            {errors.confirmPwd && <p className="text-xs text-red-600 mb-3">{errors.confirmPwd}</p>}
            {errors.newPwd && <p className="text-xs text-red-600 mb-3">{errors.newPwd}</p>}

            <Button
              onClick={() => {
                // final client-side checks
                if (!newPwd || !confirmPwd) {
                  setErrors((prev) => ({ ...prev, newPwd: txt.fillAllFields }));
                  return;
                }
                if (newPwd !== confirmPwd) {
                  setErrors((prev) => ({ ...prev, confirmPwd: txt.passwordsNotMatch }));
                  return;
                }
                if (!validatePassword(newPwd)) {
                  // validatePassword already sets detailed newPwd error
                  return;
                }

                // success (replace with real API call in production)
                alert(txt.passwordResetSuccess);
                onNavigate("login-password");
              }}
              disabled={
                !newPwd ||
                !confirmPwd ||
                newPwd !== confirmPwd ||
                !Object.values(passwordValidation).every(Boolean)
              }
              className="w-full bg-[#2E7D32] hover:bg-green-700 text-white"
            >
              {language === "en" ? "Reset Password" : "पासवर्ड रीसेट करें"}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
