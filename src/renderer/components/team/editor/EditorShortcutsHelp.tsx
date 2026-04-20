/**
 * Keyboard shortcuts help modal for the project editor.
 *
 * Cross-platform: detects Mac vs Windows/Linux and shows
 * the appropriate modifier symbols.
 */

import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@renderer/components/ui/dialog';
import { IS_MAC } from '@renderer/utils/platformKeys';

// =============================================================================
// Types
// =============================================================================

interface EditorShortcutsHelpProps {
  onClose: () => void;
}

interface ShortcutDef {
  mac: string;
  other: string;
  description: string;
}

// =============================================================================
// Shortcuts data
// =============================================================================

const SHORTCUT_GROUPS: { titleKey: string; shortcuts: (ShortcutDef & { descKey: string })[] }[] = [
  {
    titleKey: 'team.shortcuts.fileOperations',
    shortcuts: [
      { mac: '⌘ P', other: 'Ctrl+P', description: 'Quick Open', descKey: 'team.editor.quickOpen' },
      { mac: '⌘ S', other: 'Ctrl+S', description: 'Save', descKey: 'common.save' },
      {
        mac: '⌘ ⇧ S',
        other: 'Ctrl+Shift+S',
        description: 'Save All',
        descKey: 'team.shortcuts.saveAll',
      },
      { mac: '⌘ W', other: 'Ctrl+W', description: 'Close Tab', descKey: 'team.editor.closeTab' },
    ],
  },
  {
    titleKey: 'common.search',
    shortcuts: [
      {
        mac: '⌘ F',
        other: 'Ctrl+F',
        description: 'Find in File',
        descKey: 'team.shortcuts.findInFile',
      },
      {
        mac: '⌘ ⇧ F',
        other: 'Ctrl+Shift+F',
        description: 'Search in Files',
        descKey: 'team.editor.searchInFiles',
      },
      { mac: '⌘ G', other: 'Ctrl+G', description: 'Go to Line', descKey: 'team.editor.goToLine' },
    ],
  },
  {
    titleKey: 'team.shortcuts.navigation',
    shortcuts: [
      {
        mac: '⌘ ⇧ ]',
        other: 'Ctrl+Shift+]',
        description: 'Next Tab',
        descKey: 'team.shortcuts.nextTab',
      },
      {
        mac: '⌘ ⇧ [',
        other: 'Ctrl+Shift+[',
        description: 'Previous Tab',
        descKey: 'team.shortcuts.previousTab',
      },
      {
        mac: '⌃ Tab',
        other: 'Ctrl+Tab',
        description: 'Cycle Tabs',
        descKey: 'team.shortcuts.cycleTabs',
      },
      {
        mac: '⌘ B',
        other: 'Ctrl+B',
        description: 'Toggle Sidebar',
        descKey: 'team.editor.toggleSidebar',
      },
    ],
  },
  {
    titleKey: 'team.shortcuts.editing',
    shortcuts: [
      { mac: '⌘ Z', other: 'Ctrl+Z', description: 'Undo', descKey: 'team.editor.undo' },
      { mac: '⌘ ⇧ Z', other: 'Ctrl+Y', description: 'Redo', descKey: 'team.editor.redo' },
      {
        mac: '⌘ D',
        other: 'Ctrl+D',
        description: 'Select Next Match',
        descKey: 'team.shortcuts.selectNextMatch',
      },
      {
        mac: '⌘ /',
        other: 'Ctrl+/',
        description: 'Toggle Comment',
        descKey: 'team.shortcuts.toggleComment',
      },
    ],
  },
  {
    titleKey: 'team.shortcuts.markdown',
    shortcuts: [
      {
        mac: '⌘ ⇧ M',
        other: 'Ctrl+Shift+M',
        description: 'Split Preview',
        descKey: 'team.editor.splitPreview',
      },
      {
        mac: '⌘ ⇧ V',
        other: 'Ctrl+Shift+V',
        description: 'Full Preview',
        descKey: 'team.editor.fullPreview',
      },
    ],
  },
  {
    titleKey: 'team.shortcuts.general',
    shortcuts: [
      {
        mac: 'Esc',
        other: 'Esc',
        description: 'Close Editor',
        descKey: 'team.editor.closeEditorShort',
      },
    ],
  },
];

// =============================================================================
// Component
// =============================================================================

export const EditorShortcutsHelp = ({ onClose }: EditorShortcutsHelpProps): React.ReactElement => {
  const { t } = useTranslation();

  // Resolve platform-specific keys once
  const resolvedGroups = useMemo(
    () =>
      SHORTCUT_GROUPS.map((group) => ({
        titleKey: group.titleKey,
        shortcuts: group.shortcuts.map((s) => ({
          keys: IS_MAC ? s.mac : s.other,
          descKey: s.descKey,
        })),
      })),
    []
  );

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[480px] max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="text-sm">{t('team.shortcuts.title')}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-x-6 gap-y-4">
          {resolvedGroups.map((group) => (
            <div key={group.titleKey}>
              <h3 className="mb-1.5 text-xs font-medium text-text-secondary">
                {t(group.titleKey)}
              </h3>
              <div className="space-y-1">
                {group.shortcuts.map((shortcut) => (
                  <div key={shortcut.keys} className="flex items-center justify-between text-xs">
                    <span className="text-text-muted">{t(shortcut.descKey)}</span>
                    <kbd className="rounded border border-border bg-surface-raised px-1.5 py-0.5 font-mono text-[10px] text-text-secondary">
                      {shortcut.keys}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};
