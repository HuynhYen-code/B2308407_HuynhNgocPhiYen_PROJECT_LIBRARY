<template>
  <div class="admin-dashboard">
    <div class="profile-header" style="margin-bottom:var(--space-6)">
      <div class="profile-avatar-lg" style="background:rgba(255,255,255,.2);font-size:18px"><i class="pi pi-cog" style="color:#fff"></i></div>
      <div>
        <div class="profile-name">{{ $t('adminDashboard.title') }}</div>
        <div class="profile-role-badge"><i class="pi pi-key" style="font-size:12px"></i> Administrator</div>
      </div>
    </div>

    <div class="stats-grid">
      <div class="stat-card"><div class="stat-card-header"><div class="stat-card-icon blue"><i class="pi pi-book"></i></div><span class="stat-card-label">{{ $t('adminDashboard.books') }}</span></div><div class="stat-card-value">{{ stats.books }}</div></div>
      <div class="stat-card"><div class="stat-card-header"><div class="stat-card-icon green"><i class="pi pi-users"></i></div><span class="stat-card-label">{{ $t('adminDashboard.readers') }}</span></div><div class="stat-card-value">{{ stats.readers }}</div></div>
      <div class="stat-card"><div class="stat-card-header"><div class="stat-card-icon purple"><i class="pi pi-briefcase"></i></div><span class="stat-card-label">{{ $t('adminDashboard.staff') }}</span></div><div class="stat-card-value">{{ stats.staff }}</div></div>
      <div class="stat-card"><div class="stat-card-header"><div class="stat-card-icon yellow"><i class="pi pi-clipboard"></i></div><span class="stat-card-label">{{ $t('adminDashboard.activeBorrows') }}</span></div><div class="stat-card-value">{{ stats.active }}</div></div>
    </div>

    <div style="margin-top:var(--space-6)" class="flex gap-4 flex-wrap">
      <RouterLink to="/staff/books" class="btn btn-primary btn-with-icon"><i class="pi pi-book"></i> {{ $t('adminDashboard.manageBooks') }}</RouterLink>
      <RouterLink to="/staff/readers" class="btn btn-secondary btn-with-icon"><i class="pi pi-users"></i> {{ $t('adminDashboard.manageReaders') }}</RouterLink>
      <RouterLink to="/admin/staff" class="btn btn-secondary btn-with-icon"><i class="pi pi-briefcase"></i> {{ $t('adminDashboard.manageStaff') }}</RouterLink>
      <RouterLink to="/staff/borrows" class="btn btn-secondary btn-with-icon"><i class="pi pi-clipboard"></i> {{ $t('adminDashboard.manageBorrows') }}</RouterLink>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { bookService } from '@/services/books.service'
import { readerService } from '@/services/readers.service'
import { staffService } from '@/services/staff.service'
import { borrowService } from '@/services/borrows.service'

const stats = ref({ books: 0, readers: 0, staff: 0, active: 0 })

onMounted(async () => {
  try {
    const [b,r,s,a] = await Promise.all([
      bookService.getAll({limit:1}),
      readerService.getAll({limit:1}),
      staffService.getAll({limit:1}),
      borrowService.getAll({trangThai:'DangMuon',limit:1}),
    ])
    stats.value = { books: b.data.pagination?.total||0, readers: r.data.pagination?.total||0, staff: s.data.data?.length||0, active: a.data.pagination?.total||0 }
  } catch(_) {}
})
</script>
