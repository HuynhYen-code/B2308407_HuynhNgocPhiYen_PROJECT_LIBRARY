<template>
  <div class="books-view">
    <!-- Header -->
    <div class="books-header">
      <h1 class="section-title">{{ $t('books.title') }}</h1>

      <!-- Search + Filters -->
      <div class="books-toolbar">
        <div class="search-input-wrapper books-search">
          <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            v-model="search"
            class="search-input"
            :placeholder="$t('books.search')"
            @input="debouncedFetch"
          />
        </div>

        <select v-model="selectedPublisher" class="form-select" style="width:180px" @change="fetchBooks">
          <option value="">{{ $t('books.publisher') }}: {{ $t('books.all') }}</option>
          <option v-for="p in publishers" :key="p._id" :value="p._id">{{ p.TenNXB }}</option>
        </select>

        <select v-model="selectedSort" class="form-select" style="width:180px" @change="fetchBooks">
          <option value="">Năm xuất bản mới nhất</option>
          <option value="popular">Lượt mượn nhiều nhất</option>
          <option value="priceAsc">Giá tăng dần</option>
          <option value="priceDesc">Giá giảm dần</option>
          <option value="nameAsc">Tên A-Z</option>
          <option value="nameDesc">Tên Z-A</option>
        </select>
      </div>
    </div>

    <!-- Category pills -->
    <div class="cat-pills-bar">
      <CategoryPill :label="$t('books.all')" :active="!selectedCategory" @click="selectCategory('')" />
      <CategoryPill 
        v-for="(category, index) in categories" 
        :key="category._id"
        :label="category.TenTheLoai"
        :index="index" 
        :active="selectedCategory === category._id"
        @click="selectCategory(category._id)"
      />
    </div>

    <!-- Books Grid -->
    <div v-if="loading" class="loading-spinner-wrapper"><div class="spinner"></div></div>
    <div v-else-if="books.length === 0" class="empty-state">
      <div class="empty-state-icon">📭</div>
      <div class="empty-state-title">{{ $t('books.noResults') }}</div>
      <div class="empty-state-desc">{{ $t('books.noResultsDesc') }}</div>
    </div>
    <div v-else class="book-grid book-grid-lg">
      <BookCard
        v-for="book in books"
        :key="book._id"
        :book="book"
        @click="router.push({ name: 'BookDetail', params: { id: book._id } })"
      />
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="pagination">
      <button class="page-btn" :disabled="page <= 1" @click="changePage(page - 1)">‹</button>
      <button
        v-for="p in visiblePages"
        :key="p"
        class="page-btn"
        :class="{ active: p === page }"
        @click="changePage(p)"
      >{{ p }}</button>
      <button class="page-btn" :disabled="page >= totalPages" @click="changePage(page + 1)">›</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { bookService } from '@/services/books.service'
import { categoryService } from '@/services/categories.service'
import { publisherService } from '@/services/publishers.service'
import BookCard from '@/components/cards/BookCard.vue'
import CategoryPill from '@/components/common/CategoryPill.vue'

const route = useRoute()
const router = useRouter()

const books = ref([])
const categories = ref([])
const publishers = ref([])
const loading = ref(true)
const search = ref(route.query.search || '')
const selectedCategory = ref(route.query.category || '')
const selectedPublisher = ref('')
const selectedSort = ref('')
const page = ref(1)
const totalPages = ref(1)

let debounceTimer = null

function debouncedFetch() {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => { page.value = 1; fetchBooks() }, 400)
}

async function fetchBooks() {
  loading.value = true
  try {
    const params = { page: page.value, limit: 12 }
    if (search.value) params.search = search.value
    if (selectedCategory.value) params.category = selectedCategory.value
    if (selectedPublisher.value) params.publisher = selectedPublisher.value
    if (selectedSort.value) params.sort = selectedSort.value

    const res = await bookService.getAll(params)
    books.value = res.data.data || []
    totalPages.value = res.data.pagination?.totalPages || 1
  } finally {
    loading.value = false
  }
}

function selectCategory(id) {
  selectedCategory.value = id
  page.value = 1
  fetchBooks()
}

function changePage(p) {
  page.value = p
  fetchBooks()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const visiblePages = computed(() => {
  const pages = []
  for (let i = Math.max(1, page.value - 2); i <= Math.min(totalPages.value, page.value + 2); i++) {
    pages.push(i)
  }
  return pages
})

onMounted(async () => {
  const [, catsRes, pubsRes] = await Promise.all([
    fetchBooks(),
    categoryService.getAll({ limit: 50 }),
    publisherService.getAll({ limit: 50 })
  ])
  categories.value = catsRes.data.data || []
  publishers.value = pubsRes.data.data || []
})
</script>

<style scoped>
.books-view { display: flex; flex-direction: column; gap: var(--space-5); }

.books-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: var(--space-4);
}

.books-toolbar {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.books-search { width: 300px; }

.cat-pills-bar {
  display: flex;
  gap: var(--space-2);
  flex-wrap: wrap;
}
</style>
