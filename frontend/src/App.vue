<template>
  <!-- Master (public) layout -->
  <template v-if="layout === 'master'">
    <MasterLayout>
      <RouterView />
    </MasterLayout>
  </template>

  <!-- Auth layout -->
  <template v-else-if="layout === 'auth'">
    <RouterView />
  </template>

  <!-- Dashboard layout (Staff/Admin/Reader) -->
  <template v-else-if="layout === 'dashboard'">
    <DashboardLayout>
      <RouterView />
    </DashboardLayout>
  </template>

  <!-- Fallback -->
  <template v-else>
    <RouterView />
  </template>

  <!-- Global Toast -->
  <ToastContainer />
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import MasterLayout from '@/layouts/MasterLayout.vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import ToastContainer from '@/components/common/ToastContainer.vue'

const route = useRoute()
const layout = computed(() => route.meta.layout || 'master')
</script>
