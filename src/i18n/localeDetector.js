/**
 * 检测并返回当前语言
 * 优先级：URL参数 > localStorage > 浏览器语言 > 默认中文
 */
export function detectLocale() {
  // 1. 检查 URL 参数
  const urlParams = new URLSearchParams(window.location.search);
  const urlLang = urlParams.get('lang');
  if (urlLang) {
    return urlLang;
  }

  // 2. 检查 localStorage
  const storedLang = localStorage.getItem('pixel-quest-lang');
  if (storedLang) {
    return storedLang;
  }

  // 3. 检查浏览器语言
  const browserLang = navigator.language || navigator.userLanguage;
  if (browserLang.startsWith('zh')) {
    return 'zh-CN';
  } else if (browserLang.startsWith('en')) {
    return 'en';
  }

  // 4. 默认中文
  return 'zh-CN';
}

/**
 * 保存语言到 localStorage 和 URL
 */
export function saveLocale(lang) {
  localStorage.setItem('pixel-quest-lang', lang);

  // 更新 URL 参数（不刷新页面）
  const url = new URL(window.location);
  url.searchParams.set('lang', lang);
  window.history.replaceState({}, '', url.toString());
}
