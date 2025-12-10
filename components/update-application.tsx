"use client";

import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";

type Props = {
  onNavigate: (view: any, payload?: any) => void;
  language: "en" | "hi";
  userName?: string;
  payload?: any | null; // application object passed from Dashboard
};

type DocumentMeta = { name: string; url?: string };
type FormValues = {
  purpose?: string;
  department?: string;
  unit?: string;
  employeeNameEn?: string;
  employeeNameHi?: string;
  designationEn?: string;
  designationHi?: string;
  dateOfAppointment?: string;
  nearestRH?: string;
  placeOfWork?: string;
  payLevel?: string;
  email?: string;
  mobileNumber?: string;
  pinCode?: string;
  district?: string;
  state?: string;
  idCardNo?: string;
  residentialAddress?: string;
  uniqueIdentificationMark?: string;
  documents?: DocumentMeta[];
  [k: string]: any;
};

const DRAFT_KEY = "idcardDraft";
const LAST_KEY = "lastSubmittedApplication";

function readLocal(key: string) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
function writeLocal(key: string, v: any) {
  try {
    localStorage.setItem(key, JSON.stringify(v));
  } catch {}
}

// --- BEGIN: small helpers for per-employee persistence and submitted flag ---
// these are minimal, safe additions — they do not replace your draft/last flow.
// They allow saving a per-employee copy and a submitted flag if an employee id is available.
function _setSubmittedFlagForEmp(empNo?: string) {
  if (!empNo) return;
  try {
    localStorage.setItem(`idcard_submitted_${empNo}`, "true");
  } catch {}
}
function _savePerEmpData(empNo?: string, formData?: any) {
  if (!empNo || !formData) return;
  try {
    // store plain object so other components (preview/update) can read it easily
    localStorage.setItem(`idcard_data_${empNo}`, JSON.stringify(formData));
  } catch {}
}
// --- END: helpers ---

