<template>
  <div class="notifs-page">
    <div class="section-header">
      <h1 class="section-title">{{ $t('notifications.title') }}</h1>
      <button v-if="store.unreadCount > 0" class="btn btn-secondary btn-sm btn-with-icon" @click="store.markAllRead()">
        <i class="pi pi-check-circle"></i> {{ $t('notifications.markAllRead') }}
      </button>
    </div>

    <div v-if="store.loading" class="loading-spinner-wrapper"><div class="spinner"></div></div>

    <div v-else-if="store.notifications.length === 0" class="empty-state">
      <div class="empty-state-icon"><i class="pi pi-bell" style="font-size:48px;color:var(--text-muted)"></i></div>
      <div class="empty-state-title">{{ $t('notifications.noData') }}</div>
    </div>

    <div v-else class="notifs-list">
      <div
        v-for="notif in store.notifications"
        :key="notif._id"
        class="notif-full-item"
        :class="{ unread: !notif.DaDoc }"
        @click="store.markRead(notif._id)"
      >
        <div class="notif-full-dot" v-if="!notif.DaDoc"></div>
        <div class="notif-full-content">
          <div class="notif-full-title">{{ notif.TieuDe }}</div>
          <div class="notif-full-body">{{ notif.NoiDung }}</div>
          <div class="notif-full-time"><i class="pi pi-clock" style="font-size:11px; margin-right:4px"></i>{{ formatTime(notif.NgayTao) }}</div>
        </div>
        <span v-if="!notif.DaDoc" class="badge badge-blue">{{ $t('notifications.unread') }}</span>
        <span v-else class="badge badge-gray">{{ $t('notifications.read') }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useNotificationStore } from '@/stores/notifications.store'

const store = useNotificationStore()

function formatTime(d) {
  if (!d) return ''
  return new Date(d).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

onMounted(() => store.fetchAll())
</script>

<style scoped>
.notifs-list { display: flex; flex-direction: column; gap: var(--space-3); }

.notif-full-item {
  display: flex;
  align-items: flex-start;
  gap: var(--space-4);
  padding: var(--space-5);
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-lg);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.notif-full-item:hover { box-shadow: var(--shadow); }
.notif-full-item.unread { border-color: var(--brand-300); background: var(--brand-50); }
[data-theme="dark"] .notif-full-item.unread { background: rgba(59,130,246,.08); border-color: rgba(59,130,246,.3); }

.notif-full-dot {
  width: 10px; height: 10px; border-radius: 50%;
  background: var(--brand-600); flex-shrink: 0; margin-top: 6px;
}

.notif-full-content { flex: 1; min-width: 0; }
.notif-full-title { font-weight: 700; color: var(--text-primary); margin-bottom: 6px; }
.notif-full-body { font-size: var(--font-size-sm); color: var(--text-secondary); line-height: 1.6; margin-bottom: 8px; }
.notif-full-time { font-size: var(--font-size-xs); color: var(--text-muted); }
</style>
