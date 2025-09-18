import zhCN from '../locales/zh-CN.js';
import enUS from '../locales/en-US.js';

// 定义支持的语言
const locales = {
  'zh-CN': zhCN,
  'en-US': enUS
};

// 获取默认语言（简体中文）
let currentLocale = 'zh-CN';

// 获取当前语言包
function getLocale() {
  return locales[currentLocale];
}

// 设置语言
function setLocale(locale) {
  if (locales[locale]) {
    currentLocale = locale;
    return true;
  }
  return false;
}

// 获取当前语言代码
function getCurrentLocale() {
  return currentLocale;
}

// 获取翻译文本
function t(key) {
  const locale = getLocale();
  return locale[key] || key;
}

// 获取支持的语言列表
function getSupportedLocales() {
  return Object.keys(locales);
}

export {
  getLocale,
  setLocale,
  getCurrentLocale,
  t,
  getSupportedLocales
};