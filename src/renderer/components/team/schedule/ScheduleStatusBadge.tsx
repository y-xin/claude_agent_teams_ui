import React from 'react';
import { useTranslation } from 'react-i18next';

import type { ScheduleRunStatus, ScheduleStatus } from '@shared/types';

// =============================================================================
// Schedule Status Badge
// =============================================================================

const SCHEDULE_STATUS_CONFIG: Record<ScheduleStatus, { labelKey: string; className: string }> = {
  active: {
    labelKey: 'team.schedule.status.active',
    className: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  },
  paused: {
    labelKey: 'team.schedule.status.paused',
    className: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
  },
  disabled: {
    labelKey: 'team.schedule.status.disabled',
    className: 'bg-zinc-500/15 text-zinc-400 border-zinc-500/20',
  },
};

interface ScheduleStatusBadgeProps {
  status: ScheduleStatus;
}

export const ScheduleStatusBadge = ({ status }: ScheduleStatusBadgeProps): React.JSX.Element => {
  const { t } = useTranslation();
  const config = SCHEDULE_STATUS_CONFIG[status];
  return (
    <span
      className={`inline-flex items-center rounded-full border px-1.5 py-0.5 text-[10px] font-medium ${config.className}`}
    >
      {t(config.labelKey)}
    </span>
  );
};

// =============================================================================
// Run Status Badge
// =============================================================================

const RUN_STATUS_CONFIG: Record<ScheduleRunStatus, { labelKey: string; className: string }> = {
  pending: { labelKey: 'team.schedule.runStatus.pending', className: 'text-zinc-400' },
  warming_up: { labelKey: 'team.schedule.runStatus.warmingUp', className: 'text-blue-400' },
  warm: { labelKey: 'team.schedule.runStatus.warm', className: 'text-cyan-400' },
  running: { labelKey: 'team.schedule.runStatus.running', className: 'text-emerald-400' },
  completed: { labelKey: 'team.schedule.runStatus.completed', className: 'text-emerald-400' },
  failed: { labelKey: 'team.schedule.runStatus.failed', className: 'text-red-400' },
  failed_interrupted: {
    labelKey: 'team.schedule.runStatus.interrupted',
    className: 'text-amber-400',
  },
  cancelled: { labelKey: 'team.schedule.runStatus.cancelled', className: 'text-zinc-400' },
};

interface RunStatusBadgeProps {
  status: ScheduleRunStatus;
}

export const RunStatusBadge = ({ status }: RunStatusBadgeProps): React.JSX.Element => {
  const { t } = useTranslation();
  const config = RUN_STATUS_CONFIG[status];
  return (
    <span className={`text-[10px] font-medium ${config.className}`}>{t(config.labelKey)}</span>
  );
};
