/**
 * SourceBadge — displays the source of a catalog item.
 */

import { useTranslation } from 'react-i18next';

import { Badge } from '@renderer/components/ui/badge';

interface SourceBadgeProps {
  source: 'official' | 'glama' | string;
}

export const SourceBadge = ({ source }: SourceBadgeProps): React.JSX.Element => {
  const { t } = useTranslation();

  if (source === 'official') {
    return (
      <Badge className="border-blue-500/30 bg-blue-500/10 text-blue-400" variant="outline">
        {t('extensions.sourceOfficial')}
      </Badge>
    );
  }
  if (source === 'glama') {
    return (
      <Badge className="border-zinc-500/30 bg-zinc-500/10 text-zinc-400" variant="outline">
        {t('extensions.sourceGlama')}
      </Badge>
    );
  }
  return (
    <Badge className="border-orange-500/30 bg-orange-500/10 text-orange-400" variant="outline">
      {t('extensions.sourceCommunity')}
    </Badge>
  );
};
