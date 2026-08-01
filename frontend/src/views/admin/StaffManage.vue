<template>
  <div class="staff-manage">
    <div class="section-header" style="margin-bottom:var(--space-5)">
      <h1 class="section-title">{{ $t('staff.title') }}</h1>
      <button class="btn btn-primary" @click="openCreate"><i class="pi pi-plus"></i> {{ $t('staff.add') }}</button>
    </div>

    <div class="search-input-wrapper" style="max-width:360px;margin-bottom:var(--space-4)">
      <i class="pi pi-search search-icon" />
      <input v-model="search" class="search-input" placeholder="Tìm kiếm theo tên hoặc SĐT..." @input="debouncedFetch" />
    </div>

    <div class="data-table-wrapper">
      <table class="data-table">
        <thead><tr><th>{{ $t('staff.name') }}</th><th>Trạng thái</th><th>{{ $t('staff.position') }}</th><th>{{ $t('staff.phone') }}</th><th>{{ $t('staff.address') }}</th><th>{{ $t('common.actions') }}</th></tr></thead>
        <tbody>
          <tr v-if="loading"><td colspan="5" class="text-center"><i class="pi pi-spinner pi-spin"></i></td></tr>
          <tr v-else-if="items.length===0"><td colspan="5" class="text-center text-muted">{{ $t('common.noData') }}</td></tr>
          <tr v-for="item in items" :key="item._id" v-else>
            <td class="font-semibold text-sm">{{ item.HoTenNV }}</td>
            <td>
              <span v-if="item.TrangThai === 'NghiViec'" class="badge badge-danger">Nghỉ việc</span>
              <span v-else class="badge badge-success">Đang làm việc</span>
            </td>
            <td class="text-sm">{{ item.ChucVu || '—' }}</td>
            <td class="text-sm">{{ item.SoDienThoai || '—' }}</td>
            <td class="text-sm text-muted">{{ item.DiaChi || '—' }}</td>
            <td><div class="flex gap-2">
              <button class="btn btn-secondary btn-sm" title="Cấp lại tài khoản" @click="openResetAuth(item)"><i class="pi pi-key"></i></button>
              <button class="btn btn-secondary btn-sm" :title="$t('staff.edit')" @click="openEdit(item)"><i class="pi pi-pencil"></i></button>
              <button 
                :class="['btn', item.TrangThai === 'NghiViec' ? 'btn-success' : 'btn-danger', 'btn-sm']" 
                :title="item.TrangThai === 'NghiViec' ? 'Kích hoạt lại' : 'Cho nghỉ việc'" 
                @click="confirmToggleStatus(item)"
              >
                <i :class="item.TrangThai === 'NghiViec' ? 'pi pi-check' : 'pi pi-ban'"></i>
              </button>
            </div></td>
          </tr>
        </tbody>
      </table>
    </div>

    <Teleport to="body"><Transition name="fade">
      <div v-if="showModal" class="modal-overlay" @click.self="showModal=false">
        <div class="modal">
          <div class="modal-header"><span class="modal-title">{{ editingItem ? $t('staff.edit') : $t('staff.add') }}</span><button class="btn-icon" @click="showModal=false"><i class="pi pi-times"></i></button></div>
          <div class="modal-body">
            <div class="form-group mb-4"><label class="form-label">{{ $t('staff.name') }} *</label><input v-model="form.HoTenNV" class="form-input" /></div>
            <div class="form-group mb-4"><label class="form-label">{{ $t('staff.position') }}</label><input v-model="form.ChucVu" class="form-input" /></div>
            <div class="form-group mb-4"><label class="form-label">{{ $t('staff.phone') }}</label><input v-model="form.SoDienThoai" class="form-input" /></div>
            <div class="form-group mb-4"><label class="form-label">{{ $t('staff.address') }}</label><input v-model="form.DiaChi" class="form-input" /></div>
            <template v-if="!editingItem">
              <hr style="margin:var(--space-4) 0;border-color:var(--border-color)"/>
              <div class="form-group mb-4"><label class="form-label">{{ $t('staff.account') }} *</label><input v-model="form.username" class="form-input" /></div>
              <div class="form-group"><label class="form-label">Password *</label><input v-model="form.password" type="password" class="form-input" /></div>
            </template>
            <div v-if="formError" class="form-error mt-2"> {{ formError }}</div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" @click="showModal=false">{{ $t('common.cancel') }}</button>
            <button class="btn btn-primary" @click="save" :disabled="saving">{{ saving ? '...' : $t('common.save') }}</button>
          </div>
        </div>
      </div>
    </Transition></Teleport>
    <Teleport to="body"><Transition name="fade">
      <div v-if="showAuthModal" class="modal-overlay" @click.self="showAuthModal=false">
        <div class="modal">
          <div class="modal-header">
            <span class="modal-title">Cấp lại tài khoản</span>
            <button class="btn-icon" @click="showAuthModal=false"><i class="pi pi-times"></i></button>
          </div>
          <div class="modal-body">
            <div class="form-group mb-4"><label class="form-label">Tên đăng nhập mới *</label><input v-model="authForm.username" class="form-input" /></div>
            <div class="form-group mb-4"><label class="form-label">Mật khẩu mới *</label><input v-model="authForm.password" type="password" class="form-input" /></div>
            <div v-if="authFormError" class="form-error mt-2"> {{ authFormError }}</div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" @click="showAuthModal=false">{{ $t('common.cancel') }}</button>
            <button class="btn btn-primary" @click="saveAuth" :disabled="savingAuth">{{ savingAuth ? '...' : $t('common.save') }}</button>
          </div>
        </div>
      </div>
    </Transition></Teleport>
    <Teleport to="body"><Transition name="fade">
      <div v-if="showConfirmModal" class="modal-overlay" @click.self="showConfirmModal=false">
        <div class="modal modal-sm">
          <div class="modal-header">
            <span class="modal-title">Xác nhận</span>
            <button class="btn-icon" @click="showConfirmModal=false"><i class="pi pi-times"></i></button>
          </div>
          <div class="modal-body">
            Bạn có chắc muốn {{ confirmActionText }} nhân viên <strong>"{{ confirmItem?.HoTenNV }}"</strong>?
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" @click="showConfirmModal=false">{{ $t('common.cancel') }}</button>
            <button :class="['btn', confirmItem?.TrangThai === 'NghiViec' ? 'btn-success' : 'btn-danger']" @click="executeToggleStatus" :disabled="savingStatus">
              {{ savingStatus ? '...' : 'Xác nhận' }}
            </button>
          </div>
        </div>
      </div>
    </Transition></Teleport>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { staffService } from '@/services/staff.service'
