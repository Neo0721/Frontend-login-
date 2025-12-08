"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { FileText, Lock } from "lucide-react"
import IdCardForm from "@/components/id-card-form"

interface DashboardProps {
  onNavigate: (view: any, payload?: any) => void
  language: "en" | "hi"
  userName?: string
  empNo?: string
  onChangePassword?: () => void
}

type ApplicationDocument = {
  name: string
  url?: string // present if file is available on server
}

type Application = {
  id?: string | number
  // prefer formData style fields below to match your IdCardForm
  formData?: Record<string, any>
  name?: string
  employeeNo?: string
  department?: string
  dob?: string
  phone?: string
  documents?: (string | ApplicationDocument)[]
  status?: string
  submittedAt?: string
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

  // Modal state for viewing application
  const [isViewOpen, setIsViewOpen] = useState(false)
  const [loadingView, setLoadingView] = useState(false)
  const [application, setApplication] = useState<Application | null>(null)
  const [viewError, setViewError] = useState<string | null>(null)

  // show id card form as a full screen modal replacement
  if (showIdCardForm) {
    return (
      <IdCardForm
        onNavigate={onNavigate}
        language={language}
        onCancel={() => setShowIdCardForm(false)}
        onSubmitSuccess={() => {
          // mark applied so dashboard status updates
          setHasApplied(true)
          setShowIdCardForm(false)
        }}
      />
    )
  }

  /**
   * loadApplication
   *
   * Order of attempts:
   *  1) localStorage.lastSubmittedApplication (if present) — immediate and preferred
   *  2) fetch from server /api/idcard?employee=...
   *  3) localStorage.idcardDraft (so user sees the exact form fields they entered)
   *  4) example fallback
   */
  async function loadApplication(emp = empNo) {
    setLoadingView(true)
    setViewError(null)

    // 1) lastSubmittedApplication in localStorage (if present)
    try {
      const rawLast = localStorage.getItem("lastSubmittedApplication")
      if (rawLast) {
        const parsed = JSON.parse(rawLast)
        if (parsed) {
          setApplication(parsed)
          setViewError("Loaded your last submitted application (local).")
          setHasApplied(true)
          setLoadingView(false)
          return
        }
      }
    } catch (err) {
      console.warn("Failed to parse lastSubmittedApplication:", err)
    }

    // 2) Try live fetch
    try {
      const res = await fetch(`/api/idcard?employee=${encodeURIComponent(emp)}`)
      if (!res.ok) throw new Error(`Failed to fetch (${res.status})`)
      const data = await res.json()

      const appFromServer: Application = {
        id: data?.id ?? data?.applicationId ?? undefined,
        formData: data?.formData ?? undefined,
        name: data?.name ?? data?.formData?.employeeNameEn ?? undefined,
        employeeNo: data?.employeeNo ?? emp,
        department: data?.department ?? data?.formData?.department ?? undefined,
        dob: data?.dob ?? data?.formData?.dateOfAppointment ?? undefined,
        phone: data?.phone ?? data?.formData?.mobileNumber ?? undefined,
        documents: data?.documents ?? data?.uploadedFiles ?? undefined,
        status: data?.status ?? "Submitted",
        submittedAt: data?.submittedAt ?? data?.createdAt ?? undefined,
      }

      setApplication(appFromServer)
      if (appFromServer) setHasApplied(true)
      setViewError(null)
      setLoadingView(false)
      return
    } catch (err) {
      console.warn("Could not fetch application:", err)
    }

    // 3) Fallback to idcardDraft (local draft saved by the form's Save Draft)
    try {
      const raw = localStorage.getItem("idcardDraft")
      if (raw) {
        const draft = JSON.parse(raw)
        const fd = draft.formData ?? {}
        const uploaded = draft.uploadedFilesMeta ?? []

        const appFromDraft: Application = {
          id: draft.id ?? `draft-${Date.now()}`,
          formData: fd,
          name: fd.employeeNameEn ?? userName,
          employeeNo: emp,
          department: fd.department ?? undefined,
          dob: (draft.familyMembers && draft.familyMembers[0]?.age) ?? undefined,
          phone: fd.mobileNumber ?? undefined,
          documents: uploaded.map((u: any) => (u && typeof u === "object" ? { name: u.name } : String(u))),
          status: "Draft",
          submittedAt: draft.updatedAt ?? undefined,
        }

        setApplication(appFromDraft)
        setViewError("Showing your saved draft (local).")
        setHasApplied(true)
        setLoadingView(false)
        return
      }
    } catch (parseErr) {
      console.warn("Failed to parse idcardDraft from localStorage:", parseErr)
    }

    // 4) last resort: example data to keep UI functional
    setApplication({
      id: "example-1",
      status: "Submitted",
      name: userName,
      employeeNo: emp,
      department: "Engineering",
      dob: "1995-03-12",
      phone: "+91-9876543210",
      documents: ["Passport (uploaded)", "Address proof (uploaded)"],
      submittedAt: new Date().toISOString(),
    })
    setViewError("Could not fetch live data — showing example data.")
    setHasApplied(true)
    setLoadingView(false)
  }

  function openViewModal() {
    setIsViewOpen(true)
    void loadApplication()
  }

  function closeViewModal() {
    setIsViewOpen(false)
    setViewError(null)
  }

  // render a document row. If doc is {name, url} -> show link.
  // if doc is {name} with no url -> show name + "Open" button that tries to fetch /api/uploads/<filename>
  const renderDocumentItem = (doc: string | ApplicationDocument, idx: number) => {
    if (!doc) return null

    // simple string case
    if (typeof doc === "string") {
      return (
        <li key={idx} className="flex items-center gap-3">
          <span>{doc}</span>
          <span className="ml-2 text-xs text-slate-500">(no preview available)</span>
        </li>
      )
    }

    // object with url -> open directly
    if (doc.url) {
      return (
        <li key={idx} className="flex items-center gap-3">
          <a href={doc.url} target="_blank" rel="noopener noreferrer" className="underline">
            {doc.name}
          </a>
        </li>
      )
    }

    // object with name only -> attempt to fetch from server route when user clicks "Open"
    const tryOpenLocalFile = async (name: string) => {
      try {
        // attempt to fetch from your server's uploads endpoint (adjust path if your backend uses another route)
        const path = `/api/uploads/${encodeURIComponent(name)}`
        const res = await fetch(path)
        if (!res.ok) {
          alert(`Could not open file "${name}". Server responded ${res.status}.`)
          return
        }
        const blob = await res.blob()
        const blobUrl = URL.createObjectURL(blob)
        window.open(blobUrl, "_blank")
        // revoke later
        setTimeout(() => URL.revokeObjectURL(blobUrl), 60 * 1000)
      } catch (err) {
        console.warn("Failed to fetch local file preview:", err)
        alert(`Unable to open "${name}". The file might be stored only in the browser session or on a different endpoint.`)
      }
    }

    return (
      <li key={idx} className="flex items-center gap-3">
        <span>{doc.name}</span>
        <span className="ml-2 text-xs text-slate-500">(local draft file)</span>
        <button
          type="button"
          onClick={() => tryOpenLocalFile(doc.name)}
          className="ml-3 px-2 py-1 border rounded text-xs"
        >
          Open
        </button>
      </li>
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
                onClick={openViewModal}
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

      {/* View Application Modal */}
      {isViewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40"
            onClick={closeViewModal}
            aria-hidden="true"
          />

          <div className="relative bg-white rounded-2xl shadow-xl w-[92%] max-w-xl mx-auto p-6 z-10">
            <button
              className="absolute right-4 top-4 text-slate-500 hover:text-slate-800"
              onClick={closeViewModal}
              aria-label="Close"
            >
              ✕
            </button>

            <h4 className="text-lg font-semibold mb-2">{language === "en" ? "Application Details" : "आवेदन विवरण"}</h4>

            {loadingView ? (
              <div className="py-8 text-center">Loading…</div>
            ) : viewError && !application ? (
              <div className="py-6 text-center text-sm text-red-500">{viewError}</div>
            ) : application ? (
              <div className="space-y-3 text-sm text-slate-700">
                {viewError && (
                  <div className="text-xs text-amber-700">{viewError}</div>
                )}

                {/* Prefer showing formData fields when available (so the user sees what they entered) */}
                <div className="flex justify-between">
                  <span className="font-medium">Name</span>
                  <span>{application.formData?.employeeNameEn ?? application.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Employee No</span>
                  <span>{application.employeeNo ?? empNo}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Department</span>
                  <span>{application.formData?.department ?? application.department}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Date of Appointment</span>
                  <span>{application.formData?.dateOfAppointment ?? application.dob}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Mobile</span>
                  <span>{application.formData?.mobileNumber ?? application.phone}</span>
                </div>

                <div>
                  <div className="font-medium">Documents</div>
                  <ul className="list-disc ml-5 mt-1 text-slate-600">
                    {(application.documents && application.documents.length > 0) ? (
                      application.documents.map((d, i) => renderDocumentItem(d as any, i))
                    ) : (
                      <li className="text-slate-500">No documents available</li>
                    )}
                  </ul>
                </div>

                <div className="flex justify-between">
                  <span className="font-medium">Status</span>
                  <span className="text-sm font-semibold">{application.status}</span>
                </div>

                <div className="text-right">
                  <Button
                    onClick={() => {
                      closeViewModal()
                      // Pass application id when navigating to update screen
                      onNavigate?.("update-application", application?.id)
                    }}
                    className="px-4 py-2 mr-2"
                  >
                    {language === "en" ? "Edit" : "संपादित करें"}
                  </Button>

                  <Button onClick={closeViewModal} className="px-4 py-2 bg-blue-600 text-white">
                    {language === "en" ? "Close" : "बंद करें"}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="py-6 text-center text-sm text-slate-700">{language === "en" ? "No application found." : "कोई आवेदन नहीं मिला।"}</div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
