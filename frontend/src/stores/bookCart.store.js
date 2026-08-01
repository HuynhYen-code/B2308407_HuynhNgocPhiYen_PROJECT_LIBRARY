import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

/**
 * bookCartStore – Tủ sách (giỏ mượn) của độc giả
 * Lưu danh sách đầu sách (DauSach) muốn mượn, persist vào localStorage.
 */
export const useBookCartStore = defineStore('bookCart', () => {
  // Load từ localStorage
  const items = ref(JSON.parse(localStorage.getItem('bookCart') || '[]'))
  // items = [{ _id, TenSach, TacGia, HinhAnh, SanSang }]

  const count = computed(() => items.value.length)

  function save() {
    localStorage.setItem('bookCart', JSON.stringify(items.value))
  }

  function has(id) {
    return items.value.some(b => b._id === id)
  }

  function add(book) {
    if (has(book._id)) return false  // already in cart
    items.value.push({
      _id: book._id,
      TenSach: book.TenSach,
      TacGia: book.TacGia,
      HinhAnh: book.HinhAnh || null,
      SanSang: book.SanSang ?? 0,
    })
    save()
    return true
  }

  function remove(id) {
    items.value = items.value.filter(b => b._id !== id)
    save()
  }

  function clear() {
    items.value = []
    save()
  }

  return { items, count, has, add, remove, clear }
})
