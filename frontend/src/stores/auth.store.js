import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authService } from '@/services/auth.service'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(JSON.parse(localStorage.getItem('user') || 'null'))
  const token = ref(localStorage.getItem('token') || null)

  const isLoggedIn = computed(() => !!token.value)
  const role = computed(() => user.value?.role || null)
  const isReader = computed(() => role.value === 'Reader')
  const isStaff = computed(() => role.value === 'Staff')
  const isAdmin = computed(() => role.value === 'Admin')
  const isStaffOrAdmin = computed(() => isStaff.value || isAdmin.value)

  async function login(credentials) {
    const res = await authService.login(credentials)
    const { data: userData, token: jwt } = res.data
    user.value = userData
    token.value = jwt
    localStorage.setItem('user', JSON.stringify(userData))
    localStorage.setItem('token', jwt)
    return userData
  }

  async function register(credentials) {
    const res = await authService.register(credentials)
    return res.data
  }

  async function fetchMe() {
    if (!token.value) return
    try {
      const res = await authService.getMe()
      user.value = res.data.data
      localStorage.setItem('user', JSON.stringify(user.value))
    } catch (_) {
      logout()
    }
  }

  function logout() {
    user.value = null
    token.value = null
    localStorage.removeItem('user')
    localStorage.removeItem('token')
  }

  return { user, token, isLoggedIn, role, isReader, isStaff, isAdmin, isStaffOrAdmin, login, register, fetchMe, logout }
})
