<template>
  <div class="master-layout">
    <nav class="navbar">
      <!-- Brand -->
      <RouterLink to="/" class="navbar-brand">
        <div class="navbar-brand-icon">
          <AppIcon name="book" :size="18" />
        </div>
        <span class="navbar-brand-name">DigiLib</span>
      </RouterLink>

      <!-- Search -->
      <div class="navbar-search">
        <div class="search-input-wrapper">
          <AppIcon name="search" :size="16" class="search-icon" />
          <input
            v-model="searchQuery"
            class="search-input"
            :placeholder="$t('books.search')"
            @keyup.enter="goSearch"
          />
        </div>
      </div>

      <!-- Nav links -->
      <div class="navbar-nav">
        <RouterLink to="/" class="navbar-nav-link" exact-active-class="active">{{ $t('nav.home') }}</RouterLink>
        <RouterLink to="/books" class="navbar-nav-link" active-class="active">{{ $t('nav.books') }}</RouterLink>
        <!-- Tủ sách (Reader only) -->
        <RouterLink
          v-if="auth.isReader"
          to="/reader/shelf"
          class="navbar-nav-link navbar-shelf-link"
          active-class="active"
        >
          <i class="pi pi-bookmark" style="font-size:13px"></i>
          {{ $t('nav.bookshelf') }}
          <span v-if="cartStore.count > 0" class="shelf-badge">{{ cartStore.count }}</span>
        </RouterLink>
        <!-- Role-based quick access -->
        <RouterLink
          v-if="auth.isLoggedIn && dashboardLink"
          :to="dashboardLink.path"
          class="navbar-nav-link navbar-nav-link-role"
          active-class="active"
        >
          <i :class="['pi', dashboardLink.icon]" style="font-size:13px"></i>
          {{ dashboardLink.label }}
        </RouterLink>
      </div>

      <!-- Actions -->
      <div class="navbar-actions">
        <!-- Theme toggle -->
        <button class="toggle-btn" @click="toggleTheme" :title="isDark ? $t('common.lightMode') : $t('common.darkMode')">
          <AppIcon :name="isDark ? 'sun' : 'moon'" :size="18" />
        </button>

        <!-- Language toggle -->
        <button class="lang-btn" @click="toggleLang">
          <AppIcon name="globe" :size="16" />
          <span>{{ currentLang === 'vi' ? 'VI' : 'EN' }}</span>
        </button>

        <!-- Notifications (if logged in) -->
        <NotificationBell v-if="auth.isLoggedIn" />

        <!-- User menu / login buttons -->
        <template v-if="auth.isLoggedIn">
          <UserMenu />
        </template>
        <template v-else>
          <RouterLink to="/login" class="btn btn-ghost btn-sm">{{ $t('nav.login') }}</RouterLink>
          <RouterLink to="/register" class="btn btn-primary btn-sm">{{ $t('nav.register') }}</RouterLink>
        </template>
      </div>
    </nav>

    <main class="master-main">
      <slot />
    </main>

    <footer class="master-footer">
      <div class="footer-inner">
        <span class="footer-brand">
          <AppIcon name="book" :size="16" style="vertical-align:middle;margin-right:4px" />
          DigiLib
        </span>
        <span class="footer-copy">© 2026 Library Management System</span>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth.store'
import { useTheme } from '@/composables/useTheme'
import { setLocale } from '@/i18n'
import NotificationBell from '@/components/common/NotificationBell.vue'
import UserMenu from '@/components/common/UserMenu.vue'
import AppIcon from '@/components/common/AppIcon.vue'
import { useBookCartStore } from '@/stores/bookCart.store'

const router = useRouter()
const { t, locale } = useI18n()
const auth = useAuthStore()
const cartStore = useBookCartStore()
const { theme, toggle: toggleTheme } = useTheme()

const isDark = computed(() => theme.value === 'dark')
const currentLang = computed(() => locale.value)
const searchQuery = ref('')

// Role-based dashboard link
const dashboardLink = computed(() => {
  if (!auth.isLoggedIn) return null
  if (auth.isAdmin)   return { path: '/admin',  icon: 'pi-cog',       label: 'Admin' }
  if (auth.role === 'Staff') return { path: '/staff',  icon: 'pi-briefcase', label: t('common.manage') }
  if (auth.isReader) return { path: '/reader', icon: 'pi-user', label: t('common.readerZone') }
  return null
})

function toggleLang() {
  const next = locale.value === 'vi' ? 'en' : 'vi'
  setLocale(next)
}

function goSearch() {
  if (searchQuery.value.trim()) {
    router.push({ name: 'Books', query: { search: searchQuery.value.trim() } })
  }
}
</script>

<style scoped>
.master-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.master-main {
  flex: 1;
  max-width: var(--content-max);
  width: 100%;
  margin: 0 auto;
  padding: var(--space-6);
}

.master-footer {
  background: var(--bg-surface);
  border-top: 1px solid var(--border-color);
  padding: var(--space-4) var(--space-6);
  margin-top: auto;
}

.footer-inner {
  max-width: var(--content-max);
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: var(--font-size-sm);
  color: var(--text-muted);
}

.footer-brand {
  font-weight: 700;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  gap: 6px;
}

@media (max-width: 768px) {
  .master-main { padding: var(--space-4); }
  .navbar-nav  { display: none; }
  .navbar-search { display: none; }
}
</style>
