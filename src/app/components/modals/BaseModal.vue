<script setup lang="ts">
// Icons
import CloseIcon from '@/assets/icons/common/close.svg'

import { useVisualViewport } from '@/composables/useVisualViewport'

const emit = defineEmits(['update:modelValue', 'close'])

const props = defineProps({
  modelValue: { type: Boolean, default: true },
  title: { type: String, default: null }
})

const { viewportHeight } = useVisualViewport()

const proxyModelValue = computed({
  get() {
    return props.modelValue
  },
  set(newValue) {
    emit("update:modelValue", newValue)
  }
})

/**
 * Закрытие баннера
 */
 const handleClose = () => {
    proxyModelValue.value = false
    emit('close')
}
</script>

<template>
    <Teleport to="body">
        <transition name="modal-backdrop" appear>
            <div
                v-if="proxyModelValue"
                class="base-modal"
                :style="{ height: viewportHeight }" 
                @keyup.esc="handleClose()"
            >
                <transition name="modal-content" appear>
                    <div
                        v-click-outside="() => handleClose()"
                        class="base-modal__content"
                    >
                        <div
                            v-if="title"
                            class="title"
                        >
                            {{ title }}
                        </div>
                        <div
                            class="close-btn"
                            @click="handleClose()"
                        >
                            <CloseIcon filled />
                        </div>
                        <slot />
                    </div>
                </transition>
            </div>
        </transition>
    </Teleport>
</template>

<style scoped lang="scss">
.modal-backdrop-enter-active,
.modal-backdrop-leave-active {
    transition: opacity 0.3s ease;
}

.modal-backdrop-enter-from,
.modal-backdrop-leave-to {
    opacity: 0;
}

.modal-content-enter-active,
.modal-content-leave-active {
    transition:
        opacity 0.3s ease,
        transform 0.3s ease;
}

.modal-content-enter-from,
.modal-content-leave-to {
    opacity: 0;
    transform: scale(0.95) translateY(-20px);
}

.base-modal {
    position: fixed;
    top: 0;
    left: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100dvw;
    height: 100dvh;
    background: rgba(0, 0, 0, 0.2);
    z-index: 100;
    overflow: hidden;

    &__content {
        position: relative;
        padding: 15px 20px;
        background: var(--white);
        border-radius: 10px;

        .title {
            @include NP-18-500;
            width: calc(100% - 50px);
            margin-bottom: 20px;
        }
        
        .close-btn {
            top: 10px;
            right: 10px;
        }
    }

    @media (max-width: $breakpoint-xs) {
        align-items: flex-end;

        &__content {
            width: 100%;
            margin-bottom: 0;
            transition: transform 0.3s ease;
            transform: translateY(0) scale(1);
            .title {
                text-align: center;
            }

            width: 100%;
            border-radius: 20px 20px 0 0;
            padding-bottom: 40px;

            :deep(.base-input) {
                width: 100%;
                min-width: auto;
            }
            :deep(.base-button) {
                width: 100%;
                min-width: auto;
            }
            :deep(.base-select) {
                width: 100%;
                min-width: auto;
            }
        }
    }
}

@media (max-width: $breakpoint-xs) {
    .modal-content-enter-from,
    .modal-content-leave-to {
        opacity: 0;
        transform: scale(0.95) translateY(40px);
    }
}
</style>