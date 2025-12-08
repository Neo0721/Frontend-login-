"use client"

import React, { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { ChevronDown, ChevronUp, X, Upload, AlertCircle, Plus } from "lucide-react"
import { Input } from "@/components/ui/input"

interface IdCardFormProps {
  onNavigate?: (view?: any) => void
  language: "en" | "hi"
  onCancel?: () => void
  onSubmitSuccess?: () => void
  initialData?: any
  mode?: "edit" | "create"
}

type FamilyMember = {
  id: string
  name: string
  relation: string
  age: string // now a date string (YYYY-MM-DD)
  gender: string
  aadhaar: string
  uniqueIdentificationMark: string
  doc: File | { name: string } | null
}

type UploadedFileMeta = {
  name: string
  size: number
  type: string
}

export default function IdCardForm({
  onNavigate,
  language,
  onCancel,
  onSubmitSuccess,
  initialData = null,
  mode = "create",
}: IdCardFormProps) {
  const router = useRouter()
  const txt = (en: string, hi?: string) => (language === "en" ? en : hi ?? en)

  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    A: true,
    B: false,
    C: false,
    D: false,
    E: false,
    F: false,
  })

  const toggle = (id: string) => setExpanded((s) => ({ ...s, [id]: !s[id] }))

  const documentCategories = [
    {
      id: "A",
      title: txt("A. New Appointment / Transfer"),
      docs: [txt("Memorandum / Transfer Letter Copy"), txt("Charge Report Copy"), txt("Current Address Proof Copy")],
    },
    { id: "B", title: txt("B. Promotion"), docs: [txt("Promotion Order Copy")] },
    { id: "C", title: txt("C. Lost Identity Card"), docs: [txt("Police FIR/NRIC")] },
    { id: "D", title: txt("D. Damage Card"), docs: [txt("Damaged Card + Report")] },
    { id: "E", title: txt("E. Inclusion of Dependents / Family Members"), docs: [txt("Marriage / Birth Certificate")] },
    { id: "F", title: txt("F. Correction"), docs: [txt("Supporting Documents for Correction")] },
  ]

  // state
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [uploadedFilesMeta, setUploadedFilesMeta] = useState<UploadedFileMeta[]>([])
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([
    {
      id: `${Date.now()}-0`,
      name: "",
      relation: "Spouse",
      age: "",
      gender: "Male",
      aadhaar: "",
      uniqueIdentificationMark: "",
      doc: null,
    },
  ])
  const [forwardingOfficer, setForwardingOfficer] = useState("")
  const [formData, setFormData] = useState({
    purpose: "",
    department: "",
    unit: "",
    employeeNameEn: "",
    employeeNameHi: "",
    designationEn: "",
    designationHi: "",
    dateOfAppointment: "",
    nearestRH: "",
    placeOfWork: "",
    payLevel: "",
    residentialAddress: "",
    uniqueIdentificationMark: "",
    email: "",
    mobileNumber: "",
    pinCode: "",
    district: "",
    state: "",
    idCardNo: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  // NEW: Success message state
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)

  // debug UI
  const [debugAttempts, setDebugAttempts] = useState<string[]>([])
  const pushDebug = (msg: string) => {
    try {
      // eslint-disable-next-line no-console
      console.log("[IdCardForm]", msg)
    } catch {}
    setDebugAttempts((p) => [...p, msg])
  }

  // ref to submit button so we can inspect coordinates
  const submitBtnRef = useRef<HTMLButtonElement | null>(null)

  // ---------- robust back handler ----------
  const probeCandidatesAndNavigate = async (candidates: string[]) => {
    if (typeof window === "undefined") return false
    for (const p of candidates) {
      try {
        const url = new URL(p, window.location.origin).toString()
        // try HEAD first
        try {
          const res = await fetch(url, { method: "HEAD" })
          if (res.ok) {
            pushDebug(`probe: HEAD OK -> ${p}`)
            await router.replace(url)
            return true
          }
          pushDebug(`probe: HEAD not ok (${res.status}) -> ${p}`)
        } catch (headErr) {
          // HEAD not allowed — try GET
          try {
            const resGet = await fetch(url, { method: "GET" })
            if (resGet.ok) {
              pushDebug(`probe: GET OK -> ${p}`)
              await router.replace(url)
              return true
            }
            pushDebug(`probe: GET not ok (${resGet.status}) -> ${p}`)
          } catch (getErr) {
            pushDebug(`probe: fetch GET error -> ${p} (${String(getErr)})`)
          }
        }
      } catch (err) {
        pushDebug(`probe: invalid url -> ${p} (${String(err)})`)
      }
    }
    return false
  }

  const handleBack = async () => {
    setDebugAttempts([])
    pushDebug("Back clicked")

    // 1) prefer parent onCancel
    if (typeof onCancel === "function") {
      try {
        pushDebug("Attempting onCancel()")
        onCancel()
        pushDebug("onCancel() invoked")
        return
      } catch (err: any) {
        pushDebug(`onCancel threw: ${String(err)}`)
      }
    }

    // 2) prefer parent's onNavigate
    if (typeof onNavigate === "function") {
      try {
        pushDebug('Attempting onNavigate("dashboard")')
        onNavigate("dashboard")
        pushDebug('onNavigate("dashboard") invoked')
        return
      } catch (err: any) {
        pushDebug(`onNavigate threw: ${String(err)}`)
      }
    }

    // 3) try same-origin referrer
    try {
      if (typeof document !== "undefined" && document.referrer) {
        try {
          const ref = new URL(document.referrer)
          const origin = typeof window !== "undefined" ? window.location.origin : null
          if (origin && ref.origin === origin) {
            pushDebug(`Navigating to document.referrer: ${document.referrer}`)
            window.location.href = document.referrer
            return
          } else {
            pushDebug(`Referrer present but cross-origin or unknown: ${document.referrer}`)
          }
        } catch (parseErr) {
          pushDebug(`Failed parsing referrer: ${String(parseErr)}`)
        }
      } else {
        pushDebug("No document.referrer available")
      }
    } catch (err: any) {
      pushDebug(`Referrer check error: ${String(err)}`)
    }

    // 4) try native history.back()
    try {
      if (typeof window !== "undefined" && window.history && window.history.length > 1) {
        pushDebug("Calling window.history.back()")
        window.history.back()
        // wait briefly to let history act
        await new Promise((res) => setTimeout(res, 600))
        pushDebug("history.back() attempted")
      } else {
        pushDebug("history.length <= 1 or history missing; skipping history.back()")
      }
    } catch (err: any) {
      pushDebug(`history.back() threw: ${String(err)}`)
    }

    // 5) probe likely dashboard routes
    const candidates = [
      "/dashboard",
      "/home",
      "/app/dashboard",
      "/(private)/dashboard",
      "/user/dashboard",
      "/portal/dashboard",
      "/",
    ]
    const found = await probeCandidatesAndNavigate(candidates)
    if (found) return

    // 6) final hard redirect to root
    try {
      pushDebug("Final fallback -> routing to /")
      await router.replace("/")
    } catch (err: any) {
      pushDebug(`router.replace("/") threw: ${String(err)}; doing hard window.location.href = "/"`)
      try {
        if (typeof window !== "undefined") window.location.href = "/"
      } catch (finalErr: any) {
        pushDebug(`Final hard redirect failed: ${String(finalErr)}`)
      }
    }
    pushDebug("Back handling complete")
  }
  // ----------------------------------------

  // ---------- hydration for initialData / draft ----------
  useEffect(() => {
    const loadFromSource = (d: any) => {
      if (!d) return
      if (d.formData) setFormData((s) => ({ ...s, ...(d.formData ?? {}) }))
      if (Array.isArray(d.familyMembers) && d.familyMembers.length > 0) {
        const members: FamilyMember[] = d.familyMembers.map((m: any, idx: number) => ({
          id: m.id ?? `${Date.now()}-${idx}`,
          name: m.name ?? "",
          relation: m.relation ?? "Spouse",
          // Accept either date string or older 'age' strings; normalize to YYYY-MM-DD if possible
          age: m.age ?? "",
          gender: m.gender ?? "Male",
          aadhaar: m.aadhaar ?? "",
          uniqueIdentificationMark: m.uniqueIdentificationMark ?? "",
          doc: m.doc ? { name: m.doc.name ?? String(m.doc) } : null,
        }))
        setFamilyMembers(members)
      }
      if (Array.isArray(d.uploadedFilesMeta)) setUploadedFilesMeta(d.uploadedFilesMeta)
      if (d.forwardingOfficer) setForwardingOfficer(d.forwardingOfficer)
    }

    if (initialData) {
      loadFromSource(initialData)
      return
    }

    try {
      const raw = localStorage.getItem("idcardDraft")
      if (!raw) return
      const draft = JSON.parse(raw)
      if (draft) loadFromSource(draft)
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Error loading draft from localStorage:", err)
    }
  }, [initialData])
  // ---------------------------------------------------------------------

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files
    if (!files) return
    const maxSize = 5 * 1024 * 1024
    const valid: File[] = []
    const meta: UploadedFileMeta[] = []
    for (let i = 0; i < files.length; i++) {
      const f = files[i]
      if (f.size <= maxSize) {
        valid.push(f)
        meta.push({ name: f.name, size: f.size, type: f.type })
      }
    }
    setUploadedFiles((p) => [...p, ...valid])
    setUploadedFilesMeta((p) => [...p, ...meta])
    if (e.currentTarget) e.currentTarget.value = ""
  }

  const removeFile = (index: number) => {
    setUploadedFiles((p) => p.filter((_, i) => i !== index))
    setUploadedFilesMeta((p) => p.filter((_, i) => i !== index))
  }

  const addFamilyMember = () =>
    setFamilyMembers((p) => [
      ...p,
      {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        name: "",
        relation: "Spouse",
        age: "",
        gender: "Male",
        aadhaar: "",
        uniqueIdentificationMark: "",
        doc: null,
      },
    ])

  const removeFamilyMember = (id: string) =>
    setFamilyMembers((p) => {
      if (p.length === 1) {
        alert(txt("You must have at least one family member."))
        return p
      }
      const index = p.findIndex((m) => m.id === id)
      if (index === 0) {
        alert(txt("Primary family member cannot be removed."))
        return p
      }
      return p.filter((m) => m.id !== id)
    })

  const updateFamilyMember = (id: string, field: keyof FamilyMember, value: any) =>
    setFamilyMembers((p) => p.map((m) => (m.id === id ? { ...m, [field]: value } : m)))

  // ---------- Validation ----------
  const validate = () => {
    const e: Record<string, string> = {}
    if (!formData.purpose) e.purpose = txt("Purpose is required.")
    if (!formData.department) e.department = txt("Department is required.")
    if (!formData.unit?.trim()) e.unit = txt("Unit is required.")
    if (!formData.employeeNameEn?.trim()) e.employeeNameEn = txt("Employee name is required.")
    if (!formData.designationEn?.trim()) e.designationEn = txt("Designation is required.")
    if (!formData.dateOfAppointment) e.dateOfAppointment = txt("Date of appointment is required.")
    if (!formData.residentialAddress?.trim()) e.residentialAddress = txt("Residential address is required.")

    // Email validation (keeps your existing rule)
    if (!formData.email) {
      e.email = txt("Email is required.")
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      e.email = txt("Enter a valid email.")
    }

    // Mobile: must be exactly 10 digits
    if (!formData.mobileNumber) {
      e.mobileNumber = txt("Mobile number is required.")
    } else if (!/^\d{10}$/.test(formData.mobileNumber)) {
      e.mobileNumber = txt("Enter a valid 10-digit mobile number.")
    }

    // Pin code: must be exactly 6 digits
    if (!formData.pinCode?.trim()) {
      e.pinCode = txt("Pin code is required.")
    } else if (!/^\d{6}$/.test(formData.pinCode.trim())) {
      e.pinCode = txt("Enter a valid 6-digit pin code.")
    }

    if (!forwardingOfficer) e.forwardingOfficer = txt("Select a forwarding officer.")
    if (!formData.district?.trim()) e.district = txt("District is required.")
    if (!formData.state?.trim()) e.state = txt("State is required.")
    if (!familyMembers || familyMembers.length === 0) {
      e.family = txt("Add at least one family member.")
    } else {
      const primary = familyMembers[0]
      if (!primary.name?.trim()) e["family.0.name"] = txt("Primary member name is required.")
      if (!primary.age?.trim()) {
        e["family.0.age"] = txt("Primary member DOB is required.")
      } else {
        // check valid date (YYYY-MM-DD) and not in the future
        const dt = new Date(primary.age)
        if (isNaN(dt.getTime())) {
          e["family.0.age"] = txt("Enter a valid date for primary member DOB.")
        } else {
          const today = new Date()
          // normalize times to compare only dates
          const dtNoTime = new Date(dt.getFullYear(), dt.getMonth(), dt.getDate())
          const todayNoTime = new Date(today.getFullYear(), today.getMonth(), today.getDate())
          if (dtNoTime > todayNoTime) {
            e["family.0.age"] = txt("DOB cannot be in the future.")
          }
        }
      }
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  // Helper: if something is blocking the button, flash a red outline around that element (and log it)
  const inspectBlockingElement = (btn: HTMLButtonElement) => {
    try {
      const rect = btn.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      // element at the center of the button
      const el = document.elementFromPoint(centerX, centerY) as HTMLElement | null
      console.log("[IdCardForm] elementFromPoint at button center:", el)
      if (!el) {
        console.log("[IdCardForm] No element found at button center.")
        return
      }
      // if the found element is button itself or a child, nothing blocking
      if (btn.contains(el) || el === btn) {
        console.log("[IdCardForm] Click target is the button itself.")
        return
      }
      // otherwise highlight the blocking element temporarily
      const prevOutline = el.style.outline
      const prevBoxShadow = el.style.boxShadow
      el.style.outline = "3px solid rgba(255,0,0,0.85)"
      el.style.boxShadow = "0 6px 18px rgba(255,0,0,0.15)"
      console.warn("[IdCardForm] Detected possible blocking element:", el, " — flashing red outline for 2s")
      alert("Detected possible blocking element — it will be flashed in red for 2s. Check console for element details.")
      setTimeout(() => {
        try {
          el.style.outline = prevOutline
          el.style.boxShadow = prevBoxShadow
        } catch {}
      }, 2000)
    } catch (err) {
      console.warn("[IdCardForm] inspectBlockingElement failed:", err)
    }
  }

  // New: global click inspector (temporary) — logs element at click and points out overlays.
  const handleGlobalInspect = (ev?: MouseEvent) => {
    try {
      const x = ev ? ev.clientX : window.innerWidth / 2
      const y = ev ? ev.clientY : window.innerHeight / 2
      const el = document.elementFromPoint(x, y) as HTMLElement | null
      console.log("[IdCardForm] inspect at", x, y, el)
      if (el) {
        alert(`Element at point: ${el.tagName}${el.id ? `#${el.id}` : ""}${el.className ? `.${String(el.className).split(" ").join(".")}` : ""}`)
      } else {
        alert("No element found at that point.")
      }
    } catch (err) {
      console.warn("handleGlobalInspect failed", err)
    }
  }

  // NOTE: show non-blocking banner immediately, then navigate after a short pause
  const submitFinal = async () => {
    try {
      localStorage.removeItem("idcardDraft")
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn("Failed to remove draft from localStorage", err)
    }

    // Show the non-blocking banner immediately so user definitely sees it
    try {
      setShowSuccessMessage(true)
      // keep it visible long enough to read
      await new Promise((res) => setTimeout(res, 1600))
      setShowSuccessMessage(false)
    } catch (err) {
      // ignore setState errors
    }

    // Notify parent (Dashboard) that submission succeeded so it can update status UI
    try {
      onSubmitSuccess?.()
    } catch (cbErr) {
      // ignore callback errors but log
      // eslint-disable-next-line no-console
      console.warn("onSubmitSuccess threw:", cbErr)
    }

    // try to navigate back to dashboard via parent's navigation prop; fallback to router
    try {
      if (typeof onNavigate === "function") {
        onNavigate("dashboard")
        return
      }
    } catch (navErr) {
      // eslint-disable-next-line no-console
      console.warn("onNavigate threw:", navErr)
    }

    // final fallback navigation
    try {
      router.replace("/dashboard")
    } catch (finalErr) {
      // eslint-disable-next-line no-console
      console.warn("router.replace('/dashboard') threw:", finalErr)
    }
  }

  const handleSubmit = (e?: React.SyntheticEvent) => {
    // defensive logging so we can see clicks in console
    // eslint-disable-next-line no-console
    console.log("handleSubmit invoked", { eventType: e?.type ?? "no-event" })

    if (e && typeof (e as any).preventDefault === "function") (e as any).preventDefault()
    if (e && typeof (e as any).stopPropagation === "function") (e as any).stopPropagation()

    // try to detect blocking element for debugging
    try {
      if (submitBtnRef.current) inspectBlockingElement(submitBtnRef.current)
    } catch (err) {
      console.warn("inspectBlockingElement threw:", err)
    }

    if (!validate()) {
  // eslint-disable-next-line no-console
  console.log("Validation failed", errors)

  try {
    const firstKey = Object.keys(errors)[0]
    if (firstKey) {
      console.warn("[IdCardForm] First validation error:", firstKey, errors[firstKey])

      // Try to find an element with id equal to the error key
      const el = document.getElementById(firstKey) as HTMLElement | null

      // Fallback: find any input/textarea/select that has data-field attribute
      const el2 =
        el ||
        document.querySelector(
          `[data-field="${firstKey}"], input[name="${firstKey}"], textarea[name="${firstKey}"], select[name="${firstKey}"]`
        ) as HTMLElement | null

      if (el2) {
        try {
          el2.scrollIntoView({ behavior: "smooth", block: "center" })
          // try to focus an input inside (if not focusable directly)
          const focusable = (el2 as HTMLElement).querySelector ? (el2 as HTMLElement).querySelector("input, textarea, select, button") : null
          ;(focusable as HTMLElement | null)?.focus?.()
          ;(el2 as HTMLElement).focus?.()
        } catch {}
      }
    }
  } catch (err) {
    console.warn("handleSubmit scrolling to error failed", err)
  }

  return
}

    void submitFinal()
  }
  // ---------- end validation ----------

  const genId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`

  const buildPersistableFamily = (members: FamilyMember[]) =>
    members.map((m) => ({
      id: m.id,
      name: m.name,
      relation: m.relation,
      age: m.age,
      gender: m.gender,
      aadhaar: m.aadhaar,
      uniqueIdentificationMark: m.uniqueIdentificationMark,
      doc: m.doc ? (m.doc instanceof File ? { name: m.doc.name } : { name: (m.doc as any).name ?? String(m.doc) }) : null,
    }))

  const saveDraft = (): string | null => {
    try {
      const existingRaw = localStorage.getItem("idcardDraft")
      let existingId: string | null = null
      if (mode === "edit" && initialData && initialData.id) existingId = initialData.id
      else if (existingRaw) {
        try {
          const parsed = JSON.parse(existingRaw)
          if (parsed && parsed.id) existingId = parsed.id
        } catch {}
      }
      const id = existingId ?? genId()
      const draft = {
        id,
        formData,
        familyMembers: buildPersistableFamily(familyMembers),
        uploadedFilesMeta,
        forwardingOfficer,
        updatedAt: new Date().toISOString(),
      }
      localStorage.setItem("idcardDraft", JSON.stringify(draft))
      alert(txt("Draft saved"))
      return id
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Failed saving draft", err)
      alert(txt("Failed to save draft"))
      return null
    }
  }

  // inline styles (kept same as original)
  const styles = {
    inputWrap: { borderRadius: 10, padding: 14, background: "transparent" } as React.CSSProperties,
    label: { display: "block", marginBottom: 8, color: "var(--text-dark)", fontWeight: 500 } as React.CSSProperties,
    sectionHeading: { color: "#103e63", fontWeight: 700, fontSize: 20 } as React.CSSProperties,
    dashedBox: {
      border: "3px dashed #2e7d32",
      borderRadius: 12,
      padding: "36px 20px",
      background: "rgba(46,125,50,0.03)",
      textAlign: "center",
    } as React.CSSProperties,
    errorText: { color: "#d32f2f", marginTop: 6, fontSize: 13 },
    debugBox: {
      position: "fixed",
      right: 16,
      bottom: 16,
      width: 360,
      maxHeight: 280,
      overflow: "auto",
      background: "rgba(0,0,0,0.8)",
      color: "white",
      padding: 12,
      borderRadius: 8,
      fontSize: 12,
      zIndex: 9999,
    } as React.CSSProperties,
    smallDebugToolbar: {
      position: "fixed",
      left: 12,
      bottom: 12,
      zIndex: 99999,
      display: "flex",
      gap: 8,
      alignItems: "center",
    } as React.CSSProperties,
    debugBtn: {
      background: "#111827",
      color: "white",
      borderRadius: 8,
      padding: "6px 10px",
      fontSize: 12,
      cursor: "pointer",
      border: "none",
    } as React.CSSProperties,
  }

  // helper to render label plus red star inline when required
  const RenderLabel = ({ text, required = false }: { text: string; required?: boolean }) => (
    <label style={{ ...styles.label, display: "flex", alignItems: "center", gap: 6 }}>
      <span>{text}</span>
      {required && (
        <span style={{ color: "#d32f2f", fontWeight: 700 }}>
          *
        </span>
      )}
    </label>
  )

  return (
    <main className="min-h-screen py-8" style={{ background: "var(--page-bg, #fafafa)" }}>
      <div className="max-w-6xl mx-auto px-6">
        <button
          type="button"
          onClick={handleBack}
          className="text-green-700 font-semibold inline-flex items-center mb-6"
          style={{ background: "transparent", border: "none", padding: 0, cursor: "pointer" }}
        >
          ← {txt("Back")}
        </button>

        <div className="card-elevated rounded-2xl p-8" style={{ background: "white" }}>
          <h1 className="heading-lg mb-6" style={{ fontSize: 28, fontWeight: 700, color: "#0b3355" }}>
            {txt("Apply for Identity Card")}
          </h1>

          {/* SUCCESS MESSAGE (fixed, high z-index so always visible) */}
          {showSuccessMessage && (
            <div
              className="text-center text-green-700 font-semibold bg-green-100 py-3 rounded-md mb-6"
              style={{
                position: "fixed",
                top: 20,
                left: "50%",
                transform: "translateX(-50%)",
                zIndex: 99999,
                minWidth: 320,
                boxShadow: "0 6px 18px rgba(0,0,0,0.12)",
              }}
            >
              {language === "en" ? "Application submitted successfully!" : "आवेदन सफलतापूर्वक जमा किया गया!"}
            </div>
          )}

          {/* SECTION A */}
          <h3 style={{ ...styles.sectionHeading, marginTop: 6 }}>SECTION A – DOCUMENT REQUIREMENTS</h3>

          <div className="mt-4 space-y-4">
            {documentCategories.map((cat) => (
              <div key={cat.id} className="rounded-lg overflow-hidden border" style={{ borderColor: "#e6e6e6" }}>
                <button
                  type="button"
                  onClick={() => toggle(cat.id)}
                  className="w-full px-6 py-4 flex items-center justify-between"
                  style={{
                    background: expanded[cat.id] ? "#f6f6f6" : "white",
                    fontWeight: 700,
                    fontSize: 16,
                    color: "#142437",
                  }}
                >
                  <span>{cat.title}</span>
                  <span>{expanded[cat.id] ? <ChevronUp /> : <ChevronDown />}</span>
                </button>

                {expanded[cat.id] && (
                  <div style={{ background: "#f6f6f6", padding: "18px 24px" }}>
                    <ul className="space-y-3">
                      {cat.docs.map((d, i) => (
                        <li key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start", color: "#123" }}>
                          <span style={{ color: "#2e7d32", fontWeight: 700, marginTop: 2 }}>✓</span>
                          <span>{d}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 rounded-lg" style={{ background: "rgba(211,47,47,0.06)", borderLeft: "4px solid #d32f2f" }}>
            <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
              <AlertCircle style={{ color: "#d32f2f" }} />
              <div>
                <div style={{ fontWeight: 700, color: "#d32f2f" }}>{txt("Important Note")}</div>
                <div style={{ color: "#333" }}>
                  {txt("In Case of Lost / Damage of Identity Card, Original Money Receipt be submitted to this Office.")}
                </div>
              </div>
            </div>
          </div>

          {/* SECTION B */}
          <hr className="my-6" style={{ borderColor: "#eee" }} />
          <h3 style={{ ...styles.sectionHeading }}>{txt("SECTION B – APPLICATION FORM")}</h3>

          {/* IMPORTANT: wire form submit to handleSubmit for reliable click/focus handling */}
          <form onSubmit={handleSubmit} className="mt-6 space-y-6" style={{ position: "relative" }}>
            {/* form fields unchanged */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <RenderLabel text={txt("Purpose of Making ID Card")} required />
                <select
                  className="rounded-xl px-4 py-3 w-full"
                  style={{ border: "1px solid #e6e6e6", background: "white", appearance: "none" }}
                  value={formData.purpose}
                  onChange={(e) => setFormData((s) => ({ ...s, purpose: e.target.value }))}
                  required
                >
                  <option value="">{txt("Select Purpose")}</option>
                  <option value="new">New Card</option>
                  <option value="promotion">Promotion</option>
                  <option value="lost">Replacement - Lost</option>
                </select>
                {errors.purpose && <div style={styles.errorText}>{errors.purpose}</div>}
              </div>

              <div>
                <RenderLabel text={txt("Department")} required />
                <select
                  className="rounded-xl px-4 py-3 w-full"
                  style={{ border: "1px solid #e6e6e6", background: "white", appearance: "none" }}
                  value={formData.department}
                  onChange={(e) => setFormData((s) => ({ ...s, department: e.target.value }))}
                  required
                >
                  <option value="">{txt("Select")}</option>
                  <option value="engineering">Engineering</option>
                  <option value="operations">Operations</option>
                </select>
                {errors.department && <div style={styles.errorText}>{errors.department}</div>}
              </div>

              <div>
                <RenderLabel text={txt("Unit")} required />
                <Input className="rounded-xl" value={formData.unit} onChange={(e: any) => setFormData((s) => ({ ...s, unit: e.target.value }))} required />
                {errors.unit && <div style={styles.errorText}>{errors.unit}</div>}
              </div>

              <div>
                <RenderLabel text={txt("Employee Name (English)")} required />
                <Input className="rounded-xl" value={formData.employeeNameEn} onChange={(e: any) => setFormData((s) => ({ ...s, employeeNameEn: e.target.value }))} required />
                {errors.employeeNameEn && <div style={styles.errorText}>{errors.employeeNameEn}</div>}
              </div>

              {language === "hi" && (
                <div>
                  <RenderLabel text={txt("Employee Name (Hindi)")} />
                  <Input className="rounded-xl" value={formData.employeeNameHi} onChange={(e: any) => setFormData((s) => ({ ...s, employeeNameHi: e.target.value }))} />
                </div>
              )}

              <div>
                <RenderLabel text={txt("Designation (English)")} required />
                <Input className="rounded-xl" value={formData.designationEn} onChange={(e: any) => setFormData((s) => ({ ...s, designationEn: e.target.value }))} required />
                {errors.designationEn && <div style={styles.errorText}>{errors.designationEn}</div>}
              </div>

              <div>
                <RenderLabel text={txt("Date of Appointment")} required />
                <Input type="date" className="rounded-xl" value={formData.dateOfAppointment} onChange={(e: any) => setFormData((s) => ({ ...s, dateOfAppointment: e.target.value }))} required />
                {errors.dateOfAppointment && <div style={styles.errorText}>{errors.dateOfAppointment}</div>}
              </div>

              <div>
                <RenderLabel text={txt("Nearest RH/HU")} required />
                <Input className="rounded-xl" value={formData.nearestRH} onChange={(e: any) => setFormData((s) => ({ ...s, nearestRH: e.target.value }))} required />
              </div>

              <div>
                <RenderLabel text={txt("Place of Work")} required />
                <Input className="rounded-xl" value={formData.placeOfWork} onChange={(e: any) => setFormData((s) => ({ ...s, placeOfWork: e.target.value }))} required />
              </div>

              <div>
                <RenderLabel text={txt("Pay Level")} required />
                <Input className="rounded-xl" value={formData.payLevel} onChange={(e: any) => setFormData((s) => ({ ...s, payLevel: e.target.value }))} required />
              </div>

              <div>
                <RenderLabel text={txt("Email")} required />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  className="rounded-xl"
                  value={formData.email}
                  onChange={(e: any) => setFormData((s) => ({ ...s, email: e.target.value }))}
                  required
                />
                {errors.email && <div style={styles.errorText}>{errors.email}</div>}
              </div>

              <div>
                <RenderLabel text={txt("Mobile Number")} required />
                <Input
                  id="mobileNumber"
                  name="mobileNumber"
                  type="tel"
                  className="rounded-xl"
                  value={formData.mobileNumber}
                  onChange={(e: any) =>
                    setFormData((s) => ({
                      ...s,
                      mobileNumber: String(e.target.value).replace(/\D/g, "").slice(0, 10),
                    }))
                  }
                  placeholder="Enter 10-digit mobile"
                  maxLength={10}
                  required
                />
                {errors.mobileNumber && <div style={styles.errorText}>{errors.mobileNumber}</div>}

              </div>

              <div>
                <RenderLabel text={txt("Pin Code")} required />
                <Input
                  id="pinCode"
                  name="pinCode"
                  className="rounded-xl"
                  value={formData.pinCode}
                  onChange={(e: any) => setFormData((s) => ({ ...s, pinCode: String(e.target.value).replace(/\D/g, "").slice(0, 6) }))}
                  placeholder="6-digit pin code"
                  maxLength={6}
                  required
                />
                {errors.pinCode && <div style={styles.errorText}>{errors.pinCode}</div>}

              </div>

              <div>
                <RenderLabel text={txt("District")} required />
                <Input className="rounded-xl" value={formData.district} onChange={(e: any) => setFormData((s) => ({ ...s, district: e.target.value }))} required />
              </div>

              <div>
                <RenderLabel text={txt("State")} required />
                <Input className="rounded-xl" value={formData.state} onChange={(e: any) => setFormData((s) => ({ ...s, state: e.target.value }))} required />
              </div>

              <div>
                <RenderLabel text={txt("ID Card No (if applicable)")} />
                <Input className="rounded-xl" value={formData.idCardNo} onChange={(e: any) => setFormData((s) => ({ ...s, idCardNo: e.target.value }))} />
              </div>
            </div>

            <div>
              <RenderLabel text={txt("Residential Address")} required />
              <textarea value={formData.residentialAddress} onChange={(e) => setFormData((s) => ({ ...s, residentialAddress: e.target.value }))} className="w-full rounded-xl p-4" style={{ minHeight: 120, border: "1px solid #e6e6e6" }} required />
              {errors.residentialAddress && <div style={styles.errorText}>{errors.residentialAddress}</div>}
            </div>

            <div>
              <RenderLabel text={txt("Unique Identification Mark")} />
              <Input className="rounded-xl" value={formData.uniqueIdentificationMark} onChange={(e: any) => setFormData((s) => ({ ...s, uniqueIdentificationMark: e.target.value }))} placeholder={txt("Optional")} />
            </div>

            <div>
              <RenderLabel text={txt("Upload Documents")} />
              <div style={styles.dashedBox}>
                <Upload className="mx-auto" style={{ width: 36, height: 36, color: "#2e7d32" }} />
                <div style={{ fontWeight: 700, marginTop: 8 }}>{txt("Upload Documents")}</div>
                <div style={{ color: "#6b7280", marginTop: 2 }}>PDF, JPG, PNG (Max 5 MB each)</div>
                <input id="uploadFiles" type="file" multiple accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileUpload} style={{ display: "none" }} />
                <label htmlFor="uploadFiles" style={{ display: "block", marginTop: 8, cursor: "pointer", color: "#2e7d32" }}>
                  {txt("Click to upload or drag files here")}
                </label>
              </div>

              {uploadedFilesMeta.length > 0 && (
                <div className="mt-3 space-y-2">
                  {uploadedFilesMeta.map((f, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-md" style={{ background: "#f6f6f6" }}>
                      <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.name}</div>
                      <button type="button" onClick={() => removeFile(i)} style={{ color: "#d32f2f" }}>
                        <X />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* SECTION C */}
            <hr className="my-6" style={{ borderColor: "#eee" }} />
            <h3 style={{ ...styles.sectionHeading }}>SECTION C – FAMILY DETAILS</h3>

            <div className="mt-4 space-y-4">
              {familyMembers.map((m, idx) => (
                <div key={m.id} className="rounded-lg p-4" style={{ background: "#f6f6f6", border: "1px solid #ececec" }}>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <RenderLabel text={txt("Full Name")} required={idx === 0} />
                      <Input
                        id="family.0.name"
                        name="family.0.name"
                        value={m.name}
                        onChange={(e: any) => updateFamilyMember(m.id, "name", e.target.value)}
                        placeholder=""
                      />
                      {idx === 0 && errors["family.0.name"] && <div style={styles.errorText}>{errors["family.0.name"]}</div>}

                    </div>

                    <div>
                      <RenderLabel text={txt("Relation")} />
                      <select value={m.relation} onChange={(e) => updateFamilyMember(m.id, "relation", e.target.value)} className="w-full rounded-xl px-4 py-3" style={{ border: "1px solid #e6e6e6" }}>
                        <option>Spouse</option>
                        <option>Son</option>
                        <option>Daughter</option>
                        <option>Father</option>
                        <option>Mother</option>
                        <option>Dependent</option>
                      </select>
                    </div>

                    <div>
                      <RenderLabel text={txt("Age / Date of Birth")} required={idx === 0} />
                      {/* replaced text input with date picker */}
                      <Input
                        id="family.0.age"
                        name="family.0.age"
                        type="date"
                        placeholder="DD/MM/YYYY"
                        value={m.age}
                        onChange={(e: any) => updateFamilyMember(m.id, "age", e.target.value)}
                      />
                      {idx === 0 && errors["family.0.age"] && <div style={styles.errorText}>{errors["family.0.age"]}</div>}

                    </div>

                    <div>
                      <RenderLabel text={txt("Gender")} />
                      <select value={m.gender} onChange={(e) => updateFamilyMember(m.id, "gender", e.target.value)} className="w-full rounded-xl px-4 py-3" style={{ border: "1px solid #e6e6e6" }}>
                        <option>Male</option>
                        <option>Female</option>
                        <option>Other</option>
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <RenderLabel text={txt("Aadhaar Number (Optional)")} />
                      <Input value={m.aadhaar} onChange={(e: any) => updateFamilyMember(m.id, "aadhaar", String(e.target.value).replace(/\D/g, "").slice(0, 12))} placeholder={txt("Optional")} />
                    </div>

                    <div className="md:col-span-2">
                      <RenderLabel text={txt("Unique Identification Mark (Optional)")} />
                      <Input value={m.uniqueIdentificationMark} onChange={(e: any) => updateFamilyMember(m.id, "uniqueIdentificationMark", e.target.value)} placeholder={txt("Optional")} />
                    </div>

                    <div className="md:col-span-2">
                      <RenderLabel text={txt("Supporting Document (Optional)")} />

                      <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 6 }}>
                        <label htmlFor={`member-doc-${m.id}`} className="rounded-xl px-4 py-2" style={{ border: "1px solid #e6e6e6", background: "white", cursor: "pointer", fontWeight: 600 }}>
                          {txt("Choose file")}
                        </label>

                        <span style={{ color: "#6b7280", fontSize: 14 }}>{m.doc ? (m.doc instanceof File ? m.doc.name : (m.doc as any).name ?? txt("No file chosen")) : txt("No file chosen")}</span>
                      </div>

                      <input id={`member-doc-${m.id}`} type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => updateFamilyMember(m.id, "doc", e.currentTarget.files?.[0] || null)} style={{ display: "none" }} />
                    </div>
                  </div>

                  <div className="mt-3">
                    {idx !== 0 ? (
                      <button type="button" onClick={() => removeFamilyMember(m.id)} style={{ color: "#d32f2f", fontWeight: 600 }}>
                        {txt("Remove")} ×
                      </button>
                    ) : (
                      <div style={{ height: 1 }} />
                    )}
                  </div>
                </div>
              ))}

              <div>
                <button type="button" onClick={addFamilyMember} className="rounded-xl px-4 py-3" style={{ background: "#f6f6f6", color: "#2e7d32", fontWeight: 700 }}>
                  <Plus style={{ marginRight: 8 }} /> {txt("Add member")}
                </button>
              </div>
            </div>

            {/* Forwarding officer & actions (moved AFTER family details) */}
            <div>
              <RenderLabel text={txt("Select Forwarding Officer")} required />
              <select className="rounded-xl px-4 py-3 w-full" style={{ border: "1px solid #e6e6e6", background: "white", appearance: "none" }} value={forwardingOfficer} onChange={(e) => setForwardingOfficer(e.target.value)} required>
                <option value="">{txt("Select Forwarding Officer")}</option>
                <option value="CO-001">Raj Kumar - Chief Officer</option>
                <option value="AO-002">Priya Singh - Area Officer</option>
                <option value="DO-003">Amit Patel - District Officer</option>
              </select>
              {errors.forwardingOfficer && <div style={styles.errorText}>{errors.forwardingOfficer}</div>}
            </div>

            <div className="flex gap-6 items-center mt-6">
              <button
                type="button"
                onClick={() => saveDraft()}
                className="flex-1 border-2 rounded-xl"
                style={{ padding: "18px 28px", borderColor: "#0b3355", color: "#0b3355", fontWeight: 600 }}
              >
                {txt("Save Draft")}
              </button>

              {/* Defensive: keep type=submit, but ALSO attach an onClick handler that stops propagation and calls handleSubmit.
                  Also bring the button visually forward with z-index and position. */}
              <button
                ref={submitBtnRef}
                type="submit"
                onClick={(ev) => {
                  try {
                    ev.preventDefault()
                    ev.stopPropagation()
                    console.log("[IdCardForm] submit button onClick fire - calling handleSubmit")
                  } catch (err) {
                    // ignore
                  }
                  handleSubmit(ev)
                }}
                onMouseDown={(ev) => {
                  // call early on pointer down too — covers cases where overlays intercept click but not pointerdown
                  try {
                    ev.preventDefault()
                    ev.stopPropagation()
                  } catch {}
                  handleSubmit(ev)
                }}
                onKeyDown={(ev) => {
                  // support Enter key from keyboard
                  if ((ev as any).key === "Enter") {
                    ev.preventDefault()
                    ev.stopPropagation()
                    handleSubmit(ev)
                  }
                }}
                className="flex-1 rounded-xl"
                style={{
                  padding: "18px 28px",
                  background: "#2e7d32",
                  color: "white",
                  fontWeight: 600,
                  position: "relative",
                  zIndex: 2000, // bring to front to avoid being visually covered
                  pointerEvents: "auto",
                }}
                aria-disabled={false}
              >
                {txt("Submit Application")}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Small debug toolbar — removable once you've debugged */}
      <div style={styles.smallDebugToolbar}>
        <button
          style={styles.debugBtn}
          onClick={() => {
            try {
              if (submitBtnRef.current) {
                inspectBlockingElement(submitBtnRef.current)
              } else {
                alert("Submit button ref not available.")
              }
            } catch (err) {
              console.warn(err)
            }
          }}
          title="Flash any element blocking the submit button"
        >
          Inspect overlay
        </button>

        <button
          style={styles.debugBtn}
          onClick={() => {
            // force submit bypasses validation — useful to confirm navigation & banner
            if (!confirm("Force submit will bypass validation and trigger the success flow. Use only for testing.")) return
            void submitFinal()
          }}
          title="Bypass validation and run submit (for testing)"
        >
          Force submit
        </button>

        <button
          style={{ ...styles.debugBtn, background: "#374151" }}
          onClick={() => {
            handleGlobalInspect()
          }}
          title="Inspect center of viewport"
        >
          Inspect center
        </button>
      </div>

      {/* Debug UI */}
      {debugAttempts.length > 0 && (
        <div style={styles.debugBox}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>Back navigation debug</div>
          <div style={{ opacity: 0.85, fontSize: 11, marginBottom: 8 }}>Check console for the same messages.</div>
          <ul style={{ paddingLeft: 14, margin: 0 }}>
            {debugAttempts.map((d, i) => (
              <li key={i} style={{ marginBottom: 6 }}>
                {d}
              </li>
            ))}
          </ul>
          <div style={{ marginTop: 8, fontSize: 11, opacity: 0.8 }}>If still 404, paste your dashboard file path (e.g. /app/dashboard/page.tsx)</div>
        </div>
      )}
    </main>
  )
}
