<template>
  <div class="home-view">
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="hero-content">
        <h1 class="hero-title">{{ $t('home.heroTitle') }}</h1>
        <p class="hero-subtitle">{{ $t('home.heroSubtitle') }}</p>
        <div class="hero-actions">
          <RouterLink to="/books" class="btn btn-white btn-lg">
            <i class="pi pi-search"></i>
             {{ $t('home.explore') }}
          </RouterLink>
          <RouterLink v-if="!auth.isLoggedIn" to="/register" class="btn btn-outline-white btn-lg">
            {{ $t('home.login') }}
          </RouterLink>
        </div>
      </div>
      <div class="hero-visual">
        <div class="hero-books-grid">
          <div v-for="(color, i) in heroColors" :key="i" class="hero-book-spine" :style="{ background: color }">
            <span>{{ heroTitles[i] }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Categories -->
    <section class="spacing-bottom">
      <div class="section-header">
        <h2 class="section-title">{{ $t('home.categories') }}</h2>
      </div>
      <div class="categories-strip">
        <div v-if="loadingCats" class="text-muted text-sm">⏳</div>
        <template v-else>
          <!-- Sử dụng CategoryPill bọc trong RouterLink custom -->
          <RouterLink
            v-for="(cat, index) in categories"
            :key="cat._id"
            :to="{ name: 'Books', query: { category: cat._id } }"
            custom
            v-slot="{ navigate }"
          >
            <CategoryPill
              :label="`${cat.TenTheLoai}`"
              :index="index"
              @click="navigate"
            />
          </RouterLink>
        </template>
      </div>
    </section>

    <!-- Recommended Books (Giao diện thẻ nền trắng) -->
    <section class="spacing-bottom">
      <div class="recommended-container">
        <div class="section-header recommended-header">
          <h2 class="section-title text-dark">{{ $t('home.recommended') }}</h2>
          <RouterLink to="/books" class="see-all-pill">{{ $t('home.seeAll') }} ›</RouterLink>
        </div>
        
        <div v-if="loadingBooks" class="loading-spinner-wrapper"><div class="spinner"></div></div>
        <div v-else-if="books.length === 0" class="empty-state">
          <div class="empty-state-icon">📭</div>
          <div class="empty-state-title">{{ $t('books.noResults') }}</div>
        </div>
        <div v-else class="book-grid recommended-grid">
          <BookCard
            v-for="book in books.slice(0, 4)"
            :key="book._id"
            :book="book"
            @click="goBook(book)"
          />
        </div>
      </div>
    </section>

    <!-- Latest Books -->
    <section>
      <div class="section-header">
        <h2 class="section-title">{{ $t('home.latestBooks') }}</h2>
        <RouterLink to="/books" class="see-all-btn">{{ $t('home.seeAll') }} →</RouterLink>
      </div>
      <div class="book-list-horizontal">
        <RouterLink
          v-for="book in books.slice(0, 5)"
          :key="'list-' + book._id"
          :to="{ name: 'BookDetail', params: { id: book._id } }"
          class="book-list-item"
        >
          <div class="book-list-cover">
            <img v-if="book.HinhAnh" :src="book.HinhAnh" :alt="book.TenSach" />
            <div v-else class="book-list-cover-ph">📘</div>
          </div>
          <div class="book-list-info">
            <div class="book-list-title">{{ book.TenSach }}</div>
            <div class="book-list-author">{{ (book.TacGia || []).join(', ') }}</div>
            <div class="book-list-cat">
              <span v-for="cat in (book.TheLoaiIds || [])" :key="cat._id" :class="['badge', getCategoryBadgeClass(cat.TenTheLoai)]" style="font-size:10px">
                {{ cat.TenTheLoai }}
              </span>
            </div>
          </div>
          <div class="book-list-year">{{ book.NamXuatBan || '—' }}</div>
        </RouterLink>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import { bookService } from '@/services/books.service'
import { categoryService } from '@/services/categories.service'
import { useCategoryColor } from '@/composables/useCategoryColor'
import BookCard from '@/components/cards/BookCard.vue'
import CategoryPill from '@/components/common/CategoryPill.vue'

const router = useRouter()
const auth = useAuthStore()
const { getCategoryBadgeClass } = useCategoryColor()
const books = ref([])
const categories = ref([])
const loadingBooks = ref(true)
const loadingCats = ref(true)

const heroColors = [
  'linear-gradient(135deg,#6366f1,#8b5cf6)',
  'linear-gradient(135deg,#f59e0b,#ef4444)',
  'linear-gradient(135deg,#10b981,#06b6d4)',
  'linear-gradient(135deg,#3b82f6,#6366f1)',
  'linear-gradient(135deg,#ec4899,#8b5cf6)',
]
const heroTitles = ['Tâm lý học', 'Văn học', 'Khoa học', 'Lịch sử', 'Nghệ thuật']


async function fetchData() {
  try {
    const [booksRes, catsRes] = await Promise.all([
      bookService.getAll({ limit: 12 }),
      categoryService.getAll({ limit: 20 })
    ])
    books.value = booksRes.data.data || []
    categories.value = catsRes.data.data || []
  } finally {
    loadingBooks.value = false
    loadingCats.value = false
  }
}

function goBook(book) {
  router.push({ name: 'BookDetail', params: { id: book._id } })
}

onMounted(fetchData)
</script>

<style scoped>
.home-view { max-width: 1200px; margin: 0 auto; padding-bottom: 40px; }
.spacing-bottom { margin-bottom: 48px; }

/* ─── Hero Section ─── */
.hero-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-8);
  margin-bottom: 48px;
}

