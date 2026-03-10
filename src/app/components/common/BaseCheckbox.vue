<script setup lang="ts">
const emit = defineEmits(["update:modelValue"])

const props = defineProps({
  text: { type: String, default: null },
  modelValue: { type: Boolean, required: true },
  disabled: { type: Boolean, default: false },
})

const proxyModelValue = computed({
  get() {
    return props.modelValue
  },
  set(newValue) {
    emit("update:modelValue", newValue)
  }
})
</script>

<template>
    <label
        class="base-checkbox"
        :class="{ disabled }"
    >
        <input
            v-model="proxyModelValue"
            type="checkbox"
            :disabled="disabled"
        >
        <span class="checkmark"/>
        <span v-if="text" class="base-checkbox__text">{{ text }}</span>
    </label>
</template>

<style scoped lang="scss">
.base-checkbox {
    @include NP-14-400;
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    color: var(--text-main);

    &.disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    input[type="checkbox"] {
        display: none;
    }

    .checkmark {
        width: 18px;
        height: 18px;
        border: 2px solid var(--line);
        border-radius: 4px;
        position: relative;
        transition: all 0.2s;
        flex-shrink: 0;

        &::after {
            content: '';
            position: absolute;
            display: none;
            left: 5px;
            top: 2px;
            width: 4px;
            height: 8px;
            border: solid white;
            border-width: 0 2px 2px 0;
            transform: rotate(45deg);
        }
    }

    input:checked + .checkmark {
        background: var(--blue-main);
        border-color: var(--blue-main);

        &::after {
            display: block;
        }
    }

    &__text {
      user-select: none;
      transition: all 0.2s;
    }

    input:checked ~ .base-checkbox__text {
      text-decoration: line-through;
      opacity: 0.6;
    }
}
</style>