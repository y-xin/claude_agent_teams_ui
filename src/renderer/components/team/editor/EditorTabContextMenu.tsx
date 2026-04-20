/**
 * Context menu for editor tabs.
 * Supports: close, close others, close to left/right, close all.
 */

import * as ContextMenu from '@radix-ui/react-context-menu';
import { useTranslation } from 'react-i18next';

interface EditorTabContextMenuProps {
  children: React.ReactNode;
  tabId: string;
  tabIndex: number;
  totalTabs: number;
  onClose: (tabId: string) => void;
  onCloseOthers: (tabId: string) => void;
  onCloseToLeft: (tabId: string) => void;
  onCloseToRight: (tabId: string) => void;
  onCloseAll: () => void;
}

export const EditorTabContextMenu = ({
  children,
  tabId,
  tabIndex,
  totalTabs,
  onClose,
  onCloseOthers,
  onCloseToLeft,
  onCloseToRight,
  onCloseAll,
}: EditorTabContextMenuProps): React.ReactElement => {
  const { t } = useTranslation();
  const hasLeft = tabIndex > 0;
  const hasRight = tabIndex < totalTabs - 1;
  const hasOthers = totalTabs > 1;

  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger asChild>
        <div className="flex h-full">{children}</div>
      </ContextMenu.Trigger>

      <ContextMenu.Portal>
        <ContextMenu.Content className="z-50 min-w-[180px] rounded-md border border-border-emphasis bg-surface-overlay p-1 shadow-lg animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95">
          <ContextMenu.Item
            className="flex cursor-pointer items-center rounded px-2 py-1.5 text-xs text-text outline-none hover:bg-surface-raised focus:bg-surface-raised"
            onSelect={() => onClose(tabId)}
          >
            {t('common.close')}
          </ContextMenu.Item>

          <ContextMenu.Item
            className="flex cursor-pointer items-center rounded px-2 py-1.5 text-xs text-text outline-none hover:bg-surface-raised focus:bg-surface-raised disabled:cursor-not-allowed disabled:opacity-40"
            disabled={!hasOthers}
            onSelect={() => onCloseOthers(tabId)}
          >
            {t('team.editorTab.closeOthers')}
          </ContextMenu.Item>

          <ContextMenu.Separator className="my-1 h-px bg-border" />

          <ContextMenu.Item
            className="flex cursor-pointer items-center rounded px-2 py-1.5 text-xs text-text outline-none hover:bg-surface-raised focus:bg-surface-raised disabled:cursor-not-allowed disabled:opacity-40"
            disabled={!hasLeft}
            onSelect={() => onCloseToLeft(tabId)}
          >
            {t('team.editorTab.closeToLeft')}
          </ContextMenu.Item>

          <ContextMenu.Item
            className="flex cursor-pointer items-center rounded px-2 py-1.5 text-xs text-text outline-none hover:bg-surface-raised focus:bg-surface-raised disabled:cursor-not-allowed disabled:opacity-40"
            disabled={!hasRight}
            onSelect={() => onCloseToRight(tabId)}
          >
            {t('team.editorTab.closeToRight')}
          </ContextMenu.Item>

          <ContextMenu.Separator className="my-1 h-px bg-border" />

          <ContextMenu.Item
            className="flex cursor-pointer items-center rounded px-2 py-1.5 text-xs text-text outline-none hover:bg-surface-raised focus:bg-surface-raised"
            onSelect={onCloseAll}
          >
            {t('team.editorTab.closeAll')}
          </ContextMenu.Item>
        </ContextMenu.Content>
      </ContextMenu.Portal>
    </ContextMenu.Root>
  );
};