.hero-content { flex: 1; max-width: 520px; }
.hero-visual { flex-shrink: 0; }

.hero-books-grid {
  display: flex;
  gap: 8px;
  align-items: flex-end;
  height: 160px;
}

.hero-book-spine {
  width: 36px;
  border-radius: 6px;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding-bottom: 8px;
  box-shadow: 0 4px 16px rgba(0,0,0,.25);
  writing-mode: vertical-rl;
  text-orientation: mixed;
  font-size: 10px;
  font-weight: 700;
  color: rgba(255,255,255,.85);
  letter-spacing: .04em;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  cursor: default;
  transition: transform 0.2s ease;
}

.hero-book-spine:nth-child(1) { height: 110px; }
.hero-book-spine:nth-child(2) { height: 140px; }
.hero-book-spine:nth-child(3) { height: 125px; }
.hero-book-spine:nth-child(4) { height: 155px; }
.hero-book-spine:nth-child(5) { height: 130px; }
.hero-book-spine:hover { transform: translateY(-6px); }

/* ─── Headers ─── */
.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}
.section-title { font-size: 20px; font-weight: 700; }
.see-all-btn { font-size: 14px; font-weight: 600; color: var(--text-muted); text-decoration: none; }
.see-all-btn:hover { color: var(--brand-500); }

/* ─── Categories Strip ─── */
.categories-strip {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

/* ─── RECOMMENDED SECTION (Giao diện mới giống hình) ─── */
.recommended-container {
  background-color: #ffffff; /* Nền trắng tinh */
  border-radius: 24px;       /* Bo góc lớn */
  padding: 32px;             /* Khoảng cách rộng rãi bên trong */
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.03); /* Đổ bóng siêu mượt */
  border: 1px solid #f1f5f9; /* Viền mờ */
}

/* Ghi đè màu chữ tiêu đề trong vùng nền trắng để luôn nổi bật */
.recommended-header .text-dark {
  color: #0f172a;
}

/* Nút See All phong cách mới (Pill) */
.see-all-pill {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background-color: #eff6ff; /* Nền xanh dương nhạt (blue-50) */
  color: #2563eb;           /* Chữ xanh dương đậm (blue-600) */
  padding: 6px 16px;
  border-radius: 9999px;
  font-size: 13px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.2s ease;
}

.see-all-pill:hover {
  background-color: #dbeafe; /* Đậm hơn một chút khi hover (blue-100) */
}

/* Đảm bảo hiển thị 4 cột sách giống trong hình */
.recommended-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
}

/* ─── Latest Books (Dạng danh sách ngang) ─── */
.book-list-horizontal {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.book-list-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  text-decoration: none;
  transition: all 0.2s ease;
}

.book-list-item:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  border-color: var(--brand-200);
  transform: translateX(4px);
}

.book-list-cover {
  width: 48px;
  height: 64px;
  border-radius: 6px;
  overflow: hidden;
  flex-shrink: 0;
  background: var(--brand-50);
}

.book-list-cover img { width: 100%; height: 100%; object-fit: cover; }
.book-list-cover-ph {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  background: linear-gradient(135deg, var(--brand-100), var(--brand-200));
}

.book-list-info { flex: 1; min-width: 0; }
.book-list-title { font-weight: 600; color: var(--text-primary); font-size: 14px; margin-bottom: 3px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.book-list-author { font-size: 12px; color: var(--text-muted); margin-bottom: 5px; }
.book-list-cat { display: flex; gap: 4px; flex-wrap: wrap; }
.book-list-year { font-size: 14px; font-weight: 600; color: var(--text-muted); flex-shrink: 0; }

/* ─── Responsive ─── */
@media (max-width: 1024px) {
  .recommended-grid { grid-template-columns: repeat(3, 1fr); }
}

@media (max-width: 768px) {
  .hero-visual { display: none; }
  .recommended-container { padding: 20px; border-radius: 16px; }
  .recommended-grid { grid-template-columns: repeat(2, 1fr); gap: 16px; }
}

@media (max-width: 480px) {
  .recommended-grid { grid-template-columns: 1fr; }
}
</style>