<template>
  <div class="shelf-page">
    <!-- Header -->
    <div class="shelf-header">
      <div>
        <h1 class="section-title">{{ $t('bookshelf.title') }}</h1>
      </div>
      <RouterLink
      to="/books"
      class="btn btn-ghost btn-sm btn-with-icon"
      style="font-size: var(--font-size-base);"
    >
      <i class="pi pi-plus"></i>
      {{ $t('bookshelf.explore') }}
    </RouterLink>
    </div>

    <!-- Empty state -->
    <div v-if="cartStore.items.length === 0" class="empty-shelf">
      <div class="empty-shelf-icon">
        <i
          class="pi pi-bookmark"
          style="font-size:48px;color:var(--text-muted)"
        ></i>
      </div>

      <div class="empty-shelf-title">
        {{ $t('bookshelf.empty') }}
      </div>

      <p class="text-secondary text-sm" style="margin-bottom:var(--space-5)">
        {{ $t('bookshelf.emptyDesc') }}
      </p>

      <RouterLink to="/books" class="btn btn-primary btn-with-icon">
        <i class="pi pi-search"></i>
        {{ $t('bookshelf.explore') }}
      </RouterLink>
    </div>

    <template v-else>
      <div class="shelf-content-grid">

        <!-- Left -->
        <div class="shelf-list-wrapper">

          <div
            class="shelf-list-header flex items-center justify-between mb-4"
          >
            <div
              class="flex items-center gap-2"
              style="font-size:var(--font-size-sm);font-weight:600;cursor:pointer;user-select:none"
              @click="toggleAll"
            >
              <div
                class="check-box"
                :class="{ checked: selected.length === cartStore.items.length }"
              >
                <i
                  v-if="selected.length === cartStore.items.length"
                  class="pi pi-check"
                  style="font-size:11px;color:#fff"
                ></i>
              </div>

              <span>
                {{ $t('bookshelf.selectAll', {
                  count: cartStore.items.length
                }) }}
              </span>
            </div>

            <button
              v-if="cartStore.items.length > 0"
              class="btn btn-ghost btn-sm text-danger flex items-center gap-1"
              @click="cartStore.clear()"
            >
              <i class="pi pi-trash"></i>
              {{ $t('bookshelf.clearAll') }}
            </button>
          </div>

          <div class="shelf-list">
            <TransitionGroup name="shelf-item">

              <div
                v-for="item in cartStore.items"
                :key="item._id"
                class="shelf-item"
                :class="{ 'shelf-item-checked': selected.includes(item._id) }"
              >

                <!-- Checkbox -->
                <div class="shelf-check" @click="toggleSelect(item._id)">
                  <div
                    class="check-box"
                    :class="{ checked: selected.includes(item._id) }"
                  >
                    <i
                      v-if="selected.includes(item._id)"
                      class="pi pi-check"
                      style="font-size:11px;color:#fff"
                    ></i>
                  </div>
                </div>

                <!-- Cover -->
                <div class="shelf-cover">
                  <img
                    v-if="item.HinhAnh"
                    :src="item.HinhAnh"
                    :alt="item.TenSach"
                  />

                  <div v-else class="shelf-cover-ph">
                    <i
                      class="pi pi-image"
                      style="font-size:18px;color:var(--text-muted)"
                    ></i>
                  </div>
                </div>

                <!-- Info -->
                <div class="shelf-info">

                  <div class="shelf-title">
                    {{ item.TenSach }}
                  </div>

                  <div class="shelf-author">
                    {{
                      (item.TacGia || []).join(', ')
                      || $t('bookshelf.unknownAuthor')
                    }}
                  </div>

                  <div
                    class="shelf-avail"
                    :class="item.SanSang > 0 ? 'avail-ok' : 'avail-none'"
                  >
                    <i
                      class="pi pi-circle-fill"
                      style="font-size:8px"
                    ></i>

                    {{
                      item.SanSang > 0
                        ? $t('bookshelf.availableCopies', {
                            count: item.SanSang
                          })
                        : $t('bookshelf.unavailable')
                    }}
                  </div>
                </div>

                <!-- Actions -->
                <div class="shelf-actions">

                  <RouterLink
                    :to="`/books/${item._id}`"
                    class="btn btn-ghost btn-sm btn-icon"
                    :title="$t('bookshelf.viewDetail')"
                  >
                    <i class="pi pi-eye" style="font-size:14px"></i>
                  </RouterLink>

                  <button
                    class="btn btn-ghost btn-sm btn-icon text-danger"
                    :title="$t('bookshelf.removeFromShelf')"
                    @click="cartStore.remove(item._id)"
                  >
                    <i class="pi pi-trash" style="font-size:14px"></i>
                  </button>

                </div>
              </div>

            </TransitionGroup>
          </div>
        </div>

        <!-- Right -->
        <div class="shelf-sidebar">
          <div class="shelf-summary-card">

            <h3 class="font-semibold text-lg mb-4">
              {{ $t('bookshelf.summary') }}
            </h3>

            <div class="summary-row flex items-center justify-between mb-3">
              <span class="text-secondary text-sm">
                {{ $t('bookshelf.selectedBooks') }}
              </span>

              <span class="font-semibold">
                {{ selected.length }} / {{ cartStore.items.length }}
              </span>
            </div>

            <div class="summary-row flex items-center justify-between mb-5">
              <span class="text-secondary text-sm">
                {{ $t('bookshelf.borrowableBooks') }}
              </span>

              <span class="font-bold text-success">
                {{ selectedAvailable.length }}
              </span>
            </div>

            <div
              v-if="unavailable.length > 0"
              class="borrow-warn mb-4"
            >
              <i class="pi pi-exclamation-triangle mt-1"></i>

              <span>
                {{ $t('bookshelf.unavailableWarning', {
                  count: unavailable.length
                }) }}
              </span>
            </div>

            <button
              class="btn btn-primary btn-lg btn-with-icon w-full mt-4"
              :disabled="selectedAvailable.length === 0 || borrowing"
              @click="showConfirmModal = true"
            >
              <i class="pi pi-send"></i>

              {{ $t('bookshelf.submitBorrow') }}
            </button>

            <p class="text-xs text-muted text-center mt-4">
              {{ $t('bookshelf.staffAssignNotice') }}
            </p>

          </div>
        </div>

      </div>
    </template>

    <!-- Confirmation -->
    <Teleport to="body">
      <Transition name="fade">

        <div
          v-if="showConfirmModal"
          class="modal-overlay"
          @click.self="showConfirmModal = false"
        >

          <div class="modal" style="max-width:450px;">

            <div class="modal-header">

              <span class="modal-title">
                {{ $t('bookshelf.confirmBorrowTitle') }}
              </span>

              <button
                class="btn-icon"
                @click="showConfirmModal = false"
                :disabled="borrowing"
              >
                <i class="pi pi-times"></i>
              </button>

            </div>

            <div class="modal-body">

              <p class="text-secondary text-sm mb-3">
                {{
                  $t('bookshelf.confirmBorrowMessage', {
                    count: selectedAvailable.length
                  })
                }}
              </p>

              <p class="text-secondary text-sm">
                {{ $t('bookshelf.confirmBorrowDescription') }}
              </p>

            </div>

            <div class="modal-footer">

              <button
                class="btn btn-secondary"
                @click="showConfirmModal = false"
                :disabled="borrowing"
              >
                {{ $t('common.cancel') }}
              </button>

              <button
                class="btn btn-primary btn-with-icon"
                @click="createBorrow"
                :disabled="borrowing"
              >

                <div
                  v-if="borrowing"
                  class="spinner-sm"
                ></div>

                <i
                  v-else
                  class="pi pi-check"
                ></i>

                {{
                  borrowing
                    ? $t('common.sending')
                    : $t('bookshelf.confirmBorrow')
                }}

              </button>

            </div>

          </div>

        </div>

      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useBookCartStore } from '@/stores/bookCart.store'
