<script setup lang="ts">
// Icons
import CheckmarkIcon from '@/assets/icons/common/checkmark.svg'
// Types
import type { PropType } from 'vue'

export interface SelectOption {
  value: string
  label: string
  emoji?: string
}

const emit = defineEmits<{
  'update:modelValue': [value: string | string[]]
  'create': [value: string]
}>()

const props = defineProps({
  modelValue: { type: [String, Array] as PropType<string | string[]>, required: true },
  options: { type: Array as PropType<SelectOption[]>, required: true },
  placeholder: { type: String, default: 'Select...' },
  label: { type: String, default: null },
  disabled: { type: Boolean, default: false },
  multiple: { type: Boolean, default: false },
  canCreate: { type: Boolean, default: false },
})

const isOpen = ref(false)
const searchQuery = ref('')
const dropdownRef = ref<HTMLElement | null>(null)

// Get the current value - handle both single and multiple modes
const currentValue = computed(() => {
  if (props.multiple) {
    return Array.isArray(props.modelValue) ? props.modelValue : []
  }
  return typeof props.modelValue === 'string' ? props.modelValue : ''
})

const filteredOptions = computed(() => {
  if (!searchQuery.value) return props.options
  return props.options.filter(option =>
    option.label.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

const selectedLabels = computed(() => {
  if (props.multiple && Array.isArray(currentValue.value)) {
    return currentValue.value.map(value => {
      const option = props.options.find(opt => opt.value === value)
      return option?.emoji ? `${option.emoji} ${option.label}` : option?.label || ''
    }).join(', ')
  } else {
    const option = props.options.find(opt => opt.value === currentValue.value)
    return option?.emoji ? `${option.emoji} ${option.label}` : option?.label || ''
  }
})

const hasValue = computed(() => {
  if (props.multiple && Array.isArray(currentValue.value)) {
    return currentValue.value.length > 0
  }
  return currentValue.value !== ''
})

const isSelected = (value: string) => {
  if (props.multiple && Array.isArray(currentValue.value)) {
    return currentValue.value.includes(value)
  }
  return currentValue.value === value
}

const toggleOption = (option: SelectOption) => {
  if (props.multiple) {
    if (currentValue.value.includes(option.value)) {
      emit('update:modelValue', currentValue.value.filter(v => v !== option.value))
    } else {
      emit('update:modelValue', [...currentValue.value, option.value])
    }
  } else {
    emit('update:modelValue', option.value)
    isOpen.value = false
  }
  searchQuery.value = ''
}

const toggleDropdown = () => {
  if (props.disabled) return
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    searchQuery.value = ''
  }
}

const closeDropdown = () => {
  isOpen.value = false
  searchQuery.value = ''
}

const handleCreate = () => {
  if (searchQuery.value.trim()) {
    emit('create', searchQuery.value.trim())
    searchQuery.value = ''
    if (!props.multiple) {
      isOpen.value = false
    }
  }
}

const onClickOutside = (event: MouseEvent) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    closeDropdown()
  }
}

