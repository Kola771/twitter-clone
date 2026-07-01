import Image from 'next/image';
import { cn } from '@/lib/utils';

interface AvatarProps {
  src?: string | null;
  alt: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizes = {
  xs: 'h-6 w-6',
  sm: 'h-8 w-8',
  md: 'h-10 w-10',
  lg: 'h-12 w-12',
  xl: 'h-16 w-16',
};

const px = { xs: 24, sm: 32, md: 40, lg: 48, xl: 64 };

export default function Avatar({ src, alt, size = 'md', className }: AvatarProps) {
  const initials = alt
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  if (src) {
    return (
      <div className={cn('relative rounded-full overflow-hidden flex-shrink-0', sizes[size], className)}>
        <Image src={src} alt={alt} fill className="object-cover" sizes={`${px[size]}px`} />
      </div>
    );
  }

  return (
    <div
      className={cn(
        'rounded-full bg-sky-600 flex items-center justify-center flex-shrink-0 text-white font-semibold',
        sizes[size],
        size === 'xs' && 'text-[10px]',
        size === 'sm' && 'text-xs',
        size === 'md' && 'text-sm',
        size === 'lg' && 'text-base',
        size === 'xl' && 'text-xl',
        className
      )}
    >
      {initials}
    </div>
  );
}
