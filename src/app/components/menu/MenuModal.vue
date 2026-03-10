<script setup lang="ts">
// Icons
import TrashIcon from '@/assets/icons/common/trash.svg'
import EditIcon from '@/assets/icons/common/edit.svg'
// Composables
import { useMenuRegistry } from '~/composables/useMenuRegistry'

const emit = defineEmits(['edit', 'delete', 'close'])

const props = defineProps({
  anchorEl: { type: HTMLElement, default: null }
})

const { closeAllMenus } = useMenuRegistry()

const menuPosition = ref({ x: 0, y: 0 })
const menuRef = ref<HTMLElement | null>(null)

const menuItems = [
  { icon: EditIcon, name: "Редактировать", action: 'edit' as const },
  { icon: TrashIcon, name: "Удалить", action: 'delete' as const, class: "red" },
]

// Вычисляем позицию после рендеринга Teleport
const updatePosition = () => {
  if (props.anchorEl && menuRef.value) {
    const rect = props.anchorEl.getBoundingClientRect()
    menuPosition.value = {
      x: rect.right,
      y: rect.top
    }
  }
}

const handleAction = (action: 'edit' | 'delete') => {
  emit(action)
  closeAllMenus()
}

const handleClose = () => {
  closeAllMenus()
  emit('close')
}

watchEffect(async () => {
  if (props.anchorEl) {
    await nextTick(updatePosition)
  }
})
</script>

<template>
    <Teleport to="body">
        <transition name="menu">
            <div
                v-if="anchorEl"
                ref="menuRef"
                v-click-outside="() => handleClose()"
                class="menu-modal"
                :style="{
                    left: `${menuPosition.x}px`,
                    top: `${menuPosition.y}px`
                }"
            >
                <div
                    v-for="menuItem in menuItems"
                    :key="`menuItem-${menuItem.action}`"
                    class="menu-item"
                    :class="menuItem.class"
                    @click="handleAction(menuItem.action)"
                >
                    <div
                        class="menu-item__icon"
                    >
                        <component :is="menuItem.icon" filled />
                    </div>
                    <p>{{ menuItem.name }}</p>
                </div>
            </div>
        </transition>
    </Teleport>
</template>

<style scoped lang="scss">
.menu-enter-active,
.menu-leave-active {
    transition:
        opacity 0.2s ease,
        transform 0.2s ease;
    transform-origin: top left;
}

.menu-enter-from,
.menu-leave-to {
    opacity: 0;
    transform: scale(0.95);
}

.menu-modal {
    position: fixed;
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 20px;
    box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.15);
    border-radius: 10px;
    background: var(--white);
    z-index: 1000;

    .menu-item {
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 10px;
        color: var(--text-main);

        svg {
            width: 18px;
            height: 18px;
        }

        p {
            @include NP-14-500;
        }

        &:not(:last-child) {
            padding-bottom: 10px;
            border-bottom: 1px solid var(--line);
        }

        &.red {
            color: var(--red);
        }
    }
}

@media (max-width: $breakpoint-xs) {
    .menu-enter-active,
    .menu-leave-active {
        transition:
            opacity 0.3s ease,
            transform 0.3s ease;
        transform-origin: center bottom;
    }

    .menu-enter-from,
    .menu-leave-to {
        opacity: 0;
        transform: scale(0.95) translateY(40px);
    }

    .menu-modal {
        position: fixed;
        top: auto !important;
        bottom: 0 !important;
        left: 0 !important;
        width: 100%;
        border-radius: 20px 20px 0 0;
        padding-bottom: 40px;
        box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.15);
    }
}
</style>