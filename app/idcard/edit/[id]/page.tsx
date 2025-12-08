"use client"

import React, { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import IdCardForm from "@/components/id-card-form"

export default function EditIdCardPage() {
  const params = useParams()
  const id = params?.id
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [draftData, setDraftData] = useState<any>(null)

  useEffect(() => {
    // load draft if present. Do NOT redirect away here (keeps Back behavior predictable).
    try {
      const raw = localStorage.getItem("idcardDraft")
      if (!raw) {
        setDraftData(null)
        setLoading(false)
        return
      }

      const parsed = JSON.parse(raw)
      // if the stored draft matches the id param, provide it to the form.
      if (parsed && id && parsed.id === id) {
        setDraftData(parsed)
      } else {
        // if no match, still render form (no initial data)
        setDraftData(null)
      }
    } catch (err) {
      console.error("Failed to load draft from localStorage:", err)
      setDraftData(null)
    } finally {
      setLoading(false)
    }
  }, [id])

  if (loading) {
    return <div className="p-8 text-center">Loading draft…</div>
  }

  // Parent navigation handlers: prefer router.back(), otherwise try known dashboard locations
  const tryFallbacks = async () => {
    // common candidates (edit this list to match your repo if you know the path)
    const candidates = [
      "/dashboard",
      "/home",
      "/app/dashboard",
      "/(private)/dashboard",
      "/user/dashboard",
      "/portal/dashboard",
      "/",
    ]

    // try back first
    try {
      if (typeof window !== "undefined" && window.history && window.history.length > 1) {
        try {
          router.back()
          return
        } catch (err) {
          console.warn("router.back() threw:", err)
        }
      }
    } catch {}

    // try replace to candidates
    for (const p of candidates) {
      try {
        await router.replace(p)
        return
      } catch (err) {
        console.warn("router.replace threw for", p, err)
      }
    }

    // last resort hard redirect
    try {
      if (typeof window !== "undefined") window.location.href = "/"
    } catch {}
  }

  const onNavigate = (view?: any) => {
    // keep signature compatible — parent consumer may send "dashboard"/"application-status" etc.
    if (view === "application-status") {
      // try to navigate to application status page (you can customize)
      try {
        router.replace("/application-status")
        return
      } catch {}
    }

    // default: attempt safe fallback navigation
    tryFallbacks()
  }

  const onCancel = () => {
    // try router.back() then fallback
    try {
      if (typeof window !== "undefined" && window.history && window.history.length > 1) {
        router.back()
        return
      }
    } catch (err) {
      console.warn("router.back() onCancel threw:", err)
    }
    tryFallbacks()
  }

  return (
    <IdCardForm
      onNavigate={onNavigate}
      onCancel={onCancel}
      language="en"
      initialData={draftData}
      mode="edit"
    />
  )
}
