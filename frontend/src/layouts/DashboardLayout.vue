<template>
  <div class="page-wrapper">
    <!-- Sidebar -->
    <aside class="sidebar">
      <!-- Logo -->
      <RouterLink to="/" class="sidebar-logo">
        <div class="sidebar-logo-icon">
          <AppIcon name="book" :size="20" />
        </div>
        <span class="sidebar-logo-text">DigiLib</span>
      </RouterLink>

      <!-- Navigation -->
      <nav class="sidebar-nav">
        <!-- Reader Nav -->
        <template v-if="auth.isReader">
          <span class="sidebar-section-title">Menu</span>
          <RouterLink to="/reader" class="sidebar-link" exact-active-class="active">
            <AppIcon name="home" :size="18" /><span>{{ $t('nav.overview') }}</span>
          </RouterLink>
          <RouterLink to="/reader/borrows" class="sidebar-link" active-class="active">
            <AppIcon name="clipboard" :size="18" /><span>{{ $t('nav.myBorrows') }}</span>
          </RouterLink>
          <RouterLink to="/reader/shelf" class="sidebar-link" active-class="active">
            <AppIcon name="collection" :size="18" />
            <span>{{ $t('nav.bookshelf') }}</span>
            <span v-if="cartStore.count > 0" class="sidebar-badge sidebar-badge-cart">{{ cartStore.count }}</span>
          </RouterLink>
          <RouterLink to="/reader/profile" class="sidebar-link" active-class="active">
            <AppIcon name="user" :size="18" /><span>{{ $t('nav.profile') }}</span>
          </RouterLink>
          <RouterLink to="/reader/notifications" class="sidebar-link" active-class="active">
            <AppIcon name="bell" :size="18" /><span>{{ $t('nav.notifications') }}</span>
            <span v-if="notifStore.unreadCount > 0" class="sidebar-badge">{{ notifStore.unreadCount }}</span>
          </RouterLink>
        </template>

        <!-- Staff Nav -->
        <template v-if="auth.isStaffOrAdmin">
          <span class="sidebar-section-title">Quản lý</span>
          <RouterLink to="/staff" class="sidebar-link" exact-active-class="active">
            <AppIcon name="chart-bar" :size="18" /><span>{{ $t('nav.dashboard') }}</span>
          </RouterLink>
          <RouterLink to="/staff/books" class="sidebar-link" active-class="active">
            <AppIcon name="book" :size="18" /><span>{{ $t('nav.booksManage') }}</span>
          </RouterLink>
          <RouterLink to="/staff/copies" class="sidebar-link" active-class="active">
            <AppIcon name="duplicate" :size="18" /><span>{{ $t('nav.bookCopies') }}</span>
          </RouterLink>
          <RouterLink to="/staff/readers" class="sidebar-link" active-class="active">
            <AppIcon name="users" :size="18" /><span>{{ $t('nav.readersManage') }}</span>
          </RouterLink>
          <RouterLink to="/staff/borrows" class="sidebar-link" active-class="active">
            <AppIcon name="clipboard" :size="18" /><span>{{ $t('nav.borrowsManage') }}</span>
          </RouterLink>
          <span class="sidebar-section-title">Danh mục</span>
          <RouterLink to="/staff/categories" class="sidebar-link" active-class="active">
            <AppIcon name="tag" :size="18" /><span>{{ $t('nav.categories') }}</span>
          </RouterLink>
          <RouterLink to="/staff/publishers" class="sidebar-link" active-class="active">
            <AppIcon name="office" :size="18" /><span>{{ $t('nav.publishers') }}</span>
          </RouterLink>
        </template>

        <!-- Admin extras -->
        <template v-if="auth.isAdmin">
          <span class="sidebar-section-title">Hệ thống</span>
          <RouterLink to="/admin" class="sidebar-link" exact-active-class="active">
            <AppIcon name="cog" :size="18" /><span>Admin Dashboard</span>
          </RouterLink>
          <RouterLink to="/admin/staff" class="sidebar-link" active-class="active">
            <AppIcon name="briefcase" :size="18" /><span>{{ $t('nav.staffManage') }}</span>
          </RouterLink>
        </template>
      </nav>

      <!-- Bottom controls -->
      <div class="sidebar-bottom">
        <button class="sidebar-link sidebar-link-btn" @click="toggleTheme">
          <AppIcon :name="isDark ? 'sun' : 'moon'" :size="18" />
          <span>{{ isDark ? $t('common.lightMode') : $t('common.darkMode') }}</span>
        </button>
        <button class="sidebar-link sidebar-link-btn" @click="toggleLang">
          <AppIcon name="globe" :size="18" />
          <span>{{ currentLang === 'vi' ? 'Tiếng Việt' : 'English' }}</span>
        </button>
        <button class="sidebar-link sidebar-link-btn sidebar-link-danger" @click="handleLogout">
          <AppIcon name="logout" :size="18" />
          <span>{{ $t('nav.logout') }}</span>
        </button>
      </div>
    </aside>

    <!-- Main -->
    <div class="main-content">
      <!-- Top header -->
      <header class="dash-header">
        <div class="dash-header-left">
          <!-- Nav links (same as MasterLayout but without search bar) -->
          <div class="navbar-nav" style="display:flex;align-items:center;gap:var(--space-2)">
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
          </div>
        </div>
        <div class="dash-header-right">
          <NotificationBell />
          <UserMenu />
        </div>
      </header>

      <!-- Page content -->
      <div class="content-area">
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth.store'
import { useNotificationStore } from '@/stores/notifications.store'
import { useTheme } from '@/composables/useTheme'
import { setLocale } from '@/i18n'
import NotificationBell from '@/components/common/NotificationBell.vue'
import UserMenu from '@/components/common/UserMenu.vue'
import AppIcon from '@/components/common/AppIcon.vue'
import { useBookCartStore } from '@/stores/bookCart.store'

const router = useRouter()
const { locale } = useI18n()
const auth = useAuthStore()
const notifStore = useNotificationStore()
const cartStore = useBookCartStore()
const { theme, toggle: toggleTheme } = useTheme()

const isDark = computed(() => theme.value === 'dark')
const currentLang = computed(() => locale.value)
const searchQuery = ref('')

function toggleLang() {
  setLocale(locale.value === 'vi' ? 'en' : 'vi')
}

async function handleLogout() {
  auth.logout()
  router.push('/login')
}

onMounted(() => {
  if (auth.isLoggedIn) notifStore.fetchAll()
})
</script>

<style scoped>
.sidebar-link-btn {
  width: 100%;
  background: none;
  border: none;
  cursor: pointer;
  text-align: left;
  font-family: inherit;
}

.sidebar-link-danger {
  color: var(--color-danger) !important;
}

.sidebar-link-danger:hover {
  background: rgba(239, 68, 68, .08) !important;
  color: var(--color-danger) !important;
}
</style>
