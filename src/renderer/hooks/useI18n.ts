/**
 * useI18n - 将 i18n 语言与 AppConfig.general.uiLanguage 同步
 *
 * 当 config 中的 uiLanguage 变化时：
 * 1. 解析为具体语言代码
 * 2. 切换 i18next 语言
 * 3. 写入 localStorage 缓存（避免下次启动闪烁）
 */

import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { cacheUILanguage, resolveUILanguage } from '@renderer/i18n';
import { useStore } from '@renderer/store';

export const useI18n = (): void => {
  const { i18n } = useTranslation();
  const uiLanguage = useStore((s) => s.appConfig?.general?.uiLanguage ?? 'system');

  useEffect(() => {
    const resolved = resolveUILanguage(uiLanguage);
    if (i18n.language !== resolved) {
      void i18n.changeLanguage(resolved);
    }
    cacheUILanguage(resolved);
  }, [uiLanguage, i18n]);
};
