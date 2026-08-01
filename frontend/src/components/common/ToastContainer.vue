<template>
  <div class="toast-container">
    <TransitionGroup name="toast-slide">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="toast"
        :class="toast.type"
      >
        <div class="toast-icon">
          <AppIcon :name="iconMap[toast.type]" :size="18" />
        </div>
        <div class="toast-content">
          <div class="toast-title">{{ toast.title }}</div>
          <div v-if="toast.message" class="toast-message">{{ toast.message }}</div>
        </div>
        <button class="btn-icon" @click="remove(toast.id)" style="margin-left:auto;flex-shrink:0">
          <AppIcon name="x-mark" :size="16" />
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup>
import { useToast } from '@/composables/useToast'
import AppIcon from './AppIcon.vue'

const { toasts, remove } = useToast()

const iconMap = {
  success: 'check-circle',
  error:   'x-circle',
  warning: 'exclamation',
  info:    'info',
}
</script>

<style scoped>
.toast-slide-enter-active { transition: all 0.25s ease; }
.toast-slide-leave-active { transition: all 0.2s ease; position: absolute; right: 0; }
.toast-slide-enter-from   { opacity: 0; transform: translateX(20px); }
.toast-slide-leave-to     { opacity: 0; transform: translateX(20px); }
</style>
