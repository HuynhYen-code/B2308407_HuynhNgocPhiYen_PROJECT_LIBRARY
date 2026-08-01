<template>
  <div v-if="loading" class="loading-spinner-wrapper" style="min-height:60vh"><div class="spinner"></div></div>

  <div v-else-if="!book" class="empty-state" style="min-height:60vh">
    <div class="empty-state-icon"><i class="pi pi-inbox" style="font-size:48px;color:var(--text-muted)"></i></div>
    <div class="empty-state-title">{{ $t('bookDetail.notFound') }}</div>
    <RouterLink to="/books" class="btn btn-primary">
      <i class="pi pi-arrow-left"></i> {{ $t('common.back') }}
    </RouterLink>
  </div>

  <div v-else class="book-detail-page">
    <div class="page-back">
      <RouterLink to="/books" class="btn btn-ghost btn-sm btn-with-icon">
        <i class="pi pi-arrow-left"></i> {{ $t('common.back') }}
      </RouterLink>
    </div>

    <div class="book-detail-layout">
      <!-- Cover -->
      <div>
        <div class="book-detail-cover">
          <img v-if="book.HinhAnh" :src="book.HinhAnh" :alt="book.TenSach" />
          <div v-else class="book-detail-cover-ph">
            <i class="pi pi-book" style="font-size:64px;color:var(--text-muted)"></i>
          </div>
        </div>

        <!-- Copy stats -->
        <div class="copy-stats">
          <div class="copy-stat-item">
            <span class="copy-stat-val" :style="copyStats.SanSang > 0 ? 'color:var(--color-success)' : 'color:var(--color-danger)'">
              {{ copyStats.SanSang }}
            </span>
            <span class="copy-stat-lbl">Sẵn sàng</span>
          </div>
          <div class="copy-stat-item">
            <span class="copy-stat-val">{{ copyStats.DangMuon }}</span>
            <span class="copy-stat-lbl">Đang mượn</span>
          </div>
          <div class="copy-stat-item">
            <span class="copy-stat-val">{{ copyStats.total }}</span>
            <span class="copy-stat-lbl">Tổng bản</span>
          </div>
        </div>
      </div>

      <!-- Meta -->
      <div class="book-detail-meta">
        <!-- Categories -->
        <div class="book-detail-tags">
          <span v-for="cat in (book.TheLoaiIds || [])" :key="cat._id" :class="['badge', getCategoryBadgeClass(cat.TenTheLoai)]">
            {{ cat.TenTheLoai }}
          </span>
        </div>

        <h1 class="book-detail-title">{{ book.TenSach }}</h1>
        <div class="book-detail-authors">
          {{ (book.TacGia || []).join(' · ') }}
        </div>

        <!-- Stats row -->
        <div class="book-detail-stats">
          <div class="book-stat-item" v-if="book.NamXuatBan">
            <div class="book-stat-value">{{ book.NamXuatBan }}</div>
            <div class="book-stat-label">{{ $t('books.year') }}</div>
          </div>
          <div class="book-stat-item" v-if="book.NhaXuatBanId">
            <div class="book-stat-value" style="font-size:var(--font-size-md)">{{ book.NhaXuatBanId.TenNXB }}</div>
            <div class="book-stat-label">{{ $t('books.publisher') }}</div>
          </div>
          <div class="book-stat-item" v-if="book.DonGia">
            <div class="book-stat-value" style="font-size:var(--font-size-md)">{{ formatPrice(book.DonGia) }}</div>
            <div class="book-stat-label">{{ $t('books.price') }}</div>
          </div>
        </div>

        <!-- Description -->
        <div v-if="book.MoTa" class="book-description">
          <h3 style="font-weight:700;margin-bottom:var(--space-3);font-size:var(--font-size-md)">{{ $t('books.description') }}</h3>
          <p>{{ book.MoTa }}</p>
        </div>

        <!-- ─── Borrow CTA ─── -->
        <div class="borrow-cta">
          <!-- Not logged in -->
          <template v-if="!auth.isLoggedIn">
            <RouterLink to="/login" class="btn btn-primary btn-lg btn-with-icon">
              <i class="pi pi-lock"></i> {{ $t('books.loginToBorrow') }}
            </RouterLink>
          </template>

          <!-- Reader -->
          <template v-else-if="auth.isReader">
            <!-- Profile not verified -->
            <div v-if="!readerProfile || readerProfile.TrangThaiHoSo !== 'DaXacMinh'" class="borrow-cta-warn">
              <i class="pi pi-exclamation-triangle" style="font-size:18px"></i>
              <div>
                <div>{{ $t('books.notVerified') }}</div>
                <RouterLink to="/reader/profile" class="btn btn-sm btn-secondary btn-with-icon" style="margin-top:var(--space-3)">
                  <i class="pi pi-user"></i> {{ $t('profile.registerProfile') }}
                </RouterLink>
              </div>
            </div>

            <!-- No copies available -->
            <div v-else-if="copyStats.SanSang === 0" class="borrow-cta-warn">
              <i class="pi pi-ban" style="font-size:18px"></i>
              <span>{{ $t('books.unavailable') }}</span>
            </div>

            <!-- CTA: Two actions -->
            <div v-else class="borrow-cta-actions">
              <!-- Already in cart indicator -->
              <div v-if="cartStore.has(book._id)" class="in-cart-notice">
                <i class="pi pi-check-circle" style="color:var(--color-success)"></i>
                <span>Đã có trong <strong>{{ $t('nav.bookshelf') }}</strong></span>
                <RouterLink to="/reader/shelf" class="btn btn-sm btn-primary btn-with-icon">
                  <i class="pi pi-bookmark"></i> Xem tủ sách
                </RouterLink>
              </div>

              <template v-else>
                <!-- Borrow immediately (1 book) -->
                <button class="btn btn-primary btn-lg btn-with-icon" @click="showConfirmModal = true" :disabled="borrowing">
                  <i class="pi pi-bolt"></i>
                  {{ $t('books.borrow') }}
                </button>

                <!-- Add to shelf/cart -->
                <button class="btn btn-secondary btn-lg btn-with-icon" @click="addToShelf">
                  <i class="pi pi-bookmark"></i>
                  {{ $t('bookDetail.addShelf') }}
                </button>
              </template>
            </div>
          </template>
        </div>
      </div>
    </div>

    <!-- Confirmation Modal -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showConfirmModal" class="modal-overlay" @click.self="showConfirmModal = false">
          <div class="modal" style="max-width: 450px;">
            <div class="modal-header">
              <span class="modal-title">Xác nhận mượn sách</span>
              <button class="btn-icon" @click="showConfirmModal = false" :disabled="borrowing">
                <i class="pi pi-times"></i>
              </button>
            </div>
            <div class="modal-body">
              <p class="text-secondary text-sm mb-3">Bạn chuẩn bị tạo phiếu mượn cho tựa sách <strong>{{ book.TenSach }}</strong>.</p>
              <p class="text-secondary text-sm">Sau khi xác nhận, yêu cầu của bạn sẽ được gửi đến nhân viên để duyệt.</p>
            </div>
            <div class="modal-footer">
              <button class="btn btn-secondary" @click="showConfirmModal = false" :disabled="borrowing">Hủy bỏ</button>
              <button class="btn btn-primary btn-with-icon" @click="borrowNow" :disabled="borrowing">
                <div v-if="borrowing" class="spinner-sm"></div>
                <i v-else class="pi pi-check"></i>
                {{ borrowing ? 'Đang gửi...' : 'Xác nhận mượn' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth.store'
import { useBookCartStore } from '@/stores/bookCart.store'
import { bookService } from '@/services/books.service'
import { readerService } from '@/services/readers.service'
import { borrowService } from '@/services/borrows.service'
import { useToast } from '@/composables/useToast'
import { useCategoryColor } from '@/composables/useCategoryColor'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const auth = useAuthStore()
const cartStore = useBookCartStore()
const { success, error: toastError } = useToast()
const { getCategoryBadgeClass } = useCategoryColor()

const book = ref(null)
const loading = ref(true)
const copyStats = ref({ total: 0, SanSang: 0, DangMuon: 0, Pending: 0, HongMat: 0 })
const readerProfile = ref(null)
const borrowing = ref(false)
const showConfirmModal = ref(false)

function formatPrice(n) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n)
}

