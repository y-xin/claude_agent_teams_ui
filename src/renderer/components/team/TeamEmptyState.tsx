import { useTranslation } from 'react-i18next';

export const TeamEmptyState = (): React.JSX.Element => {
  const { t } = useTranslation();
  return (
    <div className="flex size-full items-center justify-center">
      <div className="text-center">
        <p className="text-lg font-medium text-[var(--color-text)]">{t('team.noTeamsFound')}</p>
        <p className="mt-2 text-sm text-[var(--color-text-muted)]">{t('team.noTeamsFoundDesc')}</p>
      </div>
    </div>
  );
};
