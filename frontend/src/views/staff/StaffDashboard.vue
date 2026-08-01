<template>
  <div class="staff-dashboard">
    <h1 class="section-title" style="margin-bottom:var(--space-6)">{{ $t('nav.dashboard') }}</h1>

    <!-- Stats -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-card-header">
          <div class="stat-card-icon blue"><i class="pi pi-book"></i></div>
          <span class="stat-card-label">{{ $t('dashboard.totalBooks') }}</span>
        </div>
        <div class="stat-card-value">{{ stats.books }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-header">
          <div class="stat-card-icon green"><i class="pi pi-users"></i></div>
          <span class="stat-card-label">{{ $t('dashboard.totalReaders') }}</span>
        </div>
        <div class="stat-card-value">{{ stats.readers }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-header">
          <div class="stat-card-icon yellow"><i class="pi pi-clock"></i></div>
          <span class="stat-card-label">{{ $t('dashboard.pendingBorrows') }}</span>
        </div>
        <div class="stat-card-value">{{ stats.pending }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-header">
          <div class="stat-card-icon blue"><i class="fa-solid fa-book-reader"></i></div>
          <span class="stat-card-label">{{ $t('dashboard.activeBorrows') }}</span>
        </div>
        <div class="stat-card-value">{{ stats.active }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-header">
          <div class="stat-card-icon red"><i class="pi pi-exclamation-triangle"></i></div>
          <span class="stat-card-label">{{ $t('dashboard.overdueBorrows') }}</span>
        </div>
        <div class="stat-card-value">{{ stats.overdue }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-header">
          <div class="stat-card-icon purple"><i class="pi pi-shield"></i></div>
          <span class="stat-card-label">{{ $t('staffDashboard.pendingUsers') }}</span>
        </div>
        <div class="stat-card-value">{{ stats.unverified }}</div>
      </div>
    </div>

    <!-- Recent borrows -->
    <div style="margin-top:var(--space-6)">
      <div class="section-header">
        <h2 class="section-title">{{ $t('dashboard.recentBorrows') }}</h2>
        <RouterLink to="/staff/borrows" class="see-all-btn flex items-center gap-1">{{ $t('home.seeAll') }} <i class="pi pi-arrow-right" style="font-size:12px"></i></RouterLink>
      </div>
      <div class="data-table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th>{{ $t('staffDashboard.ticketId') }}</th>
              <th>{{ $t('staffDashboard.reader') }}</th>
              <th>{{ $t('staffDashboard.date') }}</th>
              <th>{{ $t('staffDashboard.status') }}</th>
              <th>{{ $t('common.actions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loadingBorrows"><td colspan="5" class="text-center"><div class="spinner" style="margin:auto;width:24px;height:24px"></div></td></tr>
            <tr v-else-if="recentBorrows.length === 0"><td colspan="5" class="text-center text-muted">{{ $t('common.noData') }}</td></tr>
            <tr v-for="b in recentBorrows" :key="b._id" v-else>
              <td><span class="text-xs font-semibold">#{{ b._id.slice(-8).toUpperCase() }}</span></td>
              <td>{{ b.DocGiaId?.HoTen || '—' }}</td>
              <td>{{ formatDate(b.createdAt) }}</td>
              <td><StatusBadge :value="b.TrangThaiPhieu" type="borrow" /></td>
              <td>
                <div class="flex gap-2">
                  <RouterLink v-if="b.TrangThaiPhieu === 'ChoDuyet'" to="/staff/borrows" class="btn btn-primary btn-sm btn-with-icon">
                    <i class="pi pi-cog"></i> {{ $t('staffDashboard.process') }}
                  </RouterLink>
                  <RouterLink v-else to="/staff/borrows" class="btn btn-secondary btn-sm btn-with-icon">
                    <i class="pi pi-eye"></i> {{ $t('staffDashboard.view') }}
                  </RouterLink>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { bookService } from '@/services/books.service'
import { readerService } from '@/services/readers.service'
import { borrowService } from '@/services/borrows.service'
import { useToast } from '@/composables/useToast'
import StatusBadge from '@/components/common/StatusBadge.vue'

const { success, error: toastError } = useToast()

const stats = ref({ books: 0, readers: 0, pending: 0, active: 0, overdue: 0, unverified: 0 })
const recentBorrows = ref([])
const loadingBorrows = ref(true)

function formatDate(d) { return d ? new Date(d).toLocaleDateString('vi-VN') : '—' }



async function fetchBorrows() {
  loadingBorrows.value = true
  try {
    const res = await borrowService.getAll({ limit: 8 })
    recentBorrows.value = res.data.data || []
  } finally { loadingBorrows.value = false }
}

onMounted(async () => {
  fetchBorrows()
  try {
    const [booksRes, readersRes, pendingRes, activeRes, overdueRes, unverifiedRes] = await Promise.all([
      bookService.getAll({ limit: 1 }),
      readerService.getAll({ limit: 1 }),
      borrowService.getAll({ trangThai: 'ChoDuyet', limit: 1 }),
      borrowService.getAll({ trangThai: 'DangMuon', limit: 1 }),
      borrowService.getAll({ trangThai: 'QuaHan', limit: 1 }),
      readerService.getAll({ trangThai: 'ChuaXacMinh', limit: 1 }),
    ])
    stats.value = {
      books: booksRes.data.pagination?.total || 0,
      readers: readersRes.data.pagination?.total || 0,
      pending: pendingRes.data.pagination?.total || 0,
      active: activeRes.data.pagination?.total || 0,
      overdue: overdueRes.data.pagination?.total || 0,
      unverified: unverifiedRes.data.pagination?.total || 0,
    }
  } catch (_) {}
})
</script>
