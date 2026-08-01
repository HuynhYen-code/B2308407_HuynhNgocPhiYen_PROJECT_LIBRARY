import { createI18n } from 'vue-i18n'
import vi from './vi.js'
import en from './en.js'

const savedLang = localStorage.getItem('lang') || 'vi'

export const i18n = createI18n({
  legacy: false,
  locale: savedLang,
  fallbackLocale: 'vi',
  messages: { vi, en }
})

export function setLocale(lang) {
  i18n.global.locale.value = lang
  localStorage.setItem('lang', lang)
  document.documentElement.setAttribute('lang', lang)
}
