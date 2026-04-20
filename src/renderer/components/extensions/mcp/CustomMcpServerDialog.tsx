/**
 * CustomMcpServerDialog — add a custom MCP server by providing install spec directly.
 * Supports stdio (npm package) and HTTP/SSE transports.
 */

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { api } from '@renderer/api';
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
import { Plus, Server, Trash2 } from 'lucide-react';

import type {
  McpCustomInstallRequest,
  McpHeaderDef,
  McpInstallSpec,
} from '@shared/types/extensions';

const SERVER_NAME_RE = /^[\w.-]{1,100}$/;

interface CustomMcpServerDialogProps {
  open: boolean;
  onClose: () => void;
}

type TransportMode = 'stdio' | 'http';
type HttpTransport = 'streamable-http' | 'sse' | 'http';
type Scope = 'local' | 'user';

const SCOPE_KEYS: { value: Scope; labelKey: string }[] = [
  { value: 'user', labelKey: 'extensions.mcp.scopeUser' },
  { value: 'local', labelKey: 'extensions.mcp.scopeLocal' },
];

const HTTP_TRANSPORT_KEYS: { value: HttpTransport; labelKey: string }[] = [
  { value: 'streamable-http', labelKey: 'extensions.mcp.transportStreamableHttp' },
  { value: 'sse', labelKey: 'extensions.mcp.transportSse' },
  { value: 'http', labelKey: 'extensions.mcp.transportHttp' },
];

interface EnvEntry {
  key: string;
  value: string;
}

