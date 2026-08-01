<template>
  <div class="locked-container">
    <div class="locked-card">
      <div class="icon-wrapper">
        <i class="pi pi-lock"></i>
      </div>
      <h1 class="locked-title">Tài khoản bị khóa</h1>
      <p class="locked-message">
        Tài khoản của bạn hiện đang bị khóa. Bạn không thể sử dụng các chức năng của hệ thống.
        Vui lòng liên hệ nhân viên thư viện để biết thêm chi tiết và hỗ trợ mở khóa.
      </p>
      <button class="btn btn-primary" @click="handleLogout">
        <i class="pi pi-sign-out"></i> Đăng xuất
      </button>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth.store'
import { useRouter } from 'vue-router'

const auth = useAuthStore()
const router = useRouter()

function handleLogout() {
  auth.logout()
  router.push('/login')
}
</script>

<style scoped>
.locked-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-body);
  padding: var(--space-4);
}

.locked-card {
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-lg);
  padding: var(--space-6);
  max-width: 480px;
  width: 100%;
  text-align: center;
  box-shadow: var(--shadow-md);
}

.icon-wrapper {
  width: 64px;
  height: 64px;
  background: rgba(239, 68, 68, 0.1);
  color: var(--color-danger);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  margin: 0 auto var(--space-4);
}

.locked-title {
  font-size: var(--font-size-xl);
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: var(--space-3);
}

.locked-message {
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: var(--space-5);
}

.btn {
  width: 100%;
  justify-content: center;
}
</style>
