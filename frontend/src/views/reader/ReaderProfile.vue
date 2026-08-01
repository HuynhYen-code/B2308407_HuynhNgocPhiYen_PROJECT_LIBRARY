<template>
  <div class="reader-profile">
    <h1 class="section-title" style="margin-bottom:var(--space-6)">{{ $t('profile.title') }}</h1>

    <div v-if="loading" class="loading-spinner-wrapper"><div class="spinner"></div></div>

    <!-- No profile yet -->
    <div v-else-if="!profile && !editing">
      <div class="empty-state">
        <div class="empty-state-icon"><i class="pi pi-user" style="font-size:48px;color:var(--text-muted)"></i></div>
        <div class="empty-state-title">{{ $t('profile.notRegistered') }}</div>
        <div class="empty-state-desc">{{ $t('dashboard.profileNotRegistered') }}</div>
        <button class="btn btn-primary" @click="startCreate">{{ $t('profile.registerProfile') }}</button>
      </div>
    </div>

    <!-- Profile display -->
    <div v-else-if="profile && !editing">
      <div class="profile-header">
        <div class="profile-avatar-lg">{{ initials }}</div>
        <div>
          <div class="profile-name">{{ profile.HoTen }}</div>
          <div class="profile-role-badge">
            <StatusBadge :value="profile.TrangThaiHoSo" type="reader" />
          </div>
          <div style="margin-top:8px; font-size:var(--font-size-sm); opacity:.8">
            {{ profile.DienThoai }}
          </div>
        </div>
        <button class="btn btn-secondary btn-with-icon" style="margin-left:auto" @click="startEdit">
          <i class="pi pi-pencil"></i> {{ $t('profile.edit') }}
        </button>
      </div>

      <div class="profile-details">
        <div class="profile-detail-row">
          <span class="profile-detail-label">{{ $t('profile.fullName') }}</span>
          <span class="profile-detail-value">{{ profile.HoTen }}</span>
        </div>
        <div class="profile-detail-row">
          <span class="profile-detail-label">{{ $t('profile.phone') }}</span>
          <span class="profile-detail-value">{{ profile.DienThoai }}</span>
        </div>
        <div class="profile-detail-row">
          <span class="profile-detail-label">{{ $t('profile.birthday') }}</span>
          <span class="profile-detail-value">{{ formatDate(profile.NgaySinh) }}</span>
        </div>
        <div class="profile-detail-row">
          <span class="profile-detail-label">{{ $t('profile.gender') }}</span>
          <span class="profile-detail-value">{{ genderMap[profile.Phai] || '—' }}</span>
        </div>
        <div class="profile-detail-row">
          <span class="profile-detail-label">{{ $t('profile.address') }}</span>
          <span class="profile-detail-value">{{ profile.DiaChi || '—' }}</span>
        </div>
        <div class="profile-detail-row">
          <span class="profile-detail-label">{{ $t('profile.status') }}</span>
          <span class="profile-detail-value"><StatusBadge :value="profile.TrangThaiHoSo" type="reader" /></span>
        </div>
      </div>
    </div>

    <!-- Edit / Create Form -->
    <div v-if="editing" class="card" style="padding:var(--space-6)">
      <h2 class="section-title" style="margin-bottom:var(--space-5)">{{ profile ? $t('profile.edit') : $t('profile.registerProfile') }}</h2>
      <form class="profile-form" @submit.prevent="handleSave">
        <div class="form-grid">
          <div class="form-group">
            <label class="form-label">{{ $t('profile.fullName') }} *</label>
            <input v-model="form.HoTen" class="form-input" required />
          </div>
          <div class="form-group">
            <label class="form-label">{{ $t('profile.phone') }} *</label>
            <input v-model="form.DienThoai" class="form-input" required />
          </div>
          <div class="form-group">
            <label class="form-label">{{ $t('profile.birthday') }}</label>
            <input v-model="form.NgaySinh" class="form-input" type="date" />
          </div>
          <div class="form-group">
            <label class="form-label">{{ $t('profile.gender') }}</label>
            <select v-model="form.Phai" class="form-select">
              <option value="">—</option>
              <option value="Nam">{{ $t('profile.genderValues.Nam') }}</option>
              <option value="Nu">{{ $t('profile.genderValues.Nu') }}</option>
              <option value="Khac">{{ $t('profile.genderValues.Khac') }}</option>
            </select>
          </div>
          <div class="form-group" style="grid-column:1/-1">
            <label class="form-label">{{ $t('profile.address') }}</label>
            <input v-model="form.DiaChi" class="form-input" />
          </div>
        </div>

        <div v-if="apiError" class="form-error" style="margin-top:var(--space-3)">
          <i class="pi pi-exclamation-circle"></i> {{ apiError }}
        </div>

        <div class="flex gap-3 mt-6">
          <button type="button" class="btn btn-secondary" @click="cancelEdit">{{ $t('profile.cancel') }}</button>
          <button type="submit" class="btn btn-primary btn-with-icon" :disabled="saving">
            <div v-if="saving" class="spinner-sm"></div>
            <i v-else class="pi pi-check"></i>
            {{ saving ? $t('common.saving') : $t('profile.save') }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth.store'
import { readerService } from '@/services/readers.service'
import { useToast } from '@/composables/useToast'
import StatusBadge from '@/components/common/StatusBadge.vue'
import { useI18n } from 'vue-i18n'

const auth = useAuthStore()
const { success, error: toastError } = useToast()
const { t } = useI18n()

const profile = ref(null)
const loading = ref(true)
const editing = ref(false)
const saving = ref(false)
const apiError = ref('')
const form = ref({ HoTen: '', DienThoai: '', NgaySinh: '', Phai: '', DiaChi: '' })

const initials = computed(() => (profile.value?.HoTen || auth.user?.username || 'U').slice(0, 2).toUpperCase())
const genderMap = computed(() => ({ 
  Nam: t('profile.genderValues.Nam'), 
  Nu: t('profile.genderValues.Nu'), 
  Khac: t('profile.genderValues.Khac') 
}))

function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('vi-VN')
}

