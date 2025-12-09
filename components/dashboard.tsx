"use client"

import React, { useState, useEffect } from "react"
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
  url?: string
}

type Application = {
  id?: string | number
  name?: string
  employeeNo?: string
  department?: string
  designation?: string
  designationHi?: string
  address?: string
  bloodGroup?: string
  emergencyContact?: string
  joiningDate?: string
  officeLocation?: string
  manager?: string
  employeeType?: string
  gender?: string
  maritalStatus?: string
  dob?: string
  phone?: string
  photoUrl?: string
  documents?: (string | ApplicationDocument)[]
  status?: string
  submittedAt?: string
  statusHistory?: { status: string; at?: string }[]
  formData?: Record<string, any> | null
}

export default function Dashboard({
  onNavigate,
  language: initialLanguage = "en",
  userName = "John Doe",
  empNo = "EMP001",
  onChangePassword,
}: DashboardProps) {
  // local language state — initialized from the prop if provided
  const [language, setLanguage] = useState<"en" | "hi">(initialLanguage)

  // === SYNC FIX: ensure local state follows prop changes ===
  // This keeps `language` up-to-date when the parent toggles language.
  useEffect(() => {
    setLanguage(initialLanguage)
  }, [initialLanguage])
  // =========================================================

  const [showIdCardForm, setShowIdCardForm] = useState(false)
  const [hasApplied, setHasApplied] = useState(false)

  // Modal state for viewing application — one set of state only
  const [isViewOpen, setIsViewOpen] = useState(false)
  const [loadingView, setLoadingView] = useState(false)
  const [application, setApplication] = useState<Application | null>(null)
  const [viewError, setViewError] = useState<string | null>(null)
  const [loadedFrom, setLoadedFrom] = useState<string | null>(null) // "draft:KEY" | "lastSubmitted" | "server:URL" | "example"

  // Prevent background scroll when modal is open
  useEffect(() => {
    if (isViewOpen) {
      const prev = document.body.style.overflow
      document.body.style.overflow = "hidden"
      return () => {
        document.body.style.overflow = prev
      }
    }
    return
  }, [isViewOpen])

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

  // helper: safe JSON parse from Response
  async function safeJson(res: Response) {
    try {
      return await res.json()
    } catch (err) {
      try {
        const txt = await res.text()
        console.warn("Response text (non-json):", txt)
        return { raw: txt }
      } catch {
        return null
      }
    }
  }

  // helper: normalize arbitrary object stored locally to Application shape
  function normalizeToApplication(obj: any, emp = empNo): Application {
    return {
      id: obj.id ?? obj.applicationId ?? undefined,
      formData: obj.formData ?? obj.payload ?? null,
      name:
        obj?.name ??
        obj?.formData?.employeeNameEn ??
        obj?.employeeName ??
        obj?.applicantName ??
        userName,
      employeeNo: obj?.employeeNo ?? obj?.empNo ?? emp,
      department: obj?.department ?? obj?.formData?.department,
      designation: obj?.designation ?? obj?.formData?.designationEn,
      dob: obj?.dob ?? obj?.formData?.dateOfBirth,
      phone: obj?.phone ?? obj?.formData?.mobileNumber,
      photoUrl: obj?.photoUrl ?? obj?.formData?.photoUrl,
      documents: obj?.documents ?? obj?.uploadedFiles ?? undefined,
      status: obj?.status ?? "Submitted",
      submittedAt: obj?.submittedAt ?? obj?.createdAt ?? undefined,
    }
  }

  /**
   * loadApplication
   *
   * Priority:
   *  1) idcardDraft (local draft you just saved in the form)
   *  2) other local draft keys (common variations)
   *  3) localStorage.lastSubmittedApplication
   *  4) fetch from server (several candidate endpoints)
   *  5) example fallback
   *
   * This version logs the source (console) and stores a small label visible in the modal.
   */
  async function loadApplication(emp = empNo) {
    setLoadingView(true)
    setViewError(null)
    setLoadedFrom(null)

    // 1) Try multiple draft keys in localStorage/sessionStorage (common variations)
    const draftKeysToTry = [
      "idcardDraft",
      "idCardDraft",
      "id_card_draft",
      "idcard_draft",
      "idcard-draft",
      "idCard_Draft",
      "idCardDraft_v1",
      "draftIdCard",
      "idcardDraftLocal",
    ]

    for (const k of draftKeysToTry) {
      try {
        // check both localStorage and sessionStorage
        const rawLocal = localStorage.getItem(k)
        const rawSession = sessionStorage.getItem(k)
        const raw = rawLocal ?? rawSession
        if (!raw) continue
        const parsed = JSON.parse(raw)
        if (parsed) {
          console.info(`[Dashboard] Loaded draft from key: ${k}`, parsed)
          const fd = parsed.formData ?? parsed
          const uploaded = parsed.uploadedFilesMeta ?? parsed.uploads ?? []
          const appFromDraft: Application = {
            id: parsed.id ?? `draft-${Date.now()}`,
            formData: fd,
            name: fd.employeeNameEn ?? fd.employeeName ?? userName,
            employeeNo: emp,
            department: fd.department ?? undefined,
            designation: fd.designation ?? undefined,
            dob: fd.dateOfBirth ?? fd.dateOfAppointment ?? undefined,
            phone: fd.mobileNumber ?? undefined,
            photoUrl: fd.photoUrl ?? undefined,
            documents: uploaded.map((u: any) =>
              u && typeof u === "object" ? { name: u.name, url: u.url } : String(u)
            ),
            status: "Draft",
            submittedAt: parsed.updatedAt ?? undefined,
          }

          setApplication(appFromDraft)
          setViewError("Showing your saved draft (local).")
          setHasApplied(true)
          setLoadingView(false)
          setLoadedFrom(`draft:${k}`)
          return
        }
      } catch (err) {
        console.warn(`[Dashboard] failed parsing draft key ${k}:`, err)
      }
    }

    // 2) fallback: lastSubmittedApplication (older key)
    try {
      const rawLast = localStorage.getItem("lastSubmittedApplication") ?? localStorage.getItem("lastSubmittedApp")
      if (rawLast) {
        const parsed = JSON.parse(rawLast)
        if (parsed) {
          console.info("[Dashboard] Loaded lastSubmittedApplication from localStorage", parsed)
          setApplication(normalizeToApplication(parsed, emp))
          setViewError("Loaded your last submitted application (local).")
          setHasApplied(true)
          setLoadingView(false)
          setLoadedFrom("lastSubmitted")
          return
        }
      }
    } catch (err) {
      console.warn("Failed to parse lastSubmittedApplication:", err)
    }

    // 3) Try a list of server endpoints (in order)
    const candidateUrls = [
      `/api/idcard?employee=${encodeURIComponent(emp)}`,
      `/api/applications/${encodeURIComponent(emp)}`,
      `/api/applications?employee=${encodeURIComponent(emp)}`,
      `/api/users/${encodeURIComponent(emp)}/idcard`,
    ]

    for (const url of candidateUrls) {
      try {
        const res = await fetch(url, { cache: "no-store" })
        if (!res.ok) {
          console.warn(`Attempt to fetch ${url} failed: ${res.status}`)
          continue
        }
        const data = await safeJson(res)
        if (!data) {
          console.warn(`No JSON returned from ${url}`)
          continue
        }

        console.info(`[Dashboard] Loaded application from server: ${url}`, data)

        const appFromServer: Application = {
          id: data?.id ?? data?.applicationId ?? data?.idCardId ?? undefined,
          formData: data?.formData ?? data?.payload ?? undefined,
          name:
            data?.name ??
            data?.formData?.employeeNameEn ??
            data?.employeeName ??
            data?.applicantName ??
            undefined,
          employeeNo: data?.employeeNo ?? data?.employeeId ?? data?.empNo ?? emp,
          department:
            data?.department ?? data?.formData?.department ?? data?.dept ?? undefined,
          designation:
            data?.designation ??
            data?.formData?.designationEn ??
            data?.jobTitle ??
            undefined,
          designationHi:
            data?.designationHi ?? data?.formData?.designationHi ?? undefined,
          address:
            data?.address ??
            data?.formData?.address ??
            data?.permanentAddress ??
            undefined,
          bloodGroup:
            data?.bloodGroup ?? data?.formData?.bloodGroup ?? undefined,
          emergencyContact:
            data?.emergencyContact ??
            data?.formData?.emergencyContact ??
            data?.emergencyNumber ??
            undefined,
          joiningDate:
            data?.joiningDate ??
            data?.formData?.joiningDate ??
            data?.dateOfJoining ??
            undefined,
          officeLocation:
            data?.officeLocation ?? data?.formData?.officeLocation ?? undefined,
          manager: data?.manager ?? data?.reportingManager ?? undefined,
          employeeType: data?.employeeType ?? data?.formData?.employeeType ?? undefined,
          gender:
            data?.gender ?? data?.formData?.gender ?? data?.sex ?? undefined,
          maritalStatus:
            data?.maritalStatus ?? data?.formData?.maritalStatus ?? undefined,
          dob:
            data?.dob ?? data?.formData?.dateOfBirth ?? data?.dateOfBirth ?? undefined,
          phone:
            data?.phone ?? data?.formData?.mobileNumber ?? data?.mobile ?? undefined,
          photoUrl:
            data?.photoUrl ??
            data?.formData?.photoUrl ??
            data?.avatar ??
            data?.photo ??
            undefined,
          documents:
            data?.documents ??
            data?.uploadedFiles ??
            data?.attachments ??
            data?.files ??
            undefined,
          status: data?.status ?? data?.applicationStatus ?? "Submitted",
          submittedAt:
            data?.submittedAt ?? data?.createdAt ?? data?.submittedOn ?? undefined,
          statusHistory: data?.statusHistory ?? undefined,
        }

        setApplication(appFromServer)
        setHasApplied(true)
        setViewError(null)
        setLoadingView(false)
        setLoadedFrom(`server:${url}`)
        return
      } catch (err) {
        console.warn("Could not fetch from candidate url:", err)
      }
    }

    // 4) last resort: example data
    setApplication({
      id: "example-1",
      status: "Submitted",
      name: userName,
      employeeNo: emp,
      department: "Engineering",
      designation: "Software Engineer",
      dob: "1995-03-12",
      phone: "+91-9876543210",
      documents: ["Passport (uploaded)", "Address proof (uploaded)"],
      photoUrl: undefined,
      submittedAt: new Date().toISOString(),
    })
    setViewError("Could not fetch live data — showing example data.")
    setHasApplied(true)
    setLoadingView(false)
    setLoadedFrom("example")
    console.warn("[Dashboard] Falling back to example data")
  }

  // open the modal only AFTER loading the data (so local draft is shown immediately)
  async function openViewModal() {
    // load first (will set loadingView while fetching/parsing)
    await loadApplication(empNo)
    // then open the modal UI so it displays the loaded "application" immediately
    setIsViewOpen(true)
  }

  // NEW: handle Update Application click
  // loads data (priority: draft -> lastSubmitted -> server) then navigates to update page,
  // passing the loaded application as payload so the edit form can prefill.
  async function handleUpdateClick() {
    setLoadingView(true)
    await loadApplication(empNo)
    setLoadingView(false)
    // pass the loaded application object to the update view for prefill
    // the update page should accept this payload and populate fields accordingly
    onNavigate?.("update-application", application)
  }

  function closeViewModal() {
    setIsViewOpen(false)
    setViewError(null)
    setLoadedFrom(null)
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
        const path = `/api/uploads/${encodeURIComponent(name)}`
        const res = await fetch(path)
        if (!res.ok) {
          alert(`Could not open file "${name}". Server responded ${res.status}.`)
          return
        }
        const blob = await res.blob()
        const blobUrl = URL.createObjectURL(blob)
        window.open(blobUrl, "_blank")
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

  // small helper to format date strings nicely
  function fmtDate(d?: string) {
    if (!d) return "—"
    try {
      const dt = new Date(d)
      if (isNaN(dt.getTime())) return d
      return dt.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })
    } catch {
      return d
    }
  }

  // -------------------------
  // RENDER
  // -------------------------
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
                type="button"
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
                type="button"
                variant="outline"
                onClick={() => {
                  // open preview modal (loads data first, then opens)
                  void openViewModal()
                }}
                className="w-full flex items-center justify-center gap-3 py-3 border-[#002B5C] text-[#002B5C]"
              >
                {language === "en" ? "Preview Application" : "आवेदन पूर्वावलोकन"}
              </Button>

              <Button
                type="button"
                onClick={() => {
                  // NEW: load application then navigate to update page (prefill)
                  void handleUpdateClick()
                }}
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
                type="button"
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
              type="button"
            >
              ✕
            </button>

            <h4 className="text-lg font-semibold mb-2">{language === "en" ? "Application Details" : "आवेदन विवरण"}</h4>

            {/* Visible small source badge */}
            {loadedFrom && (
              <div className="text-xs text-amber-700 mb-2">
                {loadedFrom.startsWith("draft:") ? "Showing saved draft (local)." :
                 loadedFrom === "lastSubmitted" ? "Loaded last submitted (local)." :
                 loadedFrom.startsWith("server:") ? "Loaded from server." :
                 loadedFrom === "example" ? "Could not fetch live data — showing example data." : loadedFrom}
              </div>
            )}

            {loadingView ? (
              <div className="py-8 text-center">Loading…</div>
            ) : viewError && !application ? (
              <div className="py-6 text-center text-sm text-red-500">{viewError}</div>
            ) : application ? (
              <div className="space-y-3 text-sm text-slate-700">
                {viewError && (
                  <div className="text-xs text-amber-700">{viewError}</div>
                )}

                {/* Photo + primary identifiers */}
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <span className="font-medium">Name</span>
                      <span>{application.formData?.employeeNameEn ?? application.name ?? "—"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Employee No</span>
                      <span>{application.employeeNo ?? empNo}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Department</span>
                      <span>{application.formData?.department ?? application.department ?? "—"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Designation</span>
                      <span>{application.designation ?? application.formData?.designation ?? "—"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Designation (Hindi)</span>
                      <span>{application.designationHi ?? application.formData?.designationHi ?? "—"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Date of Birth</span>
                      <span>{fmtDate(application.dob ?? application.formData?.dateOfBirth)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Mobile</span>
                      <span>{application.formData?.mobileNumber ?? application.phone ?? "—"}</span>
                    </div>
                  </div>

                  <div className="w-28 h-28 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                    {application.photoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={application.photoUrl} alt="photo" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-slate-500">No photo</div>
                    )}
                  </div>
                </div>

                {/* More personal & employment details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div className="flex justify-between">
                    <span className="font-medium">Joining Date</span>
                    <span>{fmtDate(application.joiningDate ?? application.formData?.joiningDate)}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="font-medium">Office Location</span>
                    <span>{application.officeLocation ?? application.formData?.officeLocation ?? "—"}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="font-medium">Manager</span>
                    <span>{application.manager ?? application.formData?.manager ?? "—"}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="font-medium">Employee Type</span>
                    <span>{application.employeeType ?? application.formData?.employeeType ?? "—"}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="font-medium">Gender</span>
                    <span>{application.gender ?? application.formData?.gender ?? "—"}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="font-medium">Marital Status</span>
                    <span>{application.maritalStatus ?? application.formData?.maritalStatus ?? "—"}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="font-medium">Address</span>
                    <span className="text-right max-w-[55%]">{application.address ?? application.formData?.address ?? "—"}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="font-medium">Blood Group</span>
                    <span>{application.bloodGroup ?? application.formData?.bloodGroup ?? "—"}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="font-medium">Emergency Contact</span>
                    <span>{application.emergencyContact ?? application.formData?.emergencyContact ?? "—"}</span>
                  </div>
                </div>

                {/* Documents */}
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

                {/* Status & history */}
                <div>
                  <div className="flex justify-between">
                    <span className="font-medium">Status</span>
                    <span className="text-sm font-semibold">{application.status ?? "—"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Submitted</span>
                    <span>{fmtDate(application.submittedAt)}</span>
                  </div>

                  {application.statusHistory && application.statusHistory.length > 0 && (
                    <div className="mt-2">
                      <div className="text-xs text-slate-500 font-medium mb-1">Status history</div>
                      <ul className="text-xs text-slate-600 ml-4 list-disc">
                        {application.statusHistory.map((s, idx) => (
                          <li key={idx}>
                            {s.status} {s.at ? `— ${fmtDate(s.at)}` : ""}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Actions: EDIT REMOVED */}
                <div className="text-right">
                  <Button type="button" onClick={closeViewModal} className="px-4 py-2 bg-blue-600 text-white">
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
