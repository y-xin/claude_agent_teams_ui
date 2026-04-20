/**
 * ContextSwitchOverlay - Full-screen loading overlay during context switches.
 *
 * Displayed when isContextSwitching is true, preventing stale data flash
 * during workspace transitions.
 */

import React from 'react';
import { useTranslation } from 'react-i18next';

import { useStore } from '@renderer/store';

export const ContextSwitchOverlay: React.FC = () => {
  const { t } = useTranslation();
  const isContextSwitching = useStore((state) => state.isContextSwitching);
  const targetContextId = useStore((state) => state.targetContextId);

  if (!isContextSwitching) {
    return null;
  }

  // 格式化上下文标签用于显示
  const contextLabel =
    targetContextId === 'local'
      ? t('workspace.local')
      : (targetContextId?.replace(/^ssh-/, '') ?? 'Unknown');

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-surface">
      <div className="flex flex-col items-center gap-4">
        {/* 加载动画 */}
        <div className="size-8 animate-spin rounded-full border-4 border-text border-t-transparent" />

        {/* 文本 */}
        <div className="flex flex-col items-center gap-1">
          <p className="text-text">{t('workspace.switchingTo', { label: contextLabel })}</p>
          <p className="text-sm text-text-secondary">{t('workspace.loadingWorkspace')}</p>
        </div>
      </div>
    </div>
  );
};
