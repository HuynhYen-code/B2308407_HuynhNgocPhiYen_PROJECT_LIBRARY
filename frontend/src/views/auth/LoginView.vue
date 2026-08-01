<template>
  <div class="auth-page">
    <div class="auth-card">
      <div class="auth-header">
        <div class="auth-logo">
          <AppIcon name="book" :size="28" />
        </div>
        <h1 class="auth-title">{{ $t('auth.loginTitle') }}</h1>
        <p class="auth-subtitle">{{ $t('auth.loginSubtitle') }}</p>
      </div>

      <form class="auth-form" @submit.prevent="handleLogin">
        <div class="form-group">
          <label class="form-label" for="username">{{ $t('auth.username') }}</label>
          <input
            id="username"
            v-model="form.username"
            type="text"
            class="form-input"
            :placeholder="$t('auth.username')"
            autocomplete="username"
            required
          />
          <span v-if="errors.username" class="form-error">{{ errors.username }}</span>
        </div>

        <div class="form-group">
          <label class="form-label" for="password">{{ $t('auth.password') }}</label>
          <div class="password-input-wrap">
            <input
              id="password"
              v-model="form.password"
              :type="showPass ? 'text' : 'password'"
              class="form-input"
              :placeholder="$t('auth.password')"
              autocomplete="current-password"
              required
            />
            <button type="button" class="pass-toggle" @click="showPass = !showPass">
              <AppIcon :name="showPass ? 'eye-off' : 'eye'" :size="17" />
            </button>
          </div>
          <span v-if="errors.password" class="form-error">{{ errors.password }}</span>
        </div>

        <div v-if="apiError" class="form-error-box">
          <i class="pi pi-times"></i> {{ apiError }}
        </div>

        <button type="submit" class="btn btn-primary w-full btn-lg" :disabled="loading">
          <span v-if="loading"> <i class="fas fa-spinner fa-spin"></i> {{ $t('common.loading') }}</span>
          <span v-else>{{ $t('auth.loginBtn') }}</span>
        </button>
      </form>

      <div class="auth-footer">
        {{ $t('auth.noAccount') }}
        <RouterLink to="/register">{{ $t('auth.loginLink') }}</RouterLink>
      </div>

      <!-- Quick lang/theme -->
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
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth.store'
import { useTheme } from '@/composables/useTheme'
import { setLocale } from '@/i18n'
import AppIcon from '@/components/common/AppIcon.vue'
import { useToast } from '@/composables/useToast'

const router = useRouter()
const route = useRoute()
const { t, locale } = useI18n()
const auth = useAuthStore()
const { theme, toggle: toggleTheme } = useTheme()
const { success, error: toastError } = useToast()

const isDark = computed(() => theme.value === 'dark')
const form = ref({ username: '', password: '' })
const errors = ref({})
const apiError = ref('')
const loading = ref(false)
const showPass = ref(false)

function validate() {
  errors.value = {}
  if (!form.value.username) errors.value.username = t('auth.usernameRequired')
  if (!form.value.password) errors.value.password = t('auth.passwordRequired')
  return Object.keys(errors.value).length === 0
}

async function handleLogin() {
  if (!validate()) return
  loading.value = true
  apiError.value = ''
  try {
    const userData = await auth.login(form.value)
    success(t('common.success'), 'Chào mừng trở lại!')
    const redirect = route.query.redirect
    if (redirect) return router.push(redirect)
    if (userData.role === 'Admin') return router.push('/admin')
    if (userData.role === 'Staff') return router.push('/staff')
    router.push('/reader')
  } catch (e) {
    apiError.value = e.response?.data?.message || 'Đăng nhập thất bại.'
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
.pass-toggle {
  position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
  background: none; border: none; cursor: pointer; font-size: 16px;
}

.form-error-box {
  background: #fee2e2;
  border: 1px solid #fecaca;
  border-radius: var(--border-radius);
  padding: var(--space-3) var(--space-4);
  font-size: var(--font-size-sm);
  color: #b91c1c;
}

[data-theme="dark"] .form-error-box {
  background: rgba(239,68,68,.15);
  border-color: rgba(239,68,68,.3);
  color: #fca5a5;
}

.auth-toggles {
  display: flex;
  justify-content: center;
  gap: var(--space-3);
  margin-top: var(--space-5);
  padding-top: var(--space-5);
  border-top: 1px solid var(--border-color);
}
</style>
