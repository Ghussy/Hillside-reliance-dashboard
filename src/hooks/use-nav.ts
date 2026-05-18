'use client';

import { useMemo } from 'react';
import { useUser } from '@/hooks/use-auth';
import type { NavItem } from '@/types';

export function useFilteredNavItems(items: NavItem[]) {
  const { user, member, isLoaded } = useUser();

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
        // Server routes still enforce role access. Keep role-gated links visible
        // while the client-side member profile is loading or unavailable so the
        // sidebar does not hide primary tools after refresh.
        if (!isLoaded || !member) {
          return true;
        }

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
  }, [items, isLoaded, member, user]);

  return filteredItems;
}