onMounted(() => {
  document.addEventListener('click', onClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', onClickOutside)
})

watch(isOpen, (newValue) => {
  if (newValue) {
    setTimeout(() => {
      const input = dropdownRef.value?.querySelector('input') as HTMLInputElement
      if (input) input.focus()
    }, 0)
  }
})
</script>

<template>
  <div
    class="base-select"
    :class="{ disabled }"
  >
    <label v-if="label">{{ label }}</label>
    <div
      ref="dropdownRef"
      class="base-select__wrapper"
    >
      <div
        class="base-select__trigger"
        :class="{ open: isOpen }"
        @click="toggleDropdown"
      >
        <div class="base-select__selected">
          <span
            v-if="!hasValue"
            class="base-select__placeholder"
          >
            {{ placeholder }}
          </span>
          <template v-else>
            <span
              v-if="multiple && Array.isArray(currentValue) && currentValue.length > 1"
              class="base-select__multiple-count"
            >
              {{ currentValue.length }} selected
            </span>
            <span
              v-else
              class="base-select__label"
            >
              {{ selectedLabels }}
            </span>
          </template>
        </div>
        <span class="base-select__arrow">
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M5 7.5L10 12.5L15 7.5"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </span>
      </div>

      <transition name="dropdown">
        <div
          v-if="isOpen"
          class="base-select__dropdown"
        >
          <input
            v-model="searchQuery"
            type="text"
            class="base-select__search"
            :placeholder="props.multiple ? 'Search...' : 'Search...'"
            @click.stop
            @keydown.enter.stop="handleCreate"
          >
          <div class="base-select__options">
            <div
              v-for="option in filteredOptions"
              :key="option.value"
              class="base-select__option"
              :class="{ selected: isSelected(option.value) }"
              @click.stop="toggleOption(option)"
            >
              <span
                v-if="option.emoji"
                class="base-select__option-emoji"
              >
                {{ option.emoji }}
              </span>
              <span class="base-select__option-label">{{ option.label }}</span>
              <span
                v-if="isSelected(option.value)"
                class="base-select__checkmark"
              >
                <CheckmarkIcon filled />
              </span>
            </div>
            <div
              v-if="canCreate && searchQuery && !filteredOptions.some(opt => opt.label.toLowerCase() === searchQuery.toLowerCase())"
              class="base-select__create"
              @click.stop="handleCreate"
            >
              <span class="base-select__create-icon">+</span>
              Create "{{ searchQuery }}"
            </div>
            <div
              v-if="filteredOptions.length === 0 && !searchQuery"
              class="base-select__empty"
            >
              No options available
            </div>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<style scoped lang="scss">
.base-select {
  display: block;

  label {
    @include NP-14-500;
    display: block;
    margin-bottom: 8px;
    color: var(--text-main);
  }

  &.disabled {
    opacity: 0.6;
    pointer-events: none;
  }

  &__wrapper {
    position: relative;
  }

  &__trigger {
    @include NP-16-400;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    border: 1px solid var(--line);
    border-radius: 8px;
    background: var(--gray);
    padding: 0 12px;
    height: 42px;
    cursor: pointer;
    transition: all 0.2s;

    &:hover,
    &.open {
      border-color: var(--blue-main);
    }

    &.open .base-select__arrow {
      transform: rotate(180deg);
    }
  }

  &__selected {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__placeholder {
    color: var(--placeholder);
  }

  &__label {
    color: var(--text-main);
  }

  &__multiple-count {
    @include NP-14-500;
    color: var(--blue-main);
  }

  &__arrow {
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--placeholder);
    transition: transform 0.2s;
    min-width: 20px;
  }

  &__dropdown {
    position: absolute;
    top: calc(100% + 4px);
    left: 0;
    right: 0;
    border: 1px solid var(--line);
    border-radius: 8px;
    background: var(--back-down);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 1000;
    max-height: 280px;
    display: flex;
    flex-direction: column;
  }

  &__search {
    @include NP-14-400;
    width: 100%;
    border: none;
    border-bottom: 1px solid var(--line);
    border-radius: 8px 8px 0 0;
    background: var(--gray);
    padding: 10px 12px;
    height: 40px;
    color: var(--text-main);
    outline: none;

    &::placeholder {
      color: var(--placeholder);
    }
  }

  &__options {
    @include scroll;
    overflow-y: auto;
    padding: 4px;
  }

  &__option {
    @include NP-14-400;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px;
    border-radius: 6px;
    cursor: pointer;
    transition: background 0.2s;
    color: var(--text-main);

    &:hover {
      background: var(--table-header);
    }

    &.selected {
      background: var(--blue-back);
      color: var(--blue-main);
    }
  }

  &__option-emoji {
    min-width: 20px;
  }

  &__checkmark {
    margin-left: auto;
    display: flex;
    align-items: center;
    justify-content: center;
    color: currentColor;
  }

  &__create {
    @include NP-14-400;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 10px;
    border-radius: 6px;
    cursor: pointer;
    transition: background 0.2s;
    color: var(--blue-main);

    &:hover {
      background: var(--table-header);
    }
  }

  &__create-icon {
    @include NP-16-500;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    border-radius: 4px;
    background: var(--blue-main);
    color: $white;
  }

  &__empty {
    @include NP-14-400;
    padding: 12px;
    text-align: center;
    color: var(--placeholder);
  }
}

.dropdown-enter-active,
.dropdown-leave-active {
  transition:
    opacity 0.2s,
    transform 0.2s;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
