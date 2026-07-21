<template>
  <div class="stellar-dropdown" @click.stop>
    <div class="dropdown-trigger" @click="toggle">
      <slot name="trigger"></slot>
    </div>
    <Transition name="dropdown">
      <div v-show="isOpen" class="dropdown-menu" @click.stop>
        <div
          v-for="option in options"
          :key="option.key"
          :class="['dropdown-item', { 'dropdown-divider': option.type === 'divider', 'dropdown-disabled': option.disabled }]"
          @click="handleSelect(option)"
        >
          <template v-if="option.type !== 'divider'">
            <span v-if="option.icon" class="item-icon">
              <component :is="option.icon" :size="16" />
            </span>
            <span class="item-label">{{ option.label }}</span>
          </template>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

interface DropdownOption {
  label?: string
  key: string
  type?: 'divider'
  disabled?: boolean
  icon?: any
}

defineProps<{
  options: DropdownOption[]
}>()

const emit = defineEmits<{
  select: [key: string]
}>()

const isOpen = ref(false)

const toggle = () => {
  isOpen.value = !isOpen.value
}

const handleSelect = (option: DropdownOption) => {
  if (option.type === 'divider' || option.disabled) return
  emit('select', option.key)
  isOpen.value = false
}

const handleClickOutside = (e: MouseEvent) => {
  const target = e.target as HTMLElement
  if (!target.closest('.stellar-dropdown')) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.stellar-dropdown {
  position: relative;
  display: inline-block;
}

.dropdown-trigger {
  cursor: pointer;
  display: inline-flex;
  align-items: center;
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  background: var(--stellar-bg-card);
  border: 1px solid var(--stellar-border);
  border-radius: 12px;
  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.12);
  padding: 6px;
  min-width: 180px;
  z-index: 1000;
  overflow: hidden;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border-radius: 8px;
  font-size: 13px;
  color: var(--stellar-text);
  transition: background 0.2s;
  margin: 2px;
  cursor: pointer;
}

.dropdown-item:hover {
  background: var(--stellar-bg-hover);
}

.dropdown-item:active {
  background: var(--stellar-bg-active);
}

.dropdown-divider {
  height: 1px;
  margin: 6px 8px;
  padding: 0;
  background: var(--stellar-border-light);
  cursor: default;
}

.dropdown-divider:hover {
  background: var(--stellar-border-light);
}

.dropdown-disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.dropdown-disabled:hover {
  background: transparent;
}

.item-icon {
  flex-shrink: 0;
  color: var(--stellar-text-secondary);
}

.dropdown-item:hover .item-icon {
  color: var(--stellar-text);
}

.item-label {
  flex: 1;
  text-align: left;
}

.dropdown-enter-active,
.dropdown-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px) scale(0.95);
}
</style>
