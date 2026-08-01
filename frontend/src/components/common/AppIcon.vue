<template>
  <i
    :class="['pi', `pi-${piName}`, sizeClass]"
    :style="sizeStyle"
    aria-hidden="true"
    v-bind="$attrs"
  />
</template>

<script setup>
import { computed } from 'vue'

defineOptions({ inheritAttrs: false })

const props = defineProps({
  name:        { type: String, required: true },
  size:        { type: [String, Number], default: 16 },
  strokeWidth: { type: [String, Number], default: 1.75 }, // kept for API compatibility
  fill:        { type: Boolean, default: false },           // kept for API compatibility
})

// ── Map our semantic names → PrimeIcons names ──────────────────
const iconMap = {
  // Navigation
  'home':               'home',
  'book-open':          'book-open',
  'book-closed':        'book',
  'library':            'building',
  'clipboard':          'clipboard',
  'users':              'users',
  'user':               'user',
  'user-circle':        'user-circle',
  'tag':                'tag',
  'office':             'building',
  'briefcase':          'briefcase',
  'chart-bar':          'chart-bar',
  'cog':                'cog',
  'logout':             'sign-out',
  'bell':               'bell',

  // Actions
  'plus':               'plus',
  'pencil':             'pencil',
  'trash':              'trash',
  'check':              'check',
  'x-mark':             'times',
  'search':             'search',
  'eye':                'eye',
  'eye-off':            'eye-slash',
  'lock':               'lock',
  'lock-open':          'lock-open',
  'refresh':            'refresh',
  'back':               'arrow-left',
  'filter':             'filter',
  'download':           'download',
  'chevronDown':        'chevron-down',
  'chevronRight':       'chevron-right',
  'sort-asc':           'sort-amount-up',
  'sort-desc':          'sort-amount-down',
  'external-link':      'external-link',
  'share':              'share-alt',
  'print':              'print',

  // Theme / Locale
  'sun':                'sun',
  'moon':               'moon',
  'globe':              'globe',

  // Status / Feedback
  'check-circle':       'check-circle',
  'x-circle':           'times-circle',
  'exclamation':        'exclamation-triangle',
  'exclamation-circle': 'exclamation-circle',
  'info':               'info-circle',
  'warning':            'exclamation-triangle',
  'shield-check':       'shield',

  // Misc
  'collection':         'list',
  'duplicate':          'copy',
  'calendar':           'calendar',
  'currency':           'dollar',
  'star':               'star',
  'star-fill':          'star-fill',
  'heart':              'heart',
  'send':               'send',
  'inbox':              'inbox',
  'id-card':            'id-card',
  'address-book':       'address-book',
  'phone':              'phone',
  'map-marker':         'map-marker',
}

const piName = computed(() => iconMap[props.name] ?? props.name)

// Convert numeric size → font-size style
const sizeStyle = computed(() => ({
  fontSize: typeof props.size === 'number' ? `${props.size}px` : props.size,
  lineHeight: 1,
  display: 'inline-flex',
  alignItems: 'center',
  flexShrink: 0,
}))

const sizeClass = computed(() => '')
</script>