async function fetchBook() {
  loading.value = true
  try {
    const res = await bookService.getById(route.params.id)
    book.value = res.data.data
    copyStats.value = res.data.summary || {}
  } catch (_) {
    book.value = null
  } finally {
    loading.value = false
  }
}

async function fetchReaderProfile() {
  if (!auth.isReader) return
  try {
    const res = await readerService.getMyProfile()
    readerProfile.value = res.data.data
  } catch (_) {}
}

/** Mượn ngay – tạo phiếu mượn chỉ với 1 đầu sách, không cần chọn bản copy */
async function borrowNow() {
  borrowing.value = true
  try {
    await borrowService.create({ dauSachIds: [book.value._id] })
    success(t('bookshelf.borrowSuccess'), '')
    showConfirmModal.value = false
    router.push({ name: 'MyBorrows' })
  } catch (e) {
    toastError(t('common.error'), e.response?.data?.message || 'Không thể tạo phiếu mượn.')
  } finally {
    borrowing.value = false
  }
}

/** Thêm vào tủ sách (giỏ mượn) */
function addToShelf() {
  const added = cartStore.add({
    _id: book.value._id,
    TenSach: book.value.TenSach,
    TacGia: book.value.TacGia,
    HinhAnh: book.value.HinhAnh,
    SanSang: copyStats.value.SanSang,
  })
  if (added) {
    success(t('bookDetail.addShelfSuccess'), book.value.TenSach)
  }
}

