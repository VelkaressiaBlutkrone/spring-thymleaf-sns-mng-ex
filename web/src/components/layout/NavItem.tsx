import React from 'react';
import { cn } from '../../utils/cn';
import { Tooltip } from '../common/Tooltip';

interface NavItemProps {
  icon: any;
  label: string;
  onClick: () => void;
  active?: boolean;
  className?: string;
}

export const NavItem = ({ icon: Icon, label, onClick, active, className }: NavItemProps) => {
  return (
    <Tooltip label={label}>
      <button
        onClick={onClick}
        className={cn(
          "p-3 rounded-2xl transition-all flex items-center gap-2",
          active ? "bg-brand-600 text-white shadow-lg" : "text-slate-500 hover:bg-slate-100",
          className
        )}
      >
        <Icon className="w-6 h-6" />
        {active && label && <span className="text-sm font-bold">{label}</span>}
      </button>
    </Tooltip>
  );
};
