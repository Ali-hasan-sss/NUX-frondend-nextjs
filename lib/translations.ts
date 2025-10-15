export const translations = {
  en: {
    // Navigation
    features: "Features",
    pricing: "Pricing",
    dashboard: "Dashboard",
    contact: "Contact",
    signIn: "Sign In",
    getStarted: "Get Started",

    // Hero Section
    trustedBy: "Trusted by 500+ restaurants",
    heroTitle: "Transform Your Restaurant with",
    heroTitleHighlight: "Smart Subscriptions",
    heroDescription:
      "Streamline your restaurant operations with our comprehensive subscription management platform. Build customer loyalty, manage QR codes, and grow your business with powerful analytics.",
    startFreeTrial: "Start Free Trial",
    learnMore: "Learn More",
    viewDashboard: "View Dashboard",

    // Stats
    activeRestaurants: "Active Restaurants",
    loyaltyPointsIssued: "Loyalty Points Issued",
    uptimeGuarantee: "Uptime Guarantee",

    // Auth
    email: "Email",
    password: "Password",
    confirmPassword: "Confirm Password",
    restaurantName: "Restaurant Name",
    phoneNumber: "Phone Number",
    address: "Address",
    login: "Login",
    register: "Register",
    adminLogin: "Admin Login",

    // Dashboard
    overview: "Overview",
    users: "Users",
    subscriptions: "Subscriptions",
    plans: "Plans",
    qrCodes: "QR Codes",
    groups: "Groups",
    notifications: "Notifications",
    payments: "Payments",
    settings: "Settings",

    // Common
    save: "Save",
    cancel: "Cancel",
    edit: "Edit",
    delete: "Delete",
    create: "Create",
    update: "Update",
    loading: "Loading...",
    error: "Error",
    success: "Success",
  },
  ar: {
    // Navigation
    features: "المميزات",
    pricing: "الأسعار",
    dashboard: "لوحة التحكم",
    contact: "اتصل بنا",
    signIn: "تسجيل الدخول",
    getStarted: "ابدأ الآن",

    // Hero Section
    trustedBy: "موثوق من قبل أكثر من 500 مطعم",
    heroTitle: "حول مطعمك مع",
    heroTitleHighlight: "الاشتراكات الذكية",
    heroDescription:
      "بسّط عمليات مطعمك مع منصة إدارة الاشتراكات الشاملة. ابن ولاء العملاء، وأدر رموز QR، وانمِ عملك بتحليلات قوية.",
    startFreeTrial: "ابدأ التجربة المجانية",
    learnMore: "اعرف المزيد",
    viewDashboard: "عرض لوحة التحكم",

    // Stats
    activeRestaurants: "مطاعم نشطة",
    loyaltyPointsIssued: "نقاط ولاء صادرة",
    uptimeGuarantee: "ضمان وقت التشغيل",

    // Auth
    email: "البريد الإلكتروني",
    password: "كلمة المرور",
    confirmPassword: "تأكيد كلمة المرور",
    restaurantName: "اسم المطعم",
    phoneNumber: "رقم الهاتف",
    address: "العنوان",
    login: "تسجيل الدخول",
    register: "التسجيل",
    adminLogin: "دخول المدير",

    // Dashboard
    overview: "نظرة عامة",
    users: "المستخدمون",
    subscriptions: "الاشتراكات",
    plans: "الخطط",
    qrCodes: "رموز QR",
    groups: "المجموعات",
    notifications: "الإشعارات",
    payments: "المدفوعات",
    settings: "الإعدادات",

    // Common
    save: "حفظ",
    cancel: "إلغاء",
    edit: "تعديل",
    delete: "حذف",
    create: "إنشاء",
    update: "تحديث",
    loading: "جاري التحميل...",
    error: "خطأ",
    success: "نجح",
  },
  de: {
    // Navigation
    features: "Funktionen",
    pricing: "Preise",
    dashboard: "Dashboard",
    contact: "Kontakt",
    signIn: "Anmelden",
    getStarted: "Loslegen",

    // Hero Section
    trustedBy: "Vertraut von über 500 Restaurants",
    heroTitle: "Transformieren Sie Ihr Restaurant mit",
    heroTitleHighlight: "Smart Abonnements",
    heroDescription:
      "Optimieren Sie Ihre Restaurantabläufe mit unserer umfassenden Abonnement-Management-Plattform. Bauen Sie Kundenloyalität auf, verwalten Sie QR-Codes und lassen Sie Ihr Geschäft mit leistungsstarken Analysen wachsen.",
    startFreeTrial: "Kostenlose Testversion starten",
    learnMore: "Mehr erfahren",
    viewDashboard: "Dashboard anzeigen",

    // Stats
    activeRestaurants: "Aktive Restaurants",
    loyaltyPointsIssued: "Ausgegebene Treuepunkte",
    uptimeGuarantee: "Verfügbarkeitsgarantie",

    // Auth
    email: "E-Mail",
    password: "Passwort",
    confirmPassword: "Passwort bestätigen",
    restaurantName: "Restaurantname",
    phoneNumber: "Telefonnummer",
    address: "Adresse",
    login: "Anmelden",
    register: "Registrieren",
    adminLogin: "Admin-Anmeldung",

    // Dashboard
    overview: "Übersicht",
    users: "Benutzer",
    subscriptions: "Abonnements",
    plans: "Pläne",
    qrCodes: "QR-Codes",
    groups: "Gruppen",
    notifications: "Benachrichtigungen",
    payments: "Zahlungen",
    settings: "Einstellungen",

    // Common
    save: "Speichern",
    cancel: "Abbrechen",
    edit: "Bearbeiten",
    delete: "Löschen",
    create: "Erstellen",
    update: "Aktualisieren",
    loading: "Laden...",
    error: "Fehler",
    success: "Erfolg",
  },
} as const

export type TranslationKey = keyof typeof translations.en
