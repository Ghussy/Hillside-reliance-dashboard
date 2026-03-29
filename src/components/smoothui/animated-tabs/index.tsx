'use client';

import { cn } from '@/lib/utils';
import { motion, useReducedMotion } from 'motion/react';
import { type ReactNode, useCallback, useId, useState } from 'react';

export interface AnimatedTabsProps {
  tabs: { id: string; label: string; icon?: ReactNode }[];
  activeTab?: string;
  defaultTab?: string;
  onChange?: (tabId: string) => void;
  variant?: 'underline' | 'pill' | 'segment';
  layoutId?: string;
  className?: string;
}

const SPRING = {
  type: 'spring' as const,
  duration: 0.25,
  bounce: 0.05
};

export default function AnimatedTabs({
  tabs,
  activeTab: controlledActiveTab,
  defaultTab,
  onChange,
  variant = 'underline',
  layoutId: customLayoutId,
  className
}: AnimatedTabsProps) {
  const shouldReduceMotion = useReducedMotion();
  const generatedId = useId();
  const layoutId = customLayoutId ?? `animated-tabs-${generatedId}`;

  const [internalActiveTab, setInternalActiveTab] = useState(
    defaultTab ?? tabs[0]?.id ?? ''
  );

  const isControlled = controlledActiveTab !== undefined;
  const activeTab = isControlled ? controlledActiveTab : internalActiveTab;

  const handleTabChange = useCallback(
    (tabId: string) => {
      if (!isControlled) {
        setInternalActiveTab(tabId);
      }
      onChange?.(tabId);
    },
    [isControlled, onChange]
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent, currentIndex: number) => {
      let newIndex = currentIndex;

      if (event.key === 'ArrowRight') {
        event.preventDefault();
        newIndex = (currentIndex + 1) % tabs.length;
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        newIndex = (currentIndex - 1 + tabs.length) % tabs.length;
      } else if (event.key === 'Home') {
        event.preventDefault();
        newIndex = 0;
      } else if (event.key === 'End') {
        event.preventDefault();
        newIndex = tabs.length - 1;
      } else {
        return;
      }

      const newTab = tabs[newIndex];
      if (newTab) {
        handleTabChange(newTab.id);
        const tabElement = document.getElementById(
          `${layoutId}-tab-${newTab.id}`
        );
        tabElement?.focus();
      }
    },
    [tabs, handleTabChange, layoutId]
  );

  const baseContainerStyles = cn(
    'relative inline-flex items-center justify-center',
    variant === 'underline' && 'gap-1 border-border border-b',
    variant === 'pill' && 'gap-1 rounded-full bg-muted p-1',
    variant === 'segment' &&
      'bg-muted text-muted-foreground inline-flex h-9 w-fit rounded-lg p-[3px]'
  );

  const getTabStyles = (isActive: boolean) =>
    cn(
      'relative z-10 inline-flex items-center justify-center gap-1.5 text-sm font-medium whitespace-nowrap transition-[color,box-shadow]',
      'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-ring focus-visible:ring-[3px] focus-visible:outline-1',
      'disabled:pointer-events-none disabled:opacity-50',
      "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
      variant === 'underline' && [
        'rounded-t-md px-4 py-2',
        isActive
          ? 'text-foreground'
          : 'text-muted-foreground hover:text-foreground'
      ],
      variant === 'pill' && [
        'rounded-full px-4 py-2',
        isActive
          ? 'text-foreground'
          : 'text-muted-foreground hover:text-foreground'
      ],
      variant === 'segment' && [
        'h-[calc(100%-1px)] flex-1 rounded-md border border-transparent px-2 py-1',
        isActive
          ? 'text-foreground dark:text-foreground'
          : 'text-foreground dark:text-muted-foreground hover:text-foreground'
      ]
    );

  const getIndicatorStyles = () =>
    cn(
      'absolute',
      variant === 'underline' && 'right-0 -bottom-px left-0 h-0.5 bg-primary',
      variant === 'pill' &&
        'inset-0 rounded-full border border-border bg-background shadow-sm',
      variant === 'segment' &&
        'inset-0 rounded-md bg-background shadow-sm dark:border dark:border-input dark:bg-input/30'
    );

  return (
    <div
      aria-label='Tabs'
      className={cn(baseContainerStyles, className)}
      role='tablist'
    >
      {tabs.map((tab, index) => {
        const isActive = activeTab === tab.id;

        return (
          <button
            aria-selected={isActive}
            className={getTabStyles(isActive)}
            id={`${layoutId}-tab-${tab.id}`}
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            role='tab'
            tabIndex={isActive ? 0 : -1}
            type='button'
          >
            {isActive && (
              <motion.span
                className={getIndicatorStyles()}
                layout
                layoutId={layoutId}
                style={{ originY: '0px' }}
                transition={shouldReduceMotion ? { duration: 0 } : SPRING}
              />
            )}
            {tab.icon && <span className='relative z-10'>{tab.icon}</span>}
            <span className='relative z-10'>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
