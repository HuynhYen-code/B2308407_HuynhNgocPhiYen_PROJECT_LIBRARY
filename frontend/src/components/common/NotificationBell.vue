<template>
  <div class="notif-wrapper" ref="bellRef">
    <button class="notif-btn" @click="togglePanel" :aria-label="$t('notifications.title')">
      <AppIcon name="bell" :size="20" />
      <span v-if="store.unreadCount > 0" class="notif-badge">{{ store.unreadCount > 9 ? '9+' : store.unreadCount }}</span>
    </button>

    <Transition name="slide-up">
      <div v-if="open" class="notif-panel">
        <div class="notif-panel-header">
          <span class="notif-panel-title">{{ $t('notifications.title') }}</span>
          <button v-if="store.unreadCount > 0" class="btn btn-ghost btn-sm" @click="store.markAllRead()">
            {{ $t('notifications.markAllRead') }}
          </button>
        </div>
        <div class="notif-list">
          <div v-if="store.loading" class="notif-loading">
            <div class="spinner" style="width:28px;height:28px"></div>
          </div>
          <div v-else-if="store.notifications.length === 0" class="notif-empty">
            {{ $t('notifications.noData') }}
          </div>
          <div
            v-for="notif in store.notifications"
            :key="notif._id"
            class="notif-item"
            :class="{ unread: !notif.DaDoc }"
            @click="readNotif(notif)"
          >
            <div class="notif-item-dot" v-if="!notif.DaDoc"></div>
            <div class="notif-item-content">
              <div class="notif-item-title">{{ notif.TieuDe }}</div>
              <div class="notif-item-body">{{ notif.NoiDung }}</div>
              <div class="notif-item-time">{{ formatTime(notif.NgayTao) }}</div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useNotificationStore } from '@/stores/notifications.store'
import { useAuthStore } from '@/stores/auth.store'
import AppIcon from './AppIcon.vue'

const store = useNotificationStore()
const auth = useAuthStore()
const open = ref(false)
const bellRef = ref(null)

function togglePanel() {
  open.value = !open.value
  if (open.value && store.notifications.length === 0) {
    store.fetchAll()
  }
}

function readNotif(n) {
  if (!n.DaDoc) store.markRead(n._id)
}

function formatTime(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function outside(e) {
  if (bellRef.value && !bellRef.value.contains(e.target)) open.value = false
}

onMounted(() => {
  document.addEventListener('click', outside)
  if (auth.isLoggedIn) store.fetchAll()
})
onUnmounted(() => document.removeEventListener('click', outside))
</script>

<style scoped>
.notif-wrapper { position: relative; }

.notif-panel {
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  width: 340px;
  max-height: 480px;
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-lg);
  z-index: 200;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.notif-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-4) var(--space-5);
  border-bottom: 1px solid var(--border-color);
  flex-shrink: 0;
}

.notif-panel-title {
  font-size: var(--font-size-md);
  font-weight: 700;
  color: var(--text-primary);
}

.notif-list { overflow-y: auto; flex: 1; }

.notif-loading, .notif-empty {
  padding: var(--space-8);
  text-align: center;
  color: var(--text-muted);
  font-size: var(--font-size-sm);
  display: flex;
  align-items: center;
  justify-content: center;
}

.notif-item {
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
  padding: var(--space-4) var(--space-5);
  border-bottom: 1px solid var(--border-color);
  cursor: pointer;
  transition: background var(--transition-fast);
  position: relative;
}

.notif-item:last-child { border-bottom: none; }
.notif-item:hover { background: var(--bg-hover); }
.notif-item.unread { background: var(--brand-50); }
[data-theme="dark"] .notif-item.unread { background: rgba(59,130,246,.08); }

.notif-item-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--brand-600);
  flex-shrink: 0;
  margin-top: 6px;
}

.notif-item-content { flex: 1; min-width: 0; }

.notif-item-title {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 3px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.notif-item-body {
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
  line-height: 1.5;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.notif-item-time {
  font-size: var(--font-size-xs);
  color: var(--text-muted);
  margin-top: 5px;
}
</style>
