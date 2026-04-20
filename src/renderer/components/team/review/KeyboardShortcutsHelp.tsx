import React from 'react';
import { useTranslation } from 'react-i18next';

import { IS_MAC } from '@renderer/utils/platformKeys';
import { X } from 'lucide-react';

interface KeyboardShortcutsHelpProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const mod = IS_MAC ? '\u2318' : 'Ctrl';
const alt = IS_MAC ? '\u2325' : 'Alt';
const shift = IS_MAC ? '\u21E7' : 'Shift';

export const KeyboardShortcutsHelp = ({
  open,
  onOpenChange,
}: KeyboardShortcutsHelpProps): React.ReactElement | null => {
  const { t } = useTranslation();
  if (!open) return null;

  const shortcuts = [
    { keys: [`${alt}+J`], action: t('team.review.shortcuts.nextChange') },
    { keys: [`${alt}+K`], action: t('team.review.shortcuts.prevChange') },
    { keys: [`${alt}+\u2193`], action: t('team.review.shortcuts.nextFile') },
    { keys: [`${alt}+\u2191`], action: t('team.review.shortcuts.prevFile') },
    { keys: [`${mod}+Y`], action: t('team.review.shortcuts.acceptChange') },
    { keys: [`${mod}+N`], action: t('team.review.shortcuts.rejectChange') },
    { keys: [`${mod}+S`], action: t('team.review.shortcuts.saveFile') },
    { keys: [`${mod}+Z`], action: t('team.review.shortcuts.undo') },
    { keys: [`${mod}+${shift}+Z`], action: t('team.review.shortcuts.redo') },
    { keys: ['?'], action: t('team.review.shortcuts.toggleShortcuts') },
    { keys: ['Esc'], action: t('team.review.shortcuts.closeDialog') },
  ];

  return (
    <div className="absolute right-4 top-14 z-50 w-64 rounded-lg border border-border bg-surface-overlay p-3 shadow-lg">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-medium text-text">{t('team.review.keyboardShortcuts')}</span>
        <button
          onClick={() => onOpenChange(false)}
          className="rounded p-0.5 text-text-muted hover:bg-surface-raised hover:text-text"
        >
          <X className="size-3" />
        </button>
      </div>
      <div className="space-y-1">
        {shortcuts.map(({ keys, action }) => (
          <div key={action} className="flex items-center justify-between text-xs">
            <span className="text-text-secondary">{action}</span>
            <div className="flex gap-1">
              {keys.map((key) => (
                <kbd
                  key={key}
                  className="rounded border border-border bg-surface-raised px-1.5 py-0.5 font-mono text-[10px] text-text-muted"
                >
                  {key}
                </kbd>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
