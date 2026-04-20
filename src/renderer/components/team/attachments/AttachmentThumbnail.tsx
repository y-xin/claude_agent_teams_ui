import { useTranslation } from 'react-i18next';

import { cn } from '@renderer/lib/utils';

interface AttachmentThumbnailProps {
  src: string;
  alt?: string;
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

const sizeClasses: Record<string, string> = {
  sm: 'size-12',
  md: 'size-20',
  lg: 'size-32',
};

export const AttachmentThumbnail = ({
  src,
  alt,
  size = 'md',
  onClick,
}: AttachmentThumbnailProps): React.JSX.Element => {
  const { t } = useTranslation();
  // 使用传入的 alt 或回退到翻译的默认值
  const resolvedAlt = alt ?? t('team.attachments.attachment');
  const img = (
    <img
      src={src}
      alt={resolvedAlt}
      className={cn(
        'rounded-md border border-[var(--color-border)] object-cover',
        sizeClasses[size],
        onClick && 'cursor-pointer transition-opacity hover:opacity-80'
      )}
      draggable={false}
    />
  );
  if (onClick) {
    return (
      <button type="button" className="block border-0 bg-transparent p-0" onClick={onClick}>
        {img}
      </button>
    );
  }
  return img;
};
