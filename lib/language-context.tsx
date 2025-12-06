import React, { createContext, useContext, useMemo, useState } from "react"

type Lang = "en" | "hi"

type LanguageContextValue = {
  language: Lang
  setLanguage: (l: Lang) => void
  t: (key: string) => string
}

const translations: Record<string, Record<string, string>> = {
  en: {
    "common.back": "Back",
    "common.error": "Error",
    "common.success": "Success",
    "applyId.title": "Apply for Identity Card",
    "applyId.sectionA": "Document Requirements",
    "applyId.sectionB": "Application Form",
    "applyId.sectionC": "Family Details",
    "applyId.category1": "New ID",
    "applyId.category2": "Promotion",
    "applyId.category3": "Lost / Replacement",
    "applyId.doc1a": "Employment proof",
    "applyId.doc1b": "Address proof",
    "applyId.doc1c": "Photo",
    "applyId.noteTitle": "Important",
    "applyId.noteText": "Ensure you upload correct documents.",
    "applyId.purpose": "Purpose of ID Card",
    "applyId.department": "Department",
    "applyId.unit": "Unit",
    "applyId.employeeName": "Employee Name (English)",
    "applyId.employeeNameHi": "Employee Name (Hindi)",
    "applyId.designation": "Designation (English)",
    "applyId.designationHi": "Designation (Hindi)",
    "applyId.dateOfAppointment": "Date of Appointment",
    "applyId.nearestRH": "Nearest RH/HU",
    "applyId.placeOfWork": "Place of Work",
    "applyId.payLevel": "Pay Level",
    "applyId.residentialAddress": "Residential Address",
    "applyId.email": "Email",
    "applyId.mobileNumber": "Mobile Number",
    "applyId.pinCode": "Pin Code",
    "applyId.district": "District",
    "applyId.state": "State",
    "applyId.idCardNo": "ID Card No",
    "applyId.uploadFiles": "Upload Files",
    "applyId.forwardingOfficer": "Forwarding Officer",
    "applyId.saveDraft": "Save Draft",
    "applyId.submit": "Submit",
    "applyId.atLeastOneFamilyMember": "At least one family member is required.",
    "applyId.fillFirstFamilyMember": "Please fill name and age for the first family member.",
    "applyId.memberName": "Name",
    "applyId.memberRelation": "Relation",
    "applyId.memberAge": "Date of birth / Age",
    "applyId.memberGender": "Gender",
    "applyId.memberAadhaar": "Aadhaar No",
    "applyId.memberDoc": "Document",
    "applyId.remove": "Remove",
    "applyId.addMember": "Add Family Member",
  },
  hi: {
    "common.back": "वापस",
    "common.error": "त्रुटि",
    "common.success": "सफल",
    "applyId.title": "पहचान पत्र के लिए आवेदन करें",
    "applyId.sectionA": "दस्तावेज आवश्यकताएँ",
    "applyId.sectionB": "आवेदन प्रपत्र",
    "applyId.sectionC": "पारिवारिक विवरण",
    "applyId.category1": "नया आईडी",
    "applyId.category2": "पदोन्नति",
    "applyId.category3": "खो गया / प्रतिस्थापन",
    "applyId.doc1a": "रोजगार प्रमाण",
    "applyId.doc1b": "पते का प्रमाण",
    "applyId.doc1c": "परिचय फोटो",
    "applyId.noteTitle": "महत्वपूर्ण",
    "applyId.noteText": "सुनिश्चित करें कि आप सही दस्तावेज़ अपलोड कर रहे हैं।",
    "applyId.purpose": "पहचान पत्र का उद्देश्य",
    "applyId.department": "विभाग",
    "applyId.unit": "इकाई",
    "applyId.employeeName": "कर्मचारी का नाम (अंग्रेजी)",
    "applyId.employeeNameHi": "कर्मचारी का नाम (हिंदी)",
    "applyId.designation": "पदनाम (अंग्रेजी)",
    "applyId.designationHi": "पदनाम (हिंदी)",
    "applyId.dateOfAppointment": "नियुक्ति की तिथि",
    "applyId.nearestRH": "निकटतम RH/HU",
    "applyId.placeOfWork": "कार्यस्थल",
    "applyId.payLevel": "पे लेवल",
    "applyId.residentialAddress": "आवासीय पता",
    "applyId.email": "ईमेल",
    "applyId.mobileNumber": "मोबाइल नंबर",
    "applyId.pinCode": "पिन कोड",
    "applyId.district": "ज़िला",
    "applyId.state": "राज्य",
    "applyId.idCardNo": "आईडी कार्ड संख्या",
    "applyId.uploadFiles": "फ़ाइलें अपलोड करें",
    "applyId.forwardingOfficer": "फॉरवर्डिंग अधिकारी",
    "applyId.saveDraft": "ड्राफ्ट सहेजें",
    "applyId.submit": "जमा करें",
    "applyId.atLeastOneFamilyMember": "कम से कम एक पारिवारिक सदस्य आवश्यक है।",
    "applyId.fillFirstFamilyMember": "कृपया पहले पारिवारिक सदस्य के लिए नाम और आयु भरें।",
    "applyId.memberName": "नाम",
    "applyId.memberRelation": "रिश्ता",
    "applyId.memberAge": "जन्म तिथि / आयु",
    "applyId.memberGender": "लिंग",
    "applyId.memberAadhaar": "आधार नंबर",
    "applyId.memberDoc": "दस्तावेज़",
    "applyId.remove": "हटाएँ",
    "applyId.addMember": "पारिवारिक सदस्य जोड़ें",
  },
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Lang>("en")
  const t = useMemo(() => {
    return (key: string) => {
      const dict = translations[language] || translations.en
      return dict[key] ?? key
    }
  }, [language])
  const value: LanguageContextValue = { language, setLanguage, t }
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) {
    // graceful fallback if provider missing
    return {
      language: "en" as Lang,
      setLanguage: () => {},
      t: (k: string) => (translations.en[k] ?? k),
    }
  }
  return ctx
}
