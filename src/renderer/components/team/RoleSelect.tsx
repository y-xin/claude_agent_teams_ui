import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Combobox } from '@renderer/components/ui/combobox';
import { Input } from '@renderer/components/ui/input';
import { CUSTOM_ROLE, FORBIDDEN_ROLES, NO_ROLE, PRESET_ROLES } from '@renderer/constants/teamRoles';
import { Blocks, BookOpen, Bug, Check, Code2, FileText, Pencil, Shield, Zap } from 'lucide-react';

import type { ComboboxOption } from '@renderer/components/ui/combobox';
import type { LucideIcon } from 'lucide-react';

/** Icon mapping for preset roles. */
const ROLE_ICONS: Record<string, LucideIcon> = {
  architect: Blocks,
  reviewer: BookOpen,
  developer: Code2,
  qa: Bug,
  researcher: BookOpen,
  docs: FileText,
  auditor: Shield,
  optimizer: Zap,
};

const CUSTOM_ICON = Pencil;

interface RoleSelectProps {
  /** Current role selection value (preset role name, CUSTOM_ROLE, or NO_ROLE). */
  value: string;
  /** Called when the user picks a preset role, NO_ROLE, or CUSTOM_ROLE. */
  onValueChange: (value: string) => void;
  /** Current custom role text (only relevant when value === CUSTOM_ROLE). */
  customRole?: string;
  /** Called when the user types a custom role. */
  onCustomRoleChange?: (customRole: string) => void;
  /** Trigger height class, e.g. "h-7" or "h-8". */
  triggerClassName?: string;
  /** Custom input height class. */
  inputClassName?: string;
  /** Show validation error for custom role. */
  customRoleError?: string | null;
  /** Validate custom role on change and return error or null. */
  onCustomRoleValidate?: (role: string) => string | null;
  disabled?: boolean;
}

/** 基础角色选项（标签在组件内通过 i18n 动态覆盖） */
const BASE_ROLE_OPTIONS: ComboboxOption[] = [
  { value: NO_ROLE, label: 'No role' },
  ...PRESET_ROLES.map((role) => ({
    value: role,
    label: role,
  })),
  { value: CUSTOM_ROLE, label: 'Custom role...' },
];

// eslint-disable-next-line sonarjs/function-return-type -- option renderer returns mixed node structure
const renderRoleOption = (option: ComboboxOption, isSelected: boolean): React.ReactNode => {
  const Icon =
    option.value === CUSTOM_ROLE
      ? CUSTOM_ICON
      : option.value === NO_ROLE
        ? null
        : (ROLE_ICONS[option.value] ?? null);

  return (
    <>
      <span className="mr-2 flex size-4 shrink-0 items-center justify-center">
        {isSelected ? (
          <Check className="size-3.5" />
        ) : Icon ? (
          <Icon className="size-3.5 text-[var(--color-text-muted)]" />
        ) : null}
      </span>
      <span className="min-w-0 truncate font-medium text-[var(--color-text)]">{option.label}</span>
    </>
  );
};

export const RoleSelect = ({
  value,
  onValueChange,
  customRole = '',
  onCustomRoleChange,
  triggerClassName,
  inputClassName,
  customRoleError: externalError,
  onCustomRoleValidate,
  disabled,
}: RoleSelectProps): React.JSX.Element => {
  const { t } = useTranslation();
  const [internalError, setInternalError] = useState<string | null>(null);
  const error = externalError ?? internalError;

  // 使用 i18n 覆盖静态标签
  const roleOptions = useMemo<ComboboxOption[]>(
    () =>
      BASE_ROLE_OPTIONS.map((opt) => {
        if (opt.value === NO_ROLE) return { ...opt, label: t('team.roleSelect.noRole') };
        if (opt.value === CUSTOM_ROLE) return { ...opt, label: t('team.roleSelect.customRole') };
        return opt;
      }),
    [t]
  );

  const handleValueChange = useCallback(
    (newValue: string) => {
      onValueChange(newValue);
      if (newValue !== CUSTOM_ROLE) {
        setInternalError(null);
      }
    },
    [onValueChange]
  );

  const handleCustomChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      onCustomRoleChange?.(val);

      if (onCustomRoleValidate) {
        setInternalError(onCustomRoleValidate(val));
      } else if (FORBIDDEN_ROLES.has(val.trim().toLowerCase())) {
        setInternalError(t('team.roleSelect.reservedRole'));
      } else {
        setInternalError(null);
      }
    },
    [onCustomRoleChange, onCustomRoleValidate]
  );

  const selectedLabel = useMemo(() => {
    const opt = roleOptions.find((o) => o.value === value);
    return opt?.label;
  }, [value]);

  const renderTriggerLabel = useCallback((option: ComboboxOption) => {
    const Icon =
      option.value === CUSTOM_ROLE
        ? CUSTOM_ICON
        : option.value === NO_ROLE
          ? null
          : (ROLE_ICONS[option.value] ?? null);
    return (
      <span className="flex items-center gap-1.5">
        {Icon ? <Icon className="size-3 text-[var(--color-text-muted)]" /> : null}
        {option.label}
      </span>
    );
  }, []);

  return (
    <div className="space-y-1">
      <Combobox
        options={roleOptions}
        value={value}
        onValueChange={handleValueChange}
        placeholder={selectedLabel ?? 'No role'}
        searchPlaceholder={t('team.searchRoles')}
        emptyMessage={t('team.noRolesFound')}
        disabled={disabled}
        className={triggerClassName}
        renderOption={renderRoleOption}
        renderTriggerLabel={renderTriggerLabel}
      />
      {value === CUSTOM_ROLE && onCustomRoleChange ? (
        <div>
          <Input
            className={inputClassName ?? 'h-8 text-xs'}
            value={customRole}
            onChange={handleCustomChange}
            placeholder={t('team.enterCustomRole')}
            autoFocus
          />
          {error ? <span className="mt-0.5 block text-[10px] text-red-400">{error}</span> : null}
        </div>
      ) : null}
    </div>
  );
};
