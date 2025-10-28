"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

export type Language = "en" | "hi" | "mr"

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en")

  useEffect(() => {
    // Load language from localStorage
    const saved = localStorage.getItem("fertilizerpro_language") as Language
    if (saved && ["en", "hi", "mr"].includes(saved)) {
      setLanguageState(saved)
    }
  }, [])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem("fertilizerpro_language", lang)
  }

  const t = (key: string): string => {
    return translations[language]?.[key] || translations.en[key] || key
  }

  return <LanguageContext.Provider value={{ language, setLanguage, t }}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider")
  }
  return context
}

// Translations
const translations: Record<Language, Record<string, string>> = {
  en: {
    // Landing Page
    "landing.smartAg": "Smart Agriculture Solution",
    "landing.heroTitle": "Grow Smarter with AI-Powered Fertilizer Recommendations",
    "landing.heroDesc":
      "Get personalized fertilizer recommendations based on soil analysis, weather conditions, and crop requirements. Maximize yield while minimizing costs.",
    "landing.getStarted": "Get Started Free",
    "landing.learnMore": "Learn More",
    "landing.featuresTitle": "Everything You Need",
    "landing.featuresDesc": "Powerful features designed for modern farmers",
    "landing.feature1Title": "Soil Analysis",
    "landing.feature1Desc": "Comprehensive NPK testing and pH analysis",
    "landing.feature2Title": "Weather Data",
    "landing.feature2Desc": "Real-time weather integration",
    "landing.feature3Title": "NPK Calculator",
    "landing.feature3Desc": "Precise fertilizer calculations",
    "landing.feature4Title": "Crop-Specific",
    "landing.feature4Desc": "Tailored recommendations",
    "landing.whyTitle": "Why Farmers Choose Us",
    "landing.whyDesc": "Join thousands of farmers improving their yields",
    "landing.stat1": "Yield Increase",
    "landing.stat2": "Cost Savings",
    "landing.stat3": "Active Farmers",
    "landing.stat4": "Soil Tests",
    "landing.benefit1": "Increase crop yield significantly",
    "landing.benefit2": "Reduce fertilizer costs",
    "landing.benefit3": "Prevent soil damage",
    "landing.benefit4": "Get instant recommendations",
    "landing.benefit5": "Track soil health over time",
    "landing.benefit6": "Export detailed reports",
    "landing.ctaTitle": "Ready to Transform Your Farming?",
    "landing.ctaDesc": "Start making data-driven decisions for better harvests today",
    "landing.ctaButton": "Start Free Trial",

    // Auth
    "auth.welcome": "Welcome to FertilizerPro",
    "auth.login": "Login",
    "auth.signup": "Sign Up",
    "auth.createAccount": "Create Account",
    "auth.signupDesc": "Sign up with your name and mobile number",
    "auth.loginDesc": "Login with your mobile number",
    "auth.fullName": "Full Name",
    "auth.mobileNumber": "Mobile Number",
    "auth.enterName": "Enter your full name",
    "auth.enterMobile": "Enter 10-digit mobile number",
    "auth.selectLanguage": "Select Language",
    "auth.creating": "Creating...",
    "auth.alreadyAccount": "Already have an account?",
    "auth.noAccount": "Don't have an account?",
    "auth.sendOTP": "Send OTP",
    "auth.verifyOTP": "Verify OTP",
    "auth.enterOTP": "Enter OTP",
    "auth.yourOTP": "Your OTP:",
    "auth.expiresIn": "Expires in 5 minutes",
    "auth.changeNumber": "Change Number",
    "auth.backToHome": "Back to Home",

    // Dashboard
    "dashboard.title": "Dashboard",
    "dashboard.welcome": "Welcome",
    "dashboard.myFarms": "My Farms",
    "dashboard.soilTests": "Soil Tests",
    "dashboard.recommendations": "Recommendations",
    "dashboard.quickActions": "Quick Actions",
    "dashboard.addFarm": "Add New Farm",
    "dashboard.runSoilTest": "Run Soil Test",
    "dashboard.viewRecommendations": "View Recommendations",
    "dashboard.recentActivity": "Recent Activity",

    // Farms
    "farms.title": "My Farms",
    "farms.addNew": "Add New Farm",
    "farms.farmName": "Farm Name",
    "farms.location": "Location",
    "farms.area": "Area",
    "farms.cropType": "Crop Type",
    "farms.soilType": "Soil Type",
    "farms.useMyLocation": "Use My Location",
    "farms.save": "Save Farm",
    "farms.edit": "Edit",
    "farms.delete": "Delete",
    "farms.cancel": "Cancel",

    // Soil Test
    "soil.title": "Add Soil Test Data",
    "soil.enterResults": "Enter soil analysis results for",
    "soil.currentWeather": "Current Weather",
    "soil.humidity": "Humidity",
    "soil.wind": "Wind",
    "soil.nitrogen": "Nitrogen (N)",
    "soil.phosphorus": "Phosphorus (P)",
    "soil.potassium": "Potassium (K)",
    "soil.ph": "pH Level",
    "soil.organic": "Organic Matter",
    "soil.moisture": "Moisture",
    "soil.temperature": "Temperature",
    "soil.submit": "Submit Test",

    // Results
    "results.title": "Fertilizer Recommendations",
    "results.for": "for",
    "results.soilAnalysis": "Soil Analysis",
    "results.recommendations": "Recommended Fertilizers",
    "results.composition": "NPK Composition",
    "results.dosage": "Dosage",
    "results.perAcre": "per acre",
    "results.exportPDF": "Export Report",

    // Navbar
    "nav.home": "Home",
    "nav.myFarms": "My Farms",
    "nav.calculator": "NPK Calculator",
    "nav.profile": "Profile",
    "nav.logout": "Logout",

    // Common
    "common.loading": "Loading...",
    "common.save": "Save",
    "common.cancel": "Cancel",
    "common.delete": "Delete",
    "common.edit": "Edit",
    "common.back": "Back",
    "common.next": "Next",
    "common.submit": "Submit",
  },
  hi: {
    // Landing Page
    "landing.smartAg": "स्मार्ट कृषि समाधान",
    "landing.heroTitle": "AI-संचालित उर्वरक सिफारिशों के साथ स्मार्ट तरीके से उगाएं",
    "landing.heroDesc":
      "मिट्टी विश्लेषण, मौसम की स्थिति और फसल की आवश्यकताओं के आधार पर व्यक्तिगत उर्वरक सिफारिशें प्राप्त करें। लागत कम करते हुए उपज को अधिकतम करें।",
    "landing.getStarted": "मुफ्त में शुरू करें",
    "landing.learnMore": "और जानें",
    "landing.featuresTitle": "आपको जो कुछ भी चाहिए",
    "landing.featuresDesc": "आधुनिक किसानों के लिए डिज़ाइन की गई शक्तिशाली सुविधाएँ",
    "landing.feature1Title": "मिट्टी विश्लेषण",
    "landing.feature1Desc": "व्यापक NPK परीक्षण और pH विश्लेषण",
    "landing.feature2Title": "मौसम डेटा",
    "landing.feature2Desc": "वास्तविक समय मौसम एकीकरण",
    "landing.feature3Title": "NPK कैलकुलेटर",
    "landing.feature3Desc": "सटीक उर्वरक गणना",
    "landing.feature4Title": "फसल-विशिष्ट",
    "landing.feature4Desc": "अनुकूलित सिफारिशें",
    "landing.whyTitle": "किसान हमें क्यों चुनते हैं",
    "landing.whyDesc": "हजारों किसान अपनी उपज में सुधार कर रहे हैं",
    "landing.stat1": "उपज वृद्धि",
    "landing.stat2": "लागत बचत",
    "landing.stat3": "सक्रिय किसान",
    "landing.stat4": "मिट्टी परीक्षण",
    "landing.benefit1": "फसल की उपज में उल्लेखनीय वृद्धि",
    "landing.benefit2": "उर्वरक लागत कम करें",
    "landing.benefit3": "मिट्टी की क्षति को रोकें",
    "landing.benefit4": "तत्काल सिफारिशें प्राप्त करें",
    "landing.benefit5": "समय के साथ मिट्टी के स्वास्थ्य को ट्रैक करें",
    "landing.benefit6": "विस्तृत रिपोर्ट निर्यात करें",
    "landing.ctaTitle": "अपनी खेती को बदलने के लिए तैयार हैं?",
    "landing.ctaDesc": "आज ही बेहतर फसल के लिए डेटा-संचालित निर्णय लेना शुरू करें",
    "landing.ctaButton": "मुफ्त परीक्षण शुरू करें",

    // Auth
    "auth.welcome": "फर्टिलाइज़रप्रो में आपका स्वागत है",
    "auth.login": "लॉगिन",
    "auth.signup": "साइन अप",
    "auth.createAccount": "खाता बनाएं",
    "auth.signupDesc": "अपने नाम और मोबाइल नंबर से साइन अप करें",
    "auth.loginDesc": "अपने मोबाइल नंबर से लॉगिन करें",
    "auth.fullName": "पूरा नाम",
    "auth.mobileNumber": "मोबाइल नंबर",
    "auth.enterName": "अपना पूरा नाम दर्ज करें",
    "auth.enterMobile": "10 अंकों का मोबाइल नंबर दर्ज करें",
    "auth.selectLanguage": "भाषा चुनें",
    "auth.creating": "बना रहे हैं...",
    "auth.alreadyAccount": "पहले से खाता है?",
    "auth.noAccount": "खाता नहीं है?",
    "auth.sendOTP": "OTP भेजें",
    "auth.verifyOTP": "OTP सत्यापित करें",
    "auth.enterOTP": "OTP दर्ज करें",
    "auth.yourOTP": "आपका OTP:",
    "auth.expiresIn": "5 मिनट में समाप्त",
    "auth.changeNumber": "नंबर बदलें",
    "auth.backToHome": "होम पर वापस जाएं",

    // Dashboard
    "dashboard.title": "डैशबोर्ड",
    "dashboard.welcome": "स्वागत है",
    "dashboard.myFarms": "मेरे खेत",
    "dashboard.soilTests": "मिट्टी परीक्षण",
    "dashboard.recommendations": "सिफारिशें",
    "dashboard.quickActions": "त्वरित कार्य",
    "dashboard.addFarm": "नया खेत जोड़ें",
    "dashboard.runSoilTest": "मिट्टी परीक्षण करें",
    "dashboard.viewRecommendations": "सिफारिशें देखें",
    "dashboard.recentActivity": "हाल की गतिविधि",

    // Farms
    "farms.title": "मेरे खेत",
    "farms.addNew": "नया खेत जोड़ें",
    "farms.farmName": "खेत का नाम",
    "farms.location": "स्थान",
    "farms.area": "क्षेत्रफल",
    "farms.cropType": "फसल का प्रकार",
    "farms.soilType": "मिट्टी का प्रकार",
    "farms.useMyLocation": "मेरा स्थान उपयोग करें",
    "farms.save": "खेत सहेजें",
    "farms.edit": "संपादित करें",
    "farms.delete": "हटाएं",
    "farms.cancel": "रद्द करें",

    // Soil Test
    "soil.title": "मिट्टी परीक्षण डेटा जोड़ें",
    "soil.enterResults": "के लिए मिट्टी विश्लेषण परिणाम दर्ज करें",
    "soil.currentWeather": "वर्तमान मौसम",
    "soil.humidity": "आर्द्रता",
    "soil.wind": "हवा",
    "soil.nitrogen": "नाइट्रोजन (N)",
    "soil.phosphorus": "फास्फोरस (P)",
    "soil.potassium": "पोटैशियम (K)",
    "soil.ph": "pH स्तर",
    "soil.organic": "जैविक पदार्थ",
    "soil.moisture": "नमी",
    "soil.temperature": "तापमान",
    "soil.submit": "परीक्षण जमा करें",

    // Results
    "results.title": "उर्वरक सिफारिशें",
    "results.for": "के लिए",
    "results.soilAnalysis": "मिट्टी विश्लेषण",
    "results.recommendations": "अनुशंसित उर्वरक",
    "results.composition": "NPK संरचना",
    "results.dosage": "खुराक",
    "results.perAcre": "प्रति एकड़",
    "results.exportPDF": "रिपोर्ट निर्यात करें",

    // Navbar
    "nav.home": "होम",
    "nav.myFarms": "मेरे खेत",
    "nav.calculator": "NPK कैलकुलेटर",
    "nav.profile": "प्रोफ़ाइल",
    "nav.logout": "लॉगआउट",

    // Common
    "common.loading": "लोड हो रहा है...",
    "common.save": "सहेजें",
    "common.cancel": "रद्द करें",
    "common.delete": "हटाएं",
    "common.edit": "संपादित करें",
    "common.back": "वापस",
    "common.next": "अगला",
    "common.submit": "जमा करें",
  },
  mr: {
    // Landing Page
    "landing.smartAg": "स्मार्ट कृषी समाधान",
    "landing.heroTitle": "AI-संचालित खत शिफारशींसह स्मार्ट पद्धतीने पीक घ्या",
    "landing.heroDesc":
      "माती विश्लेषण, हवामान परिस्थिती आणि पिकाच्या गरजांवर आधारित वैयक्तिक खत शिफारसी मिळवा. खर्च कमी करताना उत्पादन वाढवा.",
    "landing.getStarted": "मोफत सुरू करा",
    "landing.learnMore": "अधिक जाणून घ्या",
    "landing.featuresTitle": "तुम्हाला जे काही हवे आहे",
    "landing.featuresDesc": "आधुनिक शेतकऱ्यांसाठी डिझाइन केलेली शक्तिशाली वैशिष्ट्ये",
    "landing.feature1Title": "माती विश्लेषण",
    "landing.feature1Desc": "सर्वसमावेशक NPK चाचणी आणि pH विश्लेषण",
    "landing.feature2Title": "हवामान डेटा",
    "landing.feature2Desc": "रिअल-टाइम हवामान एकत्रीकरण",
    "landing.feature3Title": "NPK कॅल्क्युलेटर",
    "landing.feature3Desc": "अचूक खत गणना",
    "landing.feature4Title": "पीक-विशिष्ट",
    "landing.feature4Desc": "अनुकूलित शिफारसी",
    "landing.whyTitle": "शेतकरी आम्हाला का निवडतात",
    "landing.whyDesc": "हजारो शेतकरी त्यांचे उत्पादन सुधारत आहेत",
    "landing.stat1": "उत्पादन वाढ",
    "landing.stat2": "खर्च बचत",
    "landing.stat3": "सक्रिय शेतकरी",
    "landing.stat4": "माती चाचण्या",
    "landing.benefit1": "पिकाचे उत्पादन लक्षणीयरीत्या वाढवा",
    "landing.benefit2": "खताचा खर्च कमी करा",
    "landing.benefit3": "मातीचे नुकसान टाळा",
    "landing.benefit4": "त्वरित शिफारसी मिळवा",
    "landing.benefit5": "कालांतराने मातीच्या आरोग्याचा मागोवा घ्या",
    "landing.benefit6": "तपशीलवार अहवाल निर्यात करा",
    "landing.ctaTitle": "तुमची शेती बदलण्यासाठी तयार आहात?",
    "landing.ctaDesc": "आजच चांगल्या कापणीसाठी डेटा-संचालित निर्णय घेणे सुरू करा",
    "landing.ctaButton": "मोफत चाचणी सुरू करा",

    // Auth
    "auth.welcome": "फर्टिलायझरप्रो मध्ये आपले स्वागत आहे",
    "auth.login": "लॉगिन",
    "auth.signup": "साइन अप",
    "auth.createAccount": "खाते तयार करा",
    "auth.signupDesc": "तुमचे नाव आणि मोबाइल नंबरसह साइन अप करा",
    "auth.loginDesc": "तुमच्या मोबाइल नंबरसह लॉगिन करा",
    "auth.fullName": "पूर्ण नाव",
    "auth.mobileNumber": "मोबाइल नंबर",
    "auth.enterName": "तुमचे पूर्ण नाव प्रविष्ट करा",
    "auth.enterMobile": "10 अंकी मोबाइल नंबर प्रविष्ट करा",
    "auth.selectLanguage": "भाषा निवडा",
    "auth.creating": "तयार करत आहे...",
    "auth.alreadyAccount": "आधीच खाते आहे?",
    "auth.noAccount": "खाते नाही?",
    "auth.sendOTP": "OTP पाठवा",
    "auth.verifyOTP": "OTP सत्यापित करा",
    "auth.enterOTP": "OTP प्रविष्ट करा",
    "auth.yourOTP": "तुमचा OTP:",
    "auth.expiresIn": "5 मिनिटांत संपते",
    "auth.changeNumber": "नंबर बदला",
    "auth.backToHome": "होमवर परत जा",

    // Dashboard
    "dashboard.title": "डॅशबोर्ड",
    "dashboard.welcome": "स्वागत आहे",
    "dashboard.myFarms": "माझी शेती",
    "dashboard.soilTests": "माती चाचणी",
    "dashboard.recommendations": "शिफारसी",
    "dashboard.quickActions": "द्रुत क्रिया",
    "dashboard.addFarm": "नवीन शेत जोडा",
    "dashboard.runSoilTest": "माती चाचणी करा",
    "dashboard.viewRecommendations": "शिफारसी पहा",
    "dashboard.recentActivity": "अलीकडील क्रियाकलाप",

    // Farms
    "farms.title": "माझी शेती",
    "farms.addNew": "नवीन शेत जोडा",
    "farms.farmName": "शेताचे नाव",
    "farms.location": "स्थान",
    "farms.area": "क्षेत्रफळ",
    "farms.cropType": "पिकाचा प्रकार",
    "farms.soilType": "मातीचा प्रकार",
    "farms.useMyLocation": "माझे स्थान वापरा",
    "farms.save": "शेत जतन करा",
    "farms.edit": "संपादित करा",
    "farms.delete": "हटवा",
    "farms.cancel": "रद्द करा",

    // Soil Test
    "soil.title": "माती चाचणी डेटा जोडा",
    "soil.enterResults": "साठी माती विश्लेषण परिणाम प्रविष्ट करा",
    "soil.currentWeather": "सध्याचे हवामान",
    "soil.humidity": "आर्द्रता",
    "soil.wind": "वारा",
    "soil.nitrogen": "नायट्रोजन (N)",
    "soil.phosphorus": "फॉस्फरस (P)",
    "soil.potassium": "पोटॅशियम (K)",
    "soil.ph": "pH पातळी",
    "soil.organic": "सेंद्रिय पदार्थ",
    "soil.moisture": "ओलावा",
    "soil.temperature": "तापमान",
    "soil.submit": "चाचणी सबमिट करा",

    // Results
    "results.title": "खत शिफारसी",
    "results.for": "साठी",
    "results.soilAnalysis": "माती विश्लेषण",
    "results.recommendations": "शिफारस केलेली खते",
    "results.composition": "NPK रचना",
    "results.dosage": "डोस",
    "results.perAcre": "प्रति एकर",
    "results.exportPDF": "अहवाल निर्यात करा",

    // Navbar
    "nav.home": "होम",
    "nav.myFarms": "माझी शेती",
    "nav.calculator": "NPK कॅल्क्युलेटर",
    "nav.profile": "प्रोफाइल",
    "nav.logout": "लॉगआउट",

    // Common
    "common.loading": "लोड होत आहे...",
    "common.save": "जतन करा",
    "common.cancel": "रद्द करा",
    "common.delete": "हटवा",
    "common.edit": "संपादित करा",
    "common.back": "मागे",
    "common.next": "पुढे",
    "common.submit": "सबमिट करा",
  },
}
