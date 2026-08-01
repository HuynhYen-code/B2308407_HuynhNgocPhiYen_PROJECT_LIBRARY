<template>
  <div class="borrows-manage">
    <!-- Header -->
    <div class="section-header" style="margin-bottom:var(--space-5)">
      <h1 class="section-title">{{ $t('borrows.manageTitle') }}</h1>
      <div class="flex gap-2 flex-wrap">
        <input type="text" v-model="filterSearch" placeholder="Tìm mã phiếu, Tên độc giả..." class="form-input" style="width:220px" @keyup.enter="fetchBorrows" />
        <input type="date" v-model="filterDate" class="form-input" style="width:160px" @change="fetchBorrows" />
        <select v-model="filterStatus" class="form-select" style="width:180px" @change="fetchBorrows">
          <option value="">Tất cả trạng thái</option>
          <option value="ChoDuyet">Chờ duyệt</option>
          <option value="DangMuon">Đang mượn</option>
          <option value="QuaHan">Quá hạn</option>
          <option value="DaHoanTat">Đã hoàn tất</option>
          <option value="DaHuy">Đã hủy</option>
        </select>
      </div>
    </div>

    <!-- Table -->
    <div class="data-table-wrapper">
      <table class="data-table">
        <thead>
          <tr>
            <th>{{ $t('staffDashboard.ticketId') }}</th>
            <th>{{ $t('staffDashboard.reader') }}</th>
            <th>{{ $t('staff.phone') }}</th>
            <th>{{ $t('staffDashboard.date') }}</th>
            <th>{{ $t('staffDashboard.status') }}</th>
            <th>{{ $t('common.actions') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td colspan="7" class="text-center"><div class="spinner" style="margin:auto;width:24px;height:24px"></div></td>
          </tr>
          <tr v-else-if="borrows.length === 0">
            <td colspan="7" class="text-center text-muted">{{ $t('common.noData') }}</td>
          </tr>
          <tr v-for="b in borrows" :key="b._id" v-else>
            <td>
              <code class="id-chip">{{ b._id.slice(-8).toUpperCase() }}</code>
            </td>
            <td class="font-semibold text-sm">{{ b.DocGiaId?.HoTen || '—' }}</td>
            <td class="text-sm text-muted">{{ b.DocGiaId?.DienThoai || '—' }}</td>
           

            <td class="text-sm">{{ formatDate(b.NgayLapPhieu || b.createdAt) }}</td>
            <td><StatusBadge :value="b.TrangThaiPhieu" type="borrow" /></td>
            <td>
              <div class="flex gap-2">
                <button
                  class="btn btn-sm btn-with-icon"
                  :class="b.TrangThaiPhieu === 'ChoDuyet' ? 'btn-primary' : 'btn-secondary'"
                  @click="openDetail(b)"
                >
                  <i :class="['pi', b.TrangThaiPhieu === 'ChoDuyet' ? 'pi-cog' : 'pi-eye']" style="font-size:13px"></i>
                  {{ b.TrangThaiPhieu === 'ChoDuyet' ? 'Xử lý' : 'Chi tiết' }}
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="pagination">
      <button class="page-btn" :disabled="page<=1" @click="changePage(page-1)">
        <i class="pi pi-chevron-left" style="font-size:13px"></i>
      </button>
      <button v-for="p in visiblePages" :key="p" class="page-btn" :class="{active:p===page}" @click="changePage(p)">{{ p }}</button>
      <button class="page-btn" :disabled="page>=totalPages" @click="changePage(page+1)">
        <i class="pi pi-chevron-right" style="font-size:13px"></i>
      </button>
    </div>

    <!-- ─── DETAIL MODAL ─── -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="detailBorrow" class="modal-overlay" @click.self="detailBorrow=null">
          <div class="modal modal-xl">
            <!-- Header -->
            <div class="modal-header">
              <div>
                <div class="modal-title">
                  Chi tiết phiếu mượn
                  <code class="id-chip ml-2">{{ detailBorrow._id.slice(-8).toUpperCase() }}</code>
                </div>
                <div class="modal-subtitle">
                  Lập ngày {{ formatDate(detailBorrow.NgayLapPhieu || detailBorrow.createdAt) }}
                  <template v-if="detailBorrow.NhanVienId">
                    · Duyệt bởi: <strong>{{ detailBorrow.NhanVienId.HoTenNV }}</strong>
                  </template>
                </div>
              </div>
              <div class="flex items-center gap-3">
                <StatusBadge :value="detailBorrow.TrangThaiPhieu" type="borrow" />
                <button class="btn-icon" @click="detailBorrow=null">
                  <i class="pi pi-times" style="font-size:16px"></i>
                </button>
              </div>
            </div>

            <div class="modal-body" style="padding:0">
              <!-- Two-column layout -->
              <div class="detail-layout">
                <!-- LEFT: Reader info & actions -->
                <div class="detail-sidebar">
                  <!-- Reader card -->
                  <div class="detail-section">
                    <div class="detail-section-title">
                      <i class="pi pi-user"></i> Thông tin độc giả
                    </div>
                    <div class="reader-info-card">
                      <div class="reader-avatar">
                        {{ (detailBorrow.DocGiaId?.HoTen || 'U').slice(0,2).toUpperCase() }}
                      </div>
                      <div class="reader-details">
                        <div class="reader-name">{{ detailBorrow.DocGiaId?.HoTen || '—' }}</div>
                        <div class="reader-meta">
                          <i class="pi pi-phone"></i>
                          {{ detailBorrow.DocGiaId?.DienThoai || '—' }}
                        </div>
                        <div v-if="detailBorrow.DocGiaId?.DiaChi" class="reader-meta">
                          <i class="pi pi-map-marker"></i>
                          {{ detailBorrow.DocGiaId.DiaChi }}
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Stats -->
                  <div class="detail-section">
                    <div class="detail-section-title">
                      <i class="pi pi-chart-bar"></i> Thống kê phiếu
                    </div>
                    <div class="borrow-stats">
                      <div class="borrow-stat-item">
                        <div class="borrow-stat-val">{{ (detailBorrow.ChiTiet||[]).length }}</div>
                        <div class="borrow-stat-label">Tổng cuốn</div>
                      </div>
                      <div class="borrow-stat-item">
                        <div class="borrow-stat-val text-success">{{ returnedCount }}</div>
                        <div class="borrow-stat-label">Đã trả</div>
                      </div>
                      <div class="borrow-stat-item">
                        <div class="borrow-stat-val text-warning">{{ overdueCount }}</div>
                        <div class="borrow-stat-label">Quá hạn</div>
                      </div>
                      <div class="borrow-stat-item">
                        <div class="borrow-stat-val text-danger">{{ totalFine > 0 ? formatPrice(totalFine) : '0 ₫' }}</div>
                        <div class="borrow-stat-label">Tiền phạt</div>
                      </div>
                    </div>
                  </div>

                  <!-- Action buttons -->
                  <div class="detail-section">
                    <div class="detail-section-title">
                      <i class="pi pi-cog"></i> Thao tác
                    </div>
                    <div class="action-panel">
                      <template v-if="detailBorrow.TrangThaiPhieu === 'ChoDuyet'">
                        <button class="btn btn-success w-full btn-with-icon mb-2" @click="openAssign(detailBorrow)">
                          <i class="pi pi-check-square"></i> Gán bản sách & Duyệt
                        </button>
                        <button class="btn btn-danger w-full btn-with-icon" @click="openReject(detailBorrow)">
                          <i class="pi pi-times"></i> Từ chối
                        </button>
                      </template>
                      <template v-else-if="['DangMuon', 'QuaHan'].includes(detailBorrow.TrangThaiPhieu)">
                        <p class="text-sm text-secondary mb-3">Chọn cuốn sách trong danh sách bên phải để xác nhận trả:</p>
                        <button
                          class="btn btn-primary w-full btn-with-icon"
                          :disabled="selectedReturnIds.length === 0 || returning"
                          @click="confirmReturn"
                        >
                          <div v-if="returning" class="spinner-sm"></div>
                          <i v-else class="pi pi-download"></i>
                          {{ returning ? 'Đang xử lý...' : `Xác nhận trả (${selectedReturnIds.length})` }}
                        </button>
                      </template>
                      <div v-else class="text-sm text-muted text-center" style="padding:var(--space-4)">
                        Phiếu đã đóng, không còn thao tác.
                      </div>
                    </div>
                  </div>
                </div>

                <!-- RIGHT: Book detail list -->
                <div class="detail-main">
                  <div class="detail-section-title" style="padding:var(--space-5) var(--space-5) 0">
                    <i class="pi pi-list"></i> Danh sách sách mượn ({{ (detailBorrow.ChiTiet||[]).length }} cuốn)
                  </div>

                  <div class="book-detail-list">
                    <div
                      v-for="d in (detailBorrow.ChiTiet||[])"
                      :key="d._id"
                      class="book-detail-item"
                      :class="{
                        'is-returned': ['DaTraDung','DaTraTre'].includes(d.TrangThaiChiTiet),
                        'is-overdue': d.TrangThaiChiTiet === 'QuaHan',
                        'is-selected': selectedReturnIds.includes(d._id),
                      }"
                    >
                      <!-- Checkbox for return selection -->
                      <div
                        v-if="['DangMuon', 'QuaHan'].includes(detailBorrow.TrangThaiPhieu) && !['DaTraDung','DaTraTre'].includes(d.TrangThaiChiTiet)"
                        class="book-detail-check"
                        @click="toggleReturn(d._id)"
                      >
                        <div class="check-box" :class="{checked: selectedReturnIds.includes(d._id)}">
                          <i v-if="selectedReturnIds.includes(d._id)" class="pi pi-check" style="font-size:11px;color:#fff"></i>
                        </div>
                      </div>
                      <div v-else class="book-detail-check-spacer"></div>

                      <!-- Book icon -->
                      <div class="book-detail-icon">
                        <i class="pi pi-book" style="font-size:18px;color:var(--brand-400)"></i>
                      </div>

                        <div class="book-detail-info">
                          <!-- Tên sách từ DauSachId (mới) -->
                          <div style="font-weight:600;color:var(--text-primary);margin-bottom:2px;font-size:14px">
                            {{ d.DauSachId?.TenSach || d.CuonSachId?.DauSachId?.TenSach || 'Không rõ tựa sách' }}
                          </div>
                          <div style="font-size:12px;color:var(--text-secondary);margin-bottom:6px">
                            {{ (d.DauSachId?.TacGia || d.CuonSachId?.DauSachId?.TacGia || []).join(', ') || 'Khuyết danh' }}
                          </div>
                          <!-- Bản copy đã gán -->
                          <div class="book-detail-copy-id" v-if="d.CuonSachId">
                            <i class="pi pi-id-card" style="font-size:11px"></i>
                            <span style="color:var(--text-muted);font-size:11px">Bản copy:</span>
                            <code>{{ (d.CuonSachId?._id || d.CuonSachId)?.toString().slice(-8).toUpperCase() }}</code>
                          </div>
                          <div class="book-detail-copy-id" v-else style="color:var(--color-warning)">
                            <i class="pi pi-clock" style="font-size:11px"></i>
                            <span style="font-size:11px">Chưa gán bản copy</span>
                          </div>
                        <div class="book-detail-dates">
                          <span>
                            <i class="pi pi-calendar" style="font-size:11px"></i>
                            Hạn trả: <strong>{{ formatDate(d.HanTra) }}</strong>
                          </span>
                          <span v-if="d.NgayTraThucTe">
                            <i class="pi pi-calendar-check" style="font-size:11px;color:var(--color-success)"></i>
                            Đã trả: {{ formatDate(d.NgayTraThucTe) }}
                          </span>
                        </div>
                        <div class="book-detail-extra">
                          <span v-if="d.SoLanGiaHan > 0" class="text-xs text-muted">
                            <i class="pi pi-refresh" style="font-size:11px"></i> Gia hạn {{ d.SoLanGiaHan }} lần
                          </span>
                          <span v-if="d.TienPhat > 0" class="text-xs" style="color:var(--color-danger)">
                            <i class="pi pi-dollar" style="font-size:11px"></i> Phạt: {{ formatPrice(d.TienPhat) }}
                          </span>
                        </div>
                      </div>

                      <!-- Status badge -->
                      <div class="book-detail-status">
                        <StatusBadge :value="d.TrangThaiChiTiet" type="borrowDetail" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- ─── REJECT MODAL ─── -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="rejectBorrow" class="modal-overlay" @click.self="rejectBorrow=null">
          <div class="modal" style="max-width:400px">
            <div class="modal-header">
              <span class="modal-title">Từ chối phiếu mượn</span>
              <button class="btn-icon" @click="rejectBorrow=null">
                <i class="pi pi-times" style="font-size:16px"></i>
              </button>
            </div>
            <div class="modal-body">
              <p class="text-sm text-secondary mb-3">
                Phiếu của độc giả <strong>{{ rejectBorrow.DocGiaId?.HoTen }}</strong> sẽ bị từ chối.
              </p>
              <div class="form-group">
                <label class="form-label">Lý do từ chối <span class="text-muted">(tùy chọn)</span></label>
                <textarea v-model="rejectReason" class="form-textarea" rows="3" placeholder="Sách không còn trên kệ, hồ sơ có vấn đề..."></textarea>
              </div>
            </div>
            <div class="modal-footer">
              <button class="btn btn-secondary" @click="rejectBorrow=null">Hủy</button>
              <button class="btn btn-danger btn-with-icon" @click="confirmReject" :disabled="rejecting">
                <div v-if="rejecting" class="spinner-sm"></div>
                <i v-else class="pi pi-times"></i>
                Xác nhận từ chối
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- ─── ASSIGN MODAL (Nhân viên gán bản copy khi duyệt) ─── -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="assignBorrow" class="modal-overlay" @click.self="assignBorrow=null">
          <div class="modal" style="max-width:560px">
            <div class="modal-header">
              <div>
                <div class="modal-title">Gán bản sách & Duyệt phiếu</div>
                <div class="modal-subtitle">Chọn cuốn sách cụ thể cho từng đầu sách trong phiếu</div>
              </div>
              <button class="btn-icon" @click="assignBorrow=null">
                <i class="pi pi-times" style="font-size:16px"></i>
              </button>
            </div>
            <div class="modal-body">
              <div
                v-for="(item, idx) in assignItems"
                :key="item.chiTietId"
                class="assign-row"
              >
                <div class="assign-book-info">
                  <div class="assign-book-title">{{ item.tenSach }}</div>
                  <div class="assign-book-author">{{ item.tacGia }}</div>
                </div>
                <div class="assign-copy-select">
                  <label class="form-label" style="font-size:11px;margin-bottom:4px">
                    Chọn bản copy
                    <span class="text-muted">({{ item.availableCopies.length }} bản sẵn sàng)</span>
                  </label>
                  <div v-if="item.loadingCopies" class="text-xs text-muted">Đang tải...</div>
                  <select
                    v-else-if="item.availableCopies.length > 0"
                    v-model="assignItems[idx].selectedCopyId"
                    class="form-select"
                    style="font-size:13px"
                  >
                    <option value="">-- Chọn bản --</option>
                    <option v-for="c in item.availableCopies" :key="c._id" :value="c._id">
                      ID: {{ c._id.slice(-8).toUpperCase() }}
                      <template v-if="c.TinhTrangVatLy"> — {{ c.TinhTrangVatLy }}</template>
                    </option>
                  </select>
                  <div v-else class="text-xs" style="color:var(--color-danger)">
                    <i class="pi pi-exclamation-triangle"></i> Không có bản nào sẵn sàng!
                  </div>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button class="btn btn-secondary" @click="assignBorrow=null">Hủy</button>
              <button
                class="btn btn-success btn-with-icon"
                :disabled="!canApprove || approving"
                @click="confirmApprove"
              >
                <div v-if="approving" class="spinner-sm"></div>
                <i v-else class="pi pi-check"></i>
                {{ approving ? 'Đang duyệt...' : 'Xác nhận duyệt' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { borrowService } from '@/services/borrows.service'
import { useToast } from '@/composables/useToast'
import StatusBadge from '@/components/common/StatusBadge.vue'
import api from '@/services/api'  // for book copies lookup
import { useI18n } from 'vue-i18n'

const { success, error: toastError } = useToast()
const { t } = useI18n()

// ── List state ──
const borrows = ref([])
const loading = ref(true)
const page = ref(1)
const totalPages = ref(1)
const filterStatus = ref('')
const filterSearch = ref('')
const filterDate = ref('')

const visiblePages = computed(() => {
  const p = []
  for (let i = Math.max(1, page.value - 2); i <= Math.min(totalPages.value, page.value + 2); i++) p.push(i)
  return p
})

function formatDate(d) { return d ? new Date(d).toLocaleDateString('vi-VN') : '—' }
function formatPrice(n) { return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n) }

async function fetchBorrows() {
  loading.value = true
  try {
    const params = { page: page.value, limit: 12 }
    if (filterStatus.value) params.trangThai = filterStatus.value
    if (filterSearch.value) params.search = filterSearch.value
    if (filterDate.value) params.ngayLap = filterDate.value
    const res = await borrowService.getAll(params)
    borrows.value = res.data.data || []
    totalPages.value = res.data.pagination?.totalPages || 1
  } finally { loading.value = false }
}

function changePage(p) { page.value = p; fetchBorrows() }

// ── Assign & Approve flow ──
const assignBorrow = ref(null)
const assignItems = ref([]) // [{ chiTietId, dauSachId, tenSach, tacGia, selectedCopyId, availableCopies, loadingCopies }]
const approving = ref(false)

const canApprove = computed(() =>
  assignItems.value.length > 0 &&
  assignItems.value.every(i => i.selectedCopyId !== '')
)

async function openAssign(borrow) {
  assignBorrow.value = borrow
  // Build list of items from ChiTiet
  assignItems.value = (borrow.ChiTiet || []).map(d => ({
    chiTietId: d._id,
    dauSachId: d.DauSachId?._id || d.DauSachId,
    tenSach: d.DauSachId?.TenSach || 'Không rõ',
    tacGia: (d.DauSachId?.TacGia || []).join(', '),
    selectedCopyId: '',
    availableCopies: [],
    loadingCopies: true,
  }))

  // Fetch available copies per DauSach
  for (let i = 0; i < assignItems.value.length; i++) {
    try {
      const dauSachId = assignItems.value[i].dauSachId
      const res = await api.get('/book-copies', { params: { dauSachId, trangThai: 'SanSang' } })
      assignItems.value[i].availableCopies = res.data.data || []
    } catch (_) {
      assignItems.value[i].availableCopies = []
    } finally {
      assignItems.value[i].loadingCopies = false
    }
  }
}

async function confirmApprove() {
  if (!canApprove.value) return
  approving.value = true
  try {
    const assignments = assignItems.value.map(i => ({
      chiTietId: i.chiTietId,
      cuonSachId: i.selectedCopyId,
    }))
    await borrowService.approve(assignBorrow.value._id, { assignments })
    success(t('common.success'), `Đã gán ${assignments.length} bản sách cho phiếu mượn.`)
    assignBorrow.value = null
    detailBorrow.value = null
    fetchBorrows()
  } catch (e) {
    toastError(t('common.error'), e.response?.data?.message || '')
  } finally {
    approving.value = false
  }
}

// ── Detail panel ──
const detailBorrow = ref(null)
const selectedReturnIds = ref([])
const returning = ref(false)

const returnedCount = computed(() =>
  (detailBorrow.value?.ChiTiet || []).filter(d => ['DaTraDung','DaTraTre'].includes(d.TrangThaiChiTiet)).length
)
const overdueCount = computed(() =>
  (detailBorrow.value?.ChiTiet || []).filter(d => d.TrangThaiChiTiet === 'QuaHan').length
)
const totalFine = computed(() =>
  (detailBorrow.value?.ChiTiet || []).reduce((s, d) => s + (d.TienPhat || 0), 0)
)

async function openDetail(b) {
  // Fetch full detail including populated books
  try {
    const res = await borrowService.getById(b._id)
    detailBorrow.value = res.data.data
  } catch {
    detailBorrow.value = b
  }
  selectedReturnIds.value = []
}

function toggleReturn(id) {
  const idx = selectedReturnIds.value.indexOf(id)
  if (idx >= 0) selectedReturnIds.value.splice(idx, 1)
  else selectedReturnIds.value.push(id)
}

async function confirmReturn() {
  if (!selectedReturnIds.value.length) return
  returning.value = true
  try {
    for (const detailId of selectedReturnIds.value) {
      // Truyền thêm Object dữ liệu vào tham số thứ 3
      await borrowService.returnBook(detailBorrow.value._id, detailId, {
        tinhTrangVatLy: 'Tốt' // Hoặc có thể tạo form để thủ thư tự nhập
      })
    }
    success(t('common.success'), `${selectedReturnIds.value.length} cuốn đã được ghi nhận trả.`)
    // Refresh detail
    const res = await borrowService.getById(detailBorrow.value._id)
    detailBorrow.value = res.data.data
    selectedReturnIds.value = []
    fetchBorrows()
  } catch (e) { 
    toastError(t('common.error'), e.response?.data?.message || e.message) 
  } finally { 
    returning.value = false 
  }
}

// ── Reject ──
const rejectBorrow = ref(null)
const rejectReason = ref('')
const rejecting = ref(false)

function openReject(b) {
  rejectBorrow.value = b
  rejectReason.value = ''
}

async function confirmReject() {
  rejecting.value = true
  try {
    await borrowService.reject(rejectBorrow.value._id, { lyDo: rejectReason.value })
    success('Đã từ chối phiếu mượn.', '')
    rejectBorrow.value = null
    detailBorrow.value = null
    fetchBorrows()
  } catch (e) { toastError('Lỗi', e.response?.data?.message || '') }
  finally { rejecting.value = false }
}

onMounted(fetchBorrows)
</script>

<style scoped>
/* ── Detail modal layout ── */
.modal-xl { max-width: 900px; }

.detail-layout {
  display: grid;
  grid-template-columns: 280px 1fr;
  min-height: 480px;
}

.detail-sidebar {
  border-right: 1px solid var(--border-color);
  padding: var(--space-5);
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
  background: var(--bg-surface-2);
}

.detail-main {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.detail-section-title {
  font-size: var(--font-size-xs);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .08em;
  color: var(--text-muted);
  margin-bottom: var(--space-3);
  display: flex;
  align-items: center;
  gap: 6px;
}

/* Reader info */
.reader-info-card {
  display: flex;
  gap: var(--space-3);
  align-items: flex-start;
}

.reader-avatar {
  width: 40px;
  height: 40px;
  border-radius: var(--border-radius);
  background: var(--brand-100);
  color: var(--brand-700);
  font-weight: 800;
  font-size: var(--font-size-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

[data-theme="dark"] .reader-avatar { background: rgba(59,130,246,.2); color: var(--brand-400); }

.reader-details { flex: 1; min-width: 0; }
.reader-name { font-weight: 700; font-size: var(--font-size-sm); color: var(--text-primary); margin-bottom: 4px; }
.reader-meta {
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  gap: 5px;
  margin-top: 3px;
}

/* Stats */
.borrow-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-2);
}

.borrow-stat-item {
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  padding: var(--space-3);
  text-align: center;
}

.borrow-stat-val {
  font-size: var(--font-size-xl);
  font-weight: 800;
  color: var(--text-primary);
  line-height: 1;
}

.borrow-stat-label {
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: .06em;
  color: var(--text-muted);
  margin-top: 4px;
}

.text-success { color: var(--color-success) !important; }
.text-warning { color: var(--color-warning) !important; }
.text-danger  { color: var(--color-danger) !important; }

/* Action panel */
.action-panel { display: flex; flex-direction: column; gap: var(--space-2); }
.btn-success { background: var(--color-success); color: #fff; }
.btn-success:hover { background: #16a34a; transform: translateY(-1px); }
.w-full { width: 100%; justify-content: center; }
.mb-2 { margin-bottom: var(--space-2); }
.ml-2 { margin-left: var(--space-2); }

/* Book detail list */
.book-detail-list {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-4) var(--space-5);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.book-detail-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-4);
  border: 1.5px solid var(--border-color);
  border-radius: var(--border-radius-lg);
  background: var(--bg-surface);
  transition: all var(--transition-fast);
  cursor: default;
}

.book-detail-item.is-returned {
  opacity: .65;
  background: var(--bg-surface-2);
}

.book-detail-item.is-overdue {
  border-color: rgba(239,68,68,.4);
  background: rgba(239,68,68,.04);
}

.book-detail-item.is-selected {
  border-color: var(--brand-400);
  background: var(--brand-50);
}

[data-theme="dark"] .book-detail-item.is-selected {
  background: rgba(59,130,246,.1);
}

.book-detail-check { cursor: pointer; flex-shrink: 0; }

.check-box {
  width: 20px;
  height: 20px;
  border-radius: 5px;
  border: 2px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast);
}

.check-box.checked {
  background: var(--brand-600);
  border-color: var(--brand-600);
}

.book-detail-check-spacer { width: 20px; flex-shrink: 0; }

.book-detail-icon {
  width: 40px;
  height: 40px;
  border-radius: var(--border-radius);
  background: var(--brand-50);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

[data-theme="dark"] .book-detail-icon { background: rgba(59,130,246,.1); }

.book-detail-info { flex: 1; min-width: 0; }

.book-detail-copy-id {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: var(--font-size-xs);
  color: var(--text-muted);
  margin-bottom: 5px;
}

.book-detail-dates {
  display: flex;
  gap: var(--space-4);
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
  flex-wrap: wrap;
}

.book-detail-dates span {
  display: flex;
  align-items: center;
  gap: 4px;
}

.book-detail-extra {
  display: flex;
  gap: var(--space-3);
  margin-top: 4px;
}

.book-detail-status { flex-shrink: 0; }

/* Modal subtitle */
.modal-subtitle {
  font-size: var(--font-size-sm);
  color: var(--text-muted);
  margin-top: 3px;
}

/* ID chip */
.id-chip {
  display: inline-block;
  font-family: 'Courier New', monospace;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: .08em;
  padding: 2px 7px;
  background: var(--bg-surface-2);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-sm);
  color: var(--text-secondary);
}

@media (max-width: 768px) {
  .detail-layout { grid-template-columns: 1fr; }
  .detail-sidebar { border-right: none; border-bottom: 1px solid var(--border-color); }
}

/* ── Assign modal rows ── */
.assign-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-4);
  align-items: flex-start;
  padding: var(--space-4);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-lg);
  background: var(--bg-surface-2);
  margin-bottom: var(--space-3);
}

.assign-book-info { min-width: 0; }
.assign-book-title {
  font-weight: 700;
  font-size: var(--font-size-sm);
  color: var(--text-primary);
  margin-bottom: 3px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.assign-book-author {
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
}
.assign-copy-select { min-width: 0; }
</style>