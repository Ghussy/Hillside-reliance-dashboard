'use client';

import { useMemo } from 'react';
import { useUser } from '@/hooks/use-auth';
import type { NavItem } from '@/types';

export function useFilteredNavItems(items: NavItem[]) {
  const { user } = useUser();

  const filteredItems = useMemo(() => {
    return items
      .filter((item) => {
        if (!item.access) {
          return true;
        }

        // With Supabase, we don't have built-in org context.
        // Show all items for authenticated users; hide org-required items
        // since organizations aren't implemented yet.
        if (item.access.requireOrg) {
          return false;
        }

        return !!user;
      })
      .map((item) => {
        if (item.items && item.items.length > 0) {
          const filteredChildren = item.items.filter((childItem) => {
            if (!childItem.access) {
              return true;
            }

            if (childItem.access.requireOrg) {
              return false;
            }

            return !!user;
          });

          return {
            ...item,
            items: filteredChildren
          };
        }

        return item;
      });
  }, [items, user]);

  return filteredItems;
}
