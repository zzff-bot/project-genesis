import { cn } from '@/shared/utils/cn';
import { useState } from 'react';
import type { VisualStyle } from '@/shared/types';

interface AvatarProps {
  src?: string;
  alt?: string;
  fallback?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'circle' | 'rounded';
  /** 无 src 时的背景渐变方案 */
  colorScheme?: VisualStyle | 'user';
  /** 在线状态指示器 */
  status?: 'online' | 'offline' | 'away';
  className?: string;
}

const sizeMap = {
  xs: { px: 24, text: 'text-xs' },
  sm: { px: 32, text: 'text-sm' },
  md: { px: 40, text: 'text-base' },
  lg: { px: 56, text: 'text-lg' },
  xl: { px: 72, text: 'text-xl' },
} as const;

const colorSchemeGradients: Record<string, string> = {
  modern: 'linear-gradient(135deg, #6366f1, #818cf8)',
  warm: 'linear-gradient(135deg, #d97706, #f59e0b)',
  playful: 'linear-gradient(135deg, #ec4899, #f472b6)',
  user: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-light))',
};

const statusColor = {
  online: 'bg-emerald-500',
  offline: 'bg-gray-400',
  away: 'bg-amber-500',
} as const;

/** 通用头像 */
export function Avatar({
  src,
  alt = '',
  fallback,
  size = 'md',
  variant = 'circle',
  colorScheme = 'user',
  status,
  className,
}: AvatarProps) {
  const [imgError, setImgError] = useState(false);
  const dimensions = sizeMap[size];
  const radius = variant === 'circle' ? 'var(--avatar-radius, 9999px)' : 'var(--avatar-radius, var(--radius-lg))';
  const gradient = colorSchemeGradients[colorScheme] ?? colorSchemeGradients.user;

  const showImage = src && !imgError;

  return (
    <div
      className={cn('relative inline-flex shrink-0', className)}
      style={{ width: dimensions.px, height: dimensions.px }}
    >
      {showImage ? (
        <img
          src={src}
          alt={alt}
          onError={() => setImgError(true)}
          className="w-full h-full object-cover"
          style={{ borderRadius: radius }}
        />
      ) : (
        <div
          className={cn(
            'w-full h-full flex items-center justify-center text-white font-semibold select-none',
            dimensions.text,
          )}
          style={{ background: gradient, borderRadius: radius }}
        >
          {fallback || alt.charAt(0)?.toUpperCase() || '?'}
        </div>
      )}

      {status && (
        <span
          className={cn(
            'absolute bottom-0 right-0 block rounded-full ring-2 ring-[var(--color-surface)]',
            statusColor[status],
          )}
          style={{
            width: Math.max(dimensions.px * 0.28, 8),
            height: Math.max(dimensions.px * 0.28, 8),
          }}
        />
      )}
    </div>
  );
}
