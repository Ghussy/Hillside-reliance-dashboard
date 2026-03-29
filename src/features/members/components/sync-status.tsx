'use client';

import { motion } from 'motion/react';
import { RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

type SyncStatusProps = {
  label: string;
};

export function SyncStatus({ label }: SyncStatusProps) {
  return (
    <Badge
      variant='outline'
      className='text-muted-foreground gap-1.5 font-normal'
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
      >
        <RefreshCw className='size-3' />
      </motion.div>
      {label}
    </Badge>
  );
}
