<template>
  <div class="books-manage">
    <div class="section-header" style="margin-bottom:var(--space-5)">
      <h1 class="section-title">{{ $t('booksManage.title') }}</h1>
      <button class="btn btn-primary btn-with-icon" @click="openCreate">
        <AppIcon name="plus" :size="16" /> {{ $t('booksManage.add') }}
      </button>
    </div>

    <!-- Search -->
    <div class="search-input-wrapper" style="max-width:360px;margin-bottom:var(--space-4); display: inline-flex; margin-right: var(--space-4);">
      <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
      <input v-model="search" class="search-input" :placeholder="$t('books.search')" @input="debouncedFetch" />
    </div>

    <!-- Sort -->
    <select v-model="selectedSort" class="form-select" style="width:180px; display: inline-block; margin-bottom:var(--space-4)" @change="fetchBooks">
      <option value="">Năm xuất bản mới nhất</option>
      <option value="popular">Lượt mượn nhiều nhất</option>
      <option value="priceAsc">Giá tăng dần</option>
      <option value="priceDesc">Giá giảm dần</option>
      <option value="nameAsc">Tên A-Z</option>
      <option value="nameDesc">Tên Z-A</option>
    </select>

    <!-- Table -->
    <div class="data-table-wrapper">
      <table class="data-table">
        <thead>
          <tr>
            <th>{{ $t('booksManage.name') }}</th>
            <th>{{ $t('booksManage.author') }}</th>
            <th>{{ $t('booksManage.category') }}</th>
            <th>{{ $t('booksManage.year') }}</th>
            <th>{{ $t('booksManage.price') }}</th>
            <th>{{ $t('common.actions') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading"><td colspan="6" class="text-center"><div class="spinner" style="margin:auto;width:24px;height:24px"></div></td></tr>
          <tr v-else-if="books.length === 0"><td colspan="6" class="text-center text-muted">{{ $t('common.noData') }}</td></tr>
          <tr v-for="book in books" :key="book._id" v-else>
            <td>
              <div class="flex items-center gap-3">
                <div class="book-thumb">
                  <img v-if="book.HinhAnh" :src="book.HinhAnh" alt="" />
                  <span v-else><i class="pi pi-image" style="color:var(--text-muted)"></i></span>
                </div>
                <div>
                  <div class="font-semibold text-sm">{{ book.TenSach }}</div>
                </div>
              </div>
            </td>
            <td class="text-sm">{{ (book.TacGia || []).join(', ') }}</td>
            <td>
              <div class="flex gap-1 flex-wrap">
                <span v-for="cat in (book.TheLoaiIds || [])" :key="cat._id" :class="['badge', getCategoryBadgeClass(cat.TenTheLoai)]">{{ cat.TenTheLoai }}</span>
              </div>
            </td>
            <td class="text-sm">{{ book.NamXuatBan || '—' }}</td>
            <td class="text-sm">{{ book.DonGia ? formatPrice(book.DonGia) : '—' }}</td>
            <td>
              <div class="flex gap-2">
                <button class="btn btn-secondary btn-sm btn-icon-only" :title="$t('booksManage.edit')" @click="openEdit(book)">
                  <AppIcon name="pencil" :size="15" />
                </button>
                <button v-if="auth.isAdmin" class="btn btn-danger btn-sm btn-icon-only" :title="$t('booksManage.delete')" @click="deleteBook(book)">
                  <AppIcon name="trash" :size="15" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="pagination">
      <button class="page-btn" :disabled="page <= 1" @click="changePage(page-1)">‹</button>
      <button v-for="p in visiblePages" :key="p" class="page-btn" :class="{active:p===page}" @click="changePage(p)">{{ p }}</button>
      <button class="page-btn" :disabled="page >= totalPages" @click="changePage(page+1)">›</button>
    </div>

    <!-- Modal -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showModal" class="modal-overlay" @click.self="showModal=false">
          <div class="modal modal-lg">
            <div class="modal-header">
              <span class="modal-title">{{ editingBook ? $t('booksManage.edit') : $t('booksManage.add') }}</span>
              <button class="btn-icon" @click="showModal=false"><AppIcon name="x-mark" :size="16" /></button>
            </div>
            <div class="modal-body">
              <div class="form-grid">
                <div class="form-group" style="grid-column:1/-1">
                  <label class="form-label">{{ $t('booksManage.name') }} *</label>
                  <input v-model="form.TenSach" class="form-input" required />
                </div>
                <div class="form-group">
                  <label class="form-label">{{ $t('booksManage.author') }} (cách nhau bằng dấu phẩy) *</label>
                  <input v-model="form.TacGiaStr" class="form-input" placeholder="Tác giả 1, Tác giả 2" />
                </div>
                <div class="form-group">
                  <label class="form-label">{{ $t('booksManage.year') }}</label>
                  <input v-model.number="form.NamXuatBan" class="form-input" type="number" min="1900" max="2099" />
                </div>
                <div class="form-group">
                  <label class="form-label">{{ $t('booksManage.publisher') }}</label>
                  <select v-model="form.NhaXuatBanId" class="form-select">
                    <option value="">— Không chọn —</option>
                    <option v-for="p in publishers" :key="p._id" :value="p._id">{{ p.TenNXB }}</option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label">Đơn giá (VNĐ)</label>
                  <input v-model.number="form.DonGia" class="form-input" type="number" min="0" />
                </div>
                <div class="form-group" style="grid-column:1/-1">
                  <label class="form-label">{{ $t('booksManage.category') }}</label>
                  <div class="cat-checkboxes">
                    <label v-for="cat in categories" :key="cat._id" class="cat-check-item">
                      <input type="checkbox" :value="cat._id" v-model="form.TheLoaiIds" />
                      {{ cat.TenTheLoai }}
                    </label>
                  </div>
                </div>
                <div class="form-group" style="grid-column:1/-1">
                  <label class="form-label">Ảnh bìa (Upload)</label>
                  <div class="upload-wrapper flex gap-3 items-center">
                    <div v-if="form.HinhAnh" class="cover-preview">
                      <img :src="form.HinhAnh" alt="Preview" />
                    </div>
                    <div class="upload-controls flex flex-col gap-2">
                      <input type="file" ref="fileInput" accept="image/*" class="form-input" style="padding:4px" @change="handleFileUpload" />
                      <div v-if="uploading" class="text-sm text-brand-600 flex items-center gap-2">
                        <div class="spinner-sm"></div> Đang tải lên...
                      </div>
                      <div class="text-xs text-muted">Hỗ trợ JPG, PNG. Tối đa 5MB.</div>
                    </div>
                  </div>
                </div>
                <div class="form-group" style="grid-column:1/-1">
                  <label class="form-label">{{ $t('common.description') }}</label>
                  <textarea v-model="form.MoTa" class="form-textarea" rows="3"></textarea>
                </div>
              </div>
              <div v-if="formError" class="form-error" style="margin-top:var(--space-3)"><AppIcon name="warning" :size="16" /> {{ formError }}</div>
            </div>
            <div class="modal-footer">
              <button class="btn btn-secondary" @click="showModal=false">{{ $t('common.cancel') }}</button>
              <button class="btn btn-primary" @click="saveBook" :disabled="saving">
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
import { useToast } from '@/composables/useToast'
import { useCategoryColor } from '@/composables/useCategoryColor'
import { bookService } from '@/services/books.service'
import { categoryService } from '@/services/categories.service'
import { publisherService } from '@/services/publishers.service'
import api from '@/services/api'
import AppIcon from '@/components/common/AppIcon.vue'

const auth = useAuthStore()
const { success, error: toastError } = useToast()
const { getCategoryBadgeClass } = useCategoryColor()

const books = ref([])
const categories = ref([])
const publishers = ref([])
const loading = ref(true)
const page = ref(1)
const totalPages = ref(1)
const search = ref('')
const selectedSort = ref('')
const showModal = ref(false)
const editingBook = ref(null)
const saving = ref(false)
const uploading = ref(false)
const formError = ref('')
const fileInput = ref(null)

const form = ref({ TenSach: '', TacGiaStr: '', NamXuatBan: '', NhaXuatBanId: '', DonGia: '', TheLoaiIds: [], HinhAnh: '', MoTa: '' })

const visiblePages = computed(() => {
  const pages = []
  for (let i = Math.max(1, page.value - 2); i <= Math.min(totalPages.value, page.value + 2); i++) pages.push(i)
  return pages
})

function formatPrice(n) { return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n) }

let debounceTimer = null
function debouncedFetch() { clearTimeout(debounceTimer); debounceTimer = setTimeout(() => { page.value = 1; fetchBooks() }, 400) }

async function fetchBooks() {
  loading.value = true
  try {
    const params = { page: page.value, limit: 10 }
    if (search.value) params.search = search.value
    if (selectedSort.value) params.sort = selectedSort.value
    const res = await bookService.getAll(params)
    books.value = res.data.data || []
    totalPages.value = res.data.pagination?.totalPages || 1
  } finally { loading.value = false }
}

function changePage(p) { page.value = p; fetchBooks() }

function openCreate() {
  editingBook.value = null
  form.value = { TenSach: '', TacGiaStr: '', NamXuatBan: '', NhaXuatBanId: '', DonGia: '', TheLoaiIds: [], HinhAnh: '', MoTa: '' }
  formError.value = ''
  if (fileInput.value) fileInput.value.value = ''
  showModal.value = true
}

function openEdit(book) {
  editingBook.value = book
  form.value = {
    TenSach: book.TenSach,
    TacGiaStr: (book.TacGia || []).join(', '),
    NamXuatBan: book.NamXuatBan || '',
    NhaXuatBanId: book.NhaXuatBanId?._id || book.NhaXuatBanId || '',
    DonGia: book.DonGia || '',
    TheLoaiIds: (book.TheLoaiIds || []).map(c => c._id || c),
    HinhAnh: book.HinhAnh || '',
    MoTa: book.MoTa || '',
  }
  formError.value = ''
  if (fileInput.value) fileInput.value.value = ''
  showModal.value = true
}

async function handleFileUpload(event) {
  const file = event.target.files[0]
  if (!file) return

  // Validate size
  if (file.size > 5 * 1024 * 1024) {
    formError.value = 'File ảnh quá lớn (tối đa 5MB).'
    event.target.value = ''
    return
  }

  const formData = new FormData()
  formData.append('image', file)

  uploading.value = true
  formError.value = ''
  try {
    const res = await api.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    form.value.HinhAnh = res.data.url
    success('Upload ảnh thành công!', '')
  } catch (e) {
    formError.value = e.response?.data?.message || 'Không thể upload ảnh.'
    event.target.value = ''
  } finally {
    uploading.value = false
  }
}

async function saveBook() {
  if (!form.value.TenSach || !form.value.TacGiaStr) { formError.value = 'Tên sách và tác giả là bắt buộc.'; return }
  saving.value = true
  formError.value = ''
  const payload = {
    TenSach: form.value.TenSach,
    TacGia: form.value.TacGiaStr.split(',').map(s => s.trim()).filter(Boolean),
    NamXuatBan: form.value.NamXuatBan || undefined,
    NhaXuatBanId: form.value.NhaXuatBanId || undefined,
    DonGia: form.value.DonGia || undefined,
    TheLoaiIds: form.value.TheLoaiIds,
    HinhAnh: form.value.HinhAnh || undefined,
    MoTa: form.value.MoTa || undefined,
  }
  try {
    if (editingBook.value) {
      await bookService.update(editingBook.value._id, payload)
      success('Cập nhật sách thành công!', '')
    } else {
      await bookService.create(payload)
      success('Thêm sách thành công!', '')
    }
    showModal.value = false
    fetchBooks()
  } catch (e) {
    formError.value = e.response?.data?.message || 'Có lỗi xảy ra.'
    toastError('Lỗi', formError.value)
  } finally { saving.value = false }
}

async function deleteBook(book) {
  if (!confirm(`Xóa sách "${book.TenSach}"?`)) return
  try {
    await bookService.remove(book._id)
    success('Đã xóa sách.', '')
    fetchBooks()
  } catch (e) { toastError('Lỗi', e.response?.data?.message || 'Không thể xóa.') }
}

onMounted(async () => {
  fetchBooks()
  const [catsRes, pubsRes] = await Promise.all([categoryService.getAll({ limit: 100 }), publisherService.getAll({ limit: 100 })])
  categories.value = catsRes.data.data || []
  publishers.value = pubsRes.data.data || []
})
</script>

<style scoped>
.book-thumb {
  width: 36px; height: 48px; border-radius: 4px; overflow: hidden;
  background: var(--brand-50); display: flex; align-items: center; justify-content: center;
  font-size: 18px; flex-shrink: 0;
}
.book-thumb img { width: 100%; height: 100%; object-fit: cover; }

.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4); }

.cat-checkboxes { display: flex; flex-wrap: wrap; gap: var(--space-3); }
.cat-check-item {
  display: flex; align-items: center; gap: 6px;
  font-size: var(--font-size-sm); cursor: pointer;
  padding: 6px 12px; border: 1px solid var(--border-color);
  border-radius: var(--border-radius-full); transition: all var(--transition-fast);
}
.cat-check-item:hover { border-color: var(--brand-400); background: var(--brand-50); }
.cat-check-item input[type="checkbox"]:checked + * { color: var(--brand-600); }

.cover-preview {
  width: 60px; height: 80px; border-radius: 4px; overflow: hidden;
  border: 1px solid var(--border-color);
  background: var(--bg-surface-2); flex-shrink: 0;
}
.cover-preview img { width: 100%; height: 100%; object-fit: cover; }
</style>
