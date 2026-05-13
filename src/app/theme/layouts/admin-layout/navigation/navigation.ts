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
    id: 'dashboard',
    title: 'Dashboard',
    type: 'group',
    icon: 'icon-navigation',
    children: [
      {
        id: 'default',
        title: 'Default',
        type: 'item',
        classes: 'nav-item',
        url: '/dashboard/default',
        icon: 'dashboard',
        breadcrumbs: false
      }
    ]
  },
  {
    id: 'management',
    title: 'Management',
    type: 'group',
    icon: 'icon-navigation',
    children: [
      {
        id: 'invitation-cards',
        title: 'Invitation Cards',
        type: 'item',
        classes: 'nav-item',
        url: '/invitation-cards',
        icon: 'picture',
        breadcrumbs: false
      },
      {
        id: 'packages',
        title: 'Packages',
        type: 'item',
        classes: 'nav-item',
        url: '/packages',
        icon: 'audit',
        breadcrumbs: false
      },
      {
        id: 'blog',
        title: 'Blog',
        type: 'item',
        classes: 'nav-item',
        url: '/blog',
        icon: 'read',
        breadcrumbs: false
      },
      {
        id: 'testimonials',
        title: 'Testimonials',
        type: 'item',
        classes: 'nav-item',
        url: '/testimonials',
        icon: 'comment',
        breadcrumbs: false
      },
      {
        id: 'supervisors',
        title: 'Supervisors',
        type: 'item',
        classes: 'nav-item',
        url: '/supervisors',
        icon: 'user',
        breadcrumbs: false
      },
      {
        id: 'orders',
        title: 'Orders',
        type: 'item',
        classes: 'nav-item',
        url: '/orders',
        icon: 'shopping-cart',
        breadcrumbs: false
      },
      {
        id: 'contacts',
        title: 'Contact Messages',
        type: 'item',
        classes: 'nav-item',
        url: '/contacts',
        icon: 'mail',
        breadcrumbs: false
      },
      {
        id: 'countries',
        title: 'Countries',
        type: 'item',
        classes: 'nav-item',
        url: '/countries',
        icon: 'global',
        breadcrumbs: false
      },
      {
        id: 'cities',
        title: 'Cities',
        type: 'item',
        classes: 'nav-item',
        url: '/cities',
        icon: 'environment',
        breadcrumbs: false
      },
      {
        id: 'event-types',
        title: 'Event Types',
        type: 'item',
        classes: 'nav-item',
        url: '/event-types',
        icon: 'tag',
        breadcrumbs: false
      },
      {
        id: 'features',
        title: 'Features',
        type: 'item',
        classes: 'nav-item',
        url: '/features',
        icon: 'unordered-list',
        breadcrumbs: false
      },
      {
        id: 'register',
        title: 'Register User',
        type: 'item',
        classes: 'nav-item',
        url: '/register',
        icon: 'user',
        breadcrumbs: false
      },
      {
        id: 'site-settings',
        title: 'Site Settings',
        type: 'item',
        classes: 'nav-item',
        url: '/site-settings',
        icon: 'setting',
        breadcrumbs: false
      }
    ]
  }
];
