<template>
  <div class="user-menu" ref="menuRef">
    <button class="user-menu-trigger" @click="open = !open">
      <div class="user-avatar">{{ initials }}</div>
      <span class="user-menu-name">{{ auth.user?.username || 'User' }}</span>
      <AppIcon name="chevronDown" :size="14" />
    </button>

    <Transition name="fade">
      <div v-if="open" class="user-dropdown">
        <!-- Role badge -->
        <div style="padding: 8px 12px 10px; border-bottom: 1px solid var(--border-color)">
          <div style="font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: .06em">{{ auth.role }}</div>
          <div style="font-weight: 600; color: var(--text-primary); margin-top: 2px">{{ auth.user?.username }}</div>
        </div>

        <!-- Reader links -->
        <RouterLink v-if="auth.isReader" to="/reader/profile" class="user-dropdown-item" @click="open = false">
          <AppIcon name="user" :size="16" /> {{ $t('nav.profile') }}
        </RouterLink>
        <RouterLink v-if="auth.isReader" to="/reader/borrows" class="user-dropdown-item" @click="open = false">
          <AppIcon name="clipboard" :size="16" /> {{ $t('nav.myBorrows') }}
        </RouterLink>
        <RouterLink v-if="auth.isReader" to="/reader/notifications" class="user-dropdown-item" @click="open = false">
          <AppIcon name="bell" :size="16" /> {{ $t('nav.notifications') }}
        </RouterLink>

        <!-- Staff/Admin links -->
        <RouterLink v-if="auth.isStaffOrAdmin" to="/staff" class="user-dropdown-item" @click="open = false">
          <AppIcon name="chart-bar" :size="16" /> {{ $t('nav.dashboard') }}
        </RouterLink>
        <RouterLink v-if="auth.isAdmin" to="/admin" class="user-dropdown-item" @click="open = false">
          <AppIcon name="cog" :size="16" /> Admin
        </RouterLink>

        <div class="user-dropdown-divider"></div>
        <button class="user-dropdown-item danger" @click="handleLogout">
          <AppIcon name="logout" :size="16" /> {{ $t('nav.logout') }}
        </button>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import AppIcon from './AppIcon.vue'

const auth = useAuthStore()
const router = useRouter()
const open = ref(false)
const menuRef = ref(null)

const initials = computed(() => {
  const name = auth.user?.username || 'U'
  return name.slice(0, 2).toUpperCase()
})

function handleLogout() {
  auth.logout()
  open.value = false
  router.push('/login')
}

function handleOutsideClick(e) {
  if (menuRef.value && !menuRef.value.contains(e.target)) {
    open.value = false
  }
}

onMounted(() => document.addEventListener('click', handleOutsideClick))
onUnmounted(() => document.removeEventListener('click', handleOutsideClick))
</script>
