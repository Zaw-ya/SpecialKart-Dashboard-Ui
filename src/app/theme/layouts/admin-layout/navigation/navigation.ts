export interface NavigationItem {
  id: string;
  title: string;
  type: 'item' | 'collapse' | 'group';
  translate?: string;
  icon?: string;
  hidden?: boolean;
  url?: string;
  classes?: string;
  groupClasses?: string;
  exactMatch?: boolean;
  external?: boolean;
  target?: boolean;
  breadcrumbs?: boolean;
  children?: NavigationItem[];
  link?: string;
  description?: string;
  path?: string;
}

export const NavigationItems: NavigationItem[] = [
  {
    id: 'overview',
    title: 'الرئيسية | Overview',
    type: 'group',
    icon: 'icon-navigation',
    children: [
      {
        id: 'default',
        title: 'لوحة التحكم',
        type: 'item',
        classes: 'nav-item',
        url: '/dashboard/default',
        icon: 'dashboard',
        breadcrumbs: false
      }
    ]
  },
  {
    id: 'form-submissions',
    title: 'طلبات النماذج والعملاء | Form Submissions',
    type: 'group',
    icon: 'icon-navigation',
    children: [
      {
        id: 'demo-requests',
        title: 'طلبات التجربة المجانية',
        type: 'item',
        classes: 'nav-item',
        url: '/demo-requests',
        icon: 'experiment',
        breadcrumbs: false
      },
      {
        id: 'contacts',
        title: 'رسائل الاستفسارات والطلبات',
        type: 'item',
        classes: 'nav-item',
        url: '/contacts',
        icon: 'mail',
        breadcrumbs: false
      }
    ]
  },
  {
    id: 'catalog-management',
    title: 'إدارة المحتوى والخدمات | Catalog',
    type: 'group',
    icon: 'icon-navigation',
    children: [
      {
        id: 'invitation-cards',
        title: 'بطاقات الدعوة',
        type: 'item',
        classes: 'nav-item',
        url: '/invitation-cards',
        icon: 'layout',
        breadcrumbs: false
      },
      {
        id: 'packages',
        title: 'باقات الأسعار',
        type: 'item',
        classes: 'nav-item',
        url: '/packages',
        icon: 'audit',
        breadcrumbs: false
      },
      {
        id: 'orders',
        title: 'الطلبات والمشتريات',
        type: 'item',
        classes: 'nav-item',
        url: '/orders',
        icon: 'shopping-cart',
        breadcrumbs: false
      },
      {
        id: 'event-types',
        title: 'أنواع المناسبات',
        type: 'item',
        classes: 'nav-item',
        url: '/event-types',
        icon: 'tag',
        breadcrumbs: false
      },
      {
        id: 'features',
        title: 'المميزات والخصائص',
        type: 'item',
        classes: 'nav-item',
        url: '/features',
        icon: 'unordered-list',
        breadcrumbs: false
      },
      {
        id: 'supervisors',
        title: 'المشرفين',
        type: 'item',
        classes: 'nav-item',
        url: '/supervisors',
        icon: 'user',
        breadcrumbs: false
      },
      {
        id: 'blog',
        title: 'المدونة',
        type: 'item',
        classes: 'nav-item',
        url: '/blog',
        icon: 'read',
        breadcrumbs: false
      },
      {
        id: 'testimonials',
        title: 'آراء العملاء',
        type: 'item',
        classes: 'nav-item',
        url: '/testimonials',
        icon: 'comment',
        breadcrumbs: false
      }
    ]
  },
  {
    id: 'system-settings-group',
    title: 'النظام والإعدادات | System',
    type: 'group',
    icon: 'icon-navigation',
    children: [
      {
        id: 'countries',
        title: 'الدول',
        type: 'item',
        classes: 'nav-item',
        url: '/countries',
        icon: 'global',
        breadcrumbs: false
      },
      {
        id: 'cities',
        title: 'المدن',
        type: 'item',
        classes: 'nav-item',
        url: '/cities',
        icon: 'environment',
        breadcrumbs: false
      },
      {
        id: 'register',
        title: 'تسجيل مستخدم',
        type: 'item',
        classes: 'nav-item',
        url: '/register',
        icon: 'user-add',
        breadcrumbs: false
      },
      {
        id: 'meta-tracking',
        title: 'تتبّع Meta',
        type: 'item',
        classes: 'nav-item',
        url: '/meta-tracking',
        icon: 'line-chart',
        breadcrumbs: false
      },
      {
        id: 'site-settings',
        title: 'إعدادات الموقع',
        type: 'item',
        classes: 'nav-item',
        url: '/site-settings',
        icon: 'setting',
        breadcrumbs: false
      }
    ]
  }
];
