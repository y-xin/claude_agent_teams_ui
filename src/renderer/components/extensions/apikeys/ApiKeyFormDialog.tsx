/**
 * ApiKeyFormDialog — create or edit an API key entry.
 * Edit mode pre-fills all fields except the value (which must be re-entered).
 */

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@renderer/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@renderer/components/ui/dialog';
import { Input } from '@renderer/components/ui/input';
import { Label } from '@renderer/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@renderer/components/ui/select';
import { useStore } from '@renderer/store';
import { AlertTriangle, Key } from 'lucide-react';

import type { ApiKeyEntry } from '@shared/types/extensions';

const ENV_KEY_RE = /^[A-Z_][A-Z0-9_]{0,100}$/i;

interface ApiKeyFormDialogProps {
  open: boolean;
  editingKey: ApiKeyEntry | null;
  onClose: () => void;
}

type Scope = 'user' | 'project';

/** scope 选项定义，label 通过 i18n 动态获取 */
const SCOPE_KEYS: { value: Scope; labelKey: string }[] = [
  { value: 'user', labelKey: 'extensions.apiKeys.scopeUser' },
  { value: 'project', labelKey: 'extensions.apiKeys.scopeProject' },
];

export const ApiKeyFormDialog = ({
  open,
  editingKey,
  onClose,
}: ApiKeyFormDialogProps): React.JSX.Element => {
  const { t } = useTranslation();
  const saveApiKey = useStore((s) => s.saveApiKey);
  const apiKeySaving = useStore((s) => s.apiKeySaving);
  const storageStatus = useStore((s) => s.apiKeyStorageStatus);

  const [name, setName] = useState('');
  const [envVarName, setEnvVarName] = useState('');
  const [value, setValue] = useState('');
  const [scope, setScope] = useState<Scope>('user');
  const [error, setError] = useState<string | null>(null);
  const [envVarError, setEnvVarError] = useState<string | null>(null);

  // Reset form when dialog opens/closes or editing key changes
  useEffect(() => {
    if (open) {
      if (editingKey) {
        setName(editingKey.name);
        setEnvVarName(editingKey.envVarName);
        setScope(editingKey.scope);
        setValue('');
      } else {
        setName('');
        setEnvVarName('');
        setValue('');
        setScope('user');
      }
      setError(null);
      setEnvVarError(null);
    }
  }, [open, editingKey]);

  const validateEnvVar = (v: string) => {
    if (!v.trim()) {
      setEnvVarError(null);
      return;
    }
    if (!ENV_KEY_RE.test(v)) {
      setEnvVarError(t('extensions.apiKeys.envVarFormatError'));
    } else {
      setEnvVarError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError(t('extensions.apiKeys.nameRequired'));
      return;
    }
    if (!envVarName.trim()) {
      setError(t('extensions.apiKeys.envVarRequired'));
      return;
    }
    if (!ENV_KEY_RE.test(envVarName)) {
      setError(t('extensions.apiKeys.envVarInvalid'));
      return;
    }
    if (!value) {
      setError(t('extensions.apiKeys.valueRequired'));
      return;
    }

    try {
      await saveApiKey({
        id: editingKey?.id,
        name: name.trim(),
        envVarName: envVarName.trim(),
        value,
        scope,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('extensions.apiKeys.failedToSave'));
    }
  };

  const isEdit = editingKey !== null;
  const canSubmit = name.trim() && envVarName.trim() && value && !envVarError && !apiKeySaving;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg border border-border bg-surface-raised">
              <Key className="size-4 text-text-muted" />
            </div>
            <div>
              <DialogTitle>
                {isEdit ? t('extensions.apiKeys.editTitle') : t('extensions.apiKeys.addTitle')}
              </DialogTitle>
              <DialogDescription>
                {isEdit
                  ? t('extensions.apiKeys.editDescription')
                  : t('extensions.apiKeys.addDescription')}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {storageStatus && storageStatus.encryptionMethod !== 'os-keychain' && (
          <div className="flex items-center gap-2 rounded-md border border-amber-500/30 bg-amber-500/5 px-3 py-2 text-xs text-amber-400">
            <AlertTriangle className="size-3.5 shrink-0" />
            {t('extensions.apiKeys.keychainUnavailable')}
          </div>
        )}

        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
          {/* Name */}
          <div className="space-y-1.5">
            <Label htmlFor="apikey-name" className="text-xs">
              {t('extensions.apiKeys.name')}
            </Label>
            <Input
              id="apikey-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('extensions.apiKeys.namePlaceholder')}
              className="h-8 text-sm"
              autoFocus
            />
          </div>

          {/* Env var name */}
          <div className="space-y-1.5">
            <Label htmlFor="apikey-envvar" className="text-xs">
              {t('extensions.apiKeys.envVarLabel')}
            </Label>
            <Input
              id="apikey-envvar"
              value={envVarName}
              onChange={(e) => {
                setEnvVarName(e.target.value);
                validateEnvVar(e.target.value);
              }}
              placeholder="e.g. OPENAI_API_KEY"
              className={`h-8 font-mono text-sm ${envVarError ? 'border-red-500/50' : ''}`}
            />
            {envVarError && <p className="text-xs text-red-400">{envVarError}</p>}
          </div>

          {/* Value */}
          <div className="space-y-1.5">
            <Label htmlFor="apikey-value" className="text-xs">
              {t('extensions.apiKeys.value')}
            </Label>
            <Input
              id="apikey-value"
              type="password"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={isEdit ? t('extensions.apiKeys.reenterValue') : 'sk-...'}
              className="h-8 text-sm"
            />
          </div>

          {/* Scope */}
          <div className="space-y-1.5">
            <Label className="text-xs">{t('extensions.apiKeys.scope')}</Label>
            <Select value={scope} onValueChange={(v) => setScope(v as Scope)}>
              <SelectTrigger className="h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SCOPE_KEYS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {t(opt.labelKey)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Error display */}
          {error && (
            <div className="rounded-md border border-red-500/30 bg-red-500/5 px-3 py-2 text-xs text-red-400">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" size="sm" onClick={onClose}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" size="sm" disabled={!canSubmit}>
              {apiKeySaving
                ? t('extensions.apiKeys.saving')
                : isEdit
                  ? t('extensions.apiKeys.update')
                  : t('common.save')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
