import { ref, watch } from 'vue'

const theme = ref(localStorage.getItem('theme') || 'light')

function applyTheme(t) {
  document.documentElement.setAttribute('data-theme', t)
  localStorage.setItem('theme', t)
}

// Apply on init
applyTheme(theme.value)

export function useTheme() {
  function toggle() {
    theme.value = theme.value === 'light' ? 'dark' : 'light'
    applyTheme(theme.value)
  }

  function setTheme(t) {
    theme.value = t
    applyTheme(t)
  }

  return { theme, toggle, setTheme }
}
