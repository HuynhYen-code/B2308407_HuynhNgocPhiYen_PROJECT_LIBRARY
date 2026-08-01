<template>
  <div class="copies-manage">
    <div class="section-header" style="margin-bottom:var(--space-5)">
      <h1 class="section-title">{{ $t('nav.bookCopies') }}</h1>
      <button class="btn btn-primary btn-with-icon" @click="openCreate">
        <AppIcon name="plus" :size="16" /> {{ $t('common.add') }}
      </button>
    </div>

    <!-- Filter by book -->
    <div class="flex gap-3 mb-4" style="flex-wrap:wrap">
      <div class="search-input-wrapper" style="max-width:360px;flex:1">
        <AppIcon name="search" :size="16" class="search-icon" />
        <input v-model="search" class="search-input" placeholder="Tìm theo tên sách..." @input="debouncedFetch" />
      </div>
      <select v-model="filterStatus" class="form-select" style="width:180px" @change="fetchItems">
        <option value="">Tất cả trạng thái</option>
        <option value="SanSang">Sẵn sàng</option>
        <option value="DangMuon">Đang mượn</option>
        <option value="Pending">Chờ duyệt</option>
        <option value="HongMat">Hỏng / Mất</option>
      </select>
    </div>

    <div v-if="loading" class="text-center" style="padding:var(--space-6)">
      <div class="spinner" style="margin:auto;width:32px;height:32px"></div>
    </div>
    <div v-else-if="groupedItems.length===0" class="empty-state mt-4">
      <div class="empty-state-icon"><AppIcon name="inbox" :size="48" class="text-muted" /></div>
      <div class="empty-state-title">{{ $t('common.noData') }}</div>
    </div>
    <div v-else class="copies-list mt-4">
      <div v-for="group in groupedItems" :key="group.DauSach._id" class="book-group mb-4">
        <div class="book-group-header" @click="toggleGroup(group.DauSach._id)">
          <div class="flex items-center gap-3">
             <div class="book-group-icon">
               <AppIcon name="book" :size="20" style="color:var(--brand-600)" />
             </div>
             <div>
               <div class="font-semibold text-base" style="color:var(--text-primary)">{{ group.DauSach.TenSach }}</div>
               <div class="text-xs text-muted mt-1">{{ (group.DauSach.TacGia || []).join(', ') }}</div>
             </div>
          </div>
          <div class="flex items-center gap-4">
             <span class="badge" style="background:var(--brand-100);color:var(--brand-700)">
               {{ group.copies.length }} bản
             </span>
             <AppIcon :name="expandedGroups.has(group.DauSach._id) ? 'chevron-up' : 'chevron-down'" :size="16" class="text-muted" />
          </div>
        </div>

        <div v-show="expandedGroups.has(group.DauSach._id)" class="book-group-body">
          <div class="data-table-wrapper" style="border:none; border-radius:0; box-shadow:none;">
            <table class="data-table" style="margin:0">
              <thead>
                <tr>
                  <th style="padding-left:var(--space-4)">ID Cuốn sách</th>
                  <th>Tình trạng vật lý</th>
                  <th>Trạng thái</th>
                  <th>Ngày nhập</th>
                  <th style="width:100px;text-align:right;padding-right:var(--space-4)">{{ $t('common.actions') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in group.copies" :key="item._id">
                  <td style="padding-left:var(--space-4)">
                    <code class="id-chip">{{ item._id.slice(-8).toUpperCase() }}</code>
                  </td>
                  <td class="text-sm text-secondary">{{ item.TinhTrangVatLy || 'Tốt' }}</td>
                  <td><StatusBadge :value="item.TrangThai" type="copy" /></td>
                  <td class="text-xs text-muted">{{ formatDate(item.createdAt) }}</td>
                  <td style="text-align:right;padding-right:var(--space-4)">
                    <div class="flex gap-2 justify-end">
                      <button class="btn btn-secondary btn-sm btn-icon-only" :title="$t('common.edit')" @click.stop="openEdit(item)">
                        <AppIcon name="pencil" :size="15" />
                      </button>
                      <button v-if="auth.isAdmin" class="btn btn-danger btn-sm btn-icon-only" :title="$t('common.delete')" @click.stop="deleteItem(item)">
                        <AppIcon name="trash" :size="15" />
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Add/Edit Modal -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showModal" class="modal-overlay" @click.self="showModal=false">
          <div class="modal">
            <div class="modal-header">
              <span class="modal-title">{{ editingItem ? $t('bookCopies.edit') : $t('bookCopies.add') }}</span>
              <button class="btn-icon" @click="showModal=false"><AppIcon name="x-mark" :size="16" /></button>
            </div>
            <div class="modal-body">
              <!-- Chỉ khi tạo mới mới cần chọn đầu sách -->
              <div v-if="!editingItem" class="form-group mb-4">
                <label class="form-label">Đầu sách *</label>
                <select v-model="form.DauSachId" class="form-select">
                  <option value="">— Chọn đầu sách —</option>
                  <option v-for="b in books" :key="b._id" :value="b._id">{{ b.TenSach }}</option>
                </select>
                <p class="form-hint">ID của bản sách sẽ do hệ thống tự tạo và dùng để quét mã QR/barcode.</p>
              </div>

              <div v-if="editingItem" class="form-group mb-4">
                <label class="form-label">Đầu sách</label>
                <div class="form-static">{{ editingItem.DauSachId?.TenSach || '—' }}</div>
              </div>

              <div class="form-group mb-4">
                <label class="form-label">Số lượng nhập <span v-if="!editingItem" class="text-muted">(mỗi bản = 1 bản vật lý)</span></label>
                <input
                  v-if="!editingItem"
                  v-model.number="form.SoLuong"
                  class="form-input"
                  type="number"
                  min="1"
                  max="100"
                  placeholder="Nhập số lượng bản cần nhập (vd: 5)"
                />
                <div v-else class="form-static">1 bản (chỉnh sửa thông tin bản này)</div>
              </div>

              <div class="form-group mb-4">
                <label class="form-label">Tình trạng vật lý</label>
                <input v-model="form.TinhTrangVatLy" class="form-input" placeholder="Tốt, Khá, Cũ..." />
              </div>

              <div v-if="editingItem" class="form-group">
                <label class="form-label">Trạng thái</label>
                <select v-model="form.TrangThai" class="form-select">
                  <option value="SanSang">Sẵn sàng</option>
                  <option value="HongMat">Hỏng / Mất</option>
                </select>
              </div>

              <div v-if="formError" class="alert alert-error mt-3">{{ formError }}</div>
            </div>
            <div class="modal-footer">
              <button class="btn btn-secondary" @click="showModal=false">{{ $t('common.cancel') }}</button>
              <button class="btn btn-primary" @click="save" :disabled="saving">
                {{ saving ? $t('common.loading') : $t('common.save') }}
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
import { useAuthStore } from '@/stores/auth.store'
import { bookCopyService } from '@/services/book-copies.service'
import { bookService } from '@/services/books.service'
import { useToast } from '@/composables/useToast'
import StatusBadge from '@/components/common/StatusBadge.vue'
import AppIcon from '@/components/common/AppIcon.vue'
import { useI18n } from 'vue-i18n'

const auth = useAuthStore()
const { success, error: toastError } = useToast()
const { t } = useI18n()
const items = ref([])
const books = ref([])
const loading = ref(true)
const search = ref('')
const filterStatus = ref('')
const showModal = ref(false)
const editingItem = ref(null)
const saving = ref(false)
const formError = ref('')
const form = ref({ DauSachId: '', TinhTrangVatLy: 'Tốt', TrangThai: 'SanSang', SoLuong: 1 })

const expandedGroups = ref(new Set())

function toggleGroup(id) {
  if (expandedGroups.value.has(id)) {
    expandedGroups.value.delete(id)
  } else {
    expandedGroups.value.add(id)
  }
}

const groupedItems = computed(() => {
  const groups = {}
  for (const item of items.value) {
    const dauSachId = item.DauSachId?._id || 'unknown'
    if (!groups[dauSachId]) {
      groups[dauSachId] = {
        DauSach: item.DauSachId || { TenSach: 'Không rõ đầu sách', _id: 'unknown' },
        copies: []
      }
    }
    groups[dauSachId].copies.push(item)
  }
  return Object.values(groups)
})

let debounceTimer = null
function debouncedFetch() { clearTimeout(debounceTimer); debounceTimer = setTimeout(fetchItems, 400) }

function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('vi-VN')
}

async function fetchItems() {
  loading.value = true
  try {
    const params = {}
    if (filterStatus.value) params.trangThai = filterStatus.value
    const r = await bookCopyService.getAll(params)
    let data = r.data.data || []
    if (search.value) {
      const q = search.value.toLowerCase()
      data = data.filter(i => i.DauSachId?.TenSach?.toLowerCase().includes(q))
    }
    items.value = data
  } finally { loading.value = false }
}

function openCreate() {
  editingItem.value = null
  form.value = { DauSachId: '', TinhTrangVatLy: 'Tốt', TrangThai: 'SanSang', SoLuong: 1 }
  formError.value = ''
  showModal.value = true
}

function openEdit(item) {
  editingItem.value = item
  form.value = { TinhTrangVatLy: item.TinhTrangVatLy || 'Tốt', TrangThai: item.TrangThai || 'SanSang', SoLuong: 1 }
  formError.value = ''
  showModal.value = true
}

async function save() {
  formError.value = ''
  if (!editingItem.value && !form.value.DauSachId) {
    formError.value = t('bookCopies.bookRequired')
    return
  }
  saving.value = true
  try {
    if (editingItem.value) {
      // Cập nhật bản sách hiện tại
      await bookCopyService.update(editingItem.value._id, {
        TinhTrangVatLy: form.value.TinhTrangVatLy,
        TrangThai: form.value.TrangThai,
      })
      success(t('bookCopies.updateSuccess'), '')
    } else {
      // Nhập nhiều bản cùng lúc
      const count = Math.max(1, Math.min(100, form.value.SoLuong || 1))
      const promises = Array.from({ length: count }, () =>
        bookCopyService.create({ DauSachId: form.value.DauSachId, TinhTrangVatLy: form.value.TinhTrangVatLy })
      )
      await Promise.all(promises)
      success(t('bookCopies.addSuccess'), '')
    }
    showModal.value = false
    fetchItems()
  } catch (e) {
    formError.value = e.response?.data?.message || t('common.error')
    toastError(t('common.error'), formError.value)
  } finally { saving.value = false }
}

async function deleteItem(item) {
  if (!confirm(`${t('bookCopies.confirmDelete')}?`)) return
  try {
    await bookCopyService.remove(item._id)
    success(t('bookCopies.deleteSuccess'), '')
    fetchItems()
  } catch (e) { toastError(t('common.error'), e.response?.data?.message || t('common.error')) }
}

onMounted(async () => {
  fetchItems()
  const r = await bookService.getAll({ limit: 500 })
  books.value = r.data.data || []
})
</script>

<style scoped>
.id-chip {
  display: inline-block;
  font-family: 'Courier New', monospace;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: .08em;
  padding: 3px 8px;
  background: var(--bg-surface-2);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-sm);
  color: var(--text-secondary);
}

.form-static {
  padding: 10px 14px;
  background: var(--bg-surface-2);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.form-hint {
  margin-top: 5px;
  font-size: var(--font-size-xs);
  color: var(--text-muted);
}

.alert-error {
  padding: var(--space-3) var(--space-4);
  background: rgba(239,68,68,.1);
  border: 1px solid rgba(239,68,68,.3);
  border-radius: var(--border-radius);
  color: var(--color-danger);
  font-size: var(--font-size-sm);
}

.book-group {
  background: var(--bg-surface-2);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-lg);
  overflow: hidden;
  transition: all 0.2s ease;
}

.book-group:hover {
  border-color: var(--brand-300);
}

.book-group-header {
  padding: var(--space-3) var(--space-4);
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  user-select: none;
}

.book-group-icon {
  width: 40px;
  height: 40px;
  background: rgba(59, 130, 246, 0.1);
  border-radius: var(--border-radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
}

.book-group-body {
  border-top: 1px solid var(--border-color);
  background: var(--bg-body);
}

[data-theme="dark"] .book-group-body {
  background: var(--bg-surface-1);
}
</style>
