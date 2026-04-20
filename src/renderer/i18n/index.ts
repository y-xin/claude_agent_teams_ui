/**
 * i18n 国际化配置
 *
 * 支持语言：英文 (en)、中文 (zh)
 * 语言偏好通过 AppConfig.general.uiLanguage 持久化
 *
 * 初始化策略：
 * 1. 尝试从 localStorage 读取缓存的 uiLanguage（避免首帧闪烁）
 * 2. 否则从 navigator.language 推断系统语言
 * 3. Config 加载后由 useI18n hook 精确同步并写回缓存
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './locales/en.json';
import zh from './locales/zh.json';

export const UI_LANGUAGE_OPTIONS = [
  { value: 'system', label: 'System', labelZh: '跟随系统' },
  { value: 'en', label: 'English', labelZh: 'English' },
  { value: 'zh', label: '中文', labelZh: '中文' },
] as const;

export type UILanguage = (typeof UI_LANGUAGE_OPTIONS)[number]['value'];

const UI_LANGUAGE_CACHE_KEY = 'claude-teams-ui-language';

/** 将 'system' 解析为具体语言代码 */
export const resolveUILanguage = (lang: string): string => {
  if (lang === 'system') {
    const browserLang = navigator.language;
    const primary = browserLang.includes('-') ? browserLang.split('-')[0] : browserLang;
    return primary === 'zh' ? 'zh' : 'en';
  }
  return lang === 'zh' ? 'zh' : 'en';
};

/** 缓存已解析的语言到 localStorage，供下次启动快速读取 */
export const cacheUILanguage = (resolved: string): void => {
  try {
    localStorage.setItem(UI_LANGUAGE_CACHE_KEY, resolved);
  } catch {
    // localStorage 不可用时静默失败
  }
};

/** 获取初始语言：优先使用缓存，否则用系统语言推断 */
const getInitialLanguage = (): string => {
  try {
    const cached = localStorage.getItem(UI_LANGUAGE_CACHE_KEY);
    if (cached === 'zh' || cached === 'en') return cached;
  } catch {
    // localStorage 不可用
  }
  return resolveUILanguage('system');
};

void i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    zh: { translation: zh },
  },
  lng: getInitialLanguage(),
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