export default function UpdateApplication({
  onNavigate,
  language,
  userName = "John Doe",
  payload,
}: Props) {
  const empty: FormValues = {
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
    email: "",
    mobileNumber: "",
    pinCode: "",
    district: "",
    state: "",
    idCardNo: "",
    residentialAddress: "",
    uniqueIdentificationMark: "",
    documents: [],
  };

  const [values, setValues] = useState<FormValues>(empty);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    // If caller provided an employee identifier (payload.empNo), prefer per-employee saved data
    const empNoFromPayload =
      payload?.empNo ?? payload?.formData?.empNo ?? (values as any).empNo;
    if (empNoFromPayload) {
      try {
        const rawPerEmp = localStorage.getItem(`idcard_data_${empNoFromPayload}`);
        if (rawPerEmp) {
          const parsed = JSON.parse(rawPerEmp);
          // parsed may be the raw form object or a wrapper — we try both
          const source = parsed?.formData ?? parsed;
          setValues((s) => ({ ...s, ...(source ?? {}) }));
          return;
        }
      } catch {
        // ignore parse errors, fall back to other sources below
      }
    }

    if (payload?.formData) {
      setValues((s) => ({ ...s, ...(payload.formData ?? {}) }));
      return;
    }

    const draft = readLocal(DRAFT_KEY);
    if (draft?.formData) {
      setValues((s) => ({ ...s, ...(draft.formData ?? {}) }));
      return;
    }

    const last = readLocal(LAST_KEY);
    if (last?.formData) {
      setValues((s) => ({ ...s, ...(last.formData ?? {}) }));
      return;
    }

    setValues((s) => ({ ...s, employeeNameEn: userName }));
  }, []); // stable dependency array

  function updateField<K extends keyof FormValues>(k: K, v: FormValues[K]) {
    setValues((s) => ({ ...s, [k]: v }));
  }

  function handleFileAdd(f: File) {
    const doc = { name: f.name };
    setValues((s) => ({ ...s, documents: [...(s.documents ?? []), doc] }));
  }

  function handleFileRemove(idx: number) {
    setValues((s) => ({
      ...s,
      documents: (s.documents ?? []).filter((_, i) => i !== idx),
    }));
  }

  function save() {
    const draft = {
      id: (values as any).id ?? `draft-${Date.now()}`,
      formData: values,
      uploadedFilesMeta: values.documents ?? [],
      updatedAt: new Date().toISOString(),
    };
    writeLocal(DRAFT_KEY, draft);

    // ALSO persist as the "last submitted" application so preview reads updated values
    writeLocal(LAST_KEY, draft);

    // If an empNo is available from payload.formData or payload.empNo or values.empNo,
    // save per-employee data and set the submitted flag so other parts of app can disable Apply.
    const empNo =
      payload?.empNo ?? payload?.formData?.empNo ?? (values as any).empNo ?? null;
    if (empNo) {
      try {
        _savePerEmpData(empNo, values);
        _setSubmittedFlagForEmp(empNo);
      } catch {
        // ignore storage errors
      }
    }

    setMsg("Saved.");
    setTimeout(() => {
      setMsg(null);
      onNavigate("dashboard");
    }, 700);
  }

  function cancel() {
    onNavigate("dashboard");
  }

  const inputClass = "mt-2 p-3 border rounded-2xl w-full";
  const textareaClass = "mt-2 p-4 border rounded-2xl w-full resize-none";

  return (
    <div className="min-h-[calc(100vh-100px)] py-10 px-6 bg-slate-50">
      <div className="max-w-5xl mx-auto">
        <div className="mb-4 flex items-center gap-3">
          <button onClick={cancel} className="px-3 py-1 border rounded">
            ← Back
          </button>
          <h2 className="text-2xl font-semibold">Update Application</h2>
        </div>

        <Card className="p-6 bg-white">
          {msg && <div className="mb-3 text-sm text-slate-700">{msg}</div>}

          <h3 className="text-lg font-bold mb-4">
            SECTION B — EMPLOYEE DETAILS
          </h3>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Purpose */}
            <label className="flex flex-col text-sm">
              <span className="font-medium">Purpose of Making ID Card *</span>
              <select
                value={values.purpose ?? ""}
                onChange={(e) => updateField("purpose", e.target.value)}
                className={inputClass}
              >
                <option value="">Select Purpose</option>
                <option value="new">New</option>
                <option value="replacement">Replacement</option>
                <option value="update">Update</option>
              </select>
            </label>

            {/* Department */}
            <label className="flex flex-col text-sm">
              <span className="font-medium">Department *</span>
              <input
                value={values.department ?? ""}
                onChange={(e) => updateField("department", e.target.value)}
                className={inputClass}
              />
            </label>

            {/* Unit */}
            <label className="flex flex-col text-sm">
              <span className="font-medium">Unit *</span>
              <input
                value={values.unit ?? ""}
                onChange={(e) => updateField("unit", e.target.value)}
                className={inputClass}
              />
            </label>

            {/* Employee Name EN */}
            <label className="flex flex-col text-sm">
              <span className="font-medium">Employee Name (English) *</span>
              <input
                value={values.employeeNameEn ?? ""}
                onChange={(e) => {
                  updateField("employeeNameEn", e.target.value);
                  if (!values.employeeNameHi)
                    updateField("employeeNameHi", e.target.value);
                }}
                className={inputClass}
              />
            </label>

            {/* Designation EN */}
            <label className="flex flex-col text-sm">
              <span className="font-medium">Designation (English) *</span>
              <input
                value={values.designationEn ?? ""}
                onChange={(e) => {
                  updateField("designationEn", e.target.value);
                  if (!values.designationHi)
                    updateField("designationHi", e.target.value);
                }}
                className={inputClass}
              />
            </label>

            {/* Employee Name HI */}
            <label className="flex flex-col text-sm">
              <span className="font-medium">Employee Name (Hindi)</span>
              <input
                value={values.employeeNameHi ?? ""}
                onChange={(e) => updateField("employeeNameHi", e.target.value)}
                className={inputClass}
              />
            </label>

            {/* Designation HI */}
            <label className="flex flex-col text-sm">
              <span className="font-medium">Designation (Hindi)</span>
              <input
                value={values.designationHi ?? ""}
                onChange={(e) => updateField("designationHi", e.target.value)}
                className={inputClass}
              />
            </label>

            {/* Date of Appointment */}
            <label className="flex flex-col text-sm">
              <span className="font-medium">Date of Appointment *</span>
              <input
                type="date"
                value={values.dateOfAppointment ?? ""}
                onChange={(e) =>
                  updateField("dateOfAppointment", e.target.value)
                }
                className={inputClass}
              />
            </label>

            {/* Nearest RH */}
            <label className="flex flex-col text-sm">
              <span className="font-medium">Nearest RH/HU *</span>
              <input
                value={values.nearestRH ?? ""}
                onChange={(e) => updateField("nearestRH", e.target.value)}
                className={inputClass}
              />
            </label>

            {/* Place of Work */}
            <label className="flex flex-col text-sm">
              <span className="font-medium">Place of Work *</span>
              <input
                value={values.placeOfWork ?? ""}
                onChange={(e) => updateField("placeOfWork", e.target.value)}
                className={inputClass}
              />
            </label>

            {/* Pay Level */}
            <label className="flex flex-col text-sm">
              <span className="font-medium">Pay Level *</span>
              <input
                value={values.payLevel ?? ""}
                onChange={(e) => updateField("payLevel", e.target.value)}
                className={inputClass}
              />
            </label>

            {/* Email */}
            <label className="flex flex-col text-sm">
              <span className="font-medium">Email *</span>
              <input
                type="email"
                value={values.email ?? ""}
                onChange={(e) => updateField("email", e.target.value)}
                className={inputClass}
              />
            </label>

            {/* Mobile */}
            <label className="flex flex-col text-sm">
              <span className="font-medium">Mobile Number *</span>
              <input
                value={values.mobileNumber ?? ""}
                onChange={(e) => updateField("mobileNumber", e.target.value)}
                className={inputClass}
              />
            </label>

            {/* Pin Code */}
            <label className="flex flex-col text-sm">
              <span className="font-medium">Pin Code *</span>
              <input
                value={values.pinCode ?? ""}
                onChange={(e) => updateField("pinCode", e.target.value)}
                className={inputClass}
              />
            </label>

            {/* District */}
            <label className="flex flex-col text-sm">
              <span className="font-medium">District *</span>
              <input
                value={values.district ?? ""}
                onChange={(e) => updateField("district", e.target.value)}
                className={inputClass}
              />
            </label>

            {/* State */}
            <label className="flex flex-col text-sm">
              <span className="font-medium">State *</span>
              <input
                value={values.state ?? ""}
                onChange={(e) => updateField("state", e.target.value)}
                className={inputClass}
              />
            </label>

            {/* ID Card No */}
            <label className="flex flex-col text-sm md:col-span-2">
              <span className="font-medium">ID Card No (if applicable)</span>
              <input
                value={values.idCardNo ?? ""}
                onChange={(e) => updateField("idCardNo", e.target.value)}
                className={inputClass}
              />
            </label>

            {/* Residential Address */}
            <label className="flex flex-col text-sm md:col-span-2">
              <span className="font-medium">Residential Address *</span>
              <textarea
                value={values.residentialAddress ?? ""}
                onChange={(e) =>
                  updateField("residentialAddress", e.target.value)
                }
                className={textareaClass}
                rows={4}
              />
            </label>

            {/* Unique ID Mark */}
            <label className="flex flex-col text-sm md:col-span-2">
              <span className="font-medium">Unique Identification Mark</span>
              <input
                value={values.uniqueIdentificationMark ?? ""}
                onChange={(e) =>
                  updateField("uniqueIdentificationMark", e.target.value)
                }
                className={inputClass}
              />
            </label>

            {/* Upload Section */}
            <div className="md:col-span-2">
              <div className="font-medium mb-2">Upload Documents</div>

              <div className="border-2 border-dashed border-green-600 rounded-2xl p-6 flex items-center justify-center text-center bg-green-50 relative">
                <div>
                  <div className="text-2xl mb-2">⬆</div>
                  <div className="font-semibold">Upload Documents</div>
                  <div className="text-sm text-slate-600 mt-1">
                    PDF, JPG, PNG (Max 5 MB each)
                  </div>
                  <div className="text-sm text-green-700 mt-2">
                    Click to upload or drag files here
                  </div>

                  {/* Hidden file input */}
                  <input
                    id="docInput"
                    type="file"
                    accept=".pdf,image/*"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleFileAdd(f);
                      e.target.value = "";
                    }}
                    className="hidden"
                  />

                  <label
                    htmlFor="docInput"
                    className="inline-block mt-3 px-4 py-2 border rounded cursor-pointer bg-white text-green-700 font-medium"
                  >
                    Choose file
                  </label>
                </div>
              </div>

              <ul className="mt-3 ml-4">
                {(values.documents ?? []).map((d, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <span>{d.name}</span>
                    <button
                      onClick={() => handleFileRemove(i)}
                      className="text-xs text-red-600 ml-2"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Save / Cancel */}
          <div className="mt-6 flex gap-3 justify-end">
            <button onClick={cancel} className="px-5 py-2 border rounded-2xl">
              Cancel
            </button>
            <button
              onClick={save}
              className="px-5 py-2 bg-green-700 text-white rounded-2xl"
            >
              Save
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}
