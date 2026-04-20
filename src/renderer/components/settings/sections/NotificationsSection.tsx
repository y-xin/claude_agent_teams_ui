/**
 * NotificationsSection - Notification settings including triggers and ignored repositories.
 */

import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { api } from '@renderer/api';
import {
  RepositoryDropdown,
  SelectedRepositoryItem,
} from '@renderer/components/common/RepositoryDropdown';
import {
  AlertTriangle,
  ArrowRightLeft,
  Bell,
  BellRing,
  CheckCircle2,
  CirclePlus,
  Clock,
  ExternalLink,
  EyeOff,
  GitBranch,
  HelpCircle,
  Inbox,
  Info,
  Mail,
  MessageSquare,
  PartyPopper,
  Rocket,
  Send,
  ShieldQuestion,
  Users,
  Volume2,
} from 'lucide-react';

import { SettingRow, SettingsSectionHeader, SettingsSelect, SettingsToggle } from '../components';
import { NotificationTriggerSettings } from '../NotificationTriggerSettings';

import type { RepositoryDropdownItem, SafeConfig } from '../hooks/useSettingsConfig';
import type { NotificationTrigger } from '@renderer/types/data';
import type { TeamReviewState, TeamTaskStatus } from '@shared/types';

/** Notification targets span workflow status plus the explicit review axis. */
type NotifiableStatus =
  | TeamTaskStatus
  | Extract<TeamReviewState, 'review' | 'needsFix' | 'approved'>;

// Snooze duration options
const SNOOZE_OPTIONS = [
  { value: 15, label: '15 minutes' },
  { value: 30, label: '30 minutes' },
  { value: 60, label: '1 hour' },
  { value: 120, label: '2 hours' },
  { value: 240, label: '4 hours' },
  { value: -1, label: 'Until tomorrow' },
] as const;

interface NotificationsSectionProps {
  readonly safeConfig: SafeConfig;
  readonly saving: boolean;
  readonly isSnoozed: boolean;
  readonly ignoredRepositoryItems: RepositoryDropdownItem[];
  readonly excludedRepositoryIds: string[];
  readonly onNotificationToggle: (
    key:
      | 'enabled'
      | 'soundEnabled'
      | 'includeSubagentErrors'
      | 'notifyOnLeadInbox'
      | 'notifyOnUserInbox'
      | 'notifyOnClarifications'
      | 'notifyOnStatusChange'
      | 'notifyOnTaskComments'
      | 'notifyOnTaskCreated'
      | 'notifyOnAllTasksCompleted'
      | 'notifyOnCrossTeamMessage'
      | 'notifyOnTeamLaunched'
      | 'notifyOnToolApproval'
      | 'statusChangeOnlySolo',
    value: boolean
  ) => void;
  readonly onStatusChangeStatusesUpdate: (statuses: string[]) => void;
  readonly onSnooze: (minutes: number) => Promise<void>;
  readonly onClearSnooze: () => Promise<void>;
  readonly onAddIgnoredRepository: (item: RepositoryDropdownItem) => Promise<void>;
  readonly onRemoveIgnoredRepository: (repositoryId: string) => Promise<void>;
  readonly onAddTrigger: (trigger: Omit<NotificationTrigger, 'isBuiltin'>) => Promise<void>;
  readonly onUpdateTrigger: (
    triggerId: string,
    updates: Partial<NotificationTrigger>
  ) => Promise<void>;
  readonly onRemoveTrigger: (triggerId: string) => Promise<void>;
}

