import React from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { SortDirection } from '@/hooks/useSalesAnalytics';

interface SortButtonProps {
  label: string;
  active: boolean;
  direction: SortDirection;
  onClick: () => void;
}

export function SortButton({ label, active, direction, onClick }: SortButtonProps) {
  return (
    <Button
      variant={active ? 'secondary' : 'ghost'}
      size="sm"
      onClick={onClick}
      className="gap-1 text-xs"
    >
      {label}
      {active ? (
        direction === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
      ) : (
        <ArrowUpDown className="h-3 w-3 opacity-50" />
      )}
    </Button>
  );
}
