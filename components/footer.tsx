"use client"

interface FooterProps {
  language: "en" | "hi"
}

export default function Footer({ language }: FooterProps) {
  return (
    <footer className="bg-[#002B5C] text-white py-8 mt-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="font-semibold mb-3">{language === "en" ? "Quick Links" : "त्वरित लिंक"}</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-blue-300">
                    {language === "en" ? "Home" : "होम"}
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-blue-300">
                    {language === "en" ? "About" : "परिचय"}
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-blue-300">
                    {language === "en" ? "Contact" : "संपर्क"}
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-3">{language === "en" ? "Support" : "सहायता"}</h3>
              <p className="text-sm mb-2">{language === "en" ? "Helpline: 1800-111-139" : "हेल्पलाइन: 1800-111-139"}</p>
              <p className="text-sm">{language === "en" ? "Email: support@wr.gov.in" : "ईमेल: support@wr.gov.in"}</p>
            </div>

            <div>
              <h3 className="font-semibold mb-3">{language === "en" ? "Legal" : "कानूनी"}</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-blue-300">
                    {language === "en" ? "Privacy Policy" : "गोपनीयता नीति"}
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-blue-300">
                    {language === "en" ? "Terms & Conditions" : "शर्तें और शर्तें"}
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-blue-400 pt-6 text-center text-sm text-blue-100">
            <p>
              © 2025 {language === "en" ? "Western Railway" : "पश्चिम रेल्वे"}.{" "}
              {language === "en" ? "All rights reserved." : "सर्वाधिकार सुरक्षित।"}
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
