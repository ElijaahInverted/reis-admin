import { LucideIcon } from 'lucide-react';

export interface MenuItem {
  id: string;
  label: string;
  icon: LucideIcon;
  href?: string;
}

interface NavItemProps {
  item: MenuItem;
  isActive: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onClick: () => void;
}

export const NavItem = ({
  item,
  isActive,
  onMouseEnter,
  onMouseLeave,
  onClick,
}: NavItemProps) => {
  const Icon = item.icon;

  return (
    <div className="relative flex items-center justify-center w-full">
      <button
        onClick={onClick}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        className={`w-14 h-auto min-h-[56px] py-2 rounded-xl flex flex-col items-center justify-center transition-all duration-200 mx-auto
          ${isActive 
            ? 'bg-primary/10 text-primary shadow-sm' 
            : 'text-base-content/50 hover:bg-base-100 hover:text-base-content hover:shadow-sm'
          }`}
        aria-label={item.label}
      >
        <Icon className="w-5 h-5" />
        <span className="text-[10px] mt-1 font-medium w-full text-center px-1 leading-tight">
          {item.label}
        </span>
      </button>
    </div>
  );
};