import { useToast } from '@/composables/useToast'
import { useI18n } from 'vue-i18n'

const { success, error: toastError } = useToast()
const { t } = useI18n()
const items = ref([])
const loading = ref(true)
const search = ref('')
const showModal = ref(false)
const showAuthModal = ref(false)
const showConfirmModal = ref(false)
const editingItem = ref(null)
const resetAuthItem = ref(null)
const confirmItem = ref(null)
const confirmActionText = ref('')
const saving = ref(false)
const savingAuth = ref(false)
const savingStatus = ref(false)
const formError = ref('')
const authFormError = ref('')
const form = ref({ HoTenNV:'', ChucVu:'', SoDienThoai:'', DiaChi:'', username:'', password:'' })
const authForm = ref({ username: '', password: '' })

let debounceTimer = null
function debouncedFetch() {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    fetchItems()
  }, 400)
}

async function fetchItems() { 
  loading.value=true
  try { 
    const params = { limit: 50 }
    if (search.value) params.search = search.value
    const r = await staffService.getAll(params)
    items.value = r.data.data || [] 
  } finally { loading.value=false } 
}
function openCreate() { editingItem.value=null; form.value={HoTenNV:'',ChucVu:'',SoDienThoai:'',DiaChi:'',username:'',password:''}; formError.value=''; showModal.value=true }
function openEdit(item) { editingItem.value=item; form.value={HoTenNV:item.HoTenNV,ChucVu:item.ChucVu||'',SoDienThoai:item.SoDienThoai||'',DiaChi:item.DiaChi||'',username:'',password:''}; formError.value=''; showModal.value=true }
function openResetAuth(item) {
  resetAuthItem.value = item
  authForm.value = { username: item.MaTaiKhoan?.username || '', password: '' }
  authFormError.value = ''
  showAuthModal.value = true
}

async function saveAuth() {
  if (!authForm.value.username || !authForm.value.password) { authFormError.value = 'Vui lòng nhập đầy đủ thông tin'; return }
  savingAuth.value = true; authFormError.value = ''
  try {
    await staffService.resetCredentials(resetAuthItem.value._id, authForm.value)
    success('Đã cấp lại thông tin đăng nhập thành công', '')
    showAuthModal.value = false; fetchItems()
  } catch(e) {
    authFormError.value = e.response?.data?.message || 'Có lỗi xảy ra'
  } finally { savingAuth.value = false }
}

async function save() {
  if (!form.value.HoTenNV) { formError.value = t('staff.nameRequired'); return }
  saving.value=true; formError.value=''
  try {
    if (editingItem.value) {
      await staffService.update(editingItem.value._id, { HoTenNV:form.value.HoTenNV, ChucVu:form.value.ChucVu, SoDienThoai:form.value.SoDienThoai, DiaChi:form.value.DiaChi })
      success(t('staff.updateSuccess'),'')
    } else {
      if (!form.value.username || !form.value.password) { formError.value = t('staff.usernameRequired'); saving.value=false; return }
      await staffService.create({ 
        username: form.value.username, 
        password: form.value.password, 
        HoTenNV: form.value.HoTenNV, 
        ChucVu: form.value.ChucVu, 
        SoDienThoai: form.value.SoDienThoai, 
        DiaChi: form.value.DiaChi 
      })
      success(t('staff.addSuccess'),'')
    }
    showModal.value=false; fetchItems()
  } catch(e) { formError.value=e.response?.data?.message||t('common.error'); toastError(t('common.error'),formError.value) }
  finally { saving.value=false }
}
function confirmToggleStatus(item) {
  confirmItem.value = item
  confirmActionText.value = item.TrangThai === 'NghiViec' ? 'kích hoạt lại' : 'cho nghỉ việc'
  showConfirmModal.value = true
}

async function executeToggleStatus() {
  savingStatus.value = true
  try { 
    await staffService.remove(confirmItem.value._id)
    success('Đã cập nhật trạng thái','')
    showConfirmModal.value = false
    fetchItems() 
  } catch(e) { 
    toastError(t('common.error'), e.response?.data?.message||'') 
  } finally {
    savingStatus.value = false
  }
}
onMounted(fetchItems)
</script>