import { borrowService } from '@/services/borrows.service'
import { useToast } from '@/composables/useToast'
import { useI18n } from 'vue-i18n'

const cartStore = useBookCartStore()
const router = useRouter()
const { success, error } = useToast()
const { t } = useI18n()

const borrowing = ref(false)
const showConfirmModal = ref(false)

// Selection state
const selected = ref(cartStore.items.map(i => i._id))

function toggleSelect(id) {
  const idx = selected.value.indexOf(id)
  if (idx >= 0) selected.value.splice(idx, 1)
  else selected.value.push(id)
}

function toggleAll() {
  if (selected.value.length === cartStore.items.length) selected.value = []
  else selected.value = cartStore.items.map(i => i._id)
}

// Items currently selected that have available copies
const selectedAvailable = computed(() =>
  cartStore.items.filter(i => selected.value.includes(i._id) && i.SanSang > 0)
)

// Items selected but no copies available
const unavailable = computed(() =>
  cartStore.items.filter(i => selected.value.includes(i._id) && i.SanSang === 0)
)

async function createBorrow() {
  if (selectedAvailable.value.length === 0) return
  borrowing.value = true
  try {
    const dauSachIds = selectedAvailable.value.map(i => i._id)
    await borrowService.create({ dauSachIds })
    success(
      t('bookshelf.borrowSuccess'),
      ''
    )
    // Remove successfully borrowed books from cart
    dauSachIds.forEach(id => cartStore.remove(id))
    showConfirmModal.value = false
    router.push({ name: 'MyBorrows' })
  } catch (e) {
    error('Lỗi', e.response?.data?.message || 'Không thể tạo phiếu mượn.')
  } finally {
    borrowing.value = false
  }
}
</script>

