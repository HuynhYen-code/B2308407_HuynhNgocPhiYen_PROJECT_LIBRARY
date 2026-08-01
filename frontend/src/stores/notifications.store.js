import { defineStore } from 'pinia'
import { ref } from 'vue'
import { notificationService } from '@/services/notifications.service'

export const useNotificationStore = defineStore('notifications', () => {
  const notifications = ref([])
  const unreadCount = ref(0)
  const loading = ref(false)

  async function fetchAll() {
    loading.value = true
    try {
      const res = await notificationService.getAll()
      notifications.value = res.data.data || []
      unreadCount.value = notifications.value.filter(n => !n.DaDoc).length
    } catch (_) {}
    finally { loading.value = false }
  }

  async function markRead(id) {
    await notificationService.markAsRead(id)
    const notif = notifications.value.find(n => n._id === id)
    if (notif && !notif.DaDoc) {
      notif.DaDoc = true
      unreadCount.value = Math.max(0, unreadCount.value - 1)
    }
  }

  async function markAllRead() {
    await notificationService.markAllAsRead()
    notifications.value.forEach(n => { n.DaDoc = true })
    unreadCount.value = 0
  }

  return { notifications, unreadCount, loading, fetchAll, markRead, markAllRead }
})
