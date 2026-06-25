import { cn } from '../../lib/utils';
import logoSource from '../../assets/b-trans.png';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  withText?: boolean;
}

const sizeMap = {
  sm: { width: 32, height: 32 },
  md: { width: 48, height: 48 },
  lg: { width: 64, height: 64 },
  xl: { width: 96, height: 96 },
};

export function Logo({ size = 'md', className, withText = true }: LogoProps) {
  const dimensions = sizeMap[size];

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <img 
        src={logoSource} 
        alt="Trans ByGagoos" 
        width={dimensions.width}
        height={dimensions.height}
        className="object-contain"
      />
      {withText && (
        <div className="flex flex-col">
          <span className="font-bold text-primary leading-tight text-lg">
            BYGAGOOS
          </span>
          <span className="text-[10px] text-muted-foreground tracking-[0.3em] uppercase">
            Trans
          </span>
        </div>
      )}
    </div>
  );
}