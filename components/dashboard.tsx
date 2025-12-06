"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { FileText, User, Lock } from "lucide-react"
import { useState } from "react"
import IdCardForm from "@/components/id-card-form"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

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

  if (showIdCardForm) {
    return <IdCardForm onNavigate={onNavigate} language={language} onCancel={() => setShowIdCardForm(false)} />
  }

  return (
    <div className="min-h-[calc(100vh-200px)] py-8 px-4">
      
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-[#002B5C] mb-6">{language === "en" ? "Dashboard" : "डैशबोर्ड"}</h1>

          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {!hasApplied && (
              <Button
                onClick={() => setShowIdCardForm(true)}
                className="bg-[#2E7D32] hover:bg-green-700 text-white flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                {language === "en" ? "Apply for ID Card" : "पहचान पत्र के लिए आवेदन करें"}
              </Button>
            )}

            {hasApplied && (
              <Button variant="outline" className="text-[#002B5C] border-[#002B5C] bg-transparent">
                {language === "en" ? "Application Status" : "आवेदन स्थिति"}
              </Button>
            )}

            {/* ← Fixed: My Profile now navigates using onNavigate */}
            <Button
              variant="outline"
              className="text-[#002B5C] border-[#002B5C] flex items-center gap-2 bg-transparent"
              onClick={() => onNavigate?.("profile")}
            >
              <User className="w-4 h-4" />
              {language === "en" ? "My Profile" : "मेरी प्रोफाइल"}
            </Button>

            {/* Change Password: use handler if provided, fall back to navigation */}
            <Button
              variant="outline"
              className="text-[#002B5C] border-[#002B5C] flex items-center gap-2 bg-transparent"
              onClick={() => {
                if (typeof onChangePassword === "function") {
                  onChangePassword()
                } else {
                  onNavigate?.("change-password")
                }
              }}
            >
              <Lock className="w-4 h-4" />
              {language === "en" ? "Change Password" : "पासवर्ड बदलें"}
            </Button>

            <Button
              variant="outline"
              className="text-[#D32F2F] border-[#D32F2F] bg-transparent"
              onClick={() => onNavigate("landing")}
            >
              {language === "en" ? "Logout" : "लॉगआउट"}
            </Button>
          </div>
        </div>

        {hasApplied && (
          <Card className="border border-gray-200 overflow-x-auto mb-8">
            <div className="p-6">
              <h2 className="text-xl font-bold text-[#002B5C] mb-4">
                {language === "en" ? "Application Status" : "आवेदन स्थिति"}
              </h2>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-[#F6F7F8]">
                      <th className="px-4 py-3 text-left font-semibold text-[#0B1B2B]">Sr. No</th>
                      <th className="px-4 py-3 text-left font-semibold text-[#0B1B2B]">
                        {language === "en" ? "Type" : "प्रकार"}
                      </th>
                      <th className="px-4 py-3 text-left font-semibold text-[#0B1B2B]">
                        {language === "en" ? "Department" : "विभाग"}
                      </th>
                      <th className="px-4 py-3 text-left font-semibold text-[#0B1B2B]">
                        {language === "en" ? "Submitted" : "जमा किया गया"}
                      </th>
                      <th className="px-4 py-3 text-left font-semibold text-[#0B1B2B]">
                        {language === "en" ? "Status" : "स्थिति"}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b hover:bg-[#F6F7F8]">
                      <td className="px-4 py-3">1</td>
                      <td className="px-4 py-3">{language === "en" ? "New Appointment" : "नई नियुक्ति"}</td>
                      <td className="px-4 py-3">Engineering</td>
                      <td className="px-4 py-3">2024-12-01</td>
                      <td className="px-4 py-3">
                        <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                          {language === "en" ? "Verified" : "सत्यापित"}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </Card>
        )}

        <Card className="border border-gray-200">
          <Collapsible>
            <CollapsibleTrigger className="w-full p-6 text-left font-bold text-[#002B5C] hover:bg-gray-50">
              {language === "en" ? "View Instructions & Requirements" : "निर्देश और आवश्यकताएं देखें"}
            </CollapsibleTrigger>
            <CollapsibleContent className="p-6 bg-blue-50 space-y-3">
              <p className="text-sm text-gray-700">
                {language === "en"
                  ? "Please ensure all required documents are submitted before applying for an ID card. Incomplete applications may be rejected."
                  : "आईडी कार्ड के लिए आवेदन करने से पहले सभी आवश्यक दस्तावेज़ जमा करना सुनिश्चित करें। अधूरे आवेदन खारिज किए जा सकते हैं।"}
              </p>
            </CollapsibleContent>
          </Collapsible>
        </Card>
      </div>
    </div>
  )
}
