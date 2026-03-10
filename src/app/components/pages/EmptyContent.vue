<script setup lang="ts">
// Components
import BaseBanner from '~/components/common/BaseBanner.vue';

const emit = defineEmits(['create'])

defineProps({
  title: { type: String, required: true },
  bannerText: { type: String, default: null },
  canCloseBanner: { type: Boolean, default: false },
  actionText: { type: String, default: null },
})

// Handle keyboard shortcut Ctrl+D
const handleKeyDown = (event: KeyboardEvent) => {
  // Не срабатываем на input/textarea элементах
  const target = event.target as HTMLElement
  if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
    return
  }
  
  if (event.ctrlKey && (
    event.key.toLowerCase() === 'd' ||
    event.key.toLowerCase() === 'в')
  ) {
    event.preventDefault()
    emit('create')
  }
}

onMounted(async () => {
  await nextTick()
  document.addEventListener('keydown', handleKeyDown)
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleKeyDown)
})
</script>

<template>
    <div class="empty-content">
        <div class="empty-content__title"> {{ title }} </div>
        <BaseBanner
            v-if="bannerText"
            emojy="📕"
            :text="bannerText"
            :can-close="canCloseBanner"
            class="empty-content__banner"
        />
        <div
            v-if="actionText"
            class="crete-task"
            @click="emit('create')"
        >
            <p>{{ actionText }}</p>
            <slot name="keys">
              <div class="keys-group">

                <div class="key-block">
                  ctrl
                </div>
                <div class="key-block">
                  d
                </div>
              </div>
            </slot>
        </div>
    </div>
</template>

<style scoped lang="scss">
.empty-content {
    text-align: center;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 20px;
    height: 100%;
    &__title {
        @include NP-28-500;
    }

    .crete-task {
        cursor: pointer;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 10px;
        border: 2px dashed var(--line);
        background: color-mix(var(--line) 15%, transparent);
        padding: 20px;
        border-radius: 10px;
        text-align: center;
        transition: all 0.3s ease;
        min-height: 200px;

        p {
            @include NP-16-500;
            transition: all 0.3s ease;
            color: var(--placeholder);
        }

        &:hover {
            border: 2px dashed var(--blue-main);
            background: color-mix(var(--blue-main) 10%, transparent);

            p {
                color: var(--blue-main);
            }
        }
    }
}
</style>