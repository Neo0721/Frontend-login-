"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Volume2, Printer } from "lucide-react"

interface InstructionsModalProps {
  isOpen: boolean
  onClose: () => void
  language: "en" | "hi"
}

const INSTRUCTIONS_EN = {
  title: "Registration Instructions & Document Requirements",
  sections: [
    {
      letter: "A",
      title: "New Appointment / Transfer",
      documents: [
        "Original Certificate issued by concerned Railway by Ministry",
        "Two Passport Size photographs",
        "Self attested copy of Aadhar / PAN Card",
      ],
    },
    {
      letter: "B",
      title: "Promotion",
      documents: [
        "Promotion order issued by concerned Railway",
        "Two Passport Size photographs",
        "Self attested copy of Aadhar / PAN Card",
      ],
    },
    {
      letter: "C",
      title: "Lost Identity Card",
      documents: ["FIR copy for lost card", "Two Passport Size photographs", "Self attested copy of Aadhar / PAN Card"],
    },
    {
      letter: "D",
      title: "Damaged Card",
      documents: ["Damaged card (if available)", "Two Passport Size photographs", "Application letter for replacement"],
    },
    {
      letter: "E",
      title: "Inclusion of Dependents",
      documents: ["Marriage Certificate (for spouse)", "Birth Certificate (for children)", "Photographs of dependents"],
    },
    {
      letter: "F",
      title: "Correction",
      documents: [
        "Application letter with correction details",
        "Supporting documents for correction",
        "Two Passport Size photographs",
      ],
    },
  ],
  note: "Note: Original money receipt will be provided after successful verification. All documents must be self-attested. Digital copies are acceptable.",
}

const INSTRUCTIONS_HI = {
  title: "पंजीकरण निर्देश और दस्तावेज आवश्यकताएं",
  sections: [
    {
      letter: "A",
      title: "नई नियुक्ति / स्थानांतरण",
      documents: [
        "संबंधित रेलवे द्वारा जारी किया गया मूल प्रमाण पत्र",
        "दो पासपोर्ट आकार की तस्वीरें",
        "आधार / पैन कार्ड की स्व-सत्यापित प्रति",
      ],
    },
    {
      letter: "B",
      title: "प्रचार",
      documents: ["संबंधित रेलवे द्वारा जारी प्रचार आदेश", "दो पासपोर्ट आकार की तस्वीरें", "आधार / पैन कार्ड की स्व-सत्यापित प्रति"],
    },
    {
      letter: "C",
      title: "खोया हुआ पहचान पत्र",
      documents: ["खोए हुए कार्ड के लिए एफआईआर प्रति", "दो पासपोर्ट आकार की तस्वीरें", "आधार / पैन कार्ड की स्व-सत्यापित प्रति"],
    },
    {
      letter: "D",
      title: "क्षतिग्रस्त कार्ड",
      documents: ["क्षतिग्रस्त कार्ड (यदि उपलब्ध हो)", "दो पासपोर्ट आकार की तस्वीरें", "प्रतिस्थापन के लिए आवेदन पत्र"],
    },
    {
      letter: "E",
      title: "आश्रितों को शामिल करना",
      documents: ["विवाह प्रमाण पत्र (पत्नी के लिए)", "जन्म प्रमाण पत्र (बच्चों के लिए)", "आश्रितों की तस्वीरें"],
    },
    {
      letter: "F",
      title: "सुधार",
      documents: ["सुधार विवरण के साथ आवेदन पत्र", "सुधार के लिए सहायक दस्तावेज", "दो पासपोर्ट आकार की तस्वीरें"],
    },
  ],
  note: "नोट: सफल सत्यापन के बाद मूल धन की रसीद प्रदान की जाएगी। सभी दस्तावेजों को स्व-सत्यापित होना चाहिए। डिजिटल प्रतियां स्वीकार्य हैं।",
}

export default function InstructionsModal({ isOpen, onClose, language }: InstructionsModalProps) {
  const instructions = language === "en" ? INSTRUCTIONS_EN : INSTRUCTIONS_HI

  const handleSpeak = () => {
    const text = `${instructions.title}. ${instructions.sections
      .map((s) => `${s.letter}. ${s.title}. ${s.documents.join(". ")}`)
      .join(". ")}. ${instructions.note}`

    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = language === "en" ? "en-IN" : "hi-IN"
      window.speechSynthesis.speak(utterance)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center text-[#002B5C]">{instructions.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {instructions.sections.map((section) => (
            <div key={section.letter} className="border-l-4 border-[#2E7D32] pl-4">
              <h3 className="font-bold text-[#002B5C] mb-2">
                {section.letter}. {section.title}
              </h3>
              <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
                {section.documents.map((doc, idx) => (
                  <li key={idx}>{doc}</li>
                ))}
              </ul>
            </div>
          ))}

          <div className="bg-blue-50 p-4 rounded border-l-4 border-[#002B5C]">
            <p className="text-sm text-gray-700">{instructions.note}</p>
          </div>
        </div>

        <div className="flex gap-2 pt-4">
          <Button
            onClick={handleSpeak}
            variant="outline"
            className="flex items-center gap-2 border-[#2E7D32] text-[#2E7D32] bg-transparent"
          >
            <Volume2 className="w-4 h-4" />
            {language === "en" ? "Read Aloud" : "जोर से पढ़ें"}
          </Button>

          <Button variant="outline" className="flex items-center gap-2 border-[#002B5C] text-[#002B5C] bg-transparent">
            <Printer className="w-4 h-4" />
            {language === "en" ? "Print" : "प्रिंट करें"}
          </Button>

          <Button onClick={onClose} className="ml-auto bg-[#002B5C] hover:bg-blue-900 text-white">
            {language === "en" ? "Close" : "बंद करें"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
