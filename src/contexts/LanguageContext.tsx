import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'en' | 'ar';
type Direction = 'ltr' | 'rtl';

interface LanguageContextType {
  language: Language;
  direction: Direction;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.products': 'Products',
    'nav.categories': 'Categories',
    'nav.blog': 'Blog',
    'nav.about': 'About',
    'nav.contact': 'Contact',
    'nav.cart': 'Cart',
    'nav.login': 'Login',
    'nav.admin': 'Admin',
    
    // Hero
    'hero.title': 'Your Health, Our Priority',
    'hero.subtitle': 'Premium pharmacy products delivered to your doorstep with care and precision',
    'hero.cta': 'Shop Now',
    'hero.secondary': 'Learn More',
    
    // Products
    'products.title': 'Featured Products',
    'products.viewAll': 'View All Products',
    'products.addToCart': 'Add to Cart',
    'products.outOfStock': 'Out of Stock',
    'products.prescription': 'Prescription Required',
    'products.search': 'Search products...',
    
    // Categories
    'categories.title': 'Shop by Category',
    'categories.medicines': 'Medicines',
    'categories.vitamins': 'Vitamins & Supplements',
    'categories.skincare': 'Skin Care',
    'categories.babycare': 'Baby Care',
    'categories.devices': 'Medical Devices',
    'categories.personal': 'Personal Care',
    
    // Blog
    'blog.title': 'Health & Wellness Blog',
    'blog.readMore': 'Read More',
    'blog.latestPosts': 'Latest Posts',
    
    // Cart
    'cart.title': 'Shopping Cart',
    'cart.empty': 'Your cart is empty',
    'cart.total': 'Total',
    'cart.checkout': 'Checkout',
    'cart.continue': 'Continue Shopping',
    'cart.remove': 'Remove',
    
    // Footer
    'footer.about': 'About Us',
    'footer.aboutText': 'Providing quality pharmaceutical products and healthcare solutions for our community.',
    'footer.quickLinks': 'Quick Links',
    'footer.support': 'Support',
    'footer.contact': 'Contact Us',
    'footer.privacy': 'Privacy Policy',
    'footer.terms': 'Terms of Service',
    'footer.rights': 'All rights reserved.',
    
    // Admin
    'admin.dashboard': 'Dashboard',
    'admin.products': 'Products',
    'admin.orders': 'Orders',
    'admin.customers': 'Customers',
    'admin.blog': 'Blog Posts',
    'admin.settings': 'Settings',
    'admin.totalSales': 'Total Sales',
    'admin.totalOrders': 'Total Orders',
    'admin.totalCustomers': 'Total Customers',
    'admin.totalProducts': 'Total Products',
    
    // Common
    'common.loading': 'Loading...',
    'common.error': 'Something went wrong',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.edit': 'Edit',
    'common.delete': 'Delete',
    'common.add': 'Add',
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.currency': 'SAR',
  },
  ar: {
    // Navigation
    'nav.home': 'الرئيسية',
    'nav.products': 'المنتجات',
    'nav.categories': 'الفئات',
    'nav.blog': 'المدونة',
    'nav.about': 'من نحن',
    'nav.contact': 'اتصل بنا',
    'nav.cart': 'السلة',
    'nav.login': 'تسجيل الدخول',
    'nav.admin': 'لوحة التحكم',
    
    // Hero
    'hero.title': 'صحتك، أولويتنا',
    'hero.subtitle': 'منتجات صيدلانية مميزة يتم توصيلها إلى باب منزلك بعناية ودقة',
    'hero.cta': 'تسوق الآن',
    'hero.secondary': 'اعرف المزيد',
    
    // Products
    'products.title': 'المنتجات المميزة',
    'products.viewAll': 'عرض جميع المنتجات',
    'products.addToCart': 'أضف للسلة',
    'products.outOfStock': 'نفذت الكمية',
    'products.prescription': 'يتطلب وصفة طبية',
    'products.search': 'البحث عن منتجات...',
    
    // Categories
    'categories.title': 'تسوق حسب الفئة',
    'categories.medicines': 'الأدوية',
    'categories.vitamins': 'الفيتامينات والمكملات',
    'categories.skincare': 'العناية بالبشرة',
    'categories.babycare': 'رعاية الأطفال',
    'categories.devices': 'الأجهزة الطبية',
    'categories.personal': 'العناية الشخصية',
    
    // Blog
    'blog.title': 'مدونة الصحة والعافية',
    'blog.readMore': 'اقرأ المزيد',
    'blog.latestPosts': 'أحدث المقالات',
    
    // Cart
    'cart.title': 'سلة التسوق',
    'cart.empty': 'سلتك فارغة',
    'cart.total': 'المجموع',
    'cart.checkout': 'إتمام الشراء',
    'cart.continue': 'متابعة التسوق',
    'cart.remove': 'إزالة',
    
    // Footer
    'footer.about': 'من نحن',
    'footer.aboutText': 'نقدم منتجات صيدلانية عالية الجودة وحلول رعاية صحية لمجتمعنا.',
    'footer.quickLinks': 'روابط سريعة',
    'footer.support': 'الدعم',
    'footer.contact': 'اتصل بنا',
    'footer.privacy': 'سياسة الخصوصية',
    'footer.terms': 'شروط الخدمة',
    'footer.rights': 'جميع الحقوق محفوظة.',
    
    // Admin
    'admin.dashboard': 'لوحة التحكم',
    'admin.products': 'المنتجات',
    'admin.orders': 'الطلبات',
    'admin.customers': 'العملاء',
    'admin.blog': 'المقالات',
    'admin.settings': 'الإعدادات',
    'admin.totalSales': 'إجمالي المبيعات',
    'admin.totalOrders': 'إجمالي الطلبات',
    'admin.totalCustomers': 'إجمالي العملاء',
    'admin.totalProducts': 'إجمالي المنتجات',
    
    // Common
    'common.loading': 'جاري التحميل...',
    'common.error': 'حدث خطأ ما',
    'common.save': 'حفظ',
    'common.cancel': 'إلغاء',
    'common.edit': 'تعديل',
    'common.delete': 'حذف',
    'common.add': 'إضافة',
    'common.search': 'بحث',
    'common.filter': 'تصفية',
    'common.currency': 'ر.س',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');

  const direction: Direction = language === 'ar' ? 'rtl' : 'ltr';

  useEffect(() => {
    document.documentElement.dir = direction;
    document.documentElement.lang = language;
  }, [language, direction]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('pharmacy-cms-language', lang);
  };

  useEffect(() => {
    const savedLang = localStorage.getItem('pharmacy-cms-language') as Language | null;
    if (savedLang && (savedLang === 'en' || savedLang === 'ar')) {
      setLanguageState(savedLang);
    }
  }, []);

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, direction, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
