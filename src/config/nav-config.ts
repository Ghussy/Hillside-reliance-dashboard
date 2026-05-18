import type { NavItem } from '@/types';

/**
 * Navigation configuration with RBAC support
 *
 * This configuration is used for both the sidebar navigation and Cmd+K bar.
 *
 * RBAC Access Control:
 * Each navigation item can have an `access` property that controls visibility
 * based on permissions, plans, features, roles, and organization context.
 *
 * Examples:
 *
 * 1. Require organization:
 *    access: { requireOrg: true }
 *
 * 2. Require specific permission:
 *    access: { requireOrg: true, permission: 'org:teams:manage' }
 *
 * 3. Require specific plan:
 *    access: { plan: 'pro' }
 *
 * 4. Require specific feature:
 *    access: { feature: 'premium_access' }
 *
 * 5. Require specific role:
 *    access: { role: 'admin' }
 *
 * 6. Multiple conditions (all must be true):
 *    access: { requireOrg: true, permission: 'org:teams:manage', plan: 'pro' }
 *
 * Note: The `visible` function is deprecated but still supported for backward compatibility.
 * Use the `access` property for new items.
 */
export const navItems: NavItem[] = [
  {
    title: 'Cases',
    url: '/dashboard/cases',
    icon: 'post',
    shortcut: ['c', 's'],
    isActive: false,
    items: [],
    access: { role: 'committee' }
  },
  {
    title: 'Members',
    url: '/dashboard/members',
    icon: 'product',
    shortcut: ['m', 'b'],
    isActive: false,
    items: []
  },
  {
    title: 'Settings',
    url: '/dashboard/settings',
    icon: 'settings',
    shortcut: ['s', 's'],
    isActive: false,
    items: [],
    access: { role: 'committee' }
  }
];
