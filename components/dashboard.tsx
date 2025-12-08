"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { FileText, User, Lock } from "lucide-react"
import IdCardForm from "@/components/id-card-form"

interface DashboardProps {
  onNavigate: (view: any) => void
  language: "en" | "hi"
  userName?: string
  empNo?: string
  onChangePassword?: () => void
}

export default function Dashboard({
  onNavigate,
  language,
  userName = "John Doe",
  empNo = "EMP001",
  onChangePassword,
}: DashboardProps) {
  const [showIdCardForm, setShowIdCardForm] = useState(false)
  const [hasApplied, setHasApplied] = useState(false)

  // show id card form as a full screen modal replacement
  if (showIdCardForm) {
    return (
      <IdCardForm
        onNavigate={onNavigate}
        language={language}
        onCancel={() => setShowIdCardForm(false)}
      />
    )
  }

  return (
    <div className="min-h-[calc(100vh-200px)] py-10 px-6 bg-slate-50">
      <div className="max-w-6xl mx-auto">
        {/* Header / Greeting */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-[#002B5C]">
              {language === "en" ? `Hi, ${userName}` : `नमस्ते, ${userName}`}
            </h2>
            <p className="text-sm text-gray-600 mt-1">{language === "en" ? `Employee No: ${empNo}` : `कर्मचारी संख्या: ${empNo}`}</p>
          </div>

          {/* Quick info card */}
          <div className="flex items-center gap-3">
            <Card className="px-4 py-3 shadow-sm border border-gray-200">
              <p className="text-xs text-gray-500">{language === "en" ? "ID Card Status" : "आईडी कार्ड स्थिति"}</p>
              <p className="text-lg font-semibold text-[#002B5C] mt-1">{hasApplied ? "Submitted" : "Not Applied"}</p>
            </Card>
          </div>
        </div>

        {/* Main action area: large buttons/cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 flex flex-col justify-between items-start bg-white shadow-md">
            <div>
              <h3 className="text-lg font-bold text-[#0B1B2B] mb-2">{language === "en" ? "Apply for ID Card" : "आईडी कार्ड के लिए आवेदन करें"}</h3>
              <p className="text-sm text-gray-600 mb-4">{language === "en" ? "Start a new ID card application. Documents required will appear in the form." : "नया आईडी कार्ड आवेदन शुरू करें। आवश्यक दस्तावेज़ फ़ॉर्म में दिखाई देंगे।"}</p>
            </div>

            <div className="w-full">
              <Button
                onClick={() => setShowIdCardForm(true)}
                className="w-full text-white bg-[#2E7D32] hover:bg-green-700 flex items-center justify-center gap-3 py-3"
              >
                <FileText className="w-5 h-5" />
                {language === "en" ? "Apply Now" : "अभी आवेदन करें"}
              </Button>
            </div>
          </Card>

          <Card className="p-6 flex flex-col justify-between items-start bg-white shadow-md">
            <div>
              <h3 className="text-lg font-bold text-[#0B1B2B] mb-2">{language === "en" ? "Applications" : "आवेदन"}</h3>
              <p className="text-sm text-gray-600 mb-4">{language === "en" ? "View or update your ID card application." : "अपने आईडी कार्ड आवेदन को देखें या अपडेट करें।"}</p>
            </div>

            <div className="w-full flex flex-col gap-3">
              <Button
                variant="outline"
                onClick={() => onNavigate?.("view-application")}
                className="w-full flex items-center justify-center gap-3 py-3 border-[#002B5C] text-[#002B5C]"
              >
                {language === "en" ? "View Application" : "आवेदन देखें"}
              </Button>

              <Button
                onClick={() => onNavigate?.("update-application")}
                className="w-full text-white bg-[#1565C0] hover:bg-blue-700 flex items-center justify-center gap-3 py-3"
              >
                {language === "en" ? "Update Application" : "आवेदन अपडेट करें"}
              </Button>
            </div>
          </Card>

          <Card className="p-6 flex flex-col justify-between items-start bg-white shadow-md">
            <div>
              <h3 className="text-lg font-bold text-[#0B1B2B] mb-2">{language === "en" ? "Security" : "सुरक्षा"}</h3>
              <p className="text-sm text-gray-600 mb-4">{language === "en" ? "Manage your account security settings." : "अपने खाते की सुरक्षा सेटिंग्स प्रबंधित करें।"}</p>
            </div>

            <div className="w-full">
              <Button
                variant="outline"
                onClick={() => {
                  if (typeof onChangePassword === "function") onChangePassword()
                  else onNavigate?.("change-password")
                }}
                className="w-full flex items-center justify-center gap-2 py-3 border-[#002B5C] text-[#002B5C]"
              >
                <Lock className="w-4 h-4" />
                {language === "en" ? "Change Password" : "पासवर्ड बदलें"}
              </Button>
            </div>
          </Card>
        </div>

        {/* Compact application status table (shows only when applied) */}
        {hasApplied && (
          <Card className="border border-gray-200 overflow-x-auto mb-8 bg-white">
            <div className="p-6">
              <h2 className="text-xl font-bold text-[#002B5C] mb-4">{language === "en" ? "Application Status" : "आवेदन स्थिति"}</h2>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-[#F6F7F8]">
                      <th className="px-4 py-3 text-left font-semibold text-[#0B1B2B]">Sr. No</th>
                      <th className="px-4 py-3 text-left font-semibold text-[#0B1B2B]">{language === "en" ? "Type" : "प्रकार"}</th>
                      <th className="px-4 py-3 text-left font-semibold text-[#0B1B2B]">{language === "en" ? "Department" : "विभाग"}</th>
                      <th className="px-4 py-3 text-left font-semibold text-[#0B1B2B]">{language === "en" ? "Submitted" : "जमा किया गया"}</th>
                      <th className="px-4 py-3 text-left font-semibold text-[#0B1B2B]">{language === "en" ? "Status" : "स्थिति"}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b hover:bg-[#F6F7F8]">
                      <td className="px-4 py-3">1</td>
                      <td className="px-4 py-3">{language === "en" ? "New Appointment" : "नई नियुक्ति"}</td>
                      <td className="px-4 py-3">Engineering</td>
                      <td className="px-4 py-3">2024-12-01</td>
                      <td className="px-4 py-3">
                        <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">{language === "en" ? "Verified" : "सत्यापित"}</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </Card>
        )}

        {/* Footer hint */}
        <div className="text-center text-sm text-gray-500 mt-6">{language === "en" ? "Need help? Contact HR." : "सहायता चाहिए? HR से संपर्क करें।"}</div>
      </div>
    </div>
  )
}
