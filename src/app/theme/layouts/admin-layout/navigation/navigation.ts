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
  roles?: string[];
}

export const NavigationItems: NavigationItem[] = [
  {
    id: 'overview',
    title: 'الرئيسية | Overview',
    type: 'group',
    icon: 'icon-navigation',
    roles: ['Admin', 'Marketer', 'CustomerSupport'],
    children: [
      {
        id: 'default',
        title: 'لوحة التحكم',
        type: 'item',
        classes: 'nav-item',
        url: '/dashboard/default',
        icon: 'dashboard',
        breadcrumbs: false,
        roles: ['Admin', 'Marketer', 'CustomerSupport']
      }
    ]
  },
  {
    id: 'form-submissions',
    title: 'طلبات النماذج والعملاء | Form Submissions',
    type: 'group',
    icon: 'icon-navigation',
    roles: ['Admin', 'Marketer', 'CustomerSupport'],
    children: [
      {
        id: 'demo-requests',
        title: 'طلبات التجربة المجانية',
        type: 'item',
        classes: 'nav-item',
        url: '/demo-requests',
        icon: 'experiment',
        breadcrumbs: false,
        roles: ['Admin', 'Marketer', 'CustomerSupport']
      },
      {
        id: 'contacts',
        title: 'رسائل الاستفسارات والطلبات',
        type: 'item',
        classes: 'nav-item',
        url: '/contacts',
        icon: 'mail',
        breadcrumbs: false,
        roles: ['Admin', 'Marketer', 'CustomerSupport']
      }
    ]
  },
  {
    id: 'catalog-management',
    title: 'إدارة المحتوى والخدمات | Catalog',
    type: 'group',
    icon: 'icon-navigation',
    roles: ['Admin', 'Marketer', 'CustomerSupport'],
    children: [
      {
        id: 'invitation-cards',
        title: 'بطاقات الدعوة',
        type: 'item',
        classes: 'nav-item',
        url: '/invitation-cards',
        icon: 'layout',
        breadcrumbs: false,
        roles: ['Admin', 'Marketer', 'CustomerSupport']
      },
      {
        id: 'packages',
        title: 'باقات الأسعار',
        type: 'item',
        classes: 'nav-item',
        url: '/packages',
        icon: 'audit',
        breadcrumbs: false,
        roles: ['Admin', 'Marketer', 'CustomerSupport']
      },
      {
        id: 'orders',
        title: 'الطلبات والمشتريات',
        type: 'item',
        classes: 'nav-item',
        url: '/orders',
        icon: 'shopping-cart',
        breadcrumbs: false,
        roles: ['Admin', 'Marketer']
      },
      {
        id: 'event-types',
        title: 'أنواع المناسبات',
        type: 'item',
        classes: 'nav-item',
        url: '/event-types',
        icon: 'tag',
        breadcrumbs: false,
        roles: ['Admin']
      },
      {
        id: 'features',
        title: 'المميزات والخصائص',
        type: 'item',
        classes: 'nav-item',
        url: '/features',
        icon: 'unordered-list',
        breadcrumbs: false,
        roles: ['Admin', 'Marketer']
      },
      {
        id: 'supervisors',
        title: 'المشرفين',
        type: 'item',
        classes: 'nav-item',
        url: '/supervisors',
        icon: 'user',
        breadcrumbs: false,
        roles: ['Admin']
      },
      {
        id: 'blog',
        title: 'المدونة',
        type: 'item',
        classes: 'nav-item',
        url: '/blog',
        icon: 'read',
        breadcrumbs: false,
        roles: ['Admin', 'Marketer']
      },
      {
        id: 'testimonials',
        title: 'آراء العملاء',
        type: 'item',
        classes: 'nav-item',
        url: '/testimonials',
        icon: 'comment',
        breadcrumbs: false,
        roles: ['Admin', 'Marketer']
      }
    ]
  },
  {
    id: 'system-settings-group',
    title: 'النظام والإعدادات | System',
    type: 'group',
    icon: 'icon-navigation',
    roles: ['Admin', 'Marketer'],
    children: [
      {
        id: 'countries',
        title: 'الدول',
        type: 'item',
        classes: 'nav-item',
        url: '/countries',
        icon: 'global',
        breadcrumbs: false,
        roles: ['Admin']
      },
      {
        id: 'cities',
        title: 'المدن',
        type: 'item',
        classes: 'nav-item',
        url: '/cities',
        icon: 'environment',
        breadcrumbs: false,
        roles: ['Admin']
      },
      {
        id: 'users',
        title: 'إدارة المستخدمين',
        type: 'item',
        classes: 'nav-item',
        url: '/users',
        icon: 'team',
        breadcrumbs: false,
        roles: ['Admin']
      },
      {
        id: 'register',
        title: 'تسجيل مستخدم',
        type: 'item',
        classes: 'nav-item',
        url: '/register',
        icon: 'user-add',
        breadcrumbs: false,
        roles: ['Admin']
      },
      {
        id: 'meta-tracking',
        title: 'تتبّع Meta',
        type: 'item',
        classes: 'nav-item',
        url: '/meta-tracking',
        icon: 'line-chart',
        breadcrumbs: false,
        roles: ['Admin', 'Marketer']
      },
      {
        id: 'site-settings',
        title: 'إعدادات الموقع',
        type: 'item',
        classes: 'nav-item',
        url: '/site-settings',
        icon: 'setting',
        breadcrumbs: false,
        roles: ['Admin']
      }
    ]
  }
];
