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
  const [step, setStep] = useState<"emp" | "otp" | "reset">("emp");
  const [empNo, setEmpNo] = useState<string>("");
  const [otp, setOtp] = useState<string>("");
  const [newPwd, setNewPwd] = useState<string>("");
  const [confirmPwd, setConfirmPwd] = useState<string>("");

  // validation state
  const [errors, setErrors] = useState<{
    empNo?: string;
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

  // helpers for empNo/otp inputs
  const sanitizeDigits = (v: string) => v.replace(/\D/g, "");

  /* -------------------------
      STEP 1 → Enter Employee No
  --------------------------*/
  if (step === "emp") {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-md w-full">
          <Button variant="ghost" onClick={() => onNavigate("login-password")} className="mb-6 text-[#002B5C]">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <div className="bg-white shadow-md p-8 rounded-xl border">
            <h2 className="text-2xl font-bold text-center text-[#002B5C] mb-4">
              Forgot Password
            </h2>

            <Input
              placeholder="Enter Employee Number"
              value={empNo}
              onChange={(e) => {
                const digits = sanitizeDigits(e.target.value).slice(0, 20); // limit length to 20
                setEmpNo(digits);
                setErrors((prev) => {
                  const next = { ...prev };
                  if (!digits) next.empNo = language === "en" ? "Employee number must be in digits" : "कर्मचारी संख्या अंकों में होनी चाहिए";
                  else delete next.empNo;
                  return next;
                });
              }}
              // restrict paste/key input via pattern + inputMode where possible
              inputMode="numeric"
              className="mb-4"
              maxLength={20}
            />
            {errors.empNo && <p className="text-xs text-red-600 mb-3">{errors.empNo}</p>}

            <Button
              onClick={() => {
                if (!empNo) {
                  setErrors((prev) => ({ ...prev, empNo: language === "en" ? "Enter employee number" : "कर्मचारी संख्या दर्ज करें" }));
                  return;
                }
                // final check: digits only
                if (!/^\d+$/.test(empNo)) {
                  setErrors((prev) => ({ ...prev, empNo: language === "en" ? "Employee number must contain only digits" : "कर्मचारी संख्या में केवल अंक होने चाहिए" }));
                  return;
                }

                // proceed to OTP step (in real app you'd request/send OTP)
                setErrors({});
                setStep("otp");
              }}
              className="w-full bg-[#002B5C] hover:bg-blue-900 text-white"
            >
              Send OTP
            </Button>
          </div>
        </div>
      </div>
    );
  }

  /* -------------------------
      STEP 2 → OTP Screen
  --------------------------*/
  /* -------------------------
    STEP 2 → OTP Screen
--------------------------*/
if (step === "otp") {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-md w-full">

        <Button variant="ghost" onClick={() => setStep("emp")} className="mb-6 text-[#002B5C]">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <div className="bg-white shadow-md p-8 rounded-xl border">
          <h2 className="text-2xl font-bold text-center text-[#002B5C] mb-4">
            Enter OTP
          </h2>

          <Input
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="mb-4"
          />

          <Button
            onClick={() => {
              if (!otp) return alert("Enter OTP");
              // No restrictions — allow any OTP
              setStep("reset");
            }}
            className="w-full bg-[#002B5C] hover:bg-blue-900 text-white"
          >
            Verify OTP
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
            Back
          </Button>

          <div className="bg-white shadow-md p-8 rounded-xl border">
            <h2 className="text-2xl font-bold text-center text-[#002B5C] mb-4">
              Reset Password
            </h2>

            <Input
              type="password"
              placeholder="New Password"
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
              placeholder="Confirm Password"
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
                  setErrors((prev) => ({ ...prev, newPwd: language === "en" ? "Fill all fields" : "सभी फ़ील्ड भरें" }));
                  return;
                }
                if (newPwd !== confirmPwd) {
                  setErrors((prev) => ({ ...prev, confirmPwd: language === "en" ? "Passwords do not match" : "पासवर्ड मेल नहीं खाते" }));
                  return;
                }
                if (!validatePassword(newPwd)) {
                  // validatePassword already sets detailed newPwd error
                  return;
                }

                // success (replace with real API call in production)
                alert(language === "en" ? "Password reset successfully!" : "पासवर्ड सफलतापूर्वक रीसेट हुआ!");
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
              Reset Password
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
