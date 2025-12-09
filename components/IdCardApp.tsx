"use client";

import React, { useEffect, useState } from "react";

/**
 * components/IdCardApp.tsx
 *
 * Single-file client component implementing:
 *  - Dashboard (Preview / Update / Apply)
 *  - Preview modal (read-only)
 *  - Apply form (save draft & submit)
 *  - Update form (prefill draft/lastSubmitted, save draft & submit)
 *
 * Storage keys:
 *  - idcardDraft
 *  - lastSubmittedApplication
 *
 * NOTE: This is a dev-friendly, self-contained implementation. Replace or adapt UI to use your own Input/Button components.
 */

// ---------- Types ----------
type Doc = { name: string; url?: string };

type FormValues = {
  employeeNameEn: string;
  employeeNameHi?: string;
  employeeNo?: string;
  designation?: string;
  designationHi?: string;
  department?: string;
  mobileNumber?: string;
  dateOfAppointment?: string;
  dateOfBirth?: string;
  address?: string;
  officeLocation?: string;
  manager?: string;
  employeeType?: string;
  gender?: string;
  maritalStatus?: string;
  bloodGroup?: string;
  emergencyContact?: string;
  photoUrl?: string;
  documents?: Doc[];
  notes?: string;
  [k: string]: any;
};

type Application = {
  id?: string;
  formData?: FormValues;
  name?: string;
  employeeNo?: string;
  department?: string;
  status?: string;
  submittedAt?: string;
  documents?: (string | Doc)[];
  photoUrl?: string;
  statusHistory?: { status: string; at?: string }[];
};

// ---------- Helpers ----------
const DRAFT_KEY = "idcardDraft";
const LAST_KEY = "lastSubmittedApplication";

