import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'

// Lazy-loaded views
const HomeView         = () => import('@/views/public/HomeView.vue')
const BooksView        = () => import('@/views/public/BooksView.vue')
const BookDetailView   = () => import('@/views/public/BookDetailView.vue')
const LoginView        = () => import('@/views/auth/LoginView.vue')
const RegisterView     = () => import('@/views/auth/RegisterView.vue')
const LockedView       = () => import('@/views/auth/LockedView.vue')

// Reader
const ReaderDashboard  = () => import('@/views/reader/ReaderDashboard.vue')
const ReaderProfile    = () => import('@/views/reader/ReaderProfile.vue')
const MyBorrows        = () => import('@/views/reader/MyBorrows.vue')
const NotificationsView = () => import('@/views/reader/NotificationsView.vue')
const BookShelfView    = () => import('@/views/reader/BookShelfView.vue')

// Staff
const StaffDashboard   = () => import('@/views/staff/StaffDashboard.vue')
const BooksManage      = () => import('@/views/staff/BooksManage.vue')
const ReadersManage    = () => import('@/views/staff/ReadersManage.vue')
const BorrowsManage    = () => import('@/views/staff/BorrowsManage.vue')
const CategoriesManage = () => import('@/views/staff/CategoriesManage.vue')
const BookCopiesManage = () => import('@/views/staff/BookCopiesManage.vue')
const PublishersManage = () => import('@/views/staff/PublishersManage.vue')

// Admin
const AdminDashboard   = () => import('@/views/admin/AdminDashboard.vue')
const StaffManage      = () => import('@/views/admin/StaffManage.vue')

const routes = [
  // ── Public ──
  { path: '/',        name: 'Home',       component: HomeView,       meta: { layout: 'master' } },
  { path: '/books',   name: 'Books',      component: BooksView,      meta: { layout: 'master' } },
  { path: '/books/:id', name: 'BookDetail', component: BookDetailView, meta: { layout: 'master' } },

  // ── Auth ──
  { path: '/login',   name: 'Login',    component: LoginView,    meta: { layout: 'auth', guest: true } },
  { path: '/register', name: 'Register', component: RegisterView, meta: { layout: 'auth', guest: true } },
  { path: '/locked',  name: 'Locked',   component: LockedView,   meta: { layout: 'auth' } },

  // ── Reader ──
  {
    path: '/reader',
    meta: { requiresAuth: true, role: 'Reader', layout: 'dashboard' },
    children: [
      { path: '',        name: 'ReaderDashboard', component: ReaderDashboard },
      { path: 'profile', name: 'ReaderProfile',   component: ReaderProfile },
      { path: 'borrows', name: 'MyBorrows',        component: MyBorrows },
      { path: 'shelf',   name: 'BookShelf',         component: BookShelfView },
      { path: 'notifications', name: 'Notifications', component: NotificationsView },
    ]
  },

  // ── Staff ──
  {
    path: '/staff',
    meta: { requiresAuth: true, roles: ['Staff', 'Admin'], layout: 'dashboard' },
    children: [
      { path: '',          name: 'StaffDashboard',   component: StaffDashboard },
      { path: 'books',     name: 'BooksManage',      component: BooksManage },
      { path: 'readers',   name: 'ReadersManage',    component: ReadersManage },
      { path: 'borrows',   name: 'BorrowsManage',    component: BorrowsManage },
      { path: 'categories', name: 'CategoriesManage', component: CategoriesManage },
      { path: 'copies',    name: 'BookCopiesManage', component: BookCopiesManage },
      { path: 'publishers', name: 'PublishersManage', component: PublishersManage },
    ]
  },

  // ── Admin ──
  {
    path: '/admin',
    meta: { requiresAuth: true, roles: ['Admin'], layout: 'dashboard' },
    children: [
      { path: '',      name: 'AdminDashboard', component: AdminDashboard },
      { path: 'staff', name: 'StaffManage',    component: StaffManage },
    ]
  },

  // Fallback
  { path: '/:pathMatch(.*)*', redirect: '/' }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 })
})

// Navigation Guards
router.beforeEach((to, _from, next) => {
  const auth = useAuthStore()

  // Redirect logged-in users away from guest-only pages
  if (to.meta.guest && auth.isLoggedIn) {
    return next(getRoleHome(auth.role))
  }

  // Require authentication
  if (to.meta.requiresAuth && !auth.isLoggedIn) {
    return next({ name: 'Login', query: { redirect: to.fullPath } })
  }

  // Handle locked accounts
  if (auth.isLoggedIn) {
    if (auth.user?.accountStatus === 'BiKhoa' && to.name !== 'Locked') {
      return next({ name: 'Locked' })
    }
    if (auth.user?.accountStatus !== 'BiKhoa' && to.name === 'Locked') {
      return next(getRoleHome(auth.role))
    }
  }

  // Role-based access
  if (to.meta.role && auth.role !== to.meta.role) {
    return next(getRoleHome(auth.role))
  }

  if (to.meta.roles && !to.meta.roles.includes(auth.role)) {
    return next(getRoleHome(auth.role))
  }

  next()
})

function getRoleHome(role) {
  if (role === 'Admin')  return '/admin'
  if (role === 'Staff')  return '/staff'
  if (role === 'Reader') return '/reader'
  return '/'
}

export default router
