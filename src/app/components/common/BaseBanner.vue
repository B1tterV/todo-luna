<script setup lang="ts">
// Icons
import CloseIcon from '@/assets/icons/common/close.svg'

const emit = defineEmits(['update:modelValue', 'close'])

const props = defineProps({
  modelValue: { type: Boolean, default: true },
  text: { type: String, required: true },
  emojy: { type: String, default: null },
  canClose: { type: Boolean, default: true }
})

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
    <Transition name="banner">
        <div v-if="proxyModelValue" class="base-banner">
            <span v-if="emojy" class="base-banner__emoji">{{ emojy }}</span>
            <p class="base-banner__text">{{ text }}</p>
            <div
                v-if="canClose"
                class="close-btn"
                @click="handleClose"
            >
                <CloseIcon filled />
            </div>
        </div>
    </Transition>
</template>

<style scoped lang="scss">
.base-banner {
    position: relative;
    display: flex;
    gap: 5px;
    border-radius: 10px;
    background: var(--gray);
    padding: 10px;
    overflow: hidden;

    span {
        font-size: 20px;
        flex-shrink: 0;
    }

    p {
        line-height: 18px;
        width: calc(100% - 50px);
        color: var(--placeholder);
        margin: 0;
    }
}

// Анимация баннера
.banner-enter-active,
.banner-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.banner-enter-from {
  opacity: 0;
  transform: scaleY(0);
  max-height: 0;
  padding-top: 0;
  padding-bottom: 0;
  margin: 0;
}

.banner-enter-to {
  opacity: 1;
  transform: scaleY(1);
  max-height: 100px;
  padding-top: 10px;
  padding-bottom: 10px;
  margin: 0;
}

.banner-leave-from {
  opacity: 1;
  transform: scaleY(1);
  max-height: 100px;
  padding-top: 10px;
  padding-bottom: 10px;
  margin: 0;
}

.banner-leave-to {
  opacity: 0;
  transform: scaleY(0);
  max-height: 0;
  padding-top: 0;
  padding-bottom: 0;
  margin: 0;
}
</style>