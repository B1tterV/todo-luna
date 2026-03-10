<script setup lang="ts">

const emit = defineEmits(["update:modelValue"])

const props = defineProps({
  inputId: { type: String, default: null },
  modelValue: { type: String, required: true },
  type: { type: String, default: "text" },
  placeholder: { type: String, default: null },
  disabled: { type: Boolean, default: false },
  readonly: { type: Boolean, default: false },
  autofocus: { type: Boolean, default: false },
  autocomplete: { type: String, default: "off" },
  label: { type: String, default: null },
  errorText: { type: String, default: null },
  icon: { type: String, default: null },
  iconFilled: { type: Boolean, default: true },
  name: { type: String, default: null },
})

const proxyModelValue = computed({
  get() {
    return props.modelValue
  },
  set(newValue) {
    emit("update:modelValue", newValue)
  }
})

const wrapperRef = ref<HTMLElement | null>(null)
const isFocused = ref<boolean>(false)

const onInputFocus = () => {
  isFocused.value = true
}

const onInputBlur = () => {
  isFocused.value = false
}

// Фокус на input при клике на wrapper
const onWrapperClick = () => {
  if (props.disabled) return
  const input = document.getElementById(props.inputId) as HTMLInputElement
  if (input) input.focus()
}

onMounted(() => {
  if (props.autofocus && wrapperRef.value) {
    onWrapperClick()
  }
})
</script>

<template>
    <div
        class="base-input"
        :class="{ error: errorText }"
    >
        <label :for="inputId">{{ label }}</label>
        <div
            ref="wrapperRef"
            class="base-input__wrapper"
            :class="{ 
                disabled: disabled,
                focused: isFocused 
            }"
            @click="onWrapperClick"
        >
            <component
                :is='icon'
                v-if="icon"
                class="left-icon"
                :filled="iconFilled"
            />
            <input
                :id="inputId"
                v-model="proxyModelValue"
                :name="name"
                :type="type"
                :placeholder="placeholder"
                :disabled="disabled"
                :readonly="readonly"
                :autofocus="autofocus"
                :autocomplete="autocomplete"
                @focus="onInputFocus"
                @blur="onInputBlur"
            >
            <slot name="icon-button" />
        </div>
        <span
            v-if="errorText"
            class="error-message"
        >
            {{ errorText }}
        </span>
    </div>
</template>

<style scoped lang="scss">
.base-input {
    label {
        @include NP-14-500;
        display: block;
        margin-bottom: 8px;
        color: var(--text-main);
    }
    &__wrapper{
        position: relative;
        display: flex;
        align-items: center;
        gap: 14px;
        border: 1px solid var(--line);
        border-radius: 8px;
        background: var(--gray);
        padding: 0 12px;
        height: 42px;
        width: 100%;

        &.focused {
            outline: none;
            border-color: var(--blue-main);
        }

        .disabled {
            opacity: 0.6;
            cursor: not-allowed;
        }

        .left-icon {
            left: 16px;
            color: var(--placeholder);
            transition: color 0.2s;
            min-width: 20px;
            min-height: 20px;
        }

        .right-icon {
            cursor: pointer;
        }

        input {
            @include NP-16-400;
            width: 100%;
            color: var(--text-main);
            transition: all 0.2s;
            background: transparent;
            

            &::placeholder {
                color: var(--placeholder);
            }

            &:disabled {
                opacity: 0.6;
                cursor: not-allowed;
            }
        }
    }
    .error-message {
        @include NP-14-400;
        display: block;
        margin-top: 8px;
        color: var(--red);
    }
}
</style>