function readDraft() {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
function writeDraft(d: any) {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(d));
  } catch {}
}
function clearDraft() {
  try {
    localStorage.removeItem(DRAFT_KEY);
  } catch {}
}
function readLast() {
  try {
    const raw = localStorage.getItem(LAST_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
function writeLast(o: any) {
  try {
    localStorage.setItem(LAST_KEY, JSON.stringify(o));
  } catch {}
}
function fmtDate(d?: string | null) {
  if (!d) return "—";
  try {
    const dt = new Date(d);
    if (isNaN(dt.getTime())) return d;
    return dt.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  } catch {
    return d;
  }
}
function exampleApplication(emp = "EMP001"): Application {
  return {
    id: "example-1",
    name: "John Doe",
    employeeNo: emp,
    department: "Engineering",
    status: "Submitted",
    submittedAt: new Date().toISOString(),
    documents: ["Passport (uploaded)", "Address proof (uploaded)"],
  };
}

// ---------- Mock "server" submit (client-side) ----------
async function mockSubmit(formData: FormValues) {
  await new Promise((res) => setTimeout(res, 300));
  const resp = {
    id: formData.employeeNo ?? `srv-${Date.now()}`,
    formData,
    name: formData.employeeNameEn,
    employeeNo: formData.employeeNo,
    department: formData.department,
    status: "Submitted",
    submittedAt: new Date().toISOString(),
  };
  writeLast(resp);
  clearDraft();
  return resp;
}

// ---------- Components ----------
function PreviewModal({
  application,
  loadedFrom,
  onClose,
}: {
  application: Application | null;
  loadedFrom?: string | null;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-[92%] max-w-xl mx-auto p-6 z-10">
        <button className="absolute right-4 top-4 text-slate-500 hover:text-slate-800" onClick={onClose} aria-label="Close">
          ✕
        </button>
        <h4 className="text-lg font-semibold mb-2">Application Details</h4>

        {loadedFrom && <div className="text-xs text-amber-700 mb-2">{loadedFrom}</div>}

        {application ? (
          <div className="space-y-3 text-sm text-slate-700">
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <div className="flex justify-between"><span className="font-medium">Name</span><span>{application.formData?.employeeNameEn ?? application.name ?? "—"}</span></div>
                <div className="flex justify-between"><span className="font-medium">Employee No</span><span>{application.employeeNo ?? "—"}</span></div>
                <div className="flex justify-between"><span className="font-medium">Department</span><span>{application.formData?.department ?? application.department ?? "—"}</span></div>
                <div className="flex justify-between"><span className="font-medium">Designation</span><span>{application.formData?.designation ?? "—"}</span></div>
                <div className="flex justify-between"><span className="font-medium">Designation (Hindi)</span><span>{application.formData?.designationHi ?? "—"}</span></div>
                <div className="flex justify-between"><span className="font-medium">Date of Birth</span><span>{fmtDate(application.formData?.dateOfBirth)}</span></div>
                <div className="flex justify-between"><span className="font-medium">Mobile</span><span>{application.formData?.mobileNumber ?? "—"}</span></div>
              </div>

              <div className="w-28 h-28 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                {application.photoUrl ? <img src={application.photoUrl} alt="photo" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-xs text-slate-500">No photo</div>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div className="flex justify-between"><span className="font-medium">Joining Date</span><span>{fmtDate(application.formData?.dateOfAppointment ?? application.submittedAt)}</span></div>
              <div className="flex justify-between"><span className="font-medium">Office Location</span><span>{application.formData?.officeLocation ?? "—"}</span></div>
              <div className="flex justify-between"><span className="font-medium">Manager</span><span>{application.formData?.manager ?? "—"}</span></div>
              <div className="flex justify-between"><span className="font-medium">Employee Type</span><span>{application.formData?.employeeType ?? "—"}</span></div>
              <div className="flex justify-between"><span className="font-medium">Gender</span><span>{application.formData?.gender ?? "—"}</span></div>
              <div className="flex justify-between"><span className="font-medium">Marital Status</span><span>{application.formData?.maritalStatus ?? "—"}</span></div>
              <div className="flex justify-between"><span className="font-medium">Address</span><span className="text-right max-w-[55%]">{application.formData?.address ?? "—"}</span></div>
              <div className="flex justify-between"><span className="font-medium">Blood Group</span><span>{application.formData?.bloodGroup ?? "—"}</span></div>
              <div className="flex justify-between"><span className="font-medium">Emergency Contact</span><span>{application.formData?.emergencyContact ?? "—"}</span></div>
            </div>

            <div>
              <div className="font-medium">Documents</div>
              <ul className="list-disc ml-5 mt-1 text-slate-600">
                {application.documents && application.documents.length > 0 ? (
                  application.documents.map((d, i) => {
                    if (typeof d === "string") return <li key={i} className="flex items-center gap-3"><span>{d}</span><span className="ml-2 text-xs text-slate-500">(no preview available)</span></li>;
                    return <li key={i} className="flex items-center gap-3"><a className="underline" href={d.url ?? "#"} target="_blank" rel="noreferrer">{d.name}</a></li>;
                  })
                ) : (
                  <li className="text-slate-500">No documents available</li>
                )}
              </ul>
            </div>

            <div>
              <div className="flex justify-between"><span className="font-medium">Status</span><span className="text-sm font-semibold">{application.status ?? "—"}</span></div>
              <div className="flex justify-between"><span className="font-medium">Submitted</span><span>{fmtDate(application.submittedAt)}</span></div>
            </div>

            <div className="text-right">
              <button onClick={onClose} className="px-4 py-2 bg-blue-600 text-white rounded">Close</button>
            </div>
          </div>
        ) : (
          <div className="py-6 text-center text-sm text-slate-700">No application found.</div>
        )}
      </div>
    </div>
  );
}

// ---------- Apply form ----------
function IdCardForm({ onCancel, onSaved, onSubmitted }: { onCancel?: () => void; onSaved?: (d: any) => void; onSubmitted?: (resp: any) => void }) {
  const defaults: FormValues = {
    employeeNameEn: "",
    employeeNameHi: "",
    employeeNo: "",
    designation: "",
    designationHi: "",
    department: "",
    mobileNumber: "",
    dateOfAppointment: "",
    dateOfBirth: "",
    address: "",
    photoUrl: "",
    documents: [],
  };

  const [values, setValues] = useState<FormValues>(defaults);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    const draft = readDraft();
    if (draft?.formData) {
      setValues((v) => ({ ...v, ...draft.formData }));
      setMsg("Loaded saved draft.");
      setTimeout(() => setMsg(null), 1500);
      return;
    }
    const last = readLast();
    if (last?.formData) {
      setValues((v) => ({ ...v, ...last.formData }));
      setMsg("Loaded last submitted application.");
      setTimeout(() => setMsg(null), 1500);
    }
  }, []);

  function updateField<K extends keyof FormValues>(k: K, val: FormValues[K]) {
    setValues((s) => ({ ...s, [k]: val }));
  }

  function saveDraft() {
    const draft = {
      id: (values as any).id ?? `draft-${Date.now()}`,
      formData: values,
      uploadedFilesMeta: values.documents ?? [],
      updatedAt: new Date().toISOString(),
    };
    writeDraft(draft);
    setMsg("Draft saved locally.");
    onSaved?.(draft);
    setTimeout(() => setMsg(null), 1800);
  }

  async function submit() {
    if (!values.employeeNameEn || !values.designation || !values.department || !values.mobileNumber || !values.dateOfAppointment) {
      setMsg("Please fill required fields (Name, Designation, Department, Mobile, Joining Date).");
      return;
    }
    try {
      setMsg("Submitting...");
      // Attempt real API first — if it fails, fallback to mockSubmit
      try {
        const res = await fetch(`/api/idcard`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ formData: values }),
        });
        if (res.ok) {
          const data = await res.json();
          writeLast(data);
          clearDraft();
          setMsg("Submitted successfully (server).");
          onSubmitted?.(data);
          setTimeout(() => setMsg(null), 1200);
          return;
        }
        // else fallback:
      } catch (e) {
        // fallback to local mock
      }
      const resp = await mockSubmit(values);
      setMsg("Submitted successfully (local).");
      onSubmitted?.(resp);
      setTimeout(() => setMsg(null), 1200);
    } catch (err) {
      console.error(err);
      setMsg("Submit failed.");
    }
  }

  function addDocFile(file?: File) {
    if (!file) return;
    const doc = { name: file.name };
    setValues((s) => ({ ...s, documents: [...(s.documents ?? []), doc] }));
  }
  function removeDoc(i: number) {
    setValues((s) => ({ ...s, documents: (s.documents ?? []).filter((_, idx) => idx !== i) }));
  }

  return (
    <div className="p-6 max-w-3xl mx-auto bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">ID Card Application</h2>
      {msg && <div className="mb-3 text-sm text-slate-700">{msg}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <label className="flex flex-col text-sm"><span>Name (English) *</span><input value={values.employeeNameEn} onChange={(e) => updateField("employeeNameEn", e.target.value)} className="border p-2 rounded" /></label>
        <label className="flex flex-col text-sm"><span>Employee No</span><input value={values.employeeNo} onChange={(e) => updateField("employeeNo", e.target.value)} className="border p-2 rounded" /></label>

        <label className="flex flex-col text-sm"><span>Designation *</span><input value={values.designation} onChange={(e) => updateField("designation", e.target.value)} className="border p-2 rounded" /></label>
        <label className="flex flex-col text-sm"><span>Department *</span><input value={values.department} onChange={(e) => updateField("department", e.target.value)} className="border p-2 rounded" /></label>

        <label className="flex flex-col text-sm"><span>Mobile *</span><input value={values.mobileNumber} onChange={(e) => updateField("mobileNumber", e.target.value)} className="border p-2 rounded" /></label>
        <label className="flex flex-col text-sm"><span>Joining Date *</span><input type="date" value={values.dateOfAppointment ?? ""} onChange={(e) => updateField("dateOfAppointment", e.target.value)} className="border p-2 rounded" /></label>

        <label className="flex flex-col text-sm"><span>Name (Hindi)</span><input value={values.employeeNameHi} onChange={(e) => updateField("employeeNameHi", e.target.value)} className="border p-2 rounded" /></label>
        <label className="flex flex-col text-sm"><span>Designation (Hindi)</span><input value={values.designationHi} onChange={(e) => updateField("designationHi", e.target.value)} className="border p-2 rounded" /></label>

        <label className="flex flex-col text-sm md:col-span-2"><span>Address</span><textarea value={values.address} onChange={(e) => updateField("address", e.target.value)} className="border p-2 rounded" /></label>

        <label className="flex flex-col text-sm"><span>Photo URL</span><input value={values.photoUrl} onChange={(e) => updateField("photoUrl", e.target.value)} className="border p-2 rounded" /></label>

        <label className="flex flex-col text-sm"><span>Upload document (dev: metadata only)</span><input type="file" onChange={(e) => { const f = e.target.files?.[0]; if (f) addDocFile(f) }} /></label>

        <div className="md:col-span-2">
          <div className="font-medium">Documents</div>
          <ul className="mt-2 ml-4 text-sm">
            {(values.documents ?? []).map((d, i) => <li key={i} className="flex items-center gap-3"><span>{d.name}</span><button type="button" onClick={() => removeDoc(i)} className="text-xs text-red-600 ml-2">Remove</button></li>)}
          </ul>
        </div>
      </div>

      <div className="mt-4 flex gap-3">
        <button type="button" onClick={saveDraft} className="px-4 py-2 border rounded bg-yellow-50">Save Draft</button>
        <button type="button" onClick={submit} className="px-4 py-2 bg-blue-600 text-white rounded">Submit</button>
        <button type="button" onClick={() => onCancel?.()} className="px-4 py-2 border rounded">Cancel</button>
      </div>
    </div>
  );
}