function startEdit() {
  form.value = {
    HoTen: profile.value?.HoTen || '',
    DienThoai: profile.value?.DienThoai || '',
    NgaySinh: profile.value?.NgaySinh ? profile.value.NgaySinh.slice(0, 10) : '',
    Phai: profile.value?.Phai || '',
    DiaChi: profile.value?.DiaChi || '',
  }
  editing.value = true
}

function startCreate() {
  form.value = { HoTen: '', DienThoai: '', NgaySinh: '', Phai: '', DiaChi: '' }
  editing.value = true
}

function cancelEdit() { editing.value = false; apiError.value = '' }

async function handleSave() {
  saving.value = true
  apiError.value = ''
  try {
    let res
    if (profile.value) {
      res = await readerService.updateMyProfile(form.value)
    } else {
      res = await readerService.selfRegister(form.value)
    }
    profile.value = res.data.data
    editing.value = false
    success(t('common.success'), '')
  } catch (e) {
    apiError.value = e.response?.data?.message || t('common.error')
    toastError(t('common.error'), apiError.value)
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  try {
    const res = await readerService.getMyProfile()
    profile.value = res.data.data
  } catch (_) {}
  finally { loading.value = false }
})
</script>

<style scoped>
.profile-details {
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-lg);
  overflow: hidden;
  margin-top: var(--space-5);
}

.profile-detail-row {
  display: flex;
  align-items: center;
  padding: var(--space-4) var(--space-6);
  border-bottom: 1px solid var(--border-color);
  gap: var(--space-4);
}

.profile-detail-row:last-child { border-bottom: none; }

.profile-detail-label {
  width: 160px;
  flex-shrink: 0;
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--text-muted);
}

.profile-detail-value {
  font-size: var(--font-size-sm);
  color: var(--text-primary);
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-4);
}

@media (max-width: 600px) {
  .form-grid { grid-template-columns: 1fr; }
}
</style>
