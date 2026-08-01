<template>
  <div class="auth-page">
    <div class="auth-card">
      <div class="auth-header">
        <div class="auth-logo">
          <AppIcon name="book" :size="28" />
        </div>
        <h1 class="auth-title">{{ $t('auth.registerTitle') }}</h1>
        <p class="auth-subtitle">{{ $t('auth.registerSubtitle') }}</p>
      </div>

      <form class="auth-form" @submit.prevent="handleRegister">
        <div class="form-group">
          <label class="form-label">{{ $t('auth.username') }}</label>
          <input v-model="form.username" type="text" class="form-input" :placeholder="$t('auth.username')" required />
          <span v-if="errors.username" class="form-error">{{ errors.username }}</span>
        </div>

        <div class="form-group">
          <label class="form-label">{{ $t('auth.password') }}</label>
          <div class="password-input-wrap">
            <input v-model="form.password" :type="showPass ? 'text' : 'password'" class="form-input" :placeholder="$t('auth.password')" required />
            <button type="button" class="pass-toggle" @click="showPass = !showPass">
              <AppIcon :name="showPass ? 'eye-off' : 'eye'" :size="17" />
            </button>
          </div>
          <span v-if="errors.password" class="form-error">{{ errors.password }}</span>
        </div>

        <div class="form-group">
          <label class="form-label">{{ $t('auth.confirmPassword') }}</label>
          <input v-model="form.confirm" :type="showPass ? 'text' : 'password'" class="form-input" :placeholder="$t('auth.confirmPassword')" required />
          <span v-if="errors.confirm" class="form-error">{{ errors.confirm }}</span>
        </div>

        <div v-if="apiError" class="form-error-box"> <i class="pi pi-times"></i> {{ apiError }}</div>
        <div v-if="successMsg" class="form-success-box"> <i class="pi pi-check"></i> {{ successMsg }}</div>

        <button type="submit" class="btn btn-primary w-full btn-lg" :disabled="loading">
          <span v-if="loading"> <i class="fas fa-spinner fa-spin"></i> {{ $t('common.loading') }}</span>
          <span v-else>{{ $t('auth.registerBtn') }}</span>
        </button>
      </form>

      <div class="auth-footer">
        {{ $t('auth.hasAccount') }}
        <RouterLink to="/login">{{ $t('auth.registerLink') }}</RouterLink>
      </div>

      <div class="auth-toggles">
        <button class="toggle-btn" @click="toggleTheme" :title="isDark ? $t('common.lightMode') : $t('common.darkMode')">
          <AppIcon :name="isDark ? 'sun' : 'moon'" :size="18" />
        </button>
        <button class="lang-btn" @click="toggleLang">
          <AppIcon name="globe" :size="16" />
          <span>{{ locale === 'vi' ? 'VI' : 'EN' }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth.store'
import { useTheme } from '@/composables/useTheme'
import { setLocale } from '@/i18n'
import AppIcon from '@/components/common/AppIcon.vue'

const router = useRouter()
const { t, locale } = useI18n()
const auth = useAuthStore()
const { theme, toggle: toggleTheme } = useTheme()

const isDark = computed(() => theme.value === 'dark')
const form = ref({ username: '', password: '', confirm: '' })
const errors = ref({})
const apiError = ref('')
const successMsg = ref('')
const loading = ref(false)
const showPass = ref(false)

function validate() {
  errors.value = {}
  if (!form.value.username) errors.value.username = t('auth.usernameRequired')
  if (!form.value.password) errors.value.password = t('auth.passwordRequired')
  if (form.value.password !== form.value.confirm) errors.value.confirm = t('auth.passwordMismatch')
  return Object.keys(errors.value).length === 0
}

async function handleRegister() {
  if (!validate()) return
  loading.value = true
  apiError.value = ''
  successMsg.value = ''
  try {
    await auth.register({ username: form.value.username, password: form.value.password })
    successMsg.value = 'Đăng ký thành công! Đang chuyển đến đăng nhập...'
    setTimeout(() => router.push('/login'), 1500)
  } catch (e) {
    apiError.value = e.response?.data?.message || 'Đăng ký thất bại.'
  } finally {
    loading.value = false
  }
}

function toggleLang() {
  const next = locale.value === 'vi' ? 'en' : 'vi'
  setLocale(next)
}
</script>

<style scoped>
.password-input-wrap { position: relative; }
.password-input-wrap .form-input { padding-right: 44px; }
.pass-toggle { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; font-size: 16px; }

.form-error-box {
  background: #fee2e2; border: 1px solid #fecaca; border-radius: var(--border-radius);
  padding: var(--space-3) var(--space-4); font-size: var(--font-size-sm); color: #b91c1c;
}

.form-success-box {
  background: #dcfce7; border: 1px solid #86efac; border-radius: var(--border-radius);
  padding: var(--space-3) var(--space-4); font-size: var(--font-size-sm); color: #15803d;
}

[data-theme="dark"] .form-error-box { background: rgba(239,68,68,.15); border-color: rgba(239,68,68,.3); color: #fca5a5; }
[data-theme="dark"] .form-success-box { background: rgba(34,197,94,.15); border-color: rgba(34,197,94,.3); color: #86efac; }

.auth-toggles {
  display: flex; justify-content: center; gap: var(--space-3);
  margin-top: var(--space-5); padding-top: var(--space-5); border-top: 1px solid var(--border-color);
}
</style>