// ---------- Update form ----------
function UpdateForm({ payload, onCancel, onSubmitted }: { payload?: Application | null; onCancel?: () => void; onSubmitted?: (resp: any) => void }) {
  const empty: FormValues = {
    employeeNameEn: "",
    employeeNameHi: "",
    employeeNo: "",
    designation: "",
    designationHi: "",
    department: "",
    mobileNumber: "",
    dateOfAppointment: "",
    dateOfBirth: "",
    address: "",
    photoUrl: "",
    documents: [],
  };

  const draft = readDraft();
  const last = readLast();
  const initial = draft?.formData ?? payload?.formData ?? last?.formData ?? empty;

  const [values, setValues] = useState<FormValues>({ ...empty, ...initial });
  const [msg, setMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function updateField<K extends keyof FormValues>(k: K, v: FormValues[K]) {
    setValues((s) => ({ ...s, [k]: v }));
  }

  function saveDraftLocal() {
    const d = {
      id: (values as any).id ?? `draft-${Date.now()}`,
      formData: values,
      uploadedFilesMeta: values.documents ?? [],
      updatedAt: new Date().toISOString(),
    };
    writeDraft(d);
    setMsg("Draft saved");
    setTimeout(() => setMsg(null), 1400);
  }

  async function submit() {
    if (!values.employeeNameEn || !values.designation || !values.department || !values.mobileNumber || !values.dateOfAppointment) {
      setMsg("Please fill required fields.");
      return;
    }
    setSubmitting(true);
    try {
      // try server, fallback to mock
      try {
        const res = await fetch(`/api/idcard`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ formData: values }),
        });
        if (res.ok) {
          const data = await res.json();
          writeLast(data);
          clearDraft();
          setMsg("Submitted (server)");
          onSubmitted?.(data);
          setTimeout(() => setMsg(null), 1000);
          setSubmitting(false);
          return;
        }
      } catch (e) {
        // fallback
      }
      const resp = await mockSubmit(values);
      setMsg("Submitted (local)");
      onSubmitted?.(resp);
      setTimeout(() => setMsg(null), 900);
    } catch (err) {
      console.error(err);
      setMsg("Submit failed");
    } finally {
      setSubmitting(false);
    }
  }

  function addDoc(f?: File) {
    if (!f) return;
    const d = { name: f.name };
    setValues((s) => ({ ...s, documents: [...(s.documents ?? []), d] }));
  }
  function removeDoc(i: number) {
    setValues((s) => ({ ...s, documents: (s.documents ?? []).filter((_, idx) => idx !== i) }));
  }

  return (
    <div className="p-6 max-w-3xl mx-auto bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Update Application</h2>
      {msg && <div className="mb-3 text-sm">{msg}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <label className="flex flex-col text-sm"><span>Name (English) *</span><input value={values.employeeNameEn} onChange={(e) => updateField("employeeNameEn", e.target.value)} className="border p-2 rounded" /></label>
        <label className="flex flex-col text-sm"><span>Employee No</span><input value={values.employeeNo} onChange={(e) => updateField("employeeNo", e.target.value)} className="border p-2 rounded" /></label>

        <label className="flex flex-col text-sm"><span>Designation *</span><input value={values.designation} onChange={(e) => updateField("designation", e.target.value)} className="border p-2 rounded" /></label>
        <label className="flex flex-col text-sm"><span>Department *</span><input value={values.department} onChange={(e) => updateField("department", e.target.value)} className="border p-2 rounded" /></label>

        <label className="flex flex-col text-sm"><span>Mobile *</span><input value={values.mobileNumber} onChange={(e) => updateField("mobileNumber", e.target.value)} className="border p-2 rounded" /></label>
        <label className="flex flex-col text-sm"><span>Joining Date *</span><input type="date" value={values.dateOfAppointment ?? ""} onChange={(e) => updateField("dateOfAppointment", e.target.value)} className="border p-2 rounded" /></label>

        <label className="flex flex-col text-sm"><span>Name (Hindi)</span><input value={values.employeeNameHi} onChange={(e) => updateField("employeeNameHi", e.target.value)} className="border p-2 rounded" /></label>
        <label className="flex flex-col text-sm"><span>Designation (Hindi)</span><input value={values.designationHi} onChange={(e) => updateField("designationHi", e.target.value)} className="border p-2 rounded" /></label>

        <label className="flex flex-col text-sm md:col-span-2"><span>Address</span><textarea value={values.address} onChange={(e) => updateField("address", e.target.value)} className="border p-2 rounded" /></label>

        <label className="flex flex-col text-sm"><span>Photo URL</span><input value={values.photoUrl} onChange={(e) => updateField("photoUrl", e.target.value)} className="border p-2 rounded" /></label>

        <label className="flex flex-col text-sm"><span>Upload document</span><input type="file" onChange={(e) => { const f = e.target.files?.[0]; if (f) addDoc(f) }} /></label>

        <div className="md:col-span-2">
          <div className="font-medium">Documents</div>
          <ul className="ml-4 mt-2 text-sm">
            {(values.documents ?? []).map((d, i) => <li key={i} className="flex items-center gap-3"><span>{d.name}</span><button className="text-xs text-red-600" onClick={() => removeDoc(i)}>Remove</button></li>)}
          </ul>
        </div>
      </div>

      <div className="mt-4 flex gap-3">
        <button onClick={saveDraftLocal} className="px-4 py-2 border rounded bg-yellow-50">Save Draft</button>
        <button onClick={submit} className="px-4 py-2 bg-blue-600 text-white rounded">{submitting ? "Submitting..." : "Submit"}</button>
        <button onClick={() => onCancel?.()} className="px-4 py-2 border rounded">Cancel</button>
      </div>
    </div>
  );
}

