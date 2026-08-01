<template>
  <span class="badge" :class="colorClass">{{ label }}</span>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  value: { type: String, required: true },
  type: { type: String, default: 'borrow' } // borrow | reader | copy
})

const { t } = useI18n()

const config = computed(() => ({
  borrow: {
    ChoDuyet: { color: 'badge-yellow', label: t('borrows.statusValues.ChoDuyet') },
    DangMuon: { color: 'badge-blue', label: t('borrows.statusValues.DangMuon') },
    QuaHan: { color: 'badge-red', label: t('status.QuaHan', 'Quá hạn') },
    DaHoanTat: { color: 'badge-green', label: t('borrows.statusValues.DaHoanTat') },
    DaHuy: { color: 'badge-gray', label: t('borrows.statusValues.DaHuy') },
  },
  borrowDetail: {
    ChoGanBan:   { color: 'badge-gray',   label: t('dashboard.pendingApproval') },
    DangMuon:    { color: 'badge-blue',   label: t('borrows.statusValues.DangMuon') },
    SapDenHan:   { color: 'badge-yellow', label: t('status.SapDenHan', 'Sắp đến hạn') },
    QuaHan:      { color: 'badge-red',    label: t('status.QuaHan', 'Quá hạn') },
    DaTraDung:   { color: 'badge-green',  label: t('status.DaTraDung', 'Đã trả đúng hạn') },
    DaTraTre:    { color: 'badge-yellow', label: t('status.DaTraTre', 'Đã trả trễ') },
    DaHuy:       { color: 'badge-gray',   label: t('borrows.statusValues.DaHuy') },
  },
  reader: {
    ChuaXacMinh: { color: 'badge-yellow', label: t('dashboard.unverifiedProfile') },
    DaXacMinh: { color: 'badge-green', label: t('dashboard.verifiedProfile') },
    BiKhoa: { color: 'badge-red', label: t('status.BiKhoa', 'Bị khóa') },
  },
  copy: {
    SanSang: { color: 'badge-green', label: t('status.available') },
    DangMuon: { color: 'badge-blue', label: t('status.borrowed') },
    Pending: { color: 'badge-yellow', label: t('status.pending') },
    HongMat: { color: 'badge-red', label: t('status.damaged') },
  },
}))

const colorClass = computed(() => config.value[props.type]?.[props.value]?.color || 'badge-gray')
const label = computed(() => config.value[props.type]?.[props.value]?.label || props.value)
</script>
