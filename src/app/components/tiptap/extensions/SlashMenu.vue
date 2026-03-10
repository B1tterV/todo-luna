<script setup lang="ts">
const props = defineProps<{
  items: any[]
  command: (item: any) => void
}>()

const selectedIndex = ref(0)

watch(() => props.items, () => { selectedIndex.value = 0 })

const onKeyDown = ({ event }: { event: KeyboardEvent }) => {
  if (event.key === 'ArrowUp') {
    selectedIndex.value = (selectedIndex.value + props.items.length - 1) % props.items.length
    return true
  }
  if (event.key === 'ArrowDown') {
    selectedIndex.value = (selectedIndex.value + 1) % props.items.length
    return true
  }
  if (event.key === 'Enter') {
    props.command(props.items[selectedIndex.value])
    return true
  }
  return false
}

defineExpose({ onKeyDown })
</script>

<template>
  <div class="slash-menu">
    <button
      v-for="(item, index) in items"
      :key="index"
      class="slash-menu-item"
      :class="{ 'is-selected': index === selectedIndex }"
      @click="command(item)"
    >
      <component :is="item.icon" class="icon" />
      <div class="content">
        <div class="label">{{ item.label }}</div>
        <div class="description">{{ item.description }}</div>
      </div>
    </button>
  </div>
</template>

<style lang="scss">
.slash-menu-root {
  @media (max-width: $breakpoint-xs) {
    position: fixed !important;
    top: 42px !important; /* Убедитесь, что это значение вам подходит */
    left: 0 !important;
    right: 0 !important;
    transform: none !important;
    /* Важно для Tippy/Popper: затираем инлайновый inset */
    inset: 0 0 auto 0 !important; 
    width: 100% !important;
    z-index: 9999 !important;

    .tippy-box {
      max-width: 100% !important;
      width: 100% !important;
      border-radius: 0 0 20px 20px !important;
      background: white; /* Настройте под вашу тему */
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
      
      .tippy-content {
        padding: 0;
      }
    }
  }
}
</style>

<style scoped lang="scss">
.slash-menu {
  background: var(--back-down);
  border: 1px solid var(--line);
  border-radius: 10px;
  padding: 4px;
  display: flex;
  flex-direction: column;
  min-width: 240px; // Чуть шире для описаний
  box-shadow: 0px 3px 6px rgba(0, 0, 0, 0.04), 0px 9px 24px rgba(0, 0, 0, 0.08);
  user-select: none;
  animation: slideIn 0.15s ease-out;

  .slash-menu-items {
    max-height: 320px;
    overflow-y: auto;
  }

  .slash-menu-item {
    display: flex;
    align-items: center;
    gap: 12px;
    width: 100%;
    padding: 8px 10px;
    border: none;
    background: transparent;
    border-radius: 4px;
    cursor: pointer;
    transition: background 120ms ease-in;
    text-align: left;
    color: var(--text-main);

    &:hover {
        background: var(--table-header);
    }

    &.is-selected {
        color: var(--blue-main);
        background: rgba(35, 131, 226, 0.05);
    }

    svg {
      width: 20px;
      height: 20px;
    }
  }

  @media (max-width: $breakpoint-xs) {
    width: 100% !important;
    border-radius: 0 0 20px 20px !important;
    border-bottom: none;
    // Можно добавить max-height, чтобы меню не перекрывало весь экран
    max-height: 40vh;
    overflow-y: auto;
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>