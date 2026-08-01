<template>
  <button
    class="category-pill"
    :class="{ active: active }"
    :style="{ '--theme-color': dynamicColor }"
    @click="$emit('click')"
  >
    {{ label }}
  </button>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  label: { type: String, required: true },
  active: { type: Boolean, default: false },
  // Khai báo prop index để nhận số thứ tự từ danh sách bên ngoài truyền vào
  index: { type: Number, default: 0 }
})

defineEmits(['click'])

// Bảng màu (Palette) Pastel
const colors = [
  '#89CFF0', // Pastel Blue 
  '#FFD3B6', // Pastel Orange
  '#FF8B94', // Pastel Pink
  '#D0D1FF', // Pastel Purple
  '#D4F1F9', // Pastel Cyan
  '#F4E2D8', // Pastel Peach
  '#C8E6C9', // Pastel Mint
  '#E1BEE7', // Pastel Lilac
  '#FFF9C4', // Pastel Lemon
  '#FFCDD2', // Pastel Rose
]

// Lấy màu nhất quán dựa vào tên thể loại (hash)
const dynamicColor = computed(() => {
  if (!props.label) return colors[0]
  const str = String(props.label)
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colors[Math.abs(hash) % colors.length]
})
</script>

<style scoped>
.category-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 6px 10px;
  font-size: 14px;
  font-weight: 600;
  border-radius: 8px; /* Dáng thẻ bo góc mềm mại */
  border: 1.5px solid var(--theme-color);
  background-color: var(--theme-color);
  color: black; /* Chữ đen tương phản tốt trên nền pastel sáng */
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  user-select: none;
}

/* Hiệu ứng khi di chuột (Hover) */
.category-pill:hover {
  filter: brightness(0.92); /* Làm màu nền đậm lên nhẹ nhàng thay vì đổi màu chữ */
  color: black;
  transform: translateY(-2px);
}

/* Trạng thái đang được chọn (Active) */
.category-pill.active {
  filter: brightness(0.85); /* Nền nhấn đậm hơn nữa */
  color: black;
  box-shadow: 0 4px 12px -3px rgba(0, 0, 0, 0.15); /* Bóng đổ xám tinh tế */
}

/* ─── Tinh chỉnh cho chế độ Dark Mode (nếu áp dụng) ─── */
[data-theme="dark"] .category-pill {
  /* Pha trộn màu pastel với 20% đen để dịu mắt hơn trên nền tối */
  background-color: color-mix(in srgb, var(--theme-color) 80%, black);
  border-color: var(--theme-color);
  color: white; /* Đổi chữ sang trắng do nền đã được làm tối */
}

[data-theme="dark"] .category-pill:hover {
  filter: brightness(1.1); /* Làm sáng nút khi hover ở nền tối */
}

[data-theme="dark"] .category-pill.active {
  background-color: var(--theme-color); /* Trả về màu gốc rực rỡ khi active */
  color: black;
  box-shadow: 0 4px 12px -3px var(--theme-color);
}
</style>