onMounted(() => {
  fetchBook()
  fetchReaderProfile()
})
</script>

<style scoped>
.book-detail-page { display: flex; flex-direction: column; gap: var(--space-5); }
.page-back { margin-bottom: var(--space-2); }

.book-detail-cover {
  border-radius: var(--border-radius-xl);
  overflow: hidden;
  box-shadow: var(--shadow-lg);
  aspect-ratio: 3/4;
  background: linear-gradient(135deg, var(--brand-50), var(--brand-100));
  display: flex;
  align-items: center;
  justify-content: center;
}

.book-detail-cover img { width: 100%; height: 100%; object-fit: cover; }
.book-detail-cover-ph {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.copy-stats {
  display: flex;
  gap: var(--space-4);
  margin-top: var(--space-4);
  padding: var(--space-4);
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-lg);
}

.copy-stat-item { flex: 1; text-align: center; }
.copy-stat-val { display: block; font-size: var(--font-size-xl); font-weight: 800; color: var(--brand-600); }
.copy-stat-lbl { font-size: var(--font-size-xs); color: var(--text-muted); margin-top: 2px; }

.borrow-cta { margin-top: var(--space-4); }

/* Two-button CTA */
.borrow-cta-actions {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.borrow-cta-actions .btn-lg {
  justify-content: center;
  width: 100%;
}

/* Already in cart */
.in-cart-notice {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-4);
  background: rgba(34,197,94,.08);
  border: 1.5px solid rgba(34,197,94,.3);
  border-radius: var(--border-radius-lg);
  font-size: var(--font-size-sm);
  color: var(--text-primary);
  flex-wrap: wrap;
}

.in-cart-notice .btn { margin-left: auto; }

/* Warning */
.borrow-cta-warn {
  padding: var(--space-4);
  background: #fef9c3;
  border: 1px solid #fde047;
  border-radius: var(--border-radius-lg);
  font-size: var(--font-size-sm);
  color: #78350f;
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
}

[data-theme="dark"] .borrow-cta-warn {
  background: rgba(245,158,11,.1);
  border-color: rgba(245,158,11,.3);
  color: #fcd34d;
}
</style>
