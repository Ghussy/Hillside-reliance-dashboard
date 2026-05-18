'use client';

import { useMemo } from 'react';
import { useUser } from '@/hooks/use-auth';
import type { NavItem } from '@/types';

export function useFilteredNavItems(items: NavItem[]) {
  const { user, member } = useUser();

  const filteredItems = useMemo(() => {
    const canAccess = (item: NavItem): boolean => {
      if (!item.access) {
        return true;
      }

      if (item.access.requireOrg) {
        return false;
      }

      if (!user) {
        return false;
      }

      if (item.access.role) {
        if (item.access.role === 'committee') {
          return member?.role === 'committee' || member?.role === 'admin';
        }

        return member?.role === item.access.role;
      }

      return true;
    };

    return items
      .filter((item) => {
        return canAccess(item);
      })
      .map((item) => {
        if (item.items && item.items.length > 0) {
          const filteredChildren = item.items.filter((childItem) => {
            return canAccess(childItem);
          });

          return {
            ...item,
            items: filteredChildren
          };
        }

        return item;
      });
  }, [items, member?.role, user]);

  return filteredItems;
}