export const CustomMcpServerDialog = ({
  open,
  onClose,
}: CustomMcpServerDialogProps): React.JSX.Element => {
  const { t } = useTranslation();
  const installCustomMcpServer = useStore((s) => s.installCustomMcpServer);

  // Form state
  const [serverName, setServerName] = useState('');
  const [transportMode, setTransportMode] = useState<TransportMode>('stdio');
  const [scope, setScope] = useState<Scope>('user');

  // Stdio fields
  const [npmPackage, setNpmPackage] = useState('');
  const [npmVersion, setNpmVersion] = useState('');

  // HTTP fields
  const [httpUrl, setHttpUrl] = useState('');
  const [httpTransport, setHttpTransport] = useState<HttpTransport>('streamable-http');
  const [headers, setHeaders] = useState<McpHeaderDef[]>([]);

  // Shared
  const [envVars, setEnvVars] = useState<EnvEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [installing, setInstalling] = useState(false);

  // Reset on open
  useEffect(() => {
    if (open) {
      setServerName('');
      setTransportMode('stdio');
      setScope('user');
      setNpmPackage('');
      setNpmVersion('');
      setHttpUrl('');
      setHttpTransport('streamable-http');
      setHeaders([]);
      setEnvVars([]);
      setError(null);
      setInstalling(false);
    }
  }, [open]);

  // Auto-fill env vars from saved API keys
  useEffect(() => {
    if (!open || envVars.length === 0 || !api.apiKeys) return;

    const envVarNames = envVars.map((e) => e.key).filter(Boolean);
    if (envVarNames.length === 0) return;

    void api.apiKeys.lookup(envVarNames).then(
      (results) => {
        if (results.length === 0) return;
        const lookup = new Map(results.map((r) => [r.envVarName, r.value]));
        setEnvVars((prev) =>
          prev.map((e) => (lookup.has(e.key) && !e.value ? { ...e, value: lookup.get(e.key)! } : e))
        );
      },
      () => {
        // Silently fail
      }
    );
  }, [open, envVars.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleInstall = async () => {
    setError(null);

    if (!serverName.trim()) {
      setError(t('extensions.mcp.serverNameRequired'));
      return;
    }
    if (!SERVER_NAME_RE.test(serverName)) {
      setError(t('extensions.mcp.serverNameInvalid'));
      return;
    }

    let installSpec: McpInstallSpec;

    if (transportMode === 'stdio') {
      if (!npmPackage.trim()) {
        setError(t('extensions.mcp.npmPackageRequired'));
        return;
      }
      installSpec = {
        type: 'stdio',
        npmPackage: npmPackage.trim(),
        npmVersion: npmVersion.trim() || undefined,
      };
    } else {
      if (!httpUrl.trim()) {
        setError(t('extensions.mcp.serverUrlRequired'));
        return;
      }
      installSpec = {
        type: 'http',
        url: httpUrl.trim(),
        transportType: httpTransport,
      };
    }

    const envValues: Record<string, string> = {};
    for (const entry of envVars) {
      if (entry.key.trim() && entry.value) {
        envValues[entry.key.trim()] = entry.value;
      }
    }

    const request: McpCustomInstallRequest = {
      serverName,
      scope,
      installSpec,
      envValues,
      headers: headers.filter((h) => h.key.trim() && h.value.trim()),
    };

    setInstalling(true);
    try {
      await installCustomMcpServer(request);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('extensions.mcp.installFailed'));
    } finally {
      setInstalling(false);
    }
  };

  const addEnvVar = () => setEnvVars((prev) => [...prev, { key: '', value: '' }]);
  const removeEnvVar = (i: number) => setEnvVars((prev) => prev.filter((_, idx) => idx !== i));
  const updateEnvVar = (i: number, field: 'key' | 'value', val: string) =>
    setEnvVars((prev) => prev.map((e, idx) => (idx === i ? { ...e, [field]: val } : e)));

  const addHeader = () => setHeaders((prev) => [...prev, { key: '', value: '' }]);
  const removeHeader = (i: number) => setHeaders((prev) => prev.filter((_, idx) => idx !== i));
  const updateHeader = (i: number, field: 'key' | 'value', val: string) =>
    setHeaders((prev) => prev.map((h, idx) => (idx === i ? { ...h, [field]: val } : h)));

  const canSubmit =
    serverName.trim() &&
    (transportMode === 'stdio' ? npmPackage.trim() : httpUrl.trim()) &&
    !installing;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg border border-border bg-surface-raised">
              <Server className="size-4 text-text-muted" />
            </div>
            <div>
              <DialogTitle>{t('extensions.mcp.addCustomTitle')}</DialogTitle>
              <DialogDescription>{t('extensions.mcp.addCustomDescription')}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Server name */}
          <div className="space-y-1.5">
            <Label htmlFor="custom-name" className="text-xs">
              {t('extensions.mcp.serverName')}
            </Label>
            <Input
              id="custom-name"
              value={serverName}
              onChange={(e) => setServerName(e.target.value)}
              placeholder="my-server"
              className="h-8 text-sm"
              autoFocus
            />
          </div>

          {/* Transport toggle */}
          <div className="space-y-1.5">
            <Label className="text-xs">{t('extensions.mcp.transport')}</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={transportMode === 'stdio' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTransportMode('stdio')}
              >
                Stdio (npm)
              </Button>
              <Button
                type="button"
                variant={transportMode === 'http' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTransportMode('http')}
              >
                HTTP / SSE
              </Button>
            </div>
          </div>

          {/* Stdio fields */}
          {transportMode === 'stdio' && (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="custom-npm" className="text-xs">
                  {t('extensions.mcp.npmPackage')}
                </Label>
                <Input
                  id="custom-npm"
                  value={npmPackage}
                  onChange={(e) => setNpmPackage(e.target.value)}
                  placeholder="@example/mcp-server"
                  className="h-8 font-mono text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="custom-version" className="text-xs">
                  {t('extensions.mcp.versionOptional')}
                </Label>
                <Input
                  id="custom-version"
                  value={npmVersion}
                  onChange={(e) => setNpmVersion(e.target.value)}
                  placeholder="latest"
                  className="h-8 text-sm"
                />
              </div>
            </div>
          )}

          {/* HTTP fields */}
          {transportMode === 'http' && (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="custom-url" className="text-xs">
                  {t('extensions.mcp.serverUrl')}
                </Label>
                <Input
                  id="custom-url"
                  value={httpUrl}
                  onChange={(e) => setHttpUrl(e.target.value)}
                  placeholder="https://api.example.com/mcp"
                  className="h-8 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">{t('extensions.mcp.transportType')}</Label>
                <Select
                  value={httpTransport}
                  onValueChange={(v) => setHttpTransport(v as HttpTransport)}
                >
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {HTTP_TRANSPORT_KEYS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {t(opt.labelKey)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Headers */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">{t('extensions.mcp.headers')}</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={addHeader}
                    className="h-6 px-1.5 text-xs"
                  >
                    <Plus className="mr-1 size-3" />
                    {t('extensions.mcp.add')}
                  </Button>
                </div>
                {headers.length > 0 && (
                  <div className="space-y-2">
                    {headers.map((header, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <Input
                          value={header.key}
                          onChange={(e) => updateHeader(i, 'key', e.target.value)}
                          className="h-7 w-32 text-xs"
                          placeholder={t('extensions.headerNamePlaceholder')}
                        />
                        <Input
                          value={header.value}
                          onChange={(e) => updateHeader(i, 'value', e.target.value)}
                          className="h-7 flex-1 text-xs"
                          placeholder="value"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-7 text-red-400 hover:bg-red-500/10"
                          onClick={() => removeHeader(i)}
                        >
                          <Trash2 className="size-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Scope */}
          <div className="space-y-1.5">
            <Label className="text-xs">{t('extensions.mcp.scope')}</Label>
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

          {/* Environment variables */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs">{t('extensions.mcp.envVars')}</Label>
              <Button variant="ghost" size="sm" onClick={addEnvVar} className="h-6 px-1.5 text-xs">
                <Plus className="mr-1 size-3" />
                {t('extensions.mcp.add')}
              </Button>
            </div>
            {envVars.length > 0 && (
              <div className="space-y-2">
                {envVars.map((entry, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Input
                      value={entry.key}
                      onChange={(e) => updateEnvVar(i, 'key', e.target.value)}
                      className="h-7 w-40 font-mono text-xs"
                      placeholder={t('extensions.envVarPlaceholder')}
                    />
                    <Input
                      type="password"
                      value={entry.value}
                      onChange={(e) => updateEnvVar(i, 'value', e.target.value)}
                      className="h-7 flex-1 text-xs"
                      placeholder="value"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7 text-red-400 hover:bg-red-500/10"
                      onClick={() => removeEnvVar(i)}
                    >
                      <Trash2 className="size-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-md border border-red-500/30 bg-red-500/5 px-3 py-2 text-xs text-red-400">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" size="sm" onClick={onClose}>
              {t('common.cancel')}
            </Button>
            <Button size="sm" disabled={!canSubmit} onClick={() => void handleInstall()}>
              {installing ? t('extensions.install.installing') : t('extensions.install.install')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
