export interface DocStep {
  id: string;
  titleEn: string;
  titleAr: string;
  descriptionEn: string;
  descriptionAr: string;
  steps: { en: string; ar: string }[];
  tips?: { en: string; ar: string }[];
}

export interface DocSection {
  id: string;
  titleEn: string;
  titleAr: string;
  icon: string;
  items: DocStep[];
}

export const themeDocSections: DocSection[] = [
  {
    id: 'getting-started',
    titleEn: 'Getting Started',
    titleAr: 'البدء',
    icon: 'rocket',
    items: [
      {
        id: 'overview',
        titleEn: 'Theme Overview',
        titleAr: 'نظرة عامة على القالب',
        descriptionEn: 'This theme is a comprehensive e-commerce solution with full Arabic (RTL) and English (LTR) support. It includes a customizable storefront, admin dashboard, blog system, and more.',
        descriptionAr: 'هذا القالب هو حل تجارة إلكترونية شامل مع دعم كامل للعربية (RTL) والإنجليزية (LTR). يتضمن واجهة متجر قابلة للتخصيص ولوحة تحكم إدارية ونظام مدونة والمزيد.',
        steps: [
          { en: 'Navigate to the admin panel at /admin', ar: 'انتقل إلى لوحة التحكم في /admin' },
          { en: 'Use the sidebar to access different management sections', ar: 'استخدم الشريط الجانبي للوصول إلى أقسام الإدارة المختلفة' },
          { en: 'Switch between Arabic and English using the language toggle at the bottom of the sidebar', ar: 'قم بالتبديل بين العربية والإنجليزية باستخدام زر اللغة أسفل الشريط الجانبي' },
        ],
      },
      {
        id: 'admin-access',
        titleEn: 'Accessing the Admin Dashboard',
        titleAr: 'الوصول إلى لوحة التحكم',
        descriptionEn: 'The admin dashboard provides a centralized location to manage all aspects of your store.',
        descriptionAr: 'توفر لوحة التحكم موقعاً مركزياً لإدارة جميع جوانب متجرك.',
        steps: [
          { en: 'Go to /admin to view the dashboard with key metrics', ar: 'انتقل إلى /admin لعرض لوحة التحكم مع المقاييس الرئيسية' },
          { en: 'The dashboard shows: total orders, revenue, product count, and customer count', ar: 'تعرض اللوحة: إجمالي الطلبات، الإيرادات، عدد المنتجات، وعدد العملاء' },
          { en: 'Recent orders are displayed for quick review', ar: 'يتم عرض الطلبات الأخيرة للمراجعة السريعة' },
        ],
      },
    ],
  },
  {
    id: 'colors',
    titleEn: 'Color Customization',
    titleAr: 'تخصيص الألوان',
    icon: 'palette',
    items: [
      {
        id: 'color-settings',
        titleEn: 'Adjusting Theme Colors',
        titleAr: 'ضبط ألوان القالب',
        descriptionEn: 'Customize every color in your theme to match your brand identity. Changes are applied in real-time with a live preview.',
        descriptionAr: 'خصص كل لون في قالبك ليتوافق مع هوية علامتك التجارية. يتم تطبيق التغييرات في الوقت الفعلي مع معاينة مباشرة.',
        steps: [
          { en: 'Go to Admin > Theme > Colors tab', ar: 'انتقل إلى الإدارة > المظهر > تبويب الألوان' },
          { en: 'Click on any color swatch to open the color picker', ar: 'انقر على أي عينة لون لفتح منتقي الألوان' },
          { en: 'Available color categories: Base, Brand, Text, Feedback, and Interactive', ar: 'فئات الألوان المتاحة: الأساسية، العلامة التجارية، النصوص، الحالة، والتفاعلية' },
          { en: 'Use the live preview on the right side to see your changes instantly', ar: 'استخدم المعاينة المباشرة على الجانب لرؤية تغييراتك فوراً' },
        ],
        tips: [
          { en: 'Background: Main page background color', ar: 'الخلفية: لون خلفية الصفحة الرئيسية' },
          { en: 'Primary: Main brand color used for buttons and links', ar: 'الأساسي: لون العلامة التجارية الرئيسي المستخدم للأزرار والروابط' },
          { en: 'Accent: Secondary brand color for highlights and CTAs', ar: 'اللون الثانوي: لون العلامة التجارية الثانوي للتمييز وأزرار الإجراء' },
          { en: 'Header Background: Top navigation bar color', ar: 'خلفية الترويسة: لون شريط التنقل العلوي' },
        ],
      },
    ],
  },
  {
    id: 'typography',
    titleEn: 'Typography & Fonts',
    titleAr: 'الخطوط والطباعة',
    icon: 'type',
    items: [
      {
        id: 'font-settings',
        titleEn: 'Choosing Fonts',
        titleAr: 'اختيار الخطوط',
        descriptionEn: 'Select from a curated list of fonts for both English and Arabic content. The theme supports separate font selections for each language.',
        descriptionAr: 'اختر من قائمة خطوط منتقاة للمحتوى الإنجليزي والعربي. يدعم القالب اختيارات خطوط منفصلة لكل لغة.',
        steps: [
          { en: 'Go to Admin > Theme > Fonts tab', ar: 'انتقل إلى الإدارة > المظهر > تبويب الخطوط' },
          { en: 'Select an English font from: Inter, Poppins, DM Sans, Work Sans, Roboto, Lora, Merriweather, Crimson Pro', ar: 'اختر خطاً إنجليزياً من: Inter, Poppins, DM Sans, Work Sans, Roboto, Lora, Merriweather, Crimson Pro' },
          { en: 'Select an Arabic font (Cairo is the default and recommended)', ar: 'اختر خطاً عربياً (Cairo هو الافتراضي والموصى به)' },
          { en: 'Preview the font in the live preview sidebar', ar: 'عاين الخط في شريط المعاينة المباشرة' },
        ],
        tips: [
          { en: 'Sans-serif fonts (Inter, Poppins, DM Sans) work best for modern e-commerce', ar: 'خطوط Sans-serif مثل (Inter, Poppins, DM Sans) تعمل بشكل أفضل للتجارة الإلكترونية الحديثة' },
          { en: 'Serif fonts (Lora, Merriweather) give a more traditional, premium feel', ar: 'خطوط Serif مثل (Lora, Merriweather) تعطي شعوراً تقليدياً فاخراً' },
        ],
      },
    ],
  },
  {
    id: 'layout',
    titleEn: 'Layout & Sections',
    titleAr: 'التخطيط والأقسام',
    icon: 'layout',
    items: [
      {
        id: 'section-management',
        titleEn: 'Managing Homepage Sections',
        titleAr: 'إدارة أقسام الصفحة الرئيسية',
        descriptionEn: 'Control which sections appear on your homepage and their order. Toggle visibility and drag to reorder.',
        descriptionAr: 'تحكم في الأقسام التي تظهر في صفحتك الرئيسية وترتيبها. بدّل الرؤية واسحب لإعادة الترتيب.',
        steps: [
          { en: 'Go to Admin > Theme > Layout tab', ar: 'انتقل إلى الإدارة > المظهر > تبويب التخطيط' },
          { en: 'Use the toggle switch to show/hide each section', ar: 'استخدم مفتاح التبديل لإظهار/إخفاء كل قسم' },
          { en: 'Drag sections using the handle to reorder them', ar: 'اسحب الأقسام باستخدام المقبض لإعادة ترتيبها' },
        ],
        tips: [
          { en: 'Available sections: Hero Banner, Featured Products, New Arrivals, Best Sellers, Recently Viewed, Categories, Blog', ar: 'الأقسام المتاحة: البانر الرئيسي، المنتجات المميزة، وصل حديثاً، الأكثر مبيعاً، شوهد مؤخراً، الفئات، المدونة' },
          { en: 'Hidden sections are not deleted — just not displayed on the homepage', ar: 'الأقسام المخفية لا يتم حذفها — فقط لا تُعرض في الصفحة الرئيسية' },
        ],
      },
    ],
  },
  {
    id: 'components',
    titleEn: 'Component Styles',
    titleAr: 'أنماط العناصر',
    icon: 'layers',
    items: [
      {
        id: 'style-settings',
        titleEn: 'Customizing Component Appearance',
        titleAr: 'تخصيص مظهر العناصر',
        descriptionEn: 'Fine-tune the visual style of UI components like cards, buttons, and borders across your entire site.',
        descriptionAr: 'اضبط النمط المرئي لعناصر الواجهة مثل البطاقات والأزرار والحدود عبر موقعك بالكامل.',
        steps: [
          { en: 'Go to Admin > Theme > Styles tab', ar: 'انتقل إلى الإدارة > المظهر > تبويب الأنماط' },
          { en: 'Adjust Border Radius: Controls the roundness of corners (0 = sharp, higher = rounder)', ar: 'اضبط نصف قطر الحدود: يتحكم في استدارة الزوايا (0 = حادة، أعلى = أكثر استدارة)' },
          { en: 'Select Card Shadow: none, sm, md, lg, xl — controls card depth effect', ar: 'اختر ظل البطاقة: none, sm, md, lg, xl — يتحكم في تأثير عمق البطاقة' },
          { en: 'Choose Button Style: default, rounded, pill, or sharp', ar: 'اختر نمط الزر: default, rounded, pill, أو sharp' },
        ],
      },
    ],
  },
  {
    id: 'weather-bar',
    titleEn: 'Weather & Date Bar',
    titleAr: 'شريط الطقس والتاريخ',
    icon: 'cloud-sun',
    items: [
      {
        id: 'weather-settings',
        titleEn: 'Configuring the Weather Bar',
        titleAr: 'إعداد شريط الطقس',
        descriptionEn: 'The weather bar sits at the top of the page showing current weather, date (Hijri/Gregorian), and prayer times.',
        descriptionAr: 'يقع شريط الطقس في أعلى الصفحة ويعرض الطقس الحالي والتاريخ (الهجري/الميلادي) وأوقات الصلاة.',
        steps: [
          { en: 'Go to Admin > Theme > Content tab > Weather & Date Bar', ar: 'انتقل إلى الإدارة > المظهر > تبويب المحتوى > شريط الطقس والتاريخ' },
          { en: 'Toggle "Show Weather Bar" to show or hide the bar', ar: 'بدّل "إظهار شريط الطقس" لإظهار أو إخفاء الشريط' },
          { en: 'Toggle "Show Hijri Date" to display the Islamic calendar date', ar: 'بدّل "عرض التاريخ الهجري" لعرض تاريخ التقويم الإسلامي' },
          { en: 'Toggle "Show Prayer Times" to display daily prayer schedule', ar: 'بدّل "عرض أوقات الصلاة" لعرض جدول الصلاة اليومي' },
          { en: 'Set the default city for weather and prayer data', ar: 'اضبط المدينة الافتراضية لبيانات الطقس والصلاة' },
        ],
      },
    ],
  },
  {
    id: 'news-banner',
    titleEn: 'News Banner',
    titleAr: 'شريط الأخبار',
    icon: 'megaphone',
    items: [
      {
        id: 'news-banner-setup',
        titleEn: 'Setting Up the News Banner',
        titleAr: 'إعداد شريط الأخبار',
        descriptionEn: 'The news banner is a scrolling notification bar at the top of the site for announcements, offers, and promotions.',
        descriptionAr: 'شريط الأخبار هو شريط إشعارات متحرك في أعلى الموقع للإعلانات والعروض والترويجات.',
        steps: [
          { en: 'Go to Admin > Theme > Content tab > News Banner', ar: 'انتقل إلى الإدارة > المظهر > تبويب المحتوى > شريط الأخبار' },
          { en: 'Toggle visibility to show/hide the banner', ar: 'بدّل الرؤية لإظهار/إخفاء الشريط' },
          { en: 'Add new items with bilingual text (English + Arabic) and an emoji', ar: 'أضف عناصر جديدة بنص ثنائي اللغة (إنجليزي + عربي) ورمز إيموجي' },
          { en: 'Edit existing items by clicking on them', ar: 'عدّل العناصر الموجودة بالنقر عليها' },
          { en: 'Remove items by clicking the delete button', ar: 'احذف العناصر بالنقر على زر الحذف' },
        ],
      },
    ],
  },
  {
    id: 'hero-section',
    titleEn: 'Hero Section',
    titleAr: 'البانر الرئيسي',
    icon: 'image',
    items: [
      {
        id: 'hero-content',
        titleEn: 'Hero Content & Image',
        titleAr: 'محتوى وصورة البانر',
        descriptionEn: 'The hero section is the main banner at the top of your homepage. It includes a title, subtitle, call-to-action buttons, and a featured image.',
        descriptionAr: 'قسم البانر الرئيسي هو الشريط الرئيسي في أعلى صفحتك الرئيسية. يتضمن عنواناً وعنواناً فرعياً وأزرار إجراء وصورة مميزة.',
        steps: [
          { en: 'Go to Admin > Theme > Content tab > Hero Section', ar: 'انتقل إلى الإدارة > المظهر > تبويب المحتوى > البانر الرئيسي' },
          { en: 'Edit the title in both English and Arabic', ar: 'عدّل العنوان بالإنجليزية والعربية' },
          { en: 'Edit the subtitle/description text', ar: 'عدّل النص الفرعي/الوصف' },
          { en: 'Customize primary and secondary CTA button texts', ar: 'خصص نصوص أزرار الإجراء الأساسية والثانوية' },
          { en: 'Upload or change the hero image URL', ar: 'ارفع أو غيّر رابط صورة البانر' },
          { en: 'Toggle floating cards on/off', ar: 'بدّل البطاقات العائمة تشغيل/إيقاف' },
        ],
      },
      {
        id: 'hero-badges',
        titleEn: 'Trust Badges',
        titleAr: 'شارات الثقة',
        descriptionEn: 'Trust badges appear below the hero section to build customer confidence (e.g., "Fast Delivery", "Genuine Products").',
        descriptionAr: 'تظهر شارات الثقة أسفل البانر الرئيسي لبناء ثقة العملاء (مثل "توصيل سريع"، "منتجات أصلية").',
        steps: [
          { en: 'Badges are managed under the Hero Section accordion', ar: 'تُدار الشارات تحت مجموعة البانر الرئيسي' },
          { en: 'Add new badges with bilingual text', ar: 'أضف شارات جديدة بنص ثنائي اللغة' },
          { en: 'Edit or remove existing badges', ar: 'عدّل أو احذف الشارات الموجودة' },
        ],
      },
    ],
  },
  {
    id: 'section-headings',
    titleEn: 'Section Headings',
    titleAr: 'عناوين الأقسام',
    icon: 'heading',
    items: [
      {
        id: 'heading-customization',
        titleEn: 'Customizing Section Titles',
        titleAr: 'تخصيص عناوين الأقسام',
        descriptionEn: 'Each homepage section has a heading that can be customized in both languages.',
        descriptionAr: 'كل قسم في الصفحة الرئيسية له عنوان يمكن تخصيصه بكلتا اللغتين.',
        steps: [
          { en: 'Go to Admin > Theme > Content tab > Section Headings', ar: 'انتقل إلى الإدارة > المظهر > تبويب المحتوى > عناوين الأقسام' },
          { en: 'Edit the heading for each section: Featured Products, New Arrivals, Best Sellers, Recently Viewed, Categories, Blog', ar: 'عدّل عنوان كل قسم: المنتجات المميزة، وصل حديثاً، الأكثر مبيعاً، شوهد مؤخراً، الفئات، المدونة' },
          { en: 'Enter both English and Arabic text for each heading', ar: 'أدخل النص بالإنجليزية والعربية لكل عنوان' },
        ],
      },
    ],
  },
  {
    id: 'about-page',
    titleEn: 'About Page',
    titleAr: 'صفحة من نحن',
    icon: 'info',
    items: [
      {
        id: 'about-content',
        titleEn: 'Editing the About Page',
        titleAr: 'تعديل صفحة من نحن',
        descriptionEn: 'Customize your About page with company description, mission statement, and feature highlights.',
        descriptionAr: 'خصص صفحة "من نحن" بوصف الشركة وبيان المهمة وأبرز الميزات.',
        steps: [
          { en: 'Go to Admin > Theme > Content tab > About Page', ar: 'انتقل إلى الإدارة > المظهر > تبويب المحتوى > صفحة من نحن' },
          { en: 'Edit the main title and description in both languages', ar: 'عدّل العنوان الرئيسي والوصف بكلتا اللغتين' },
          { en: 'Edit the mission title and mission description', ar: 'عدّل عنوان المهمة ووصف المهمة' },
          { en: 'Add, edit, or remove feature items with icons', ar: 'أضف أو عدّل أو احذف عناصر الميزات مع الأيقونات' },
          { en: 'Each feature has: icon, title (EN/AR), description (EN/AR)', ar: 'كل ميزة تحتوي على: أيقونة، عنوان (إنجليزي/عربي)، وصف (إنجليزي/عربي)' },
        ],
      },
    ],
  },
  {
    id: 'footer',
    titleEn: 'Footer',
    titleAr: 'الفوتر',
    icon: 'layout-template',
    items: [
      {
        id: 'footer-content',
        titleEn: 'Configuring the Footer',
        titleAr: 'إعداد الفوتر',
        descriptionEn: 'Set up footer content including about text, social media links, and newsletter subscription settings.',
        descriptionAr: 'أعد محتوى الفوتر بما في ذلك نص "عن الموقع" وروابط التواصل الاجتماعي وإعدادات النشرة البريدية.',
        steps: [
          { en: 'Go to Admin > Theme > Content tab > Footer', ar: 'انتقل إلى الإدارة > المظهر > تبويب المحتوى > الفوتر' },
          { en: 'Edit the "About" text displayed in the footer (English + Arabic)', ar: 'عدّل نص "عن الموقع" المعروض في الفوتر (إنجليزي + عربي)' },
          { en: 'Enter social media links: Facebook, Twitter/X, Instagram', ar: 'أدخل روابط التواصل الاجتماعي: فيسبوك، تويتر/X، انستقرام' },
          { en: 'Toggle newsletter section visibility', ar: 'بدّل رؤية قسم النشرة البريدية' },
          { en: 'Customize newsletter title and description in both languages', ar: 'خصص عنوان ووصف النشرة البريدية بكلتا اللغتين' },
        ],
      },
    ],
  },
  {
    id: 'products-management',
    titleEn: 'Products Management',
    titleAr: 'إدارة المنتجات',
    icon: 'package',
    items: [
      {
        id: 'add-products',
        titleEn: 'Adding & Managing Products',
        titleAr: 'إضافة وإدارة المنتجات',
        descriptionEn: 'Manage your product catalog with full details, images, pricing, and inventory tracking.',
        descriptionAr: 'أدر كتالوج منتجاتك مع التفاصيل الكاملة والصور والتسعير وتتبع المخزون.',
        steps: [
          { en: 'Go to Admin > Products', ar: 'انتقل إلى الإدارة > المنتجات' },
          { en: 'Click "Add Product" to create a new product', ar: 'انقر "إضافة منتج" لإنشاء منتج جديد' },
          { en: 'Fill in: name (EN/AR), description (EN/AR), price, category, stock', ar: 'املأ: الاسم (إنجليزي/عربي)، الوصف (إنجليزي/عربي)، السعر، الفئة، المخزون' },
          { en: 'Upload product images (main image + gallery)', ar: 'ارفع صور المنتج (صورة رئيسية + معرض)' },
          { en: 'Set product flags: Featured, Best Seller, New Arrival', ar: 'اضبط علامات المنتج: مميز، الأكثر مبيعاً، وصل حديثاً' },
          { en: 'Enable/disable VAT for individual products', ar: 'فعّل/عطّل ضريبة القيمة المضافة لكل منتج' },
          { en: 'Import products in bulk via Excel/CSV', ar: 'استورد المنتجات بالجملة عبر Excel/CSV' },
        ],
      },
    ],
  },
  {
    id: 'categories-management',
    titleEn: 'Categories',
    titleAr: 'الفئات',
    icon: 'folder-tree',
    items: [
      {
        id: 'manage-categories',
        titleEn: 'Managing Product Categories',
        titleAr: 'إدارة فئات المنتجات',
        descriptionEn: 'Organize products into categories with support for parent-child hierarchy.',
        descriptionAr: 'نظّم المنتجات في فئات مع دعم التسلسل الهرمي (فئات رئيسية وفرعية).',
        steps: [
          { en: 'Go to Admin > Categories', ar: 'انتقل إلى الإدارة > الفئات' },
          { en: 'Click "Add Category" to create a new category', ar: 'انقر "إضافة فئة" لإنشاء فئة جديدة' },
          { en: 'Set name (EN/AR), slug, icon, and optional parent category', ar: 'اضبط الاسم (إنجليزي/عربي)، الرابط، الأيقونة، والفئة الأم (اختياري)' },
          { en: 'Upload a category image', ar: 'ارفع صورة للفئة' },
          { en: 'Toggle active/inactive status', ar: 'بدّل حالة التفعيل/التعطيل' },
        ],
      },
    ],
  },
  {
    id: 'orders',
    titleEn: 'Orders & Shipping',
    titleAr: 'الطلبات والشحن',
    icon: 'shopping-cart',
    items: [
      {
        id: 'manage-orders',
        titleEn: 'Managing Orders',
        titleAr: 'إدارة الطلبات',
        descriptionEn: 'View, filter, and manage customer orders. Update statuses and add tracking information.',
        descriptionAr: 'اعرض وفلتر وأدر طلبات العملاء. حدّث الحالات وأضف معلومات التتبع.',
        steps: [
          { en: 'Go to Admin > Orders to see all orders', ar: 'انتقل إلى الإدارة > الطلبات لرؤية جميع الطلبات' },
          { en: 'Filter by status: pending, processing, shipped, delivered, cancelled', ar: 'فلتر حسب الحالة: قيد الانتظار، قيد المعالجة، تم الشحن، تم التسليم، ملغي' },
          { en: 'Click on an order to view full details and line items', ar: 'انقر على طلب لعرض التفاصيل الكاملة والعناصر' },
          { en: 'Add tracking events with location and notes', ar: 'أضف أحداث تتبع مع الموقع والملاحظات' },
          { en: 'Generate and send VAT invoices to customers', ar: 'أنشئ وأرسل فواتير ضريبة القيمة المضافة للعملاء' },
        ],
      },
      {
        id: 'shipping-zones',
        titleEn: 'Setting Up Shipping Zones',
        titleAr: 'إعداد مناطق الشحن',
        descriptionEn: 'Configure shipping zones with different rates, delivery estimates, and free shipping thresholds.',
        descriptionAr: 'أعد مناطق الشحن بأسعار مختلفة وتقديرات التوصيل وحدود الشحن المجاني.',
        steps: [
          { en: 'Go to Admin > Shipping', ar: 'انتقل إلى الإدارة > الشحن' },
          { en: 'Add shipping zones with name (EN/AR) and regions', ar: 'أضف مناطق شحن بالاسم (إنجليزي/عربي) والمناطق' },
          { en: 'Set shipping rate and free shipping threshold', ar: 'اضبط سعر الشحن وحد الشحن المجاني' },
          { en: 'Configure estimated delivery days (min-max range)', ar: 'اضبط أيام التوصيل المقدرة (نطاق أدنى-أقصى)' },
        ],
      },
    ],
  },
  {
    id: 'discounts',
    titleEn: 'Discounts & Loyalty',
    titleAr: 'الخصومات والولاء',
    icon: 'tag',
    items: [
      {
        id: 'discount-codes',
        titleEn: 'Discount Codes',
        titleAr: 'أكواد الخصم',
        descriptionEn: 'Create and manage discount codes with various types, limits, and validity periods.',
        descriptionAr: 'أنشئ وأدر أكواد الخصم بأنواع مختلفة وحدود وفترات صلاحية.',
        steps: [
          { en: 'Go to Admin > Discounts > Discount Codes tab', ar: 'انتقل إلى الإدارة > الخصومات > تبويب أكواد الخصم' },
          { en: 'Create codes with: percentage or fixed amount discount', ar: 'أنشئ أكواداً بخصم: نسبة مئوية أو مبلغ ثابت' },
          { en: 'Set validity dates, usage limits, and minimum order amounts', ar: 'اضبط تواريخ الصلاحية وحدود الاستخدام والحد الأدنى للطلب' },
          { en: 'Mark codes as influencer codes with associated names', ar: 'حدد الأكواد كأكواد مؤثرين مع الأسماء المرتبطة' },
        ],
      },
      {
        id: 'loyalty-program',
        titleEn: 'Loyalty Program',
        titleAr: 'برنامج الولاء',
        descriptionEn: 'Configure a points-based loyalty program to reward returning customers.',
        descriptionAr: 'أعد برنامج ولاء قائم على النقاط لمكافأة العملاء المتكررين.',
        steps: [
          { en: 'Go to Admin > Discounts > Loyalty Program tab', ar: 'انتقل إلى الإدارة > الخصومات > تبويب برنامج الولاء' },
          { en: 'Enable/disable the loyalty program', ar: 'فعّل/عطّل برنامج الولاء' },
          { en: 'Set points earned per currency unit spent', ar: 'اضبط النقاط المكتسبة لكل وحدة عملة منفقة' },
          { en: 'Set currency value per point for redemption', ar: 'اضبط قيمة العملة لكل نقطة عند الاسترداد' },
          { en: 'Configure minimum redemption points and welcome bonus', ar: 'اضبط الحد الأدنى لنقاط الاسترداد ومكافأة الترحيب' },
        ],
      },
    ],
  },
  {
    id: 'blog-system',
    titleEn: 'Blog System',
    titleAr: 'نظام المدونة',
    icon: 'file-text',
    items: [
      {
        id: 'blog-posts',
        titleEn: 'Managing Blog Posts',
        titleAr: 'إدارة مقالات المدونة',
        descriptionEn: 'Create and manage bilingual blog posts with a rich text editor, categories, and image uploads.',
        descriptionAr: 'أنشئ وأدر مقالات مدونة ثنائية اللغة مع محرر نصوص غني وتصنيفات ورفع صور.',
        steps: [
          { en: 'Go to Admin > Blog', ar: 'انتقل إلى الإدارة > المدونة' },
          { en: 'Click "New Post" to create a blog post', ar: 'انقر "مقال جديد" لإنشاء مقال' },
          { en: 'Use the rich text editor for content in both languages', ar: 'استخدم محرر النصوص الغني للمحتوى بكلتا اللغتين' },
          { en: 'Set category, slug, author name, and featured image', ar: 'اضبط التصنيف والرابط واسم الكاتب والصورة المميزة' },
          { en: 'Publish or save as draft', ar: 'انشر أو احفظ كمسودة' },
        ],
      },
    ],
  },
  {
    id: 'theme-updates',
    titleEn: 'Theme Updates & Licensing',
    titleAr: 'تحديثات القالب والتراخيص',
    icon: 'refresh-cw',
    items: [
      {
        id: 'version-management',
        titleEn: 'Version Management',
        titleAr: 'إدارة الإصدارات',
        descriptionEn: 'Create and publish theme versions for distribution across WordPress, Shopify, and Salla platforms.',
        descriptionAr: 'أنشئ وانشر إصدارات القالب للتوزيع عبر منصات WordPress وShopify وSalla.',
        steps: [
          { en: 'Go to Admin > Theme Updates > Versions tab', ar: 'انتقل إلى الإدارة > تحديثات القالب > تبويب الإصدارات' },
          { en: 'Click "New Version" — version number auto-increments', ar: 'انقر "إصدار جديد" — رقم الإصدار يزداد تلقائياً' },
          { en: 'Add changelog in both languages', ar: 'أضف سجل التغييرات بكلتا اللغتين' },
          { en: 'Upload ZIP files for each platform (WordPress, Shopify, Salla)', ar: 'ارفع ملفات ZIP لكل منصة (WordPress, Shopify, Salla)' },
          { en: 'Toggle "Published" to make the version available', ar: 'بدّل "منشور" لجعل الإصدار متاحاً' },
          { en: 'Use "Notify All Customers" to email all active license holders', ar: 'استخدم "إشعار جميع العملاء" لإرسال بريد لجميع حاملي التراخيص النشطة' },
        ],
      },
      {
        id: 'license-management',
        titleEn: 'License Key Management',
        titleAr: 'إدارة مفاتيح التراخيص',
        descriptionEn: 'Generate and manage license keys for customers who purchased the theme.',
        descriptionAr: 'أنشئ وأدر مفاتيح التراخيص للعملاء الذين اشتروا القالب.',
        steps: [
          { en: 'Go to Admin > Theme Updates > Licenses tab', ar: 'انتقل إلى الإدارة > تحديثات القالب > تبويب التراخيص' },
          { en: 'Click "Add License" to generate a new key', ar: 'انقر "إضافة ترخيص" لإنشاء مفتاح جديد' },
          { en: 'Enter customer name, email, platform, and optional expiry date', ar: 'أدخل اسم العميل والبريد والمنصة وتاريخ الانتهاء (اختياري)' },
          { en: 'License keys are auto-generated in UUID format', ar: 'يتم إنشاء مفاتيح التراخيص تلقائياً بتنسيق UUID' },
          { en: 'Activate/deactivate licenses as needed', ar: 'فعّل/عطّل التراخيص حسب الحاجة' },
        ],
      },
    ],
  },
  {
    id: 'advanced',
    titleEn: 'Advanced Features',
    titleAr: 'الميزات المتقدمة',
    icon: 'settings',
    items: [
      {
        id: 'site-health',
        titleEn: 'Site Health & SEO',
        titleAr: 'صحة الموقع والسيو',
        descriptionEn: 'Monitor your site health score, run SEO audits, and fix issues automatically.',
        descriptionAr: 'راقب درجة صحة موقعك وأجرِ فحوصات SEO وأصلح المشكلات تلقائياً.',
        steps: [
          { en: 'Go to Admin > Site Health', ar: 'انتقل إلى الإدارة > صحة الموقع' },
          { en: 'Click "Run Scan" to perform a health check', ar: 'انقر "إجراء فحص" لإجراء فحص صحي' },
          { en: 'Review issues by category: SEO, Performance, Security, Content', ar: 'راجع المشكلات حسب الفئة: SEO، الأداء، الأمان، المحتوى' },
          { en: 'Use Auto-Fix to resolve common issues automatically', ar: 'استخدم الإصلاح التلقائي لحل المشكلات الشائعة تلقائياً' },
        ],
      },
      {
        id: 'backups',
        titleEn: 'Backups',
        titleAr: 'النسخ الاحتياطي',
        descriptionEn: 'Create and manage database backups with scheduling and comparison tools.',
        descriptionAr: 'أنشئ وأدر النسخ الاحتياطية لقاعدة البيانات مع أدوات الجدولة والمقارنة.',
        steps: [
          { en: 'Go to Admin > Backups', ar: 'انتقل إلى الإدارة > النسخ الاحتياطي' },
          { en: 'Create manual backups or set up automatic schedules', ar: 'أنشئ نسخاً احتياطية يدوية أو اضبط جداول تلقائية' },
          { en: 'Compare backups to see data changes over time', ar: 'قارن النسخ الاحتياطية لرؤية تغييرات البيانات عبر الوقت' },
          { en: 'Restore from a previous backup when needed', ar: 'استعد من نسخة احتياطية سابقة عند الحاجة' },
        ],
      },
      {
        id: 'plugins',
        titleEn: 'Plugins',
        titleAr: 'الإضافات',
        descriptionEn: 'Extend your store functionality with installable plugins.',
        descriptionAr: 'وسّع وظائف متجرك بإضافات قابلة للتثبيت.',
        steps: [
          { en: 'Go to Admin > Plugins', ar: 'انتقل إلى الإدارة > الإضافات' },
          { en: 'Browse available plugins', ar: 'تصفح الإضافات المتاحة' },
          { en: 'Click Install/Activate to enable a plugin', ar: 'انقر تثبيت/تفعيل لتفعيل إضافة' },
          { en: 'Configure plugin settings after activation', ar: 'اضبط إعدادات الإضافة بعد التفعيل' },
        ],
      },
      {
        id: 'reset-theme',
        titleEn: 'Resetting the Theme',
        titleAr: 'إعادة ضبط القالب',
        descriptionEn: 'Reset all theme customizations back to default settings if needed.',
        descriptionAr: 'أعد ضبط جميع تخصيصات القالب للإعدادات الافتراضية إذا لزم الأمر.',
        steps: [
          { en: 'Go to Admin > Theme', ar: 'انتقل إلى الإدارة > المظهر' },
          { en: 'Click the "Reset" button in the top-right corner (appears only when changes exist)', ar: 'انقر زر "إعادة ضبط" في الزاوية العلوية (يظهر فقط عند وجود تغييرات)' },
          { en: 'Confirm to reset all colors, fonts, layout, and content to defaults', ar: 'أكد لإعادة ضبط جميع الألوان والخطوط والتخطيط والمحتوى للقيم الافتراضية' },
        ],
      },
    ],
  },
];
