import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { api } from '@renderer/api';
import { CodeBlockViewer } from '@renderer/components/chat/viewers/CodeBlockViewer';
import { MarkdownViewer } from '@renderer/components/chat/viewers/MarkdownViewer';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@renderer/components/ui/alert-dialog';
import { Badge } from '@renderer/components/ui/badge';
import { Button } from '@renderer/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@renderer/components/ui/dialog';
import { useStore } from '@renderer/store';
import { useShallow } from 'zustand/react/shallow';
import { AlertTriangle, ExternalLink, FolderOpen, Pencil, Trash2 } from 'lucide-react';

interface SkillDetailDialogProps {
  skillId: string | null;
  open: boolean;
  onClose: () => void;
  projectPath: string | null;
  onEdit: () => void;
  onDeleted: () => void;
}

export const SkillDetailDialog = ({
  skillId,
  open,
  onClose,
  projectPath,
  onEdit,
  onDeleted,
}: SkillDetailDialogProps): React.JSX.Element => {
  const { t } = useTranslation();
  const fetchSkillDetail = useStore((s) => s.fetchSkillDetail);
  const deleteSkill = useStore((s) => s.deleteSkill);
  const detail = useStore(useShallow((s) => (skillId ? s.skillsDetailsById[skillId] : undefined)));
  const loading = useStore((s) =>
    skillId ? (s.skillsDetailLoadingById[skillId] ?? false) : false
  );
  const detailError = useStore((s) =>
    skillId ? (s.skillsDetailErrorById[skillId] ?? null) : null
  );
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  useEffect(() => {
    if (!open || !skillId) return;
    void fetchSkillDetail(skillId, projectPath ?? undefined).catch(() => undefined);
  }, [fetchSkillDetail, open, projectPath, skillId]);

  useEffect(() => {
    if (!open) {
      setDeleteError(null);
      setDeleteLoading(false);
      setDeleteConfirmOpen(false);
    }
  }, [open]);

  const item = detail?.item;

  function formatRootKind(rootKind: 'claude' | 'cursor' | 'agents'): string {
    return `.${rootKind}`;
  }

  function formatScopeLabel(scope: 'user' | 'project'): string {
    return scope === 'project'
      ? t('extensions.skills.scopeThisProject')
      : t('extensions.skills.scopePersonalSkills');
  }

  function formatInvocationLabel(invocationMode: 'auto' | 'manual-only'): string {
    return invocationMode === 'manual-only'
      ? t('extensions.skills.invocationManualLabel')
      : t('extensions.skills.invocationAutoLabel');
  }

  async function handleDelete(): Promise<void> {
    if (!item) return;
    setDeleteLoading(true);
    setDeleteError(null);
    try {
      await deleteSkill({
        skillId: item.id,
        projectPath: projectPath ?? undefined,
      });
      setDeleteConfirmOpen(false);
      onDeleted();
    } catch (error) {
      setDeleteError(
        error instanceof Error ? error.message : t('extensions.skills.failedToDelete')
      );
    } finally {
      setDeleteLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>{item?.name ?? t('extensions.skills.detailTitle')}</DialogTitle>
          <DialogDescription>
            {item?.description ?? t('extensions.skills.detailDescription')}
          </DialogDescription>
        </DialogHeader>

        {(loading || (open && skillId && detail === undefined)) && (
          <p className="text-sm text-text-muted">{t('extensions.skills.loadingDetails')}</p>
        )}

        {!loading && detailError && (
          <div className="space-y-3 rounded-md border border-red-500/30 bg-red-500/5 p-4 text-sm text-red-400">
            <p>{detailError}</p>
            {skillId && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  void fetchSkillDetail(skillId, projectPath ?? undefined).catch(() => undefined);
                }}
              >
                {t('common.retry')}
              </Button>
            )}
          </div>
        )}

        {!loading && !detailError && detail === null && (
          <div className="rounded-md border border-red-500/30 bg-red-500/5 p-4 text-sm text-red-400">
            {t('extensions.skills.unableToLoad')}
          </div>
        )}

        {!loading && detail && item && (
          <div className="space-y-4">
            {deleteError && (
              <div className="rounded-md border border-red-500/30 bg-red-500/5 p-3 text-sm text-red-400">
                {deleteError}
              </div>
            )}
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">{formatScopeLabel(item.scope)}</Badge>
              <Badge variant="outline">
                {t('extensions.skills.storedIn', { root: formatRootKind(item.rootKind) })}
              </Badge>
              <Badge variant="secondary">
                {item.invocationMode === 'manual-only'
                  ? t('extensions.skills.manualUse')
                  : t('extensions.skills.autoUse')}
              </Badge>
              {item.flags.hasScripts && (
                <Badge variant="destructive">{t('extensions.skills.hasScripts')}</Badge>
              )}
              {item.flags.hasReferences && (
                <Badge variant="secondary">{t('extensions.skills.references')}</Badge>
              )}
              {item.flags.hasAssets && (
                <Badge variant="secondary">{t('extensions.skills.assets')}</Badge>
              )}
            </div>

            {item.issues.length > 0 && (
              <div className="space-y-2 rounded-md border border-amber-500/30 bg-amber-500/5 p-4">
                <p className="text-sm font-medium text-amber-700 dark:text-amber-300">
                  {t('extensions.skills.reviewCarefully')}
                </p>
                {item.issues.map((issue, index) => (
                  <div
                    key={`${issue.code}-${index}`}
                    className="flex gap-2 text-sm text-amber-700 dark:text-amber-300"
                  >
                    <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                    <span>{issue.message}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="grid gap-3 rounded-lg border border-border p-4 md:grid-cols-3">
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
                  {t('extensions.skills.whoCanUseIt')}
                </p>
                <p className="text-sm text-text">{formatScopeLabel(item.scope)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
                  {t('extensions.skills.howClaudeUsesIt')}
                </p>
                <p className="text-sm text-text">{formatInvocationLabel(item.invocationMode)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
                  {t('extensions.skills.whatComesWithIt')}
                </p>
                <p className="text-sm text-text">
                  {[
                    item.flags.hasReferences ? t('extensions.skills.contentsReferences') : null,
                    item.flags.hasScripts ? t('extensions.skills.contentsScripts') : null,
                    item.flags.hasAssets ? t('extensions.skills.contentsAssets') : null,
                  ]
                    .filter(Boolean)
                    .join(t('extensions.skills.contentsSeparator')) ||
                    t('extensions.skills.justInstructions')}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" size="sm" onClick={onEdit}>
                <Pencil className="mr-1.5 size-3.5" />
                {t('extensions.skills.editButton')}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDeleteConfirmOpen(true)}
                disabled={deleteLoading}
              >
                <Trash2 className="mr-1.5 size-3.5" />
                {deleteLoading ? t('extensions.skills.deleting') : t('common.delete')}
              </Button>
            </div>

            <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
              <div className="min-w-0 rounded-lg border border-border p-4">
                <MarkdownViewer
                  content={detail.body || detail.rawContent}
                  baseDir={item.skillDir}
                  bare
                  copyable
                />
              </div>

              <div className="space-y-4">
                <div className="rounded-lg border border-border p-3 text-sm text-text-secondary">
                  <div className="space-y-2">
                    <p className="font-medium text-text">{t('extensions.skills.storedAt')}</p>
                    <p className="break-all text-xs text-text-muted">{item.skillDir}</p>
                  </div>

                  {detail.scriptFiles.length > 0 && (
                    <div className="mt-4 space-y-1">
                      <p className="font-medium text-text">{t('extensions.skills.scripts')}</p>
                      {detail.scriptFiles.map((file) => (
                        <p key={file} className="text-xs text-text-muted">
                          {file}
                        </p>
                      ))}
                    </div>
                  )}

                  {detail.referencesFiles.length > 0 && (
                    <div className="mt-4 space-y-1">
                      <p className="font-medium text-text">{t('extensions.skills.references')}</p>
                      {detail.referencesFiles.map((file) => (
                        <p key={file} className="text-xs text-text-muted">
                          {file}
                        </p>
                      ))}
                    </div>
                  )}

                  {detail.assetFiles.length > 0 && (
                    <div className="mt-4 space-y-1">
                      <p className="font-medium text-text">{t('extensions.skills.assets')}</p>
                      {detail.assetFiles.map((file) => (
                        <p key={file} className="text-xs text-text-muted">
                          {file}
                        </p>
                      ))}
                    </div>
                  )}
                </div>

                <details className="rounded-lg border border-border p-3 text-sm text-text-secondary">
                  <summary className="cursor-pointer font-medium text-text">
                    {t('extensions.skills.advancedFileDetails')}
                  </summary>
                  <div className="mt-3 space-y-3">
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => void api.showInFolder(item.skillFile)}
                      >
                        <FolderOpen className="mr-1.5 size-3.5" />
                        {t('extensions.skills.openFolder')}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => void api.openPath(item.skillFile, projectPath ?? undefined)}
                      >
                        <ExternalLink className="mr-1.5 size-3.5" />
                        {t('extensions.skills.openSkillMd')}
                      </Button>
                    </div>
                    <CodeBlockViewer
                      fileName={item.skillFile}
                      content={detail.rawContent}
                      maxHeight="max-h-72"
                    />
                  </div>
                </details>
              </div>
            </div>
          </div>
        )}
      </DialogContent>

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('extensions.skills.deleteConfirmTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {item
                ? t('extensions.skills.deleteConfirmWithName', { name: item.name })
                : t('extensions.skills.deleteConfirmGeneric')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteLoading}>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={() => void handleDelete()} disabled={deleteLoading}>
              {deleteLoading ? t('extensions.skills.deleting') : t('extensions.skills.deleteSkill')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
};