<style scoped>
.shelf-page {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
  max-width: 1100px;
  margin: 0 auto;
}

.shelf-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-4);
  margin-bottom: var(--space-2);
}

/* Empty state */
.empty-shelf {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-12) var(--space-6);
  text-align: center;
  gap: var(--space-3);
  background: var(--bg-surface);
  border: 1px dashed var(--border-color);
  border-radius: var(--border-radius-xl);
}

.empty-shelf-icon {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: var(--bg-surface-2);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: var(--space-2);
}

.empty-shelf-title {
  font-size: var(--font-size-lg);
  font-weight: 700;
  color: var(--text-primary);
}

/* Grid Layout */
.shelf-content-grid {
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: var(--space-6);
  align-items: start;
}

@media (max-width: 900px) {
  .shelf-content-grid {
    grid-template-columns: 1fr;
  }
}

/* Shelf list */
.shelf-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.shelf-item {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-4);
  background: var(--bg-surface);
  border: 1.5px solid var(--border-color);
  border-radius: var(--border-radius-lg);
  transition: all var(--transition-fast);
}

.shelf-item:hover {
  border-color: var(--border-color-hover);
}

.shelf-item-checked {
  border-color: var(--brand-400);
  background: var(--brand-50);
}

[data-theme="dark"] .shelf-item-checked {
  background: rgba(59,130,246,.08);
}

/* Checkbox */
.shelf-check { cursor: pointer; flex-shrink: 0; }
.check-box {
  width: 20px;
  height: 20px;
  border-radius: 5px;
  border: 2px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast);
}
.check-box.checked { background: var(--brand-600); border-color: var(--brand-600); }

/* Cover */
.shelf-cover {
  width: 56px;
  height: 76px;
  border-radius: var(--border-radius);
  overflow: hidden;
  flex-shrink: 0;
  background: var(--bg-surface-2);
  display: flex;
  align-items: center;
  justify-content: center;
}
.shelf-cover img { width: 100%; height: 100%; object-fit: cover; }
.shelf-cover-ph { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; }

/* Info */
.shelf-info { flex: 1; min-width: 0; }
.shelf-title { font-weight: 700; font-size: var(--font-size-base); color: var(--text-primary); margin-bottom: 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.shelf-author { font-size: var(--font-size-sm); color: var(--text-secondary); margin-bottom: 6px; }
.shelf-avail { font-size: var(--font-size-xs); font-weight: 600; display: flex; align-items: center; gap: 5px; }
.avail-ok { color: var(--color-success); }
.avail-none { color: var(--color-danger); }

/* Actions */
.shelf-actions { display: flex; flex-direction: column; gap: var(--space-2); flex-shrink: 0; align-items: center; justify-content: center; }

/* Summary Sidebar */
.shelf-summary-card {
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-xl);
  padding: var(--space-5);
  position: sticky;
  top: var(--space-6);
}

/* Borrow panel */
.borrow-warn {
  display: flex;
  gap: var(--space-2);
  align-items: flex-start;
  padding: var(--space-3);
  background: rgba(245,158,11,.08);
  border: 1px solid rgba(245,158,11,.3);
  border-radius: var(--border-radius);
  font-size: var(--font-size-sm);
  color: var(--color-warning);
  line-height: 1.4;
}

.text-success {
  color: var(--color-success);
}

.w-full { width: 100%; justify-content: center; }

/* Transition */
.shelf-item-enter-active, .shelf-item-leave-active { transition: all .3s ease; }
.shelf-item-enter-from, .shelf-item-leave-to { opacity: 0; transform: translateX(-15px); }
.shelf-item-leave-active { position: absolute; }
</style>
