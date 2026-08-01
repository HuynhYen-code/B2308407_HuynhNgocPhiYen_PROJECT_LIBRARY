<template>
  <div class="my-borrows">
    <div class="section-header">
      <h1 class="section-title">{{ $t('borrows.title') }}</h1>
    </div>

    <!-- Filter tabs -->
    <div class="borrow-tabs">
      <button v-for="tab in tabs" :key="tab.value" class="borrow-tab" :class="{ active: activeTab === tab.value }" @click="setTab(tab.value)">
        {{ tab.label }}
        <span v-if="tab.count" class="tab-count">{{ tab.count }}</span>
      </button>
    </div>

    <div v-if="loading" class="loading-spinner-wrapper"><div class="spinner"></div></div>

    <div v-else-if="filteredBorrows.length === 0" class="empty-state">
      <div class="empty-state-icon">
        <i class="pi pi-inbox" style="font-size:48px;color:var(--text-muted)"></i>
      </div>
      <div class="empty-state-title">{{ $t('borrows.noData') }}</div>
      <RouterLink to="/books" class="btn btn-primary btn-with-icon">
        <i class="pi pi-search"></i> {{ $t('dashboard.findBook') }}
      </RouterLink>
    </div>

    <div v-else class="borrows-list">
      <div v-for="borrow in filteredBorrows" :key="borrow._id" class="borrow-card">
        <div class="borrow-card-header">
          <div>
            <div class="borrow-id">{{ $t('borrows.ticketId') }}: #{{ borrow._id.slice(-8).toUpperCase() }}</div>
            <div class="text-xs text-muted mt-2">{{ $t('borrows.dateCreated') }}: {{ formatDate(borrow.NgayLapPhieu || borrow.createdAt) }}</div>
          </div>
          <div class="flex items-center gap-3">
            <StatusBadge :value="borrow.TrangThaiPhieu" type="borrow" />
            <button
              v-if="borrow.TrangThaiPhieu === 'ChoDuyet'"
              class="btn btn-danger btn-sm btn-with-icon"
              @click="cancelBorrow(borrow._id)"
              :disabled="cancelingId === borrow._id"
            >
              <i class="pi pi-times" style="font-size:12px"></i>
              {{ cancelingId === borrow._id ? '...' : $t('common.cancel') }}
            </button>
          </div>
        </div>

        <!-- Book details -->
        <div class="borrow-books">
          <div v-for="detail in (borrow.ChiTiet || [])" :key="detail._id" class="borrow-book-row">
            <div class="borrow-book-icon">
              <i class="pi pi-book" style="font-size:18px;color:var(--brand-400)"></i>
            </div>
            <div class="borrow-book-info">
              <div class="text-sm font-semibold">
                {{ detail.DauSachId?.TenSach || 'Sách' }}
              </div>
              <div class="text-xs text-muted">
                <span v-if="detail.TrangThaiChiTiet === 'ChoGanBan'" style="color:var(--color-warning)">
                  <i class="pi pi-clock" style="font-size:10px"></i>
                  {{ $t('dashboard.pendingApproval') }}
                </span>
                <div v-else class="flex items-center gap-2 flex-wrap mt-1">
                  <span class="due-date-badge" :class="{
                    'is-danger': detail.TrangThaiChiTiet === 'QuaHan',
                    'is-warning': detail.TrangThaiChiTiet === 'SapDenHan',
                    'is-info': detail.TrangThaiChiTiet === 'DangMuon'
                  }">
                    <i class="pi pi-calendar" style="font-size:11px"></i>
                    {{ $t('borrows.dueDate') }}: {{ formatDate(detail.HanTra) }}
                  </span>
                  <span v-if="detail.NgayTraThucTe" class="return-date-badge">
                    <i class="pi pi-check-circle" style="font-size:11px"></i> 
                    {{ $t('borrows.returnDate') }}: {{ formatDate(detail.NgayTraThucTe) }}
                  </span>
                  <span v-if="detail.TienPhat > 0" class="text-danger font-bold">
                    — <i class="pi pi-exclamation-triangle" style="font-size:11px"></i> 
                    {{ $t('borrows.fine') }}: {{ formatPrice(detail.TienPhat) }}
                  </span>
                </div>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <StatusBadge :value="detail.TrangThaiChiTiet" type="borrowDetail" />
              <!-- Renew button -->
              <button
                v-if="canRenew(detail)"
                class="btn btn-secondary btn-sm btn-with-icon"
                @click="renewBook(borrow._id, detail._id)"
                :disabled="renewingId === detail._id"
              >
                <i class="pi pi-refresh" style="font-size:12px"></i>
                {{ renewingId === detail._id ? '...' : $t('borrows.renew') }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { borrowService } from '@/services/borrows.service'
import { useToast } from '@/composables/useToast'
import StatusBadge from '@/components/common/StatusBadge.vue'

const { t } = useI18n()
const { success, error: toastError } = useToast()

const borrows = ref([])
const loading = ref(true)
const activeTab = ref('all')
const renewingId = ref(null)
const cancelingId = ref(null)

const tabs = computed(() => [
  { value: 'all', label: t('books.all'), count: borrows.value.length },
  { value: 'ChoDuyet', label: t('borrows.statusValues.ChoDuyet'), count: borrows.value.filter(b => b.TrangThaiPhieu === 'ChoDuyet').length },
  { value: 'DangMuon', label: t('borrows.statusValues.DangMuon'), count: borrows.value.filter(b => b.TrangThaiPhieu === 'DangMuon').length },
  { value: 'QuaHan', label: t('status.QuaHan', 'Quá hạn'), count: borrows.value.filter(b => b.TrangThaiPhieu === 'QuaHan').length },
  { value: 'DaHoanTat', label: t('borrows.statusValues.DaHoanTat'), count: borrows.value.filter(b => b.TrangThaiPhieu === 'DaHoanTat').length },
  { value: 'DaHuy', label: t('borrows.statusValues.DaHuy'), count: borrows.value.filter(b => b.TrangThaiPhieu === 'DaHuy').length },
])

const filteredBorrows = computed(() => {
  if (activeTab.value === 'all') return borrows.value
  return borrows.value.filter(b => b.TrangThaiPhieu === activeTab.value)
})

function setTab(val) { activeTab.value = val }
function formatDate(d) { if (!d) return '—'; return new Date(d).toLocaleDateString('vi-VN') }
function formatPrice(n) { return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n) }

