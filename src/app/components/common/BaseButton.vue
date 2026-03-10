<script setup lang="ts">
export type ButtonTypes = "button" | "submit" | "reset" 
export type ButtonStyles = "filled" | "outlined"
export type ButtonSize = "xs" | "sm" | "md"
export type ButtonColor = "default" | "red" | "gray"

const props = defineProps({
  disabled: { type: Boolean, default: false },
  type: { type: String as PropType<ButtonTypes>, default: "button" },
  isLoading: { type: Boolean, default: false },
  name: { type: String, default: "" },
  buttonStyle: { type: String as PropType<ButtonStyles>, default: "filled" },
  size: { type: String as PropType<ButtonSize>, default: "sm" },
  color: { type: String as PropType<ButtonColor>, default: "default" }
})

/**
 * Добавляем классы кнопке
 */
const buttonClasses = computed(() => {
  return [
    { filled: props.buttonStyle === "filled" },
    { outlined: props.buttonStyle === "outlined" },
    `base-button--${props.size}`,
    `base-button--${props.color || 'default'}`
  ]
})
</script>

<template>
    <button 
        :type="type" 
        class="base-button"
        :class="buttonClasses"
        :disabled="disabled || isLoading"
    >
        <slot>
            <span v-if="!isLoading">{{ name }}</span>
            <span v-else class="loader"/>
        </slot>
    </button>
</template>

<style scoped lang="scss">
@keyframes spin {
  to { transform: rotate(360deg); }
}

.base-button {
    @include NP-14-400;
    display: flex;
    align-items: center;
    gap: 14px;
    justify-content: center;
    width: 100%;
    padding: 10px 24px;
    border: none;
    border-radius: 8px;
    background: transparent;
    color: $white;
    cursor: pointer;
    transition: background 0.2s;


    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    :deep(.loader) {
      display: inline-block;
      width: 20px;
      height: 20px;
      border: 2px solid white;
      border-bottom-color: transparent;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    :deep(svg) {
        width: 20px;
        height: 20px;
    }

    // Colors
    &--default {
      &.filled {
        background: var(--blue-main);
        color: $white;
        &:hover:not(:disabled) {
          background: var(--blue-main-hover);
        }
      }
  
      &.outlined {
        border: 1px solid var(--blue-main);
        transition: background 0.6s;
        color: var(--text-main);
        &:hover:not(:disabled) {
          background: var(--blue-main-hover);
          color: $white;
        }
      }
    }

    &--gray {
      &.filled {
        background: var(--gray);
        color: var(--text-color);
        &:hover:not(:disabled) {
          background: var(--table-header);
        }
      }
  
      &.outlined {
        border: 1px solid var(--gray);
        transition: background 0.6s;
        color: var(--text-main);
        &:hover:not(:disabled) {
          background: var(--table-header);
          color: var(--text-main);
        }
      }
    }

    &--red {
      &.filled {
        background: var(--red);
        &:hover:not(:disabled) {
          opacity: 0.8;
        }
      }
  
      &.outlined {
        border: 1px solid var(--red);
        transition: background 0.6s;
        color: var(--red);
        &:hover:not(:disabled) {
          opacity: 0.8;
        }
      }
    }

    // Sizes
    &--xs {
      height: 36px;
    }

    &--sm {
      height: 40px;
    }

    &--md {
      height: 50px;
    }
}
</style>