export const NotificationsSection = ({
  safeConfig,
  saving,
  isSnoozed,
  ignoredRepositoryItems,
  excludedRepositoryIds,
  onNotificationToggle,
  onSnooze,
  onClearSnooze,
  onAddIgnoredRepository,
  onRemoveIgnoredRepository,
  onAddTrigger,
  onUpdateTrigger,
  onRemoveTrigger,
  onStatusChangeStatusesUpdate,
}: NotificationsSectionProps): React.JSX.Element => {
  const { t } = useTranslation();
  const [testStatus, setTestStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [testError, setTestError] = useState<string | null>(null);

  const translatedSnoozeOptions = useMemo(
    () => [
      { value: 0, label: t('settings.notifications.selectDuration') },
      ...SNOOZE_OPTIONS.map((opt) => ({
        value: opt.value,
        label: t(
          `settings.notifications.${opt.value === 15 ? '15minutes' : opt.value === 30 ? '30minutes' : opt.value === 60 ? '1hour' : opt.value === 120 ? '2hours' : opt.value === 240 ? '4hours' : 'untilTomorrow'}`
        ),
      })),
    ],
    [t]
  );

  const handleTestNotification = async (): Promise<void> => {
    setTestStatus('sending');
    setTestError(null);
    try {
      const result = await api.notifications.testNotification();
      if (result.success) {
        setTestStatus('success');
        setTimeout(() => setTestStatus('idle'), 3000);
      } else {
        setTestStatus('error');
        setTestError(result.error ?? 'Unknown error');
        setTimeout(() => setTestStatus('idle'), 5000);
      }
    } catch (err) {
      console.error('[notifications] testNotification failed:', err);
      setTestStatus('error');
      const message = err instanceof Error ? err.message : 'Failed to send test notification';
      setTestError(message);
      setTimeout(() => setTestStatus('idle'), 5000);
    }
  };

  const isDev = import.meta.env.DEV;

  return (
    <div>
      {/* Dev-mode warning */}
      {isDev ? (
        <div
          className="mb-4 flex items-start gap-2.5 rounded-lg border p-3"
          style={{
            borderColor: 'rgba(234, 179, 8, 0.2)',
            backgroundColor: 'rgba(234, 179, 8, 0.05)',
          }}
        >
          <Info className="mt-0.5 size-4 shrink-0 text-yellow-500" />
          <div>
            <div className="text-sm font-medium text-yellow-500">
              {t('settings.notifications.devMode')}
            </div>
            <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              Notifications may not work in development mode. macOS identifies the app as
              &quot;Electron&quot; (bundle ID <code className="text-xs">com.github.Electron</code>)
              instead of the production app name. Check System Settings → Notifications → Electron
              to verify permissions.
            </div>
          </div>
        </div>
      ) : null}

      {/* Notification Settings */}
      <SettingsSectionHeader
        title={t('settings.notifications.title')}
        icon={<Bell className="size-3.5" />}
      />
      <SettingRow
        label={t('settings.notifications.enableSystemNotifications')}
        description={t('settings.notifications.enableSystemNotificationsDesc')}
        icon={<BellRing className="size-4" />}
      >
        <SettingsToggle
          enabled={safeConfig.notifications.enabled}
          onChange={(v) => onNotificationToggle('enabled', v)}
          disabled={saving}
        />
      </SettingRow>
      <SettingRow
        label={t('settings.notifications.playSound')}
        description={t('settings.notifications.playSoundDesc')}
        icon={<Volume2 className="size-4" />}
      >
        <SettingsToggle
          enabled={safeConfig.notifications.soundEnabled}
          onChange={(v) => onNotificationToggle('soundEnabled', v)}
          disabled={saving || !safeConfig.notifications.enabled}
        />
      </SettingRow>
      <SettingRow
        label={t('settings.notifications.includeSubagentErrors')}
        description={t('settings.notifications.includeSubagentErrorsDesc')}
        icon={<AlertTriangle className="size-4" />}
      >
        <SettingsToggle
          enabled={safeConfig.notifications.includeSubagentErrors}
          onChange={(v) => onNotificationToggle('includeSubagentErrors', v)}
          disabled={saving || !safeConfig.notifications.enabled}
        />
      </SettingRow>
      <SettingRow
        label={t('settings.notifications.testNotification')}
        description={t('settings.notifications.testNotificationDesc')}
        icon={<Send className="size-4" />}
      >
        <div className="flex items-center gap-2">
          {testStatus === 'success' ? (
            <span className="text-xs text-green-400">{t('common.sent')}</span>
          ) : testStatus === 'error' ? (
            <span className="max-w-48 truncate text-xs text-red-400">{testError}</span>
          ) : null}
          <button
            onClick={handleTestNotification}
            disabled={saving || !safeConfig.notifications.enabled || testStatus === 'sending'}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors hover:brightness-125 ${
              saving || !safeConfig.notifications.enabled || testStatus === 'sending'
                ? 'cursor-not-allowed opacity-50'
                : ''
            }`}
            style={{
              backgroundColor: 'var(--color-border-emphasis)',
              color: 'var(--color-text)',
            }}
          >
            {testStatus === 'sending' ? t('common.sending') : t('settings.notifications.sendTest')}
          </button>
        </div>
      </SettingRow>
      <SettingRow
        label={t('settings.notifications.snoozeNotifications')}
        description={
          isSnoozed
            ? t('settings.notifications.snoozedUntil', {
                time: new Date(safeConfig.notifications.snoozedUntil!).toLocaleTimeString(),
              })
            : t('settings.notifications.temporarilyPause')
        }
        icon={<Clock className="size-4" />}
      >
        <div className="flex items-center gap-2">
          {isSnoozed ? (
            <button
              onClick={onClearSnooze}
              disabled={saving}
              className={`rounded-md bg-red-500/10 px-3 py-1.5 text-sm font-medium text-red-400 transition-all duration-150 hover:bg-red-500/20 ${saving ? 'cursor-not-allowed opacity-50' : ''} `}
            >
              {t('settings.notifications.clearSnooze')}
            </button>
          ) : (
            <SettingsSelect
              value={0}
              options={translatedSnoozeOptions}
              onChange={(v) => v !== 0 && onSnooze(v)}
              disabled={saving || !safeConfig.notifications.enabled}
              dropUp
            />
          )}
        </div>
      </SettingRow>

      {/* Team Notifications — grouped card */}
      <SettingsSectionHeader
        title={t('settings.notifications.teamNotifications')}
        icon={<Users className="size-3.5" />}
      />
      <div
        className="mb-4 rounded-lg border p-4"
        style={{
          borderColor: 'var(--color-border)',
          backgroundColor: 'var(--color-surface-raised)',
        }}
      >
        <SettingRow
          label={t('settings.notifications.leadInbox')}
          description={t('settings.notifications.leadInboxDesc')}
          icon={<Inbox className="size-4" />}
        >
          <SettingsToggle
            enabled={safeConfig.notifications.notifyOnLeadInbox}
            onChange={(v) => onNotificationToggle('notifyOnLeadInbox', v)}
            disabled={saving || !safeConfig.notifications.enabled}
          />
        </SettingRow>
        <SettingRow
          label={t('settings.notifications.userInbox')}
          description={t('settings.notifications.userInboxDesc')}
          icon={<Mail className="size-4" />}
        >
          <SettingsToggle
            enabled={safeConfig.notifications.notifyOnUserInbox}
            onChange={(v) => onNotificationToggle('notifyOnUserInbox', v)}
            disabled={saving || !safeConfig.notifications.enabled}
          />
        </SettingRow>
        <SettingRow
          label={t('settings.notifications.taskClarification')}
          description={t('settings.notifications.taskClarificationDesc')}
          icon={<HelpCircle className="size-4" />}
        >
          <SettingsToggle
            enabled={safeConfig.notifications.notifyOnClarifications}
            onChange={(v) => onNotificationToggle('notifyOnClarifications', v)}
            disabled={saving || !safeConfig.notifications.enabled}
          />
        </SettingRow>
        <SettingRow
          label={t('settings.notifications.taskComment')}
          description={t('settings.notifications.taskCommentDesc')}
          icon={<MessageSquare className="size-4" />}
        >
          <SettingsToggle
            enabled={safeConfig.notifications.notifyOnTaskComments}
            onChange={(v) => onNotificationToggle('notifyOnTaskComments', v)}
            disabled={saving || !safeConfig.notifications.enabled}
          />
        </SettingRow>
        <SettingRow
          label={t('settings.notifications.taskCreated')}
          description={t('settings.notifications.taskCreatedDesc')}
          icon={<CirclePlus className="size-4" />}
        >
          <SettingsToggle
            enabled={safeConfig.notifications.notifyOnTaskCreated}
            onChange={(v) => onNotificationToggle('notifyOnTaskCreated', v)}
            disabled={saving || !safeConfig.notifications.enabled}
          />
        </SettingRow>
        <SettingRow
          label={t('settings.notifications.allTasksCompleted')}
          description={t('settings.notifications.allTasksCompletedDesc')}
          icon={<CheckCircle2 className="size-4" />}
        >
          <SettingsToggle
            enabled={safeConfig.notifications.notifyOnAllTasksCompleted}
            onChange={(v) => onNotificationToggle('notifyOnAllTasksCompleted', v)}
            disabled={saving || !safeConfig.notifications.enabled}
          />
        </SettingRow>
        <SettingRow
          label={t('settings.notifications.crossTeamMessage')}
          description={t('settings.notifications.crossTeamMessageDesc')}
          icon={<GitBranch className="size-4" />}
        >
          <SettingsToggle
            enabled={safeConfig.notifications.notifyOnCrossTeamMessage}
            onChange={(v) => onNotificationToggle('notifyOnCrossTeamMessage', v)}
            disabled={saving || !safeConfig.notifications.enabled}
          />
        </SettingRow>
        <SettingRow
          label={t('settings.notifications.teamLaunched')}
          description={t('settings.notifications.teamLaunchedDesc')}
          icon={<Rocket className="size-4" />}
        >
          <SettingsToggle
            enabled={safeConfig.notifications.notifyOnTeamLaunched}
            onChange={(v) => onNotificationToggle('notifyOnTeamLaunched', v)}
            disabled={saving || !safeConfig.notifications.enabled}
          />
        </SettingRow>
        <SettingRow
          label={t('settings.notifications.toolApproval')}
          description={t('settings.notifications.toolApprovalDesc')}
          icon={<ShieldQuestion className="size-4" />}
        >
          <SettingsToggle
            enabled={safeConfig.notifications.notifyOnToolApproval}
            onChange={(v) => onNotificationToggle('notifyOnToolApproval', v)}
            disabled={saving || !safeConfig.notifications.enabled}
          />
        </SettingRow>

        {/* Task Status Change Notifications — nested within team card */}
        <div className="last:*:border-b-0">
          <SettingRow
            label={t('settings.notifications.taskStatusChange')}
            description={t('settings.notifications.taskStatusChangeDesc')}
            icon={<ArrowRightLeft className="size-4" />}
          >
            <SettingsToggle
              enabled={safeConfig.notifications.notifyOnStatusChange}
              onChange={(v) => onNotificationToggle('notifyOnStatusChange', v)}
              disabled={saving || !safeConfig.notifications.enabled}
            />
          </SettingRow>
          {safeConfig.notifications.notifyOnStatusChange && safeConfig.notifications.enabled ? (
            <div
              className="flex flex-col gap-3 border-b pb-3"
              style={{ borderColor: 'var(--color-border-subtle)', paddingLeft: 30 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div
                    className="text-sm font-medium"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    {t('settings.notifications.onlySoloMode')}
                  </div>
                  <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    {t('settings.notifications.onlySoloModeDesc')}
                  </div>
                </div>
                <div className="shrink-0">
                  <SettingsToggle
                    enabled={safeConfig.notifications.statusChangeOnlySolo}
                    onChange={(v) => onNotificationToggle('statusChangeOnlySolo', v)}
                    disabled={saving}
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <div>
                  <div
                    className="text-sm font-medium"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    {t('settings.notifications.notifyOnStatuses')}
                  </div>
                  <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    {t('settings.notifications.notifyOnStatusesDesc')}
                  </div>
                </div>
                <StatusCheckboxGroup
                  selected={safeConfig.notifications.statusChangeStatuses}
                  onChange={onStatusChangeStatusesUpdate}
                  disabled={saving}
                />
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* Custom Triggers */}
      <NotificationTriggerSettings
        triggers={safeConfig.notifications.triggers || []}
        saving={saving}
        onUpdateTrigger={onUpdateTrigger}
        onAddTrigger={onAddTrigger}
        onRemoveTrigger={onRemoveTrigger}
      />

      <SettingsSectionHeader
        title={t('settings.notifications.ignoredRepos')}
        icon={<EyeOff className="size-3.5" />}
      />
      <p className="mb-3 text-xs" style={{ color: 'var(--color-text-muted)' }}>
        {t('settings.notifications.ignoredReposDesc')}
      </p>
      {ignoredRepositoryItems.length > 0 ? (
        <div className="mb-3">
          {ignoredRepositoryItems.map((item) => (
            <SelectedRepositoryItem
              key={item.id}
              item={item}
              onRemove={() => onRemoveIgnoredRepository(item.id)}
              disabled={saving}
            />
          ))}
        </div>
      ) : (
        <div
          className="mb-3 rounded-md border border-dashed py-3 text-center"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            {t('settings.notifications.noReposIgnored')}
          </p>
        </div>
      )}
      <RepositoryDropdown
        onSelect={onAddIgnoredRepository}
        excludeIds={excludedRepositoryIds}
        placeholder={t('settings.notifications.selectRepoToIgnore')}
        disabled={saving}
        dropUp
      />

      {/* Task Completion Notifications */}
      <SettingsSectionHeader
        title={t('settings.notifications.taskCompletion')}
        icon={<PartyPopper className="size-3.5" />}
      />
      <div
        className="mb-4 rounded-lg border p-4"
        style={{
          borderColor: 'var(--color-border)',
          backgroundColor: 'var(--color-surface-raised)',
        }}
      >
        <p className="mb-3 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          {t('settings.notifications.taskCompletionDesc')}
        </p>
        <button
          onClick={() =>
            void api.openExternal('https://github.com/777genius/claude-notifications-go')
          }
          className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors hover:brightness-125"
          style={{
            backgroundColor: 'var(--color-border-emphasis)',
            color: 'var(--color-text)',
          }}
        >
          <ExternalLink className="size-3.5" />
          {t('settings.notifications.installPlugin')}
        </button>
      </div>
    </div>
  );
};

const STATUS_OPTIONS: { value: NotifiableStatus; labelKey: string }[] = [
  { value: 'in_progress', labelKey: 'settings.notifications.statusStarted' },
  { value: 'completed', labelKey: 'settings.notifications.statusCompleted' },
  { value: 'review', labelKey: 'settings.notifications.statusReview' },
  { value: 'needsFix', labelKey: 'settings.notifications.statusNeedsFixes' },
  { value: 'approved', labelKey: 'settings.notifications.statusApproved' },
  { value: 'pending', labelKey: 'settings.notifications.statusPending' },
  { value: 'deleted', labelKey: 'settings.notifications.statusDeleted' },
];

const StatusCheckboxGroup = ({
  selected,
  onChange,
  disabled,
}: {
  selected: string[];
  onChange: (statuses: string[]) => void;
  disabled: boolean;
}): React.JSX.Element => {
  const { t } = useTranslation();
  return (
    <div className="flex flex-wrap gap-2">
      {STATUS_OPTIONS.map((opt) => {
        const checked = selected.includes(opt.value);
        return (
          <button
            key={opt.value}
            type="button"
            disabled={disabled}
            onClick={() => {
              const next = checked
                ? selected.filter((s) => s !== opt.value)
                : [...selected, opt.value];
              onChange(next);
            }}
            className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
              checked
                ? 'bg-indigo-500/20 text-indigo-400'
                : 'bg-[var(--color-surface-raised)] text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]'
            } ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
          >
            {t(opt.labelKey)}
          </button>
        );
      })}
    </div>
  );
};