function canRenew(detail) {
  return ['DangMuon', 'SapDenHan'].includes(detail.TrangThaiChiTiet) && detail.SoLanGiaHan < 1
}

async function renewBook(borrowId, detailId) {
  renewingId.value = detailId
  try {
    await borrowService.renew(borrowId, detailId)
    success(t('common.success'), '')
    await fetchBorrows()
  } catch (e) {
    toastError(t('common.error'), e.response?.data?.message || t('common.error'))
  } finally {
    renewingId.value = null
  }
}

async function cancelBorrow(borrowId) {
  if (!confirm('Bạn có chắc chắn muốn hủy phiếu mượn này không?')) return
  cancelingId.value = borrowId
  try {
    await borrowService.cancel(borrowId)
    success(t('common.success'), 'Đã hủy phiếu mượn.')
    await fetchBorrows()
  } catch (e) {
    toastError(t('common.error'), e.response?.data?.message || 'Không thể hủy phiếu mượn.')
  } finally {
    cancelingId.value = null
  }
}

async function fetchBorrows() {
  loading.value = true
  try {
    const res = await borrowService.getMy({ limit: 50 })
    borrows.value = res.data.data || []
  } finally {
    loading.value = false
  }
}

onMounted(fetchBorrows)
</script>

<style scoped>
.borrow-tabs {
  display: flex;
  gap: var(--space-2);
  flex-wrap: wrap;
  margin-bottom: var(--space-5);
  border-bottom: 1px solid var(--border-color);
  padding-bottom: var(--space-3);
}

.borrow-tab {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: var(--border-radius-full);
  border: none;
  background: transparent;
  font-size: var(--font-size-sm);
  font-weight: 500;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.borrow-tab:hover { background: var(--bg-hover); color: var(--text-primary); }
.borrow-tab.active { background: var(--brand-50); color: var(--brand-700); font-weight: 600; }
[data-theme="dark"] .borrow-tab.active { background: rgba(59,130,246,.15); color: var(--brand-400); }

.tab-count {
  background: var(--border-color);
  color: var(--text-secondary);
  font-size: 10px;
  font-weight: 700;
  padding: 1px 6px;
  border-radius: var(--border-radius-full);
  min-width: 18px;
  text-align: center;
}

.borrow-tab.active .tab-count { background: var(--brand-100); color: var(--brand-700); }

.borrows-list { display: flex; flex-direction: column; gap: var(--space-4); }

.borrow-books { display: flex; flex-direction: column; gap: var(--space-2); margin-top: var(--space-4); }

.borrow-book-row {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3);
  background: var(--bg-surface-2);
  border-radius: var(--border-radius);
  border: 1px solid var(--border-color);
}

.borrow-book-icon { font-size: 20px; flex-shrink: 0; }
.borrow-book-info { flex: 1; min-width: 0; }

.due-date-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 6px;
  border-radius: 4px;
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  font-weight: 600;
  color: var(--text-primary);
}
.due-date-badge.is-info {
  background: #eff6ff;
  border-color: #bfdbfe;
  color: #2563eb;
}
[data-theme="dark"] .due-date-badge.is-info {
  background: rgba(59, 130, 246, 0.15);
  border-color: rgba(59, 130, 246, 0.3);
  color: #60a5fa;
}
.due-date-badge.is-warning {
  background: #fffbeb;
  border-color: #fde68a;
  color: #d97706;
}
[data-theme="dark"] .due-date-badge.is-warning {
  background: rgba(245, 158, 11, 0.15);
  border-color: rgba(245, 158, 11, 0.3);
  color: #fbbf24;
}
.due-date-badge.is-danger {
  background: #fef2f2;
  border-color: #fca5a5;
  color: #dc2626;
}
[data-theme="dark"] .due-date-badge.is-danger {
  background: rgba(220, 38, 38, 0.15);
  border-color: rgba(220, 38, 38, 0.3);
  color: #f87171;
}

.return-date-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 6px;
  border-radius: 4px;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  font-weight: 600;
  color: #16a34a;
}
[data-theme="dark"] .return-date-badge {
  background: rgba(22, 163, 74, 0.15);
  border-color: rgba(22, 163, 74, 0.3);
  color: #4ade80;
}
</style>
