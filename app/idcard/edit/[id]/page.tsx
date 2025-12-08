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

  return (
    <IdCardForm
      // these handlers ensure the form's Back button and any parent navigation go to dashboard
      onNavigate={() => router.push("/dashboard")}
      onCancel={() => router.push("/dashboard")}
      language="en"
      initialData={draftData}
      mode="edit"
    />
  )
}
