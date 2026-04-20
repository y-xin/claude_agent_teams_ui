/**
 * Empty state shown when no file is open in the editor.
 * Shows keyboard shortcuts cheatsheet.
 */

import { useTranslation } from 'react-i18next';

import { shortcutLabel } from '@renderer/utils/platformKeys';
import { FileCode } from 'lucide-react';

export const EditorEmptyState = (): React.ReactElement => {
  const { t } = useTranslation();

  const SHORTCUTS = [
    { keys: shortcutLabel('⌘ P', 'Ctrl+P'), label: t('team.editor.quickOpen') },
    { keys: shortcutLabel('⌘ ⇧ F', 'Ctrl+Shift+F'), label: t('team.editor.searchInFiles') },
    { keys: shortcutLabel('⌘ S', 'Ctrl+S'), label: t('common.save') },
    { keys: shortcutLabel('⌘ B', 'Ctrl+B'), label: t('team.editor.toggleSidebar') },
    { keys: shortcutLabel('⌘ G', 'Ctrl+G'), label: t('team.editor.goToLine') },
    { keys: 'Esc', label: t('team.editor.closeEditorShort') },
  ];

  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 text-text-muted">
      <FileCode className="size-12 opacity-30" />
      <p className="text-sm">{t('team.editor.selectFileToEdit')}</p>
      <div className="mt-2 grid grid-cols-2 gap-x-6 gap-y-1.5">
        {SHORTCUTS.map((s) => (
          <div key={s.keys} className="flex items-center justify-between gap-4 text-xs">
            <span className="text-text-muted">{s.label}</span>
            <kbd className="rounded border border-border bg-surface-raised px-1.5 py-0.5 font-mono text-[10px] text-text-secondary">
              {s.keys}
            </kbd>
          </div>
        ))}
      </div>
    </div>
  );
};
