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
  language = "en", // <- default to en
  onCancel,
  onSubmitSuccess,
  initialData = null,
  mode = "create",
}: IdCardFormProps) {
  const router = useRouter()
   const normLang = String(language ?? "en").trim().toLowerCase()
  const txt = (en: string, hi?: string) => (normLang === "en" ? en : hi ?? en)

  useEffect(() => {
    // remove this console.log in production
    // eslint-disable-next-line no-console
    console.log("[IdCardForm] language prop =", language, "normalized:", normLang)
  }, [language, normLang])
  
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
      title: txt("A. New Appointment / Transfer", "A. नई नियुक्ति / स्थानांतरण"),
      docs: [txt("Memorandum / Transfer Letter Copy", "स्मरण / स्थानांतरण पत्र की प्रतिलिपि"), txt("Charge Report Copy", "चार्ज रिपोर्ट प्रतिलिपि"), txt("Current Address Proof Copy", "वर्तमान पता प्रमाण प्रतिलिपि")],
    },
    { id: "B", title: txt("B. Promotion", "B. पदोन्नति"), docs: [txt("Promotion Order Copy", "पदोन्नति आदेश प्रतिलिपि"), txt("Old Identity Card Copy both sides", "पुराना पहचान पत्र (दोनों पक्ष)")] },
    { id: "C", title: txt("C. Lost Identity Card", "C. खोया हुआ पहचान पत्र"), docs: [txt("Police Complaint Certificate Copy", "पुलिस शिकायत प्रमाण पत्र प्रतिलिपि"), txt("Rs.100/- Money Receipt", "₹100/- रसीद"), txt("Current Address Proof Copy", "वर्तमान पता प्रमाण प्रतिलिपि")] },
    { id: "D", title: txt("D. Damage Card", "D. क्षतिग्रस्त कार्ड"), docs: [txt("Rs.100/- Money Receipt", "₹100/- रसीद"),  txt("Identity Card Copy both sides", "पहचान पत्र प्रतिलिपि (दोनों पक्ष)")] },
    { id: "E", title: txt("E. Inclusion of Dependents / Family Members", "E. आश्रित / परिवार के सदस्यों को शामिल करना"), docs: [ txt(" Address Proof Copy", "पता प्रमाण प्रतिलिपि"), txt("Marriage / Death / Birth Certificate", "विवाह / मृत्यु / जन्म प्रमाण पत्र")] },
    { id: "F", title: txt("F. Correction", "F. सुधार"), docs: [txt("Rs.100/- Money Receipt", "₹100/- रसीद"), txt("Identity Card Copy both sides", "पहचान पत्र प्रतिलिपि (दोनों पक्ष)"), txt(" Correction Documents", "सुधार दस्तावेज़")] },
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

  // Live validation: touched state (ADDED)
  const [touched, setTouched] = useState<Record<string, boolean>>({})

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
        alert(txt("You must have at least one family member.","आपके पास कम से कम एक परिवार का सदस्य होना चाहिए।"))
        return p
      }
      const index = p.findIndex((m) => m.id === id)
      if (index === 0) {
        alert(txt("Primary family member cannot be removed.","प्राथमिक परिवार के सदस्य को हटाया नहीं जा सकता।"))
        return p
      }
      return p.filter((m) => m.id !== id)
    })

  // UPDATED: mark touched when updating a family member (to enable live validation)
  const updateFamilyMember = (id: string, field: keyof FamilyMember, value: any) => {
    setFamilyMembers((p) => p.map((m) => (m.id === id ? { ...m, [field]: value } : m)))
    // If this is primary member (first in array), mark touched keys for name/age
    try {
      const primaryId = familyMembers?.[0]?.id
      if (id === primaryId) {
        if (field === "name") touch("family.0.name")
        if (field === "age") touch("family.0.age")
      }
    } catch {}
  }

  // ---------- Validation ----------
  const validate = () => {
    const e: Record<string, string> = {}
    if (!formData.purpose) e.purpose = txt("Purpose is required.","उद्देश्य आवश्यक है।")
    if (!formData.department) e.department = txt("Department is required.","विभाग आवश्यक है।")
    if (!formData.unit?.trim()) e.unit = txt("Unit is required.","यूनिट आवश्यक है।")
    if (!formData.employeeNameEn?.trim()) e.employeeNameEn = txt("Employee name is required.","कर्मचारी का नाम आवश्यक है।")
    if (!formData.designationEn?.trim()) e.designationEn = txt("Designation is required.","पद आवश्यक है।")
    if (!formData.dateOfAppointment) e.dateOfAppointment = txt("Date of appointment is required.","नियुक्ति की तारीख आवश्यक है।")
    if (!formData.residentialAddress?.trim()) e.residentialAddress = txt("Residential address is required.","निवास पता आवश्यक है।")

    // Email validation (keeps your existing rule)
    if (!formData.email) {
      e.email = txt("Email is required.","ईमेल आवश्यक है।")
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      e.email = txt("Enter a valid email.","मान्य ईमेल दर्ज करें।")
    }

    // Mobile: must be exactly 10 digits
    if (!formData.mobileNumber) {
      e.mobileNumber = txt("Mobile number is required.","मोबाइल नंबर आवश्यक है।")
    } else if (!/^\d{10}$/.test(formData.mobileNumber)) {
      e.mobileNumber = txt("Enter a valid 10-digit mobile number.","मान्य 10-अंकीय मोबाइल नंबर दर्ज करें।")
    }

    // Pin code: must be exactly 6 digits
    if (!formData.pinCode?.trim()) {
      e.pinCode = txt("Pin code is required.","पिन कोड आवश्यक है।")
    } else if (!/^\d{6}$/.test(formData.pinCode.trim())) {
      e.pinCode = txt("Enter a valid 6-digit pin code.","मान्य 6-अंकीय पिन कोड दर्ज करें।")
    }

    if (!forwardingOfficer) e.forwardingOfficer = txt("Select a forwarding officer.","कृपया एक फॉरवर्डिंग अधिकारी चुनें।")
    if (!formData.district?.trim()) e.district = txt("District is required.","जिला आवश्यक है।")
    if (!formData.state?.trim()) e.state = txt("State is required.","राज्य आवश्यक है।")
    if (!familyMembers || familyMembers.length === 0) {
      e.family = txt("Add at least one family member.","कम से कम एक परिवार का सदस्य जोड़ें।")
    } else {
      const primary = familyMembers[0]
      if (!primary.name?.trim()) e["family.0.name"] = txt("Primary member name is required.","प्राथमिक सदस्य का नाम आवश्यक है।")
      if (!primary.age?.trim()) {
        e["family.0.age"] = txt("Primary member DOB is required.","प्राथमिक सदस्य की जन्मतिथि आवश्यक है।")
      } else {
        // check valid date (YYYY-MM-DD) and not in the future
        const dt = new Date(primary.age)
        if (isNaN(dt.getTime())) {
          e["family.0.age"] = txt("Enter a valid date for primary member DOB.","प्राथमिक सदस्य की जन्मतिथि के लिए मान्य तारीख दर्ज करें।")
        } else {
          const today = new Date()
          // normalize times to compare only dates
          const dtNoTime = new Date(dt.getFullYear(), dt.getMonth(), dt.getDate())
          const todayNoTime = new Date(today.getFullYear(), today.getMonth(), today.getDate())
          if (dtNoTime > todayNoTime) {
            e["family.0.age"] = txt("DOB cannot be in the future.","जन्मतिथि भविष्य में नहीं हो सकती।")
          }
        }
      }
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  // Live validation helpers (ADDED)
  const touch = (key: string) => setTouched((s) => ({ ...s, [key]: true }))

  const validateField = (key: string, value: any, all?: { formData: typeof formData; familyMembers: FamilyMember[]; forwardingOfficer: string }) => {
    const t = (k: string) => (language === "en" ? k : k)
    const fd = all?.formData ?? formData
    const fam = all?.familyMembers ?? familyMembers
    const fo = all?.forwardingOfficer ?? forwardingOfficer

    switch (key) {
      case "purpose":
        if (!value) return t(txt("Purpose is required.","उद्देश्य आवश्यक है।"))
        return null
      case "department":
        if (!value) return t(txt("Department is required.","विभाग आवश्यक है।"))
        return null
      case "unit":
        if (!String(value).trim()) return t(txt("Unit is required.","यूनिट आवश्यक है।"))
        return null
      case "employeeNameEn":
        if (!String(value).trim()) return t(txt("Employee name is required.","कर्मचारी का नाम आवश्यक है।"))
        return null
      case "designationEn":
        if (!String(value).trim()) return t(txt("Designation is required.","पद आवश्यक है।"))
        return null
      case "dateOfAppointment":
        if (!value) return t(txt("Date of appointment is required.","नियुक्ति की तारीख आवश्यक है।"))
        return null
      case "residentialAddress":
        if (!String(value).trim()) return t(txt("Residential address is required.","निवास पता आवश्यक है।"))
        return null
      case "email":
        if (!value) return t(txt("Email is required.","ईमेल आवश्यक है।"))
        if (!/\S+@\S+\.\S+/.test(value)) return t(txt("Enter a valid email.","मान्य ईमेल दर्ज करें।"))
        return null
      case "mobileNumber":
        if (!value) return t(txt("Mobile number is required.","मोबाइल नंबर आवश्यक है।"))
        if (!/^\d{10}$/.test(String(value))) return t(txt("Enter a valid 10-digit mobile number.","मान्य 10-अंकीय मोबाइल नंबर दर्ज करें।"))
        return null
      case "pinCode":
        if (!String(value).trim()) return t(txt("Pin code is required.","पिन कोड आवश्यक है।"))
        if (!/^\d{6}$/.test(String(value).trim())) return t(txt("Enter a valid 6-digit pin code.","मान्य 6-अंकीय पिन कोड दर्ज करें।"))
        return null
      case "forwardingOfficer":
        if (!fo) return t(txt("Select a forwarding officer.","कृपया एक फॉरवर्डिंग अधिकारी चुनें।"))
        return null
      case "district":
        if (!String(value).trim()) return t(txt("District is required.","जिला आवश्यक है।"))
        return null
      case "state":
        if (!String(value).trim()) return t(txt("State is required.","राज्य आवश्यक है।"))
        return null

      case "family.0.name": {
        const primary = fam[0]
        if (!primary?.name?.trim()) return t(txt("Primary member name is required.","प्राथमिक सदस्य का नाम आवश्यक है।"))
        return null
      }
      case "family.0.age": {
        const primary = fam[0]
        if (!primary?.age?.trim()) return t(txt("Primary member DOB is required.","प्राथमिक सदस्य की जन्मतिथि आवश्यक है।"))
        const dt = new Date(primary.age)
        if (isNaN(dt.getTime())) return t(txt("Enter a valid date for primary member DOB.","प्राथमिक सदस्य की जन्मतिथि के लिए मान्य तारीख दर्ज करें।"))
        const today = new Date()
        const dtNoTime = new Date(dt.getFullYear(), dt.getMonth(), dt.getDate())
        const todayNoTime = new Date(today.getFullYear(), today.getMonth(), today.getDate())
        if (dtNoTime > todayNoTime) return t(txt("DOB cannot be in the future.","जन्मतिथि भविष्य में नहीं हो सकती।"))
        return null
      }

      default:
        return null
    }
  }

  const validateAll = () => {
    const fullErrors: Record<string, string> = {}

    if (!formData.purpose) fullErrors.purpose = txt("Purpose is required.","उद्देश्य आवश्यक है।")
    if (!formData.department) fullErrors.department = txt("Department is required.","विभाग आवश्यक है।")
    if (!formData.unit?.trim()) fullErrors.unit = txt("Unit is required.","यूनिट आवश्यक है।")
    if (!formData.employeeNameEn?.trim()) fullErrors.employeeNameEn = txt("Employee name is required.","कर्मचारी का नाम आवश्यक है।")
    if (!formData.designationEn?.trim()) fullErrors.designationEn = txt("Designation is required.","पद आवश्यक है।")
    if (!formData.dateOfAppointment) fullErrors.dateOfAppointment = txt("Date of appointment is required.","नियुक्ति की तारीख आवश्यक है।")
    if (!formData.residentialAddress?.trim()) fullErrors.residentialAddress = txt("Residential address is required.","निवास पता आवश्यक है।")
    if (!formData.email) fullErrors.email = txt("Email is required.","ईमेल आवश्यक है।")
    else if (!/\S+@\S+\.\S+/.test(formData.email)) fullErrors.email = txt("Enter a valid email.","मान्य ईमेल दर्ज करें।")
    if (!formData.mobileNumber) fullErrors.mobileNumber = txt("Mobile number is required.","मोबाइल नंबर आवश्यक है।")
    else if (!/^\d{10}$/.test(formData.mobileNumber)) fullErrors.mobileNumber = txt("Enter a valid 10-digit mobile number.","मान्य 10-अंकीय मोबाइल नंबर दर्ज करें।")
    if (!formData.pinCode?.trim()) fullErrors.pinCode = txt("Pin code is required.","पिन कोड आवश्यक है।")
    else if (!/^\d{6}$/.test(formData.pinCode.trim())) fullErrors.pinCode = txt("Enter a valid 6-digit pin code.","मान्य 6-अंकीय पिन कोड दर्ज करें।")
    if (!forwardingOfficer) fullErrors.forwardingOfficer = txt("Select a forwarding officer.","कृपया एक फॉरवर्डिंग अधिकारी चुनें।")
    if (!formData.district?.trim()) fullErrors.district = txt("District is required.","जिला आवश्यक है।")
    if (!formData.state?.trim()) fullErrors.state = txt("State is required.","राज्य आवश्यक है।")
    if (!familyMembers || familyMembers.length === 0) fullErrors.family = txt("Add at least one family member.","कम से कम एक परिवार का सदस्य जोड़ें।")
    else {
      const primary = familyMembers[0]
      if (!primary.name?.trim()) fullErrors["family.0.name"] = txt("Primary member name is required.","प्राथमिक सदस्य का नाम आवश्यक है।")
      if (!primary.age?.trim()) fullErrors["family.0.age"] = txt("Primary member DOB is required.","प्राथमिक सदस्य की जन्मतिथि आवश्यक है।")
      else {
        const dt = new Date(primary.age)
        if (isNaN(dt.getTime())) fullErrors["family.0.age"] = txt("Enter a valid date for primary member DOB.","प्राथमिक सदस्य की जन्मतिथि के लिए मान्य तारीख दर्ज करें।")
        else {
          const today = new Date()
          const dtNoTime = new Date(dt.getFullYear(), dt.getMonth(), dt.getDate())
          const todayNoTime = new Date(today.getFullYear(), today.getMonth(), today.getDate())
          if (dtNoTime > todayNoTime) fullErrors["family.0.age"] = txt("DOB cannot be in the future.","जन्मतिथि भविष्य में नहीं हो सकती।")
        }
      }
    }

    // filter by touched so we only show errors for fields the user interacted with
    const visibleErrors: Record<string, string> = {}
    for (const k of Object.keys(fullErrors)) {
      if (touched[k]) visibleErrors[k] = fullErrors[k]
    }

    setErrors(visibleErrors)
    return Object.keys(fullErrors).length === 0
  }

  // Run live validation when relevant pieces change (ADDED)
  useEffect(() => {
    validateAll()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData, familyMembers, forwardingOfficer, touched])

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
      alert(txt("Detected possible blocking element — it will be flashed in red for 2s. Check console for element details.","संभावित बाधक तत्व पता चला — यह 2 सेकंड के लिए लाल रंग में हाइलाइट किया जाएगा। कंसोल में विवरण देखें।"))
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
        alert(
          `${txt("Element at point:", "उस बिंदु पर तत्व:")} ${el.tagName}${el.id ? `#${el.id}` : ""}${el.className ? `.${String(el.className).split(" ").join(".")}` : ""}`
        )
      } else {
        alert(txt("No element found at that point.","उस बिंदु पर कोई तत्व नहीं मिला।"))
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

  // mark all relevant fields touched (ADDED)
  const markAllTouched = () => {
    const keys = [
      "purpose",
      "department",
      "unit",
      "employeeNameEn",
      "designationEn",
      "dateOfAppointment",
      "residentialAddress",
      "email",
      "mobileNumber",
      "pinCode",
      "forwardingOfficer",
      "district",
      "state",
      "family.0.name",
      "family.0.age",
    ]
    const newTouched = { ...touched }
    keys.forEach((k) => (newTouched[k] = true))
    setTouched(newTouched)
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

    // Mark all fields touched so errors become visible, then run validateAll
    markAllTouched()
    const ok = validateAll()

    if (!ok) {
      // use the errors object (which now contains visible errors) to scroll to first error
      try {
        const firstKey = Object.keys(errors)[0] || Object.keys((() => {
          // build a stable snapshot of full errors if errors still empty (race)
          const fullErrs: Record<string, string> = {}
          if (!formData.purpose) fullErrs.purpose = txt("Purpose is required.","उद्देश्य आवश्यक है।")
          if (!formData.department) fullErrs.department = txt("Department is required.","विभाग आवश्यक है।")
          if (!formData.unit?.trim()) fullErrs.unit = txt("Unit is required.","यूनिट आवश्यक है।")
          if (!formData.employeeNameEn?.trim()) fullErrs.employeeNameEn = txt("Employee name is required.","कर्मचारी का नाम आवश्यक है।")
          if (!formData.designationEn?.trim()) fullErrs.designationEn = txt("Designation is required.","पद आवश्यक है।")
          if (!formData.dateOfAppointment) fullErrs.dateOfAppointment = txt("Date of appointment is required.","नियुक्ति की तारीख आवश्यक है।")
          if (!formData.residentialAddress?.trim()) fullErrs.residentialAddress = txt("Residential address is required.","निवास पता आवश्यक है।")
          if (!formData.email) fullErrs.email = txt("Email is required.","ईमेल आवश्यक है।")
          else if (!/\S+@\S+\.\S+/.test(formData.email)) fullErrs.email = txt("Enter a valid email.","मान्य ईमेल दर्ज करें।")
          if (!formData.mobileNumber) fullErrs.mobileNumber = txt("Mobile number is required.","मोबाइल नंबर आवश्यक है।")
          else if (!/^\d{10}$/.test(formData.mobileNumber)) fullErrs.mobileNumber = txt("Enter a valid 10-digit mobile number.","मान्य 10-अंकीय मोबाइल नंबर दर्ज करें।")
          if (!formData.pinCode?.trim()) fullErrs.pinCode = txt("Pin code is required.","पिन कोड आवश्यक है।")
          else if (!/^\d{6}$/.test(formData.pinCode.trim())) fullErrs.pinCode = txt("Enter a valid 6-digit pin code","मान्य 6-अंकीय पिन कोड दर्ज करें।")
          if (!forwardingOfficer) fullErrs.forwardingOfficer = txt("Select a forwarding officer.","कृपया एक फॉरवर्डिंग अधिकारी चुनें।")
          if (!formData.district?.trim()) fullErrs.district = txt("District is required.","जिला आवश्यक है।")
          if (!formData.state?.trim()) fullErrs.state = txt("State is required.","राज्य आवश्यक है।")
          if (!familyMembers || familyMembers.length === 0) fullErrs.family = txt("Add at least one family member.","कम से कम एक परिवार का सदस्य जोड़ें।")
          else {
            const primary = familyMembers[0]
            if (!primary.name?.trim()) fullErrs["family.0.name"] = txt("Primary member name is required.","प्राथमिक सदस्य का नाम आवश्यक है।")
            if (!primary.age?.trim()) fullErrs["family.0.age"] = txt("Primary member DOB is required.","प्राथमिक सदस्य की जन्मतिथि आवश्यक है।")
          }
          return fullErrs
        })())[0]

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
      alert(txt("Draft saved","ड्राफ्ट सहेजा गया"))
      return id
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Failed saving draft", err)
      alert(txt("Failed to save draft","ड्राफ्ट सहेजने में विफल"))
      return null
    }
  }

  // -------------------- TRANSLATION HELPERS (ADDED) --------------------
  // This client-side helper attempts to translate text to Hindi and write into the corresponding Hi fields.
  // Strategy:
  // 1) Debounce input -> avoid excessive calls while typing.
  // 2) Try POST /api/translate (recommended: implement server route to call Google Translate / Azure / GCP
  //    so API keys are not exposed to client). If that fails, fallback to LibreTranslate public endpoint.
  //
  // Example server route (Next.js) for /api/translate:
  // (This is only an example — implement on server and secure your API key)
  //
  // // pages/api/translate.ts
  // export default async function handler(req, res) {
  //   const { q, target } = req.body
  //   // use your server-side credential to call Google Translate, e.g. fetch to:
  //   // https://translation.googleapis.com/language/translate/v2?key=YOUR_KEY
  //   // or use official Google Cloud SDK on server
  //   // For now simply proxy to LibreTranslate or implement production translator here.
  // }
  //
  // Client-side implementation (below) will attempt to fetch '/api/translate' then fall back.
  const translateTimeoutRef = useRef<number | null>(null)
  const [translating, setTranslating] = useState({ employee: false, designation: false })

  const translateText = async (text: string, target = "hi") => {
    if (!text || !text.trim()) return ""
    // prefer your server-side endpoint (safer for keys)
    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ q: text, target }),
      })
      if (res.ok) {
        const data = await res.json()
        // expect data.translatedText (adjust according to your server)
        if (typeof data.translatedText === "string") return data.translatedText
        // if server returns Google API response style:
        if (data && data.data && data.data.translations && data.data.translations[0]) {
          return data.data.translations[0].translatedText
        }
      } else {
        console.warn("Server /api/translate responded not OK:", res.status)
      }
    } catch (err) {
      console.warn("Call to /api/translate failed:", err)
    }

    // Fallback: LibreTranslate public endpoint (may be rate-limited)
    try {
      const res2 = await fetch("https://libretranslate.de/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          q: text,
          source: "en",
          target: target,
          format: "text",
        }),
      })
      if (res2.ok) {
        const out = await res2.json()
        if (out && out.translatedText) return out.translatedText
      } else {
        console.warn("LibreTranslate responded not OK:", res2.status)
      }
    } catch (err) {
      console.warn("LibreTranslate fallback failed:", err)
    }

    // Final fallback: just return original text (or you could attempt naive transliteration)
    return text
  }

  // Debounced call orchestrators
  const scheduleEmployeeTranslate = (text: string) => {
    // cancel previous
    if (translateTimeoutRef.current) window.clearTimeout(translateTimeoutRef.current)
    // schedule
    translateTimeoutRef.current = window.setTimeout(async () => {
      try {
        setTranslating((s) => ({ ...s, employee: true }))
        const hi = await translateText(text, "hi")
        setFormData((s) => ({ ...s, employeeNameHi: hi }))
      } catch (err) {
        console.warn("Employee name translation failed:", err)
      } finally {
        setTranslating((s) => ({ ...s, employee: false }))
      }
    }, 700)
  }

  const scheduleDesignationTranslate = (text: string) => {
    // Use a different timer so both can run independently
    // We'll store them in separate refs (re-using translateTimeoutRef would overwrite)
    // Create separate ref objects for designation
    if ((scheduleDesignationTranslate as any).timeout) {
      window.clearTimeout((scheduleDesignationTranslate as any).timeout)
    }
    (scheduleDesignationTranslate as any).timeout = window.setTimeout(async () => {
      try {
        setTranslating((s) => ({ ...s, designation: true }))
        const hi = await translateText(text, "hi")
        setFormData((s) => ({ ...s, designationHi: hi }))
      } catch (err) {
        console.warn("Designation translation failed:", err)
      } finally {
        setTranslating((s) => ({ ...s, designation: false }))
      }
    }, 700)
  }

  // --------------------------------------------------------------------

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
          ← {txt("Back","वापस")}
        </button>

        <div className="card-elevated rounded-2xl p-8" style={{ background: "white" }}>
          <h1 className="heading-lg mb-6" style={{ fontSize: 28, fontWeight: 700, color: "#0b3355" }}>
            {txt("Apply for Identity Card","पहचान पत्र के लिए आवेदन करें")}
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
              {txt("Application submitted successfully!","आवेदन सफलतापूर्वक जमा किया गया!")}
            </div>
          )}

          {/* SECTION A */}
          <h3 style={{ ...styles.sectionHeading, marginTop: 6 }}>{txt("SECTION A – DOCUMENT REQUIREMENTS","अनुभाग A – दस्तावेज़ आवश्यकताएँ")}</h3>

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
                <div style={{ fontWeight: 700, color: "#d32f2f" }}>{txt("Important Note","महत्वपूर्ण सूचना")}</div>
                <div style={{ color: "#333" }}>
                  {txt("In Case of Lost / Damage of Identity Card, Original Money Receipt be submitted to this Office.","पहचान पत्र खो जाने/क्षतिग्रस्त होने की स्थिति में, मूल रसीद इस कार्यालय में जमा करें।")}
                </div>
              </div>
            </div>
          </div>

          {/* SECTION B */}
          <hr className="my-6" style={{ borderColor: "#eee" }} />
          <h3 style={{ ...styles.sectionHeading }}>{txt("SECTION B – EMPLOYEE DETAILS","अनुभाग B – कर्मचारी विवरण")}</h3>

          {/* IMPORTANT: wire form submit to handleSubmit for reliable click/focus handling */}
          <form onSubmit={handleSubmit} className="mt-6 space-y-6" style={{ position: "relative" }}>
            {/* form fields unchanged */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <RenderLabel text={txt("Purpose of Making ID Card","पहचान पत्र बनाने का उद्देश्य")} required />
                <select
                  className="rounded-xl px-4 py-3 w-full"
                  style={{ border: "1px solid #e6e6e6", background: "white", appearance: "none" }}
                  value={formData.purpose}
                  onChange={(e) => {
                    setFormData((s) => ({ ...s, purpose: e.target.value }))
                    touch("purpose")
                  }}
                  onBlur={() => touch("purpose")}
                  required
                >
                  <option value="">{txt("Select Purpose","उद्देश्य चुनें")}</option>
                  <option value="new">{txt("New Card","नया कार्ड")}</option>
                  <option value="promotion">{txt("Promotion","पदोन्नति")}</option>
                  <option value="lost">{txt("Replacement - Lost","प्रतिस्थापन - खोया हुआ")}</option>
                </select>
                {errors.purpose && <div style={styles.errorText}>{errors.purpose}</div>}
              </div>

              <div>
                <RenderLabel text={txt("Department","विभाग")} required />
                <select
                  className="rounded-xl px-4 py-3 w-full"
                  style={{ border: "1px solid #e6e6e6", background: "white", appearance: "none" }}
                  value={formData.department}
                  onChange={(e) => {
                    setFormData((s) => ({ ...s, department: e.target.value }))
                    touch("department")
                  }}
                  onBlur={() => touch("department")}
                  required
                >
                  <option value="">{txt("Select","चुनें")}</option>
                  <option value="engineering">{txt("Engineering","इंजीनियरिंग")}</option>
                  <option value="operations">{txt("Operations","ऑपरेशंस")}</option>
                </select>
                {errors.department && <div style={styles.errorText}>{errors.department}</div>}
              </div>

              <div>
                <RenderLabel text={txt("Unit","यूनिट")} required />
                <Input className="rounded-xl" value={formData.unit} onChange={(e: any) => { setFormData((s) => ({ ...s, unit: e.target.value })); touch("unit") }} onBlur={() => touch("unit")} required />
                {errors.unit && <div style={styles.errorText}>{errors.unit}</div>}
              </div>

              <div>
                <RenderLabel text={txt("Employee Name (English)","कर्मचारी का नाम (अंग्रेज़ी)")} required />
                <Input
                  className="rounded-xl"
                  value={formData.employeeNameEn}
                  onChange={(e: any) => {
                    const v = e.target.value
                    setFormData((s) => ({ ...s, employeeNameEn: v }))
                    touch("employeeNameEn")
                    // schedule auto-translate
                    scheduleEmployeeTranslate(v)
                  }}
                  onBlur={() => touch("employeeNameEn")}
                  required
                />
                {errors.employeeNameEn && <div style={styles.errorText}>{errors.employeeNameEn}</div>}
                {/* small hint showing translation status */}
                <div style={{ marginTop: 6, fontSize: 12, color: "#6b7280" }}>
                  {translating.employee ? txt("Translating...","अनुवाद हो रहा है...") : txt("Auto-translates to Hindi below","नीचे हिंदी में स्वतः अनुवादित")}
                </div>
              </div>

              {/* NEW: Employee Name Hindi (always present so user can edit or override auto-translation) */}
              <div>
                <RenderLabel text={txt("Employee Name (Hindi)","कर्मचारी का नाम (हिंदी)")} />
                <Input
                  className="rounded-xl"
                  value={formData.employeeNameHi}
                  onChange={(e: any) => {
                    setFormData((s) => ({ ...s, employeeNameHi: e.target.value }))
                    // if user edits Hindi manually, mark touched if desired
                    touch("employeeNameHi")
                  }}
                  onBlur={() => touch("employeeNameHi")}
                />
                <div style={{ marginTop: 6, fontSize: 12, color: "#6b7280" }}>{txt("Automatically filled from English — editable","अंग्रेज़ी से स्वतः भरा गया — संपादन योग्य")}</div>
              </div>

              <div>
                <RenderLabel text={txt("Designation (English)","पदोन्नति (अंग्रेज़ी)")} required />
                <Input
                  className="rounded-xl"
                  value={formData.designationEn}
                  onChange={(e: any) => {
                    const v = e.target.value
                    setFormData((s) => ({ ...s, designationEn: v }))
                    touch("designationEn")
                    scheduleDesignationTranslate(v)
                  }}
                  onBlur={() => touch("designationEn")}
                  required
                />
                {errors.designationEn && <div style={styles.errorText}>{errors.designationEn}</div>}
                <div style={{ marginTop: 6, fontSize: 12, color: "#6b7280" }}>
                  {translating.designation ? txt("Translating...","अनुवाद हो रहा है...") : txt("Auto-translates to Hindi below","नीचे हिंदी में स्वतः अनुवादित")}
                </div>
              </div>

              {/* NEW: Designation Hindi */}
              <div>
                <RenderLabel text={txt("Designation (Hindi)","पद (हिंदी)")} />
                <Input
                  className="rounded-xl"
                  value={formData.designationHi}
                  onChange={(e: any) => {
                    setFormData((s) => ({ ...s, designationHi: e.target.value }))
                    touch("designationHi")
                  }}
                  onBlur={() => touch("designationHi")}
                />
                <div style={{ marginTop: 6, fontSize: 12, color: "#6b7280" }}>{txt("Automatically filled from English — editable","अंग्रेज़ी से स्वतः भरा गया — संपादन योग्य")}</div>
              </div>

              <div>
                <RenderLabel text={txt("Date of Appointment","नियुक्ति की तारीख")} required />
                <Input type="date" className="rounded-xl" value={formData.dateOfAppointment} onChange={(e: any) => { setFormData((s) => ({ ...s, dateOfAppointment: e.target.value })); touch("dateOfAppointment") }} onBlur={() => touch("dateOfAppointment")} required />
                {errors.dateOfAppointment && <div style={styles.errorText}>{errors.dateOfAppointment}</div>}
              </div>

              <div>
                <RenderLabel text={txt("Nearest RH/HU","नज़दीकी RH/HU")} required />
                <Input className="rounded-xl" value={formData.nearestRH} onChange={(e: any) => setFormData((s) => ({ ...s, nearestRH: e.target.value }))} required />
              </div>

              <div>
                <RenderLabel text={txt("Place of Work","कार्यस्थल")} required />
                <Input className="rounded-xl" value={formData.placeOfWork} onChange={(e: any) => setFormData((s) => ({ ...s, placeOfWork: e.target.value }))} required />
              </div>

              <div>
                <RenderLabel text={txt("Pay Level","पे स्तर")} required />
                <Input className="rounded-xl" value={formData.payLevel} onChange={(e: any) => setFormData((s) => ({ ...s, payLevel: e.target.value }))} required />
              </div>

              <div>
                <RenderLabel text={txt("Email","ईमेल")} required />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  className="rounded-xl"
                  value={formData.email}
                  onChange={(e: any) => {
                    const v = e.target.value
                    setFormData((s) => ({ ...s, email: v }))
                    touch("email")
                  }}
                  onBlur={() => touch("email")}
                  required
                />
                {errors.email && <div style={styles.errorText}>{errors.email}</div>}
              </div>

              <div>
                <RenderLabel text={txt("Mobile Number","मोबाइल नंबर")} required />
                <Input
                  id="mobileNumber"
                  name="mobileNumber"
                  type="tel"
                  className="rounded-xl"
                  value={formData.mobileNumber}
                  onChange={(e: any) =>
                    {
                      const cleaned = String(e.target.value).replace(/\D/g, "").slice(0, 10)
                      setFormData((s) => ({
                        ...s,
                        mobileNumber: cleaned,
                      }))
                      touch("mobileNumber")
                    }
                  }
                  onBlur={() => touch("mobileNumber")}
                  placeholder={txt("Enter 10-digit mobile","10-अंकीय मोबाइल दर्ज करें")}
                  maxLength={10}
                  required
                />
                {errors.mobileNumber && <div style={styles.errorText}>{errors.mobileNumber}</div>}

              </div>

              <div>
                <RenderLabel text={txt("Pin Code","पिन कोड")} required />
                <Input
                  id="pinCode"
                  name="pinCode"
                  className="rounded-xl"
                  value={formData.pinCode}
                  onChange={(e: any) => { const cleaned = String(e.target.value).replace(/\D/g, "").slice(0, 6); setFormData((s) => ({ ...s, pinCode: cleaned })); touch("pinCode") }}
                  onBlur={() => touch("pinCode")}
                  placeholder={txt("6-digit pin code","6-अंकीय पिन कोड")}
                  maxLength={6}
                  required
                />
                {errors.pinCode && <div style={styles.errorText}>{errors.pinCode}</div>}

              </div>

              <div>
                <RenderLabel text={txt("District","जिला")} required />
                <Input className="rounded-xl" value={formData.district} onChange={(e: any) => { setFormData((s) => ({ ...s, district: e.target.value })); touch("district") }} onBlur={() => touch("district")} required />
              </div>

              <div>
                <RenderLabel text={txt("State","राज्य")} required />
                <Input className="rounded-xl" value={formData.state} onChange={(e: any) => { setFormData((s) => ({ ...s, state: e.target.value })); touch("state") }} onBlur={() => touch("state")} required />
              </div>

              <div>
                <RenderLabel text={txt("ID Card No (if applicable)","आईडी कार्ड नंबर (यदि लागू हो)")} />
                <Input className="rounded-xl" value={formData.idCardNo} onChange={(e: any) => setFormData((s) => ({ ...s, idCardNo: e.target.value }))} />
              </div>
            </div>

            <div>
              <RenderLabel text={txt("Residential Address","निवास पता")} required />
              <textarea value={formData.residentialAddress} onChange={(e) => { setFormData((s) => ({ ...s, residentialAddress: e.target.value })); touch("residentialAddress") }} onBlur={() => touch("residentialAddress")} className="w-full rounded-xl p-4" style={{ minHeight: 120, border: "1px solid #e6e6e6" }} required />
              {errors.residentialAddress && <div style={styles.errorText}>{errors.residentialAddress}</div>}
            </div>

            <div>
              <RenderLabel text={txt("Unique Identification Mark","विशिष्ट पहचान चिह्न")} />
              <Input className="rounded-xl" value={formData.uniqueIdentificationMark} onChange={(e: any) => setFormData((s) => ({ ...s, uniqueIdentificationMark: e.target.value }))} placeholder={txt("Optional","वैकल्पिक")} />
            </div>

            <div>
              <RenderLabel text={txt("Upload Documents","दस्तावेज़ अपलोड करें")} />
              <div style={styles.dashedBox}>
                <Upload className="mx-auto" style={{ width: 36, height: 36, color: "#2e7d32" }} />
                <div style={{ fontWeight: 700, marginTop: 8 }}>{txt("Upload Documents","दस्तावेज़ अपलोड करें")}</div>
                <div style={{ color: "#6b7280", marginTop: 2 }}>{txt("PDF, JPG, PNG (Max 5 MB each)","PDF, JPG, PNG (प्रति फ़ाइल अधिकतम 5MB)")}</div>
                <input id="uploadFiles" type="file" multiple accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileUpload} style={{ display: "none" }} />
                <label htmlFor="uploadFiles" style={{ display: "block", marginTop: 8, cursor: "pointer", color: "#2e7d32" }}>
                  {txt("Click to upload or drag files here","अपलोड करने के लिए क्लिक करें या फाइलें यहाँ ड्रैग करें")}
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
            <h3 style={{ ...styles.sectionHeading }}>{txt("SECTION C – FAMILY DETAILS","अनुभाग C – पारिवारिक विवरण")}</h3>

            <div className="mt-4 space-y-4">
              {familyMembers.map((m, idx) => (
                <div key={m.id} className="rounded-lg p-4" style={{ background: "#f6f6f6", border: "1px solid #ececec" }}>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <RenderLabel text={txt("Full Name","पूरा नाम")} required={idx === 0} />
                      <Input
                        id="family.0.name"
                        name="family.0.name"
                        value={m.name}
                        onChange={(e: any) => { updateFamilyMember(m.id, "name", e.target.value); touch("family.0.name") }}
                        onBlur={() => touch("family.0.name")}
                        placeholder=""
                      />
                      {idx === 0 && errors["family.0.name"] && <div style={styles.errorText}>{errors["family.0.name"]}</div>}

                    </div>

                    <div>
                      <RenderLabel text={txt("Relation","रिश्ता")} />
                      <select value={m.relation} onChange={(e) => updateFamilyMember(m.id, "relation", e.target.value)} className="w-full rounded-xl px-4 py-3" style={{ border: "1px solid #e6e6e6" }}>
                        <option>{txt("Spouse","जीवनसाथी")}</option>
                        <option>{txt("Son","पुत्र")}</option>
                        <option>{txt("Daughter","पुत्री")}</option>
                        <option>{txt("Father","पिता")}</option>
                        <option>{txt("Mother","माता")}</option>
                        <option>{txt("Dependent","आश्रित")}</option>
                      </select>
                    </div>

                    <div>
                      <RenderLabel text={txt("Age / Date of Birth","आयु / जन्मतिथि")} required={idx === 0} />
                      {/* replaced text input with date picker */}
                      <Input
                        id="family.0.age"
                        name="family.0.age"
                        type="date"
                        placeholder={txt("DD/MM/YYYY","DD/MM/YYYY")}
                        value={m.age}
                        onChange={(e: any) => { updateFamilyMember(m.id, "age", e.target.value); touch("family.0.age") }}
                        onBlur={() => touch("family.0.age")}
                      />
                      {idx === 0 && errors["family.0.age"] && <div style={styles.errorText}>{errors["family.0.age"]}</div>}

                    </div>

                    <div>
                      <RenderLabel text={txt("Gender","लैंगिक")} />
                      <select value={m.gender} onChange={(e) => updateFamilyMember(m.id, "gender", e.target.value)} className="w-full rounded-xl px-4 py-3" style={{ border: "1px solid #e6e6e6" }}>
                        <option>{txt("Male","पुरुष")}</option>
                        <option>{txt("Female","महिला")}</option>
                        <option>{txt("Other","अन्य")}</option>
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <RenderLabel text={txt("Aadhaar Number (Optional)","आधार नंबर (वैकल्पिक)")} />
                      <Input value={m.aadhaar} onChange={(e: any) => updateFamilyMember(m.id, "aadhaar", String(e.target.value).replace(/\D/g, "").slice(0, 12))} placeholder={txt("Optional","वैकल्पिक")} />
                    </div>

                    <div className="md:col-span-2">
                      <RenderLabel text={txt("Unique Identification Mark (Optional)","विशिष्ट पहचान चिह्न (वैकल्पिक)")} />
                      <Input value={m.uniqueIdentificationMark} onChange={(e: any) => updateFamilyMember(m.id, "uniqueIdentificationMark", e.target.value)} placeholder={txt("Optional","वैकल्पिक")} />
                    </div>

                    <div className="md:col-span-2">
                      <RenderLabel text={txt("Supporting Document (Optional)","समर्थन दस्तावेज़ (वैकल्पिक)")} />

                      <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 6 }}>
                        <label htmlFor={`member-doc-${m.id}`} className="rounded-xl px-4 py-2" style={{ border: "1px solid #e6e6e6", background: "white", cursor: "pointer", fontWeight: 600 }}>
                          {txt("Choose file","फ़ाइल चुनें")}
                        </label>

                        <span style={{ color: "#6b7280", fontSize: 14 }}>{m.doc ? (m.doc instanceof File ? m.doc.name : (m.doc as any).name ?? txt("No file chosen","कोई फाइल नहीं")) : txt("No file chosen","कोई फाइल नहीं")}</span>
                      </div>

                      <input id={`member-doc-${m.id}`} type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => updateFamilyMember(m.id, "doc", e.currentTarget.files?.[0] || null)} style={{ display: "none" }} />
                    </div>
                  </div>

                  <div className="mt-3">
                    {idx !== 0 ? (
                      <button type="button" onClick={() => removeFamilyMember(m.id)} style={{ color: "#d32f2f", fontWeight: 600 }}>
                        {txt("Remove","हटाएँ")} ×
                      </button>
                    ) : (
                      <div style={{ height: 1 }} />
                    )}
                  </div>
                </div>
              ))}

              <div>
                <button type="button" onClick={addFamilyMember} className="rounded-xl px-4 py-3" style={{ background: "#f6f6f6", color: "#2e7d32", fontWeight: 700 }}>
                  <Plus style={{ marginRight: 8 }} /> {txt("Add member","सदस्य जोड़ें")}
                </button>
              </div>
            </div>

            {/* Forwarding officer & actions (moved AFTER family details) */}
            <div>
              <RenderLabel text={txt("Select Forwarding Officer","फॉरवर्डिंग अधिकारी चुनें")} required />
              <select className="rounded-xl px-4 py-3 w-full" style={{ border: "1px solid #e6e6e6", background: "white", appearance: "none" }} value={forwardingOfficer} onChange={(e) => { setForwardingOfficer(e.target.value); touch("forwardingOfficer") }} onBlur={() => touch("forwardingOfficer")} required>
                <option value="">{txt("Select Forwarding Officer","फॉरवर्डिंग अधिकारी चुनें")}</option>
                <option value="CO-001">{txt("Raj Kumar - Chief Officer","राज कुमार - मुख्य अधिकारी")}</option>
                <option value="AO-002">{txt("Priya Singh - Area Officer","प्रिया सिंह - क्षेत्र अधिकारी")}</option>
                <option value="DO-003">{txt("Amit Patel - District Officer","अमित पटेल - जिला अधिकारी")}</option>
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
                {txt("Save Draft","ड्राफ्ट सहेजें")}
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
                {txt("Submit Application","आवेदन जमा करें")}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Debug UI */}
      {debugAttempts.length > 0 && (
        <div style={styles.debugBox}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>{txt("Back navigation debug","बैक नेविगेशन डिबग")}</div>
          <div style={{ opacity: 0.85, fontSize: 11, marginBottom: 8 }}>{txt("Check console for the same messages.","कंसोल में समान संदेश देखें।")}</div>
          <ul style={{ paddingLeft: 14, margin: 0 }}>
            {debugAttempts.map((d, i) => (
              <li key={i} style={{ marginBottom: 6 }}>
                {d}
              </li>
            ))}
          </ul>
          <div style={{ marginTop: 8, fontSize: 11, opacity: 0.8 }}>{txt("If still 404, paste your dashboard file path (e.g. /app/dashboard/page.tsx)","यदि फिर भी 404 आता है, तो अपने डैशबोर्ड फ़ाइल पथ (उदा. /app/dashboard/page.tsx) पेस्ट करें")}</div>
        </div>
      )}
    </main>
  )
}
