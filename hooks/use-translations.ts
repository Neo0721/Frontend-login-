// /hooks/use-translations.ts
export type Lang = "en" | "hi"

/**
 * Simple translation helper used by the legacy id-card-form.
 * Add more keys as needed.
 */
const DICT: Record<Lang, Record<string, string>> = {
  en: {
    idFormTitle: "ID Card Application",
    fullName: "Full name",
    designation: "Designation",
    department: "Department",
    employeeId: "Employee ID",
    contactNumber: "Contact number",
    email: "Email",
    bloodGroup: "Blood group",
    address: "Residential address",
    photoUpload: "Upload photo",
    cancel: "Cancel",
    submit: "Submit",
  },
  hi: {
    idFormTitle: "आईडी कार्ड आवेदन",
    fullName: "पूरा नाम",
    designation: "पदनाम",
    department: "विभाग",
    employeeId: "कर्मचारी आईडी",
    contactNumber: "संपर्क नंबर",
    email: "ईमेल",
    bloodGroup: "रक्त समूह",
    address: "पता",
    photoUpload: "फ़ोटो अपलोड करें",
    cancel: "रद्द करें",
    submit: "सबमिट करें",
  },
}

/**
 * Minimal hook. Accepts language code string (defaults to 'en' if unknown)
 * Returns a function t(key) -> translated string
 */
export function useTranslations(lang?: string) {
  const language: Lang = lang === "hi" ? "hi" : "en"
  return (key: string) => {
    return DICT[language][key] ?? DICT.en[key] ?? key
  }
}
