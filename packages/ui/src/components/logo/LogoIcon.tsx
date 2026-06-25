import { cn } from '../../lib/utils';
import logoSource from '../../assets/b-trans.png';

interface LogoIconProps {
  size?: number;
  className?: string;
}

export function LogoIcon({ size = 40, className }: LogoIconProps) {
  return (
    <img 
      src={logoSource} 
      alt="Trans ByGagoos" 
      width={size}
      height={size}
      className={cn('object-contain', className)}
    />
  );
}