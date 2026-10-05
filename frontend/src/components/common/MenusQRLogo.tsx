import { ChefHat } from 'lucide-react';

export const MenusQRIcon = ({ className }: { className?: string }) => (
  <ChefHat className={className} />
);

export default function MenusQRLogo({ size = 'md', darkBg = false, brandName = 'MenusQR' }: { size?: 'sm' | 'md' | 'lg', darkBg?: boolean, brandName?: string }) {
  return (
    <div className="flex items-center gap-2">
      <MenusQRIcon className={`text-menusqr-orange ${size === 'lg' ? 'w-8 h-8' : size === 'sm' ? 'w-5 h-5' : 'w-6 h-6'}`} />
      <span className={`font-bold ${size === 'lg' ? 'text-2xl' : size === 'sm' ? 'text-lg' : 'text-xl'} ${darkBg ? 'text-white' : 'text-menusqr-emerald'}`}>
        {brandName}
      </span>
    </div>
  );
}

