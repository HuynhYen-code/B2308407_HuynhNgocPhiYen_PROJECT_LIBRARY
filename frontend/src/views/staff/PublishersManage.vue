<template>
  <div class="publishers-manage">
    <div class="section-header" style="margin-bottom:var(--space-5)">
      <h1 class="section-title">{{ $t('nav.publishers') }}</h1>
      <div class="flex items-center gap-3">
        <div class="search-input-wrapper" style="width: 250px">
          <AppIcon name="search" :size="16" class="search-icon" />
          <input v-model="searchQuery" class="search-input" placeholder="Tìm kiếm nhà xuất bản..." />
        </div>
        <button class="btn btn-primary btn-with-icon" @click="openCreate">
          <AppIcon name="plus" :size="16" /> {{ $t('common.add') }}
        </button>
      </div>
    </div>
    <div class="data-table-wrapper">
      <table class="data-table">
        <thead><tr><th>{{ $t('publishersManage.name') }}</th><th>{{ $t('publishersManage.address') }}</th><th>{{ $t('common.actions') }}</th></tr></thead>
        <tbody>
          <tr v-if="loading"><td colspan="3" class="text-center"><div class="spinner" style="margin:auto;width:24px;height:24px"></div></td></tr>
          <tr v-else-if="filteredItems.length===0"><td colspan="3" class="text-center text-muted">{{ $t('common.noData') }}</td></tr>
          <tr v-for="item in filteredItems" :key="item._id" v-else>
            <td class="font-semibold text-sm">{{ item.TenNXB }}</td>
            <td class="text-sm text-muted">{{ item.DiaChi || '—' }}</td>
            <td><div class="flex gap-2">
              <button class="btn btn-secondary btn-sm btn-icon-only" :title="$t('common.edit')" @click="openEdit(item)"><AppIcon name="pencil" :size="15" /></button>
              <button v-if="auth.isAdmin" class="btn btn-danger btn-sm btn-icon-only" :title="$t('common.delete')" @click="deleteItem(item)"><AppIcon name="trash" :size="15" /></button>
            </div></td>
          </tr>
        </tbody>
      </table>
    </div>
    <Teleport to="body"><Transition name="fade">
      <div v-if="showModal" class="modal-overlay" @click.self="showModal=false">
        <div class="modal">
          <div class="modal-header"><span class="modal-title">{{ editingItem ? $t('publishersManage.edit') : $t('publishersManage.add') }}</span><button class="btn-icon" @click="showModal=false"><AppIcon name="x-mark" :size="16" /></button></div>
          <div class="modal-body">
            <div class="form-group mb-4"><label class="form-label">{{ $t('publishersManage.name') }} *</label><input v-model="form.TenNXB" class="form-input" /></div>
            <div class="form-group"><label class="form-label">{{ $t('publishersManage.address') }}</label><input v-model="form.DiaChi" class="form-input" /></div>
            <div v-if="formError" class="form-error mt-2"><i class="pi pi-exclamation-circle"></i> {{ formError }}</div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" @click="showModal=false">{{ $t('common.cancel') }}</button>
            <button class="btn btn-primary btn-with-icon" @click="save" :disabled="saving">
              <div v-if="saving" class="spinner-sm"></div>
              <i v-else class="pi pi-check"></i>
              {{ saving ? $t('common.loading') : $t('common.save') }}
            </button>
          </div>
        </div>
      </div>
    </Transition></Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth.store'
import { publisherService } from '@/services/publishers.service'
import { useToast } from '@/composables/useToast'

import AppIcon from '@/components/common/AppIcon.vue'
import { useI18n } from 'vue-i18n'
const auth = useAuthStore()
const { success, error: toastError } = useToast()
const { t } = useI18n()
const items = ref([])
const searchQuery = ref('')
const filteredItems = computed(() => {
  if (!searchQuery.value) return items.value
  const q = searchQuery.value.toLowerCase()
  return items.value.filter(i => 
    i.TenNXB.toLowerCase().includes(q) || 
    (i.DiaChi && i.DiaChi.toLowerCase().includes(q))
  )
})
const loading = ref(true)
const showModal = ref(false)
const editingItem = ref(null)
const saving = ref(false)
const formError = ref('')
const form = ref({ TenNXB: '', DiaChi: '' })

async function fetchItems() { loading.value=true; try { const r=await publisherService.getAll({limit:100}); items.value=r.data.data||[] } finally { loading.value=false } }
function openCreate() { editingItem.value=null; form.value={TenNXB:'',DiaChi:''}; formError.value=''; showModal.value=true }
function openEdit(item) { editingItem.value=item; form.value={TenNXB:item.TenNXB,DiaChi:item.DiaChi||''}; formError.value=''; showModal.value=true }
async function save() {
  if (!form.value.TenNXB) { formError.value = t('publishersManage.nameRequired'); return }
  saving.value=true; formError.value=''
  try {
    if (editingItem.value) { await publisherService.update(editingItem.value._id, form.value); success(t('publishersManage.updateSuccess'),'') }
    else { await publisherService.create(form.value); success(t('publishersManage.addSuccess'),'') }
    showModal.value=false; fetchItems()
  } catch(e) { formError.value=e.response?.data?.message||t('common.error'); toastError(t('common.error'),formError.value) }
  finally { saving.value=false }
}
async function deleteItem(item) {
  if (!confirm(`${t('publishersManage.confirmDelete')} "${item.TenNXB}"?`)) return
  try { await publisherService.remove(item._id); success(t('publishersManage.deleteSuccess'),''); fetchItems() }
  catch(e) { toastError(t('common.error'), e.response?.data?.message||'') }
}
onMounted(fetchItems)
</script>
