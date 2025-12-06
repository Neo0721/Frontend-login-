"use client"

import React, { useState } from "react"
import Link from "next/link"
import { ChevronDown, ChevronUp, X, Upload, AlertCircle, Plus } from "lucide-react"
import { Input } from "@/components/ui/input"

interface IdCardFormProps {
  onNavigate: (view: any) => void
  language: "en" | "hi"
  onCancel?: () => void
}

type FamilyMember = {
  id: string
  name: string
  relation: string
  age: string
  gender: string
  aadhaar: string
  uniqueIdentificationMark: string
  doc: File | null
}

export default function IdCardForm({ onNavigate, language }: IdCardFormProps) {
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
    { id: "A", title: txt("A. New Appointment / Transfer"), docs: [txt("Memorandum / Transfer Letter Copy"), txt("Charge Report Copy"), txt("Current Address Proof Copy")] },
    { id: "B", title: txt("B. Promotion"), docs: [txt("Promotion Order Copy")] },
    { id: "C", title: txt("C. Lost Identity Card"), docs: [txt("Police FIR/NRIC")] },
    { id: "D", title: txt("D. Damage Card"), docs: [txt("Damaged Card + Report")] },
    { id: "E", title: txt("E. Inclusion of Dependents / Family Members"), docs: [txt("Marriage / Birth Certificate")] },
    { id: "F", title: txt("F. Correction"), docs: [txt("Supporting Documents for Correction")] },
  ]

  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
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

  // moved errors state INSIDE the component (was incorrectly placed at top-level earlier)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files
    if (!files) return
    const maxSize = 5 * 1024 * 1024
    const valid: File[] = []
    for (let i = 0; i < files.length; i++) {
      const f = files[i]
      if (f.size <= maxSize) valid.push(f)
    }
    setUploadedFiles((p) => [...p, ...valid])
  }

  const removeFile = (index: number) => setUploadedFiles((p) => p.filter((_, i) => i !== index))

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

  // Prevent removing the last member; also protect first (primary) member.
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

    // basic required fields
    if (!formData.purpose) e.purpose = txt("Purpose is required.")
    if (!formData.department) e.department = txt("Department is required.")
    if (!formData.unit?.trim()) e.unit = txt("Unit is required.")
    if (!formData.employeeNameEn?.trim()) e.employeeNameEn = txt("Employee name is required.")
    if (!formData.designationEn?.trim()) e.designationEn = txt("Designation is required.")
    if (!formData.dateOfAppointment) e.dateOfAppointment = txt("Date of appointment is required.")
    if (!formData.residentialAddress?.trim()) e.residentialAddress = txt("Residential address is required.")

    // email format
    if (!formData.email) {
      e.email = txt("Email is required.")
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      e.email = txt("Enter a valid email.")
    }

    // mobile number basic check (10 digits)
    if (!formData.mobileNumber) {
      e.mobileNumber = txt("Mobile number is required.")
    } else if (!/^\d{10}$/.test(formData.mobileNumber)) {
      e.mobileNumber = txt("Enter a valid 10-digit mobile number.")
    }

    if (!forwardingOfficer) e.forwardingOfficer = txt("Select a forwarding officer.")

    // family validation: must have at least one; primary member must have name and age
    if (!familyMembers || familyMembers.length === 0) {
      e.family = txt("Add at least one family member.")
    } else {
      const primary = familyMembers[0]
      if (!primary.name?.trim()) e["family.0.name"] = txt("Primary member name is required.")
      if (!primary.age?.trim()) e["family.0.age"] = txt("Primary member DOB is required.")
    }

    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) {
      // focus/scroll to first error could be added here
      console.log("Validation failed", errors)
      return
    }

    // passed validation -> continue
    alert(txt("Application submitted"))
    onNavigate?.("application-status")
  }
  // ---------- end validation ----------

  // Inline style fallbacks to match the screenshots' look.
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
  }

  return (
    <main className="min-h-screen py-8" style={{ background: "var(--page-bg, #fafafa)" }}>
      <div className="max-w-6xl mx-auto px-6">
        <Link href="/dashboard" className="text-green-700 font-semibold inline-flex items-center mb-6">
          ← {txt("Back")}
        </Link>

        <div className="card-elevated rounded-2xl p-8" style={{ background: "white" }}>
          <h1 className="heading-lg mb-6" style={{ fontSize: 28, fontWeight: 700, color: "#0b3355" }}>
            {txt("Apply for Identity Card")}
          </h1>

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

          <form onSubmit={handleSubmit} className="mt-6 space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label style={styles.label}>{txt("Purpose of Making ID Card")}</label>
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
                <label style={styles.label}>{txt("Department")}</label>
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
                <label style={styles.label}>{txt("Unit")}</label>
                <Input
                  className="rounded-xl"
                  value={formData.unit}
                  onChange={(e: any) => setFormData((s) => ({ ...s, unit: e.target.value }))}
                  required
                />
                {errors.unit && <div style={styles.errorText}>{errors.unit}</div>}
              </div>

              <div>
                <label style={styles.label}>{txt("Employee Name (English)")}</label>
                <Input
                  className="rounded-xl"
                  value={formData.employeeNameEn}
                  onChange={(e: any) => setFormData((s) => ({ ...s, employeeNameEn: e.target.value }))}
                  required
                />
                {errors.employeeNameEn && <div style={styles.errorText}>{errors.employeeNameEn}</div>}
              </div>

              {language === "hi" && (
                <div>
                  <label style={styles.label}>{txt("Employee Name (Hindi)")}</label>
                  <Input
                    className="rounded-xl"
                    value={formData.employeeNameHi}
                    onChange={(e: any) => setFormData((s) => ({ ...s, employeeNameHi: e.target.value }))}
                  />
                </div>
              )}

              <div>
                <label style={styles.label}>{txt("Designation (English)")}</label>
                <Input
                  className="rounded-xl"
                  value={formData.designationEn}
                  onChange={(e: any) => setFormData((s) => ({ ...s, designationEn: e.target.value }))}
                  required
                />
                {errors.designationEn && <div style={styles.errorText}>{errors.designationEn}</div>}
              </div>

              <div>
                <label style={styles.label}>{txt("Date of Appointment")}</label>
                <Input
                  type="date"
                  className="rounded-xl"
                  value={formData.dateOfAppointment}
                  onChange={(e: any) => setFormData((s) => ({ ...s, dateOfAppointment: e.target.value }))}
                  required
                />
                {errors.dateOfAppointment && <div style={styles.errorText}>{errors.dateOfAppointment}</div>}
              </div>

              <div>
                <label style={styles.label}>{txt("Nearest RH/HU")}</label>
                <Input
                  className="rounded-xl"
                  value={formData.nearestRH}
                  onChange={(e: any) => setFormData((s) => ({ ...s, nearestRH: e.target.value }))}
                  required
                />
              </div>

              <div>
                <label style={styles.label}>{txt("Place of Work")}</label>
                <Input
                  className="rounded-xl"
                  value={formData.placeOfWork}
                  onChange={(e: any) => setFormData((s) => ({ ...s, placeOfWork: e.target.value }))}
                  required
                />
              </div>

              <div>
                <label style={styles.label}>{txt("Pay Level")}</label>
                <Input
                  className="rounded-xl"
                  value={formData.payLevel}
                  onChange={(e: any) => setFormData((s) => ({ ...s, payLevel: e.target.value }))}
                  required
                />
              </div>

              <div>
                <label style={styles.label}>{txt("Email")}</label>
                <Input
                  type="email"
                  className="rounded-xl"
                  value={formData.email}
                  onChange={(e: any) => setFormData((s) => ({ ...s, email: e.target.value }))}
                  required
                />
                {errors.email && <div style={styles.errorText}>{errors.email}</div>}
              </div>

              <div>
                <label style={styles.label}>{txt("Mobile Number")}</label>
                <Input
                  type="tel"
                  className="rounded-xl"
                  value={formData.mobileNumber}
                  onChange={(e: any) => setFormData((s) => ({ ...s, mobileNumber: e.target.value }))}
                  required
                />
                {errors.mobileNumber && <div style={styles.errorText}>{errors.mobileNumber}</div>}
              </div>

              <div>
                <label style={styles.label}>{txt("Pin Code")}</label>
                <Input
                  className="rounded-xl"
                  value={formData.pinCode}
                  onChange={(e: any) => setFormData((s) => ({ ...s, pinCode: e.target.value }))}
                  required
                />
              </div>

              <div>
                <label style={styles.label}>{txt("District")}</label>
                <Input
                  className="rounded-xl"
                  value={formData.district}
                  onChange={(e: any) => setFormData((s) => ({ ...s, district: e.target.value }))}
                  required
                />
              </div>

              <div>
                <label style={styles.label}>{txt("State")}</label>
                <Input
                  className="rounded-xl"
                  value={formData.state}
                  onChange={(e: any) => setFormData((s) => ({ ...s, state: e.target.value }))}
                  required
                />
              </div>

              <div>
                <label style={styles.label}>{txt("ID Card No (if applicable)")}</label>
                <Input
                  className="rounded-xl"
                  value={formData.idCardNo}
                  onChange={(e: any) => setFormData((s) => ({ ...s, idCardNo: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <label style={styles.label}>{txt("Residential Address")}</label>
              <textarea
                value={formData.residentialAddress}
                onChange={(e) => setFormData((s) => ({ ...s, residentialAddress: e.target.value }))}
                className="w-full rounded-xl p-4"
                style={{ minHeight: 120, border: "1px solid #e6e6e6" }}
                required
              />
              {errors.residentialAddress && <div style={styles.errorText}>{errors.residentialAddress}</div>}
            </div>

            {/* NEW FIELD: Unique Identification Mark for employee */}
            <div>
              <label style={styles.label}>{txt("Unique Identification Mark")}</label>
              <Input
                className="rounded-xl"
                value={formData.uniqueIdentificationMark}
                onChange={(e: any) =>
                  setFormData((s) => ({ ...s, uniqueIdentificationMark: e.target.value }))
                }
                placeholder={txt("Optional")}
              />
            </div>

            <div>
              <label style={styles.label}>{txt("Upload Documents")}</label>
              <div style={styles.dashedBox}>
                <Upload className="mx-auto" style={{ width: 36, height: 36, color: "#2e7d32" }} />
                <div style={{ fontWeight: 700, marginTop: 8 }}>{txt("Upload Documents")}</div>
                <div style={{ color: "#6b7280", marginTop: 2 }}>PDF, JPG, PNG (Max 5 MB each)</div>
                <input
                  id="uploadFiles"
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileUpload}
                  style={{ display: "none" }}
                />
                <label
                  htmlFor="uploadFiles"
                  style={{ display: "block", marginTop: 8, cursor: "pointer", color: "#2e7d32" }}
                >
                  {txt("Click to upload or drag files here")}
                </label>
              </div>

              {uploadedFiles.length > 0 && (
                <div className="mt-3 space-y-2">
                  {uploadedFiles.map((f, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3 rounded-md"
                      style={{ background: "#f6f6f6" }}
                    >
                      <div
                        style={{
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {f.name}
                      </div>
                      <button type="button" onClick={() => removeFile(i)} style={{ color: "#d32f2f" }}>
                        <X />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label style={styles.label}>{txt("Select Forwarding Officer *")}</label>
              <select
                className="rounded-xl px-4 py-3 w-full"
                style={{ border: "1px solid #e6e6e6", background: "white", appearance: "none" }}
                value={forwardingOfficer}
                onChange={(e) => setForwardingOfficer(e.target.value)}
                required
              >
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
                onClick={() => alert(txt("Draft saved"))}
                className="flex-1 border-2 rounded-xl"
                style={{ padding: "18px 28px", borderColor: "#0b3355", color: "#0b3355", fontWeight: 600 }}
              >
                {txt("Save Draft")}
              </button>

              <button
                type="submit"
                className="flex-1 rounded-xl"
                style={{ padding: "18px 28px", background: "#2e7d32", color: "white", fontWeight: 600 }}
              >
                {txt("Submit Application")}
              </button>
            </div>
          </form>

          {/* SECTION C */}
          <hr className="my-6" style={{ borderColor: "#eee" }} />
          <h3 style={{ ...styles.sectionHeading }}>SECTION C – FAMILY DETAILS</h3>

          <div className="mt-4 space-y-4">
            {familyMembers.map((m, idx) => (
              <div
                key={m.id}
                className="rounded-lg p-4"
                style={{ background: "#f6f6f6", border: "1px solid #ececec" }}
              >
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label style={styles.label}>{txt("Full Name")}</label>
                    <Input
                      value={m.name}
                      onChange={(e: any) => updateFamilyMember(m.id, "name", e.target.value)}
                      placeholder=""
                    />
                    {idx === 0 && errors["family.0.name"] && <div style={styles.errorText}>{errors["family.0.name"]}</div>}
                  </div>

                  <div>
                    <label style={styles.label}>{txt("Relation")}</label>
                    <select
                      value={m.relation}
                      onChange={(e) => updateFamilyMember(m.id, "relation", e.target.value)}
                      className="w-full rounded-xl px-4 py-3"
                      style={{ border: "1px solid #e6e6e6" }}
                    >
                      <option>Spouse</option>
                      <option>Son</option>
                      <option>Daughter</option>
                      <option>Father</option>
                      <option>Mother</option>
                      <option>Dependent</option>
                    </select>
                  </div>

                  <div>
                    <label style={styles.label}>{txt("Age / Date of Birth")}</label>
                    <Input
                      placeholder="DD/MM/YYYY"
                      value={m.age}
                      onChange={(e: any) => updateFamilyMember(m.id, "age", e.target.value)}
                    />
                    {idx === 0 && errors["family.0.age"] && <div style={styles.errorText}>{errors["family.0.age"]}</div>}
                  </div>

                  <div>
                    <label style={styles.label}>{txt("Gender")}</label>
                    <select
                      value={m.gender}
                      onChange={(e) => updateFamilyMember(m.id, "gender", e.target.value)}
                      className="w-full rounded-xl px-4 py-3"
                      style={{ border: "1px solid #e6e6e6" }}
                    >
                      <option>Male</option>
                      <option>Female</option>
                      <option>Other</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label style={styles.label}>{txt("Aadhaar Number (Optional)")}</label>
                    <Input
                      value={m.aadhaar}
                      onChange={(e: any) => updateFamilyMember(m.id, "aadhaar", e.target.value)}
                      placeholder={txt("Optional")}
                    />
                  </div>

                  {/* NEW FIELD: Unique Identification Mark per family member */}
                  <div className="md:col-span-2">
                    <label style={styles.label}>
                      {txt("Unique Identification Mark (Optional)")}
                    </label>
                    <Input
                      value={m.uniqueIdentificationMark}
                      onChange={(e: any) =>
                        updateFamilyMember(m.id, "uniqueIdentificationMark", e.target.value)
                      }
                      placeholder={txt("Optional")}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label style={styles.label}>{txt("Supporting Document (Optional)")}</label>

                    {/* visible choose button + filename */}
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 6 }}>
                      <label
                        htmlFor={`member-doc-${m.id}`}
                        className="rounded-xl px-4 py-2"
                        style={{
                          border: "1px solid #e6e6e6",
                          background: "white",
                          cursor: "pointer",
                          fontWeight: 600,
                        }}
                      >
                        {txt("Choose file")}
                      </label>

                      <span style={{ color: "#6b7280", fontSize: 14 }}>
                        {m.doc ? m.doc.name : txt("No file chosen")}
                      </span>
                    </div>

                    {/* hidden input that the label activates; unique id per member */}
                    <input
                      id={`member-doc-${m.id}`}
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => updateFamilyMember(m.id, "doc", e.currentTarget.files?.[0] || null)}
                      style={{ display: "none" }}
                    />
                  </div>
                </div>

                <div className="mt-3">
                  {idx !== 0 ? (
                    <button
                      type="button"
                      onClick={() => removeFamilyMember(m.id)}
                      style={{ color: "#d32f2f", fontWeight: 600 }}
                    >
                      {txt("Remove")} ×
                    </button>
                  ) : (
                    <div style={{ height: 1 }} />
                  )}
                </div>
              </div>
            ))}

            <div>
              <button
                type="button"
                onClick={addFamilyMember}
                className="rounded-xl px-4 py-3"
                style={{ background: "#f6f6f6", color: "#2e7d32", fontWeight: 700 }}
              >
                <Plus style={{ marginRight: 8 }} /> {txt("Add member")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
