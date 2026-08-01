import { ref } from 'vue'

const toasts = ref([])
let nextId = 0

export function useToast() {
  function show(type, title, message, duration = 3500) {
    const id = ++nextId
    toasts.value.push({ id, type, title, message })
    setTimeout(() => {
      toasts.value = toasts.value.filter(t => t.id !== id)
    }, duration)
  }

  return {
    toasts,
    success: (title, msg) => show('success', title, msg),
    error:   (title, msg) => show('error', title, msg),
    warning: (title, msg) => show('warning', title, msg),
    info:    (title, msg) => show('info', title, msg),
    remove:  (id) => { toasts.value = toasts.value.filter(t => t.id !== id) }
  }
}
