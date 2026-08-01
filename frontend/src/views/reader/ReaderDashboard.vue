<template>
  <div class="reader-dashboard">
    <!-- Welcome header -->
    <div class="profile-header" style="margin-bottom: var(--space-6)">
      <div class="profile-avatar-lg">{{ initials }}</div>
      <div>
        <div class="profile-name">{{ $t('dashboard.welcome') }}, {{ auth.user?.username }}!</div>
        <div class="profile-role-badge"><i class="pi pi-user" style="font-size:10px; margin-right:4px"></i> Reader</div>
        <div v-if="profile" style="margin-top:8px;font-size:var(--font-size-sm);opacity:.8;display:flex;align-items:center;gap:6px">
          <i v-if="profile.TrangThaiHoSo === 'DaXacMinh'" class="pi pi-check-circle" style="color:var(--color-success)"></i>
          <i v-else class="pi pi-clock" style="color:var(--color-warning)"></i>
          {{ profile.TrangThaiHoSo === 'DaXacMinh' ? $t('dashboard.verifiedProfile') : $t('dashboard.unverifiedProfile') }}
        </div>
      </div>
    </div>

    <!-- Stats -->
    <div class="stats-grid" style="margin-bottom:var(--space-6)">
      <div class="stat-card">
        <div class="stat-card-header">
          <div class="stat-card-icon blue"><i class="pi pi-clipboard"></i></div>
          <span class="stat-card-label">{{ $t('borrows.title') }}</span>
        </div>
        <div class="stat-card-value">{{ stats.total }}</div>
        <div class="stat-card-change">{{ $t('dashboard.totalBorrowTickets') }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-header">
          <div class="stat-card-icon yellow"><i class="pi pi-clock"></i></div>
          <span class="stat-card-label">{{ $t('dashboard.pendingBorrows') }}</span>
        </div>
        <div class="stat-card-value">{{ stats.pending }}</div>
        <div class="stat-card-change">{{ $t('dashboard.pendingApproval') }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-header">
          <div class="stat-card-icon green"><i class="pi pi-book"></i></div>
          <span class="stat-card-label">{{ $t('dashboard.activeBorrows') }}</span>
        </div>
        <div class="stat-card-value">{{ stats.active }}</div>
        <div class="stat-card-change">{{ $t('dashboard.booksHolding') }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-header">
          <div class="stat-card-icon red"><i class="pi pi-exclamation-triangle"></i></div>
          <span class="stat-card-label">{{ $t('dashboard.overdueBorrows') }}</span>
        </div>
        <div class="stat-card-value">{{ stats.overdue }}</div>
        <div class="stat-card-change">{{ $t('dashboard.needReturnUrgent') }}</div>
      </div>
    </div>

    <!-- Quick actions -->
    <div class="quick-actions">
      <h2 class="section-title" style="margin-bottom:var(--space-4)">{{ $t('dashboard.quickActions') }}</h2>
      <div class="actions-grid">
        <RouterLink to="/books" class="action-card">
          <span class="action-icon"><i class="pi pi-search"></i></span>
          <span class="action-label">{{ $t('dashboard.findBook') }}</span>
        </RouterLink>
        <RouterLink to="/reader/borrows" class="action-card">
          <span class="action-icon"><i class="pi pi-list"></i></span>
          <span class="action-label">{{ $t('nav.myBorrows') }}</span>
        </RouterLink>
        <RouterLink to="/reader/profile" class="action-card">
          <span class="action-icon"><i class="pi pi-user"></i></span>
          <span class="action-label">{{ $t('nav.profile') }}</span>
        </RouterLink>
        <RouterLink to="/reader/notifications" class="action-card">
          <span class="action-icon"><i class="pi pi-bell"></i></span>
          <span class="action-label">{{ $t('nav.notifications') }}</span>
        </RouterLink>
      </div>
    </div>

    <!-- Profile not registered warning -->
    <div v-if="!loadingProfile && !profile" class="profile-warn">
      <span><i class="pi pi-exclamation-triangle" style="margin-right:6px"></i> {{ $t('dashboard.profileNotRegistered') }}</span>
      <RouterLink to="/reader/profile" class="btn btn-primary btn-sm btn-with-icon">{{ $t('dashboard.registerNow') }} <i class="pi pi-arrow-right" style="font-size:12px"></i></RouterLink>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth.store'
import { readerService } from '@/services/readers.service'
import { borrowService } from '@/services/borrows.service'

const auth = useAuthStore()
const profile = ref(null)
const loadingProfile = ref(true)
const stats = ref({ total: 0, pending: 0, active: 0, overdue: 0 })

const initials = computed(() => (auth.user?.username || 'U').slice(0, 2).toUpperCase())

async function fetchData() {
  try {
    const profileRes = await readerService.getMyProfile()
    profile.value = profileRes.data.data
  } catch (_) {}
  finally { loadingProfile.value = false }

  try {
    const borrowRes = await borrowService.getMy({ limit: 100 })
    const borrows = borrowRes.data.data || []
    stats.value = {
      total: borrows.length,
      pending: borrows.filter(b => b.TrangThaiPhieu === 'ChoDuyet').length,
      active: borrows.filter(b => b.TrangThaiPhieu === 'DangMuon').length,
      overdue: borrows.reduce((acc, b) => acc + (b.ChiTiet || []).filter(d => d.TrangThaiChiTiet === 'QuaHan').length, 0)
    }
  } catch (_) {}
}

onMounted(fetchData)
</script>

<style scoped>
.actions-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-4);
  margin-bottom: var(--space-6);
}

.action-card {
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-lg);
  padding: var(--space-5);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-3);
  text-decoration: none;
  transition: all var(--transition-fast);
  cursor: pointer;
}

.action-card:hover {
  box-shadow: var(--shadow-md);
  border-color: var(--brand-300);
  transform: translateY(-2px);
}

.action-icon { font-size: 28px; }
.action-label { font-size: var(--font-size-sm); font-weight: 600; color: var(--text-primary); }

.profile-warn {
  background: #fef9c3;
  border: 1px solid #fde047;
  border-radius: var(--border-radius-lg);
  padding: var(--space-4) var(--space-5);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  font-size: var(--font-size-sm);
  color: #78350f;
  flex-wrap: wrap;
}

[data-theme="dark"] .profile-warn {
  background: rgba(245,158,11,.1);
  border-color: rgba(245,158,11,.3);
  color: #fcd34d;
}

@media (max-width: 768px) {
  .actions-grid { grid-template-columns: repeat(2, 1fr); }
}
</style>
