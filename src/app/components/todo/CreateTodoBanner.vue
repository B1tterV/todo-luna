<script setup lang="ts">
// Icons
import PlusIcon from '@/assets/icons/common/plus.svg'

const emit = defineEmits(['create'])

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
    <div
        class="create-todo-banner"
        @click="emit('create')"
    >
        <div class="create-todo-banner__info">
            <PlusIcon filled />
            <p>Новая задача</p>
        </div>
        <div class="keys-group">
            <div class="key-block">
                ctrl
            </div>
            <div class="key-block">
                d
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
.create-todo-banner {
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    border: 2px dashed var(--line);
    background: color-mix(var(--line) 15%, transparent);
    padding: 10px;
    border-radius: 10px;
    text-align: center;
    transition: all 0.3s ease;
    margin-top: 20px;

    &__info {
        display: flex;
        align-items: center;
        gap: 5px;

        svg {
            width: 22px;
            height: 22px;
        }
    }

    &:hover {
        border: 2px dashed var(--blue-main);
        background: color-mix(var(--blue-main) 10%, transparent);
    }
}
</style>