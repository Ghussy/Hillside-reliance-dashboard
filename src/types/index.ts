import type { Icons } from '@/components/icons';

export interface PermissionCheck {
  permission?: string;
  plan?: string;
  feature?: string;
  role?: string;
  requireOrg?: boolean;
}

export interface NavItem {
  title: string;
  url: string;
  disabled?: boolean;
  external?: boolean;
  shortcut?: [string, string];
  icon?: keyof typeof Icons;
  label?: string;
  description?: string;
  isActive?: boolean;
  items?: NavItem[];
  access?: PermissionCheck;
}

export interface NavItemWithChildren extends NavItem {
  items: NavItemWithChildren[];
}

export interface NavItemWithOptionalChildren extends NavItem {
  items?: NavItemWithChildren[];
}

export interface FooterItem {
  title: string;
  items: {
    title: string;
    href: string;
    external?: boolean;
  }[];
}

export type MainNavItem = NavItemWithOptionalChildren;

export type SidebarNavItem = NavItemWithChildren;

export interface Calling {
  name: string;
  organization: string;
}

export interface Member {
  id: string;
  auth_id: string | null;
  name: string;
  email?: string | null;
  phone?: string | null;
  role: string;
  photo_url?: string | null;
  household_name?: string | null;
  address?: string | null;
  status: string;
  callings: Calling[];
  synced_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  email_manual?: boolean;
  phone_manual?: boolean;
}
