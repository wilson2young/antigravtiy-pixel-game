import { useState, useMemo, createContext, useContext } from 'react';
import { detectLocale, saveLocale } from './localeDetector';
import zhCN from './locales/zh-CN.json';
import en from './locales/en.json';

// 语言包映射
const locales = {
  'zh-CN': zhCN,
  'en': en
};

// 支持的语言列表
export const supportedLanguages = [
  { code: 'zh-CN', name: '中文', flag: '🇨🇳' },
  { code: 'en', name: 'English', flag: '🇺🇸' }
];

// 创建 Context
const TranslationContext = createContext(null);

/**
 * 翻译函数，支持命名空间
 * @param {string} key - 翻译键，如 'home.title'
 * @param {object} translations - 当前语言的翻译对象
 */
function translate(key, translations) {
  const keys = key.split('.');
  let result = translations;

  for (const k of keys) {
    if (result && typeof result === 'object' && k in result) {
      result = result[k];
    } else {
      // 找不到翻译时返回 key
      console.warn(`Translation key not found: ${key}`);
      return key;
    }
  }

  return result;
}

/**
 * TranslationProvider 组件
 * 提供全局的翻译状态管理
 */
export function TranslationProvider({ children }) {
  const [lang, setLangState] = useState(detectLocale);

  // 获取当前语言的翻译对象
  const translations = useMemo(() => {
    return locales[lang] || locales['zh-CN'];
  }, [lang]);

  // 翻译函数（使用 useMemo 确保响应 lang 变化）
  const t = useMemo(() => {
    return (key) => translate(key, translations);
  }, [translations]);

  // 切换语言
  const setLang = (newLang) => {
    if (locales[newLang]) {
      setLangState(newLang);
      saveLocale(newLang);
    } else {
      console.warn(`Language not supported: ${newLang}`);
    }
  };

  const value = useMemo(() => ({
    lang,
    setLang,
    t,
    supportedLanguages
  }), [lang, t]);

  return (
    <TranslationContext.Provider value={value}>
      {children}
    </TranslationContext.Provider>
  );
}

/**
 * useTranslation Hook
 * 使用 Context 中的翻译状态
 */
export function useTranslation() {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error('useTranslation must be used within TranslationProvider');
  }
  return context;
}
