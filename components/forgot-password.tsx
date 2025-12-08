"use client";





import { useState } from "react";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import { ArrowLeft } from "lucide-react";

interface ForgotPasswordProps {
  onNavigate: (view: any, payload?: any) => void;
  language: "en" | "hi";
}

export default function ForgotPassword(
  { onNavigate, language }: ForgotPasswordProps
) {
  const [step, setStep] = useState<"emp" | "otp" | "reset">("emp");
const [empNo, setEmpNo] = useState<string>("");
const [otp, setOtp] = useState<string>("");
const [newPwd, setNewPwd] = useState<string>("");
const [confirmPwd, setConfirmPwd] = useState<string>("");



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
              onChange={(e) => setEmpNo(e.target.value)}
              className="mb-4"
            />

            <Button
              onClick={() => {
                if (!empNo) return alert("Enter employee number");
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
              onChange={(e) => setNewPwd(e.target.value)}
              className="mb-4"
            />

            <Input
              type="password"
              placeholder="Confirm Password"
              value={confirmPwd}
              onChange={(e) => setConfirmPwd(e.target.value)}
              className="mb-4"
            />

            <Button
              onClick={() => {
                if (!newPwd || !confirmPwd) return alert("Fill all fields");
                if (newPwd !== confirmPwd) return alert("Passwords do not match");

                alert("Password reset successfully!");
                onNavigate("login-password");
              }}
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
