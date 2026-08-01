<template>
  <div class="readers-manage">
    <!-- Header -->
    <div class="section-header" style="margin-bottom:var(--space-5)">
      <h1 class="section-title">{{ $t('readers.title') }}</h1>
      <button class="btn btn-primary btn-with-icon" @click="openCounterCreate">
        <AppIcon name="user" :size="16" />
        Tạo hồ sơ tại quầy
      </button>
    </div>

    <!-- Toolbar -->
    <div class="flex gap-3 mb-4" style="flex-wrap:wrap">
      <div class="search-input-wrapper" style="max-width:320px;flex:1">
        <AppIcon name="search" :size="16" class="search-icon" />
        <input v-model="search" class="search-input" placeholder="Tìm tên, SĐT..." @input="debouncedFetch" />
      </div>
      <select v-model="filterStatus" class="form-select" style="width:200px" @change="fetchReaders">
        <option value="">Tất cả trạng thái</option>
        <option value="ChuaXacMinh">Chưa xác minh</option>
        <option value="DaXacMinh">Đã xác minh</option>
        <option value="BiKhoa">Bị khóa</option>
      </select>
    </div>

    <!-- Table -->
    <div class="data-table-wrapper">
      <table class="data-table">
        <thead>
          <tr>
            <th>{{ $t('profile.fullName') }}</th>
            <th>{{ $t('profile.phone') }}</th>
            <th>{{ $t('profile.address') }}</th>
            <th>Tài khoản</th>
            <th>{{ $t('profile.status') }}</th>
            <th>{{ $t('common.actions') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td colspan="6" class="text-center"><div class="spinner" style="margin:auto;width:24px;height:24px"></div></td>
          </tr>
          <tr v-else-if="readers.length === 0">
            <td colspan="6" class="text-center text-muted">{{ $t('common.noData') }}</td>
          </tr>
          <tr v-for="r in readers" :key="r._id" v-else>
            <td class="font-semibold text-sm">{{ r.HoTen }}</td>
            <td class="text-sm">{{ r.DienThoai }}</td>
            <td class="text-sm text-muted" style="max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">{{ r.DiaChi || '—' }}</td>
            <td class="text-xs text-muted">{{ r.MaTaiKhoan?.username || '—' }}</td>
            <td><StatusBadge :value="r.TrangThaiHoSo" type="reader" /></td>
            <td>
              <div class="flex gap-2">
                <button
                  v-if="r.TrangThaiHoSo === 'ChuaXacMinh'"
                  class="btn btn-sm btn-with-icon"
                  style="background:var(--color-success);color:#fff"
                  :title="$t('readers.verify')"
                  @click="verify(r)"
                >
                  <AppIcon name="shield-check" :size="14" /> Xác minh
                </button>
                <button
                  v-if="r.TrangThaiHoSo === 'DaXacMinh'"
                  class="btn btn-secondary btn-sm btn-icon-only"
                  :title="$t('readers.lock')"
                  @click="lockToggle(r, true)"
                >
                  <AppIcon name="lock" :size="14" />
                </button>
                <button
                  v-if="r.TrangThaiHoSo === 'BiKhoa'"
                  class="btn btn-secondary btn-sm btn-icon-only"
                  :title="$t('readers.unlock')"
                  @click="lockToggle(r, false)"
                >
                  <AppIcon name="lock-open" :size="14" />
                </button>
                <button
                  class="btn btn-secondary btn-sm btn-icon-only"
                  :title="$t('readers.edit')"
                  @click="openEdit(r)"
                >
                  <AppIcon name="pencil" :size="14" />
                </button>
                <button
                  v-if="auth.isAdmin"
                  class="btn btn-danger btn-sm btn-icon-only"
                  :title="$t('readers.delete')"
                  @click="deleteReader(r)"
                >
                  <AppIcon name="trash" :size="14" />
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
        <AppIcon name="chevronRight" :size="16" style="transform:rotate(180deg)" />
      </button>
      <button v-for="p in visiblePages" :key="p" class="page-btn" :class="{active:p===page}" @click="changePage(p)">{{ p }}</button>
      <button class="page-btn" :disabled="page>=totalPages" @click="changePage(page+1)">
        <AppIcon name="chevronRight" :size="16" />
      </button>
    </div>

    <!-- ─── Modal: Tạo hồ sơ tại quầy ─── -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showCounterModal" class="modal-overlay" @click.self="showCounterModal=false">
          <div class="modal modal-lg">
            <div class="modal-header">
              <div>
                <div class="modal-title">Tạo hồ sơ độc giả tại quầy</div>
                <div class="modal-subtitle">Hồ sơ được xác minh ngay do đã kiểm tra CCCD trực tiếp</div>
              </div>
              <button class="btn-icon" @click="showCounterModal=false">
                <AppIcon name="x-mark" :size="16" />
              </button>
            </div>

            <div class="modal-body">
              <!-- Step indicator -->
              <div class="step-indicator">
                <div class="step" :class="{ active: step === 1, done: step > 1 }">
                  <div class="step-num">{{ step > 1 ? '✓' : '1' }}</div>
                  <div class="step-label">Tài khoản</div>
                </div>
                <div class="step-line"></div>
                <div class="step" :class="{ active: step === 2 }">
                  <div class="step-num">2</div>
                  <div class="step-label">Hồ sơ</div>
                </div>
              </div>

              <!-- Step 1: Tạo tài khoản -->
              <template v-if="step === 1">
                <p class="text-sm text-secondary mb-4">
                  Tạo tài khoản đăng nhập cho độc giả. Họ có thể đổi mật khẩu sau khi đăng nhập lần đầu.
                </p>
                <div class="form-grid">
                  <div class="form-group">
                    <label class="form-label">Tên đăng nhập *</label>
                    <input v-model="accountForm.username" class="form-input" placeholder="vd: nguyenvana" autocomplete="off" />
                    <span v-if="accountErrors.username" class="form-error">{{ accountErrors.username }}</span>
                  </div>
                  <div class="form-group">
                    <label class="form-label">Mật khẩu *</label>
                    <div class="password-input-wrap">
                      <input
                        v-model="accountForm.password"
                        :type="showPass ? 'text' : 'password'"
                        class="form-input"
                        placeholder="Tối thiểu 6 ký tự"
                        autocomplete="new-password"
                      />
                      <button type="button" class="pass-toggle" @click="showPass = !showPass">
                        <AppIcon :name="showPass ? 'eye-off' : 'eye'" :size="16" />
                      </button>
                    </div>
                    <span v-if="accountErrors.password" class="form-error">{{ accountErrors.password }}</span>
                  </div>
                </div>
                <div v-if="step1Error" class="alert alert-error mt-3">{{ step1Error }}</div>
              </template>

              <!-- Step 2: Thông tin hồ sơ -->
              <template v-if="step === 2">
                <div class="verified-notice">
                  <AppIcon name="shield-check" :size="18" />
                  <span>Hồ sơ sẽ được <strong>xác minh ngay</strong> vì độc giả đã xuất trình CCCD tại quầy</span>
                </div>
                <div class="form-grid mt-4">
                  <div class="form-group">
                    <label class="form-label">Họ và tên *</label>
                    <input v-model="profileForm.HoTen" class="form-input" placeholder="Nguyễn Văn A" />
                    <span v-if="profileErrors.HoTen" class="form-error">{{ profileErrors.HoTen }}</span>
                  </div>
                  <div class="form-group">
                    <label class="form-label">Số điện thoại *</label>
                    <input v-model="profileForm.DienThoai" class="form-input" placeholder="0901234567" type="tel" />
                    <span v-if="profileErrors.DienThoai" class="form-error">{{ profileErrors.DienThoai }}</span>
                  </div>
                  <div class="form-group">
                    <label class="form-label">Ngày sinh</label>
                    <input v-model="profileForm.NgaySinh" class="form-input" type="date" />
                  </div>
                  <div class="form-group">
                    <label class="form-label">Giới tính</label>
                    <select v-model="profileForm.Phai" class="form-select">
                      <option value="">— Chọn —</option>
                      <option value="Nam">Nam</option>
                      <option value="Nu">Nữ</option>
                      <option value="Khac">Khác</option>
                    </select>
                  </div>
                  <div class="form-group" style="grid-column:1/-1">
                    <label class="form-label">Địa chỉ</label>
                    <input v-model="profileForm.DiaChi" class="form-input" placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành" />
                  </div>
                </div>
                <div v-if="step2Error" class="alert alert-error mt-3">{{ step2Error }}</div>
              </template>
            </div>

            <div class="modal-footer">
              <button class="btn btn-secondary" @click="step === 1 ? (showCounterModal=false) : step--">
                {{ step === 1 ? $t('common.cancel') : 'Quay lại' }}
              </button>
              <button class="btn btn-primary btn-with-icon" @click="handleCounterStep" :disabled="savingCounter">
                <AppIcon v-if="!savingCounter" :name="step === 1 ? 'chevronRight' : 'check'" :size="16" />
                <div v-else class="spinner-sm"></div>
                {{ savingCounter ? 'Đang xử lý...' : (step === 1 ? 'Tiếp theo' : 'Tạo hồ sơ & Xác minh') }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- ─── Modal: Chỉnh sửa hồ sơ ─── -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showEditModal" class="modal-overlay" @click.self="showEditModal=false">
          <div class="modal">
            <div class="modal-header">
              <span class="modal-title">Chỉnh sửa hồ sơ độc giả</span>
              <button class="btn-icon" @click="showEditModal=false"><AppIcon name="x-mark" :size="16" /></button>
            </div>
            <div class="modal-body">
              <div class="form-grid">
                <div class="form-group">
                  <label class="form-label">Họ và tên *</label>
                  <input v-model="editForm.HoTen" class="form-input" />
                </div>
                <div class="form-group">
                  <label class="form-label">Số điện thoại *</label>
                  <input v-model="editForm.DienThoai" class="form-input" />
                </div>
                <div class="form-group">
                  <label class="form-label">Ngày sinh</label>
                  <input v-model="editForm.NgaySinh" class="form-input" type="date" />
                </div>
                <div class="form-group">
                  <label class="form-label">Giới tính</label>
                  <select v-model="editForm.Phai" class="form-select">
                    <option value="">— Chọn —</option>
                    <option value="Nam">Nam</option>
                    <option value="Nu">Nữ</option>
                    <option value="Khac">Khác</option>
                  </select>
                </div>
                <div class="form-group" style="grid-column:1/-1">
                  <label class="form-label">Địa chỉ</label>
                  <input v-model="editForm.DiaChi" class="form-input" />
                </div>
              </div>
              <div v-if="editError" class="alert alert-error mt-3">{{ editError }}</div>
            </div>
            <div class="modal-footer">
              <button class="btn btn-secondary" @click="showEditModal=false">{{ $t('common.cancel') }}</button>
              <button class="btn btn-primary" @click="saveEdit" :disabled="savingEdit">
                {{ savingEdit ? $t('common.loading') : $t('common.save') }}
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
import { readerService } from '@/services/readers.service'
import { useToast } from '@/composables/useToast'
import { authService } from '@/services/auth.service'
import StatusBadge from '@/components/common/StatusBadge.vue'
import AppIcon from '@/components/common/AppIcon.vue'

const auth = useAuthStore()
const { success, error: toastError } = useToast()

// ── List state ──
const readers = ref([])
const loading = ref(true)
const page = ref(1)
const totalPages = ref(1)
const search = ref('')
const filterStatus = ref('')

const visiblePages = computed(() => {
  const pages = []
  for (let i = Math.max(1, page.value - 2); i <= Math.min(totalPages.value, page.value + 2); i++) pages.push(i)
  return pages
})

let debounceTimer = null
function debouncedFetch() { clearTimeout(debounceTimer); debounceTimer = setTimeout(() => { page.value = 1; fetchReaders() }, 400) }

async function fetchReaders() {
  loading.value = true
  try {
    const params = { page: page.value, limit: 15 }
    if (filterStatus.value) params.trangThai = filterStatus.value
    if (search.value) params.search = search.value
    const res = await readerService.getAll(params)
    readers.value = res.data.data || []
    totalPages.value = res.data.pagination?.totalPages || 1
  } finally { loading.value = false }
}

function changePage(p) { page.value = p; fetchReaders() }

async function verify(r) {
  try { await readerService.verify(r._id); success('Đã xác minh hồ sơ!', r.HoTen + ' có thể mượn sách ngay.'); fetchReaders() }
  catch (e) { toastError('Lỗi', e.response?.data?.message || '') }
}

async function lockToggle(r, lock) {
  try {
    await readerService.lock(r._id, lock)
    success(lock ? 'Đã khóa tài khoản.' : 'Đã mở khóa tài khoản.', '')
    fetchReaders()
  }
  catch (e) { toastError('Lỗi', e.response?.data?.message || '') }
}

async function deleteReader(r) {
  if (!confirm(`Xóa hồ sơ độc giả "${r.HoTen}"? Hành động này không thể hoàn tác.`)) return
  try { await readerService.remove(r._id); success('Đã xóa hồ sơ.', ''); fetchReaders() }
  catch (e) { toastError('Lỗi', e.response?.data?.message || '') }
}

// ── Counter registration (2-step) ──
const showCounterModal = ref(false)
const step = ref(1)
const showPass = ref(false)
const savingCounter = ref(false)
const step1Error = ref('')
const step2Error = ref('')
const createdUserId = ref(null)

const accountForm = ref({ username: '', password: '' })
const accountErrors = ref({})
const profileForm = ref({ HoTen: '', DienThoai: '', NgaySinh: '', Phai: '', DiaChi: '' })
const profileErrors = ref({})

function openCounterCreate() {
  step.value = 1
  showPass.value = false
  step1Error.value = ''
  step2Error.value = ''
  createdUserId.value = null
  accountForm.value = { username: '', password: '' }
  accountErrors.value = {}
  profileForm.value = { HoTen: '', DienThoai: '', NgaySinh: '', Phai: '', DiaChi: '' }
  profileErrors.value = {}
  showCounterModal.value = true
}

function validateStep1() {
  accountErrors.value = {}
  if (!accountForm.value.username.trim()) accountErrors.value.username = 'Tên đăng nhập là bắt buộc'
  if (accountForm.value.password.length < 6) accountErrors.value.password = 'Mật khẩu tối thiểu 6 ký tự'
  return Object.keys(accountErrors.value).length === 0
}

function validateStep2() {
  profileErrors.value = {}
  if (!profileForm.value.HoTen.trim()) profileErrors.value.HoTen = 'Họ tên là bắt buộc'
  if (!profileForm.value.DienThoai.trim()) profileErrors.value.DienThoai = 'Số điện thoại là bắt buộc'
  return Object.keys(profileErrors.value).length === 0
}

async function handleCounterStep() {
  if (step.value === 1) {
    if (!validateStep1()) return
    savingCounter.value = true
    step1Error.value = ''
    try {
      // Tạo tài khoản Reader
      const res = await authService.register({ username: accountForm.value.username, password: accountForm.value.password })
      createdUserId.value = res.data.data._id
      step.value = 2
    } catch (e) {
      step1Error.value = e.response?.data?.message || 'Không thể tạo tài khoản.'
    } finally { savingCounter.value = false }
  } else {
    if (!validateStep2()) return
    savingCounter.value = true
    step2Error.value = ''
    try {
      // Tạo hồ sơ + xác minh ngay (POST /api/readers → DaXacMinh)
      await readerService.create({
        MaTaiKhoan: createdUserId.value,
        HoTen: profileForm.value.HoTen,
        DienThoai: profileForm.value.DienThoai,
        NgaySinh: profileForm.value.NgaySinh || undefined,
        Phai: profileForm.value.Phai || undefined,
        DiaChi: profileForm.value.DiaChi || undefined,
      })
      success('Tạo hồ sơ thành công!', `${profileForm.value.HoTen} đã được xác minh và có thể mượn sách ngay.`)
      showCounterModal.value = false
      fetchReaders()
    } catch (e) {
      step2Error.value = e.response?.data?.message || 'Không thể tạo hồ sơ.'
    } finally { savingCounter.value = false }
  }
}

// ── Edit reader ──
const showEditModal = ref(false)
const editingReader = ref(null)
const editForm = ref({ HoTen: '', DienThoai: '', NgaySinh: '', Phai: '', DiaChi: '' })
const editError = ref('')
const savingEdit = ref(false)

function openEdit(r) {
  editingReader.value = r
  editForm.value = {
    HoTen: r.HoTen,
    DienThoai: r.DienThoai,
    NgaySinh: r.NgaySinh ? r.NgaySinh.slice(0, 10) : '',
    Phai: r.Phai || '',
    DiaChi: r.DiaChi || '',
  }
  editError.value = ''
  showEditModal.value = true
}

async function saveEdit() {
  if (!editForm.value.HoTen || !editForm.value.DienThoai) {
    editError.value = 'Họ tên và số điện thoại là bắt buộc.'
    return
  }
  savingEdit.value = true
  editError.value = ''
  try {
    await readerService.update(editingReader.value._id, editForm.value)
    success('Cập nhật hồ sơ thành công!', '')
    showEditModal.value = false
    fetchReaders()
  } catch (e) {
    editError.value = e.response?.data?.message || 'Có lỗi xảy ra.'
    toastError('Lỗi', editError.value)
  } finally { savingEdit.value = false }
}

onMounted(fetchReaders)
</script>

<style scoped>
/* ── Step indicator ── */
.step-indicator {
  display: flex;
  align-items: center;
  gap: 0;
  margin-bottom: var(--space-6);
  padding: var(--space-4) 0;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.step-num {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-sm);
  font-weight: 700;
  background: var(--bg-surface-2);
  border: 2px solid var(--border-color);
  color: var(--text-muted);
  transition: all var(--transition-fast);
}

.step.active .step-num {
  background: var(--brand-600);
  border-color: var(--brand-600);
  color: #fff;
}

.step.done .step-num {
  background: var(--color-success);
  border-color: var(--color-success);
  color: #fff;
}

.step-label {
  font-size: var(--font-size-xs);
  font-weight: 600;
  color: var(--text-muted);
}

.step.active .step-label,
.step.done .step-label { color: var(--text-primary); }

.step-line {
  flex: 1;
  height: 2px;
  background: var(--border-color);
  margin: 0 var(--space-3);
  margin-bottom: 20px;
}

/* ── Verified notice ── */
.verified-notice {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  background: rgba(16, 185, 129, .1);
  border: 1px solid rgba(16, 185, 129, .3);
  border-radius: var(--border-radius-lg);
  font-size: var(--font-size-sm);
  color: #065f46;
}

[data-theme="dark"] .verified-notice {
  background: rgba(16,185,129,.12);
  color: #6ee7b7;
}

/* ── Form ── */
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4); }
@media (max-width: 640px) { .form-grid { grid-template-columns: 1fr; } }

.alert-error {
  padding: var(--space-3) var(--space-4);
  background: rgba(239,68,68,.1);
  border: 1px solid rgba(239,68,68,.3);
  border-radius: var(--border-radius);
  color: var(--color-danger);
  font-size: var(--font-size-sm);
}

.modal-subtitle {
  font-size: var(--font-size-sm);
  color: var(--text-muted);
  margin-top: 3px;
}

.spinner-sm {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255,255,255,.4);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

.password-input-wrap { position: relative; }
.password-input-wrap .form-input { padding-right: 44px; }
.pass-toggle {
  position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
  background: none; border: none; cursor: pointer; color: var(--text-muted);
  display: flex; align-items: center;
}
</style>