// ---------- Main container ----------
export default function IdCardApp({ startingEmp = "EMP001", language = "en" }: { startingEmp?: string; language?: "en" | "hi" }) {
  const [view, setView] = useState<"dashboard" | "apply" | "update">("dashboard");
  const [isPreviewOpen, setPreviewOpen] = useState(false);
  const [previewApp, setPreviewApp] = useState<Application | null>(null);
  const [previewSourceLabel, setPreviewSourceLabel] = useState<string | null>(null);
  const [updatePayload, setUpdatePayload] = useState<Application | null>(null);
  const [hasApplied, setHasApplied] = useState<boolean>(!!readLast());

  async function loadApplication(emp = startingEmp) {
    const draft = readDraft();
    if (draft?.formData) {
      const app: Application = {
        id: draft.id,
        formData: draft.formData,
        name: draft.formData.employeeNameEn ?? undefined,
        employeeNo: draft.formData.employeeNo ?? emp,
        department: draft.formData.department,
        documents: draft.uploadedFilesMeta ?? [],
        status: "Draft",
        submittedAt: draft.updatedAt,
      };
      return { app, label: "Showing your saved draft (local)." };
    }
    const last = readLast();
    if (last) {
      const app: Application = {
        id: last.id,
        formData: last.formData,
        name: last.formData?.employeeNameEn ?? last.name,
        employeeNo: last.employeeNo ?? emp,
        department: last.department ?? last.formData?.department,
        documents: last.documents ?? last.formData?.documents ?? [],
        status: last.status ?? "Submitted",
        submittedAt: last.submittedAt ?? last.createdAt,
      };
      return { app, label: "Loaded your last submitted application (local)." };
    }
    return { app: exampleApplication(emp), label: "Could not fetch live data — showing example data." };
  }

  async function handlePreviewClick() {
    const { app, label } = await loadApplication(startingEmp);
    setPreviewApp(app);
    setPreviewSourceLabel(label);
    setPreviewOpen(true);
    setHasApplied(true);
  }

  async function handleUpdateClick() {
    const { app } = await loadApplication(startingEmp);
    setUpdatePayload(app);
    setView("update");
  }

  function onFormSubmitted(resp: any) {
    setHasApplied(true);
    setView("dashboard");
  }
  function onDraftSaved(_: any) {
    setHasApplied(true);
  }

  return (
    <div className="min-h-[calc(100vh-200px)] py-10 px-6 bg-slate-50">
      <div className="max-w-6xl mx-auto">
        {view === "dashboard" && (
          <>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
              <div>
                <h2 className="text-2xl md:text-3xl font-extrabold text-[#002B5C]">{language === "en" ? `Hi, ${previewApp?.name ?? readLast()?.name ?? "User"}` : `नमस्ते`}</h2>
                <p className="text-sm text-gray-600 mt-1">{language === "en" ? `Employee No: ${startingEmp}` : `कर्मचारी संख्या: ${startingEmp}`}</p>
              </div>

              <div className="flex items-center gap-3">
                <div className="px-4 py-3 shadow-sm border border-gray-200 rounded">
                  <p className="text-xs text-gray-500">{language === "en" ? "ID Card Status" : "आईडी कार्ड स्थिति"}</p>
                  <p className="text-lg font-semibold text-[#002B5C] mt-1">{hasApplied ? "Submitted" : "Not Applied"}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="p-6 flex flex-col justify-between items-start bg-white shadow-md rounded">
                <div>
                  <h3 className="text-lg font-bold text-[#0B1B2B] mb-2">Apply for ID Card</h3>
                  <p className="text-sm text-gray-600 mb-4">Start a new ID card application. Documents required will appear in the form.</p>
                </div>
                <div className="w-full">
                  <button onClick={() => setView("apply")} className="w-full text-white bg-[#2E7D32] hover:bg-green-700 flex items-center justify-center gap-3 py-3 rounded">Apply Now</button>
                </div>
              </div>

              <div className="p-6 flex flex-col justify-between items-start bg-white shadow-md rounded">
                <div>
                  <h3 className="text-lg font-bold text-[#0B1B2B] mb-2">Applications</h3>
                  <p className="text-sm text-gray-600 mb-4">View or update your ID card application.</p>
                </div>

                <div className="w-full flex flex-col gap-3">
                  <button onClick={handlePreviewClick} className="w-full border border-[#002B5C] text-[#002B5C] py-3 rounded">Preview Application</button>
                  <button onClick={handleUpdateClick} className="w-full text-white bg-[#1565C0] hover:bg-blue-700 py-3 rounded">Update Application</button>
                </div>
              </div>

              <div className="p-6 flex flex-col justify-between items-start bg-white shadow-md rounded">
                <div>
                  <h3 className="text-lg font-bold text-[#0B1B2B] mb-2">Security</h3>
                  <p className="text-sm text-gray-600 mb-4">Manage your account security settings.</p>
                </div>

                <div className="w-full">
                  <button onClick={() => alert("Change password flow")} className="w-full border border-[#002B5C] text-[#002B5C] py-3 rounded">Change Password</button>
                </div>
              </div>
            </div>

            {isPreviewOpen && <PreviewModal application={previewApp} loadedFrom={previewSourceLabel} onClose={() => setPreviewOpen(false)} />}

            <div className="text-center text-sm text-gray-500 mt-6">Need help? Contact HR.</div>
          </>
        )}

        {view === "apply" && (
          <>
            <div className="mb-4 flex items-center gap-3">
              <button onClick={() => setView("dashboard")} className="px-3 py-1 border rounded">← Back</button>
              <h3 className="text-lg font-semibold">Apply for ID Card</h3>
            </div>
            <IdCardForm onCancel={() => setView("dashboard")} onSaved={(d) => onDraftSaved(d)} onSubmitted={(resp) => onFormSubmitted(resp)} />
          </>
        )}

        {view === "update" && (
          <>
            <div className="mb-4 flex items-center gap-3">
              <button onClick={() => setView("dashboard")} className="px-3 py-1 border rounded">← Back</button>
              <h3 className="text-lg font-semibold">Update Application</h3>
            </div>

            <UpdateForm payload={updatePayload} onCancel={() => setView("dashboard")} onSubmitted={(resp) => onFormSubmitted(resp)} />
          </>
        )}
      </div>
    </div>
  );
}
