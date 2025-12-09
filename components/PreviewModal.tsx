"use client";

import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";

type ApplicationDocument = { name: string; url?: string };
type Application = {
  id?: string | number;
  name?: string;
  employeeNo?: string;
  department?: string;
  dob?: string;
  phone?: string;
  documents?: (string | ApplicationDocument)[];
  status?: string;
  submittedAt?: string;
  formData?: Record<string, any> | null;
};

interface PreviewModalProps {
  open: boolean;
  onClose: () => void;
  data: Application | null;
  loading?: boolean;
  viewError?: string | null;
  language?: "en" | "hi";
  onEdit?: (id?: string | number) => void;
  renderDocumentItem?: (doc: string | ApplicationDocument, idx: number) => React.ReactNode;
}

export default function PreviewModal({
  open,
  onClose,
  data,
  loading = false,
  viewError = null,
  language = "en",
  onEdit,
  renderDocumentItem,
}: PreviewModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const fallbackRenderDoc = (doc: any, idx: number) => {
    if (!doc) return null;
    if (typeof doc === "string") return (
      <li key={idx} className="flex items-center gap-3">
        <span>{doc}</span>
        <span className="ml-2 text-xs text-slate-500">(no preview)</span>
      </li>
    );
    if (doc.url) {
      return (
        <li key={idx}>
          <a href={doc.url} target="_blank" rel="noopener noreferrer" className="underline">{doc.name}</a>
        </li>
      );
    }
    return (
      <li key={idx} className="flex items-center gap-3">
        <span>{doc.name}</span>
        <span className="ml-2 text-xs text-slate-500">(local)</span>
      </li>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} aria-hidden="true" />
      <div className="relative bg-white rounded-2xl shadow-xl w-[92%] max-w-xl mx-auto p-6 z-10">
        <button
          className="absolute right-4 top-4 text-slate-500 hover:text-slate-800"
          onClick={onClose}
          aria-label="Close"
        >
          ✕
        </button>

        <h4 className="text-lg font-semibold mb-2">{language === "en" ? "Application Details" : "आवेदन विवरण"}</h4>

        {loading ? (
          <div className="py-8 text-center">Loading…</div>
        ) : viewError && !data ? (
          <div className="py-6 text-center text-sm text-red-500">{viewError}</div>
        ) : data ? (
          <div className="space-y-3 text-sm text-slate-700">
            {viewError && <div className="text-xs text-amber-700">{viewError}</div>}

            <div className="flex justify-between">
              <span className="font-medium">Name</span>
              <span>{data.formData?.employeeNameEn ?? data.name ?? "—"}</span>
            </div>

            <div className="flex justify-between">
              <span className="font-medium">Employee No</span>
              <span>{data.employeeNo ?? "—"}</span>
            </div>

            <div className="flex justify-between">
              <span className="font-medium">Department</span>
              <span>{data.formData?.department ?? data.department ?? "—"}</span>
            </div>

            <div className="flex justify-between">
              <span className="font-medium">Date of Appointment</span>
              <span>{data.formData?.dateOfAppointment ?? data.dob ?? "—"}</span>
            </div>

            <div className="flex justify-between">
              <span className="font-medium">Mobile</span>
              <span>{data.formData?.mobileNumber ?? data.phone ?? "—"}</span>
            </div>

            <div>
              <div className="font-medium">Documents</div>
              <ul className="list-disc ml-5 mt-1 text-slate-600">
                {(data.documents && data.documents.length > 0)
                  ? data.documents.map((d, i) => (renderDocumentItem ? renderDocumentItem(d as any, i) : fallbackRenderDoc(d, i)))
                  : <li className="text-slate-500">No documents available</li>}
              </ul>
            </div>

            <div className="flex justify-between">
              <span className="font-medium">Status</span>
              <span className="text-sm font-semibold">{data.status ?? "—"}</span>
            </div>

            <div className="text-right">
              <Button
                onClick={() => { onClose(); onEdit?.(data.id); }}
                className="px-4 py-2 mr-2"
              >
                {language === "en" ? "Edit" : "संपादित करें"}
              </Button>

              <Button onClick={onClose} className="px-4 py-2 bg-blue-600 text-white">
                {language === "en" ? "Close" : "बंद करें"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="py-6 text-center text-sm text-slate-700">{language === "en" ? "No application found." : "कोई आवेदन नहीं मिला।"}</div>
        )}
      </div>
    </div>
  );
}
