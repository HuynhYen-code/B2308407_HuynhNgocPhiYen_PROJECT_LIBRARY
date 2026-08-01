<template>
  <div class="book-card" @click="$emit('click', book)">
    <!-- Cover Wrapper -->
    <div class="book-card-cover">
      <img 
        v-if="book.HinhAnh" 
        :src="book.HinhAnh" 
        :alt="book.TenSach" 
        loading="lazy" 
      />
      <div v-else class="book-card-cover-placeholder">
        <AppIcon name="book-closed" :size="40" />
      </div>
      
      <!-- Floating Badge -->
      <span v-if="badge" class="book-card-badge">{{ badge }}</span>
    </div>

    <!-- Info Section -->
    <div class="book-card-info">
      <h3 class="book-card-title" :title="book.TenSach">{{ book.TenSach }}</h3>
      <p class="book-card-author" :title="authors">{{ authors || 'Đang cập nhật tác giả' }}</p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import AppIcon from '@/components/common/AppIcon.vue'

const props = defineProps({
  book: { type: Object, required: true },
  badge: { type: String, default: null }
})

defineEmits(['click'])

const authors = computed(() => {
  const a = props.book.TacGia
  if (!a) return ''
  if (Array.isArray(a)) return a.slice(0, 2).join(', ')
  return a
})
</script>

<style scoped>
.book-card {
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-lg, 12px);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  position: relative;
}

.book-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.08);
  border-color: var(--brand-400, #3b82f6);
}

[data-theme="dark"] .book-card:hover {
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.3);
}

/* Cover Image Container with fixed aspect ratio */
.book-card-cover {
  position: relative;
  width: 100%;
  aspect-ratio: 3 / 4;
  background: var(--bg-surface-2, #f3f4f6);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.book-card-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;
}

.book-card:hover .book-card-cover img {
  transform: scale(1.05);
}

.book-card-cover-placeholder {
  color: var(--text-muted, #9ca3af);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, var(--bg-surface-2, #f3f4f6) 0%, var(--border-color, #e5e7eb) 100%);
}

/* Badge styling */
.book-card-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(4px);
  color: #fff;
  font-size: 11px;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 6px;
  z-index: 2;
  letter-spacing: 0.02em;
}

/* Info styling */
.book-card-info {
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.book-card-title {
  font-size: 14px;
  font-weight: 700;
  color: var(--text-primary, #111827);
  line-height: 1.4;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.book-card-author {
  font-size: 12px;
  color: var(--text-secondary, #6b7280);
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>