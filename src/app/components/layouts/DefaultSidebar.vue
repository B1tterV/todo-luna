<script setup lang="ts">
// Icons
import ToDoIcon from '@/assets/icons/common/folder-todo.svg'
import PlusIcon from '@/assets/icons/common/plus.svg'
import ArrowsLeftRightIcon from '@/assets/icons/common/arrows-left-right.svg'
import DotsHorizontal from '@/assets/icons/common/dots-horizontal.svg'
import ReOrderDots from '@/assets/icons/common/re-order-dots.svg'

// Components
import GroupsModal from '~/components/modals/GroupsModal.vue'
import MenuModal from '~/components/menu/MenuModal.vue'
import RemoveModal from '~/components/modals/RemoveModal.vue';

// Сomposables
import { useMenuRegistry } from '~/composables/useMenuRegistry'

// Store
import { useTaskGroupsStore } from '~/stores/public/taskGroups'
import { useToDosStore } from '~/stores/public/toDos'

// Types
import type { LocationQuery } from 'vue-router'
import type { SidebarGroupItem } from '~/types/groups'

// VueDraggable
import VueDraggable from 'vuedraggable'

const router = useRouter()
const route = useRoute()
const taskGroupsStore = useTaskGroupsStore()
const toDosStore = useToDosStore()
const { tabletWindow } = useWindow()
const { activeMenuId, registerMenu, closeAllMenus } = useMenuRegistry()

const isSidebarOpen = useSidebarOpen()

// Данные для перетаскивания
interface DraggableSidebarItem extends Omit<SidebarGroupItem, 'groupSlug'> {
  order: number
  uniqueId: string
  groupSlug?: string
}

const defaultItemsOrder = ref<{ id: string; order: number }[]>([
  { id: 'home', order: 0 },
  { id: 'today', order: 1 }
])

// Handle keyboard shortcut Ctrl+L
const handleKeyDown = (event: KeyboardEvent) => {
  // Не срабатываем на input/textarea элементах
  const target = event.target as HTMLElement
  if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
    return
  }

  if (event.ctrlKey && (
    event.key.toLowerCase() === 'l' ||
    event.key.toLowerCase() === 'д')
  ) {
    event.preventDefault()
    showGroupsModal.value = true
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeyDown)
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleKeyDown)
})

// Ждем загрузку групп из базы данных
const loadedGroups = computed(() => {
  if (!taskGroupsStore.isLoaded) return []
  return taskGroupsStore.groups
})

// Массив для перетаскивания (реактивный)
const draggableItems = ref<DraggableSidebarItem[]>([])

// Задачи без группы
const todosWithoutGroup = computed(() => {
  if (!toDosStore.isLoaded) return []
  return toDosStore.getToDosWithoutGroup()
})

// Инициализация элементов
watch([loadedGroups, todosWithoutGroup], () => {
  const groups = loadedGroups.value
  const hasTodosWithoutGroup = todosWithoutGroup.value.length > 0

  // Создаем базовые элементы
  const baseItems: DraggableSidebarItem[] = [
    {
      name: "Главная",
      emoji: '🏠',
      route: "/",
      query: undefined as LocationQuery | undefined,
      type: 'default' as const,
      editable: false,
      groupId: '-1',
      order: defaultItemsOrder.value.find(i => i.id === 'home')?.order ?? 0,
      uniqueId: 'home',
    },
  ]

  // Добавляем "Без группы" только если есть задачи без группы
  if (hasTodosWithoutGroup) {
    baseItems.push({
      name: "Без группы",
      emoji: '🫧',
      route: "/group/empty-group",
      query: undefined as LocationQuery | undefined,
      type: 'default' as const,
      editable: false,
      groupId: '-1',
      order: defaultItemsOrder.value.find(i => i.id === 'home')?.order ?? 0,
      uniqueId: 'empty-group',
    })
  }

//   baseItems.push({
//     name: "Сегодня",
//     emoji: '🔥',
//     route: "/",
//     query: { date: "today" } as LocationQuery,
//     type: 'default' as const,
//     editable: false,
//     groupId: '-1',
//     order: defaultItemsOrder.value.find(i => i.id === 'today')?.order ?? 1,
//     uniqueId: 'today',
//   })

  // Добавляем группы
  const groupItems: DraggableSidebarItem[] = groups.map(group => ({
    name: group.name,
    emoji: group.emoji,
    route: `/group/${group.slug}` as `/group/${string}`,
    query: undefined as LocationQuery | undefined,
    type: 'group' as const,
    groupId: group.id,
    groupSlug: group.slug,
    editable: true,
    order: group.order ?? 0,
    uniqueId: `group-${group.id}`
  }))

  // Объединяем и сортируем по order
  draggableItems.value = [...baseItems, ...groupItems].sort((a, b) => a.order - b.order)
}, { immediate: true, deep: true })

// Базовые элементы (не перетаскиваются)
const baseItems = computed(() => {
  return draggableItems.value.filter(item => item.type === 'default')
})

const itemNamesRef = ref<HTMLElement[]>([])

/**
 * Получить текущий роут и сделать его активным
 * @param sidebarRoute маршрут. Например '/'
 * @param query query параметры. Например { date: "today" }
 */
const isCurrentRoute = (sidebarRoute: string, query: LocationQuery | null = null): boolean => {
  // Проверяем путь
  const pathMatches = sidebarRoute === '/' 
    ? route.path === sidebarRoute           // для главной - точное совпадение
    : route.path.startsWith(sidebarRoute)   // для остальных - startsWith
  
  if (!pathMatches) return false

  // Проверяем query параметры
  if (query) return isQueryMatch(route.query, query)
  
  // Если query не указаны, проверяем что их нет в URL
  return Object.keys(route.query).length === 0
}

/**
 * Вспомогательная функция для сравнения query объектов
 * @param currentQuery 
 * @param targetQuery 
 */
const isQueryMatch = (currentQuery: LocationQuery, targetQuery: LocationQuery): boolean => {
  // Получаем все ключи из targetQuery
  const targetKeys = Object.keys(targetQuery)
  
  // Проверяем каждый ключ из targetQuery
  return targetKeys.every(key => {
    const currentValue = currentQuery[key]
    const targetValue = targetQuery[key]
    
    // Для массивов
    if (Array.isArray(currentValue) && Array.isArray(targetValue)) {
      return JSON.stringify(currentValue.sort()) === JSON.stringify(targetValue.sort())
    }
    
    // Для обычных значений
    return currentValue === targetValue
  })
}

// Данные для модалки создания
const editableGroupID = ref<string>('')
const editableGroupName = ref<string>('')
const editableGroupRoute = ref<string>('')
const editableGroupEmojy = ref<string>('')
const showGroupsModal = ref<boolean>(false)

/**
 * Функция при закрытии модалки
 */
const clearModalData = (): void => {
  editableGroupID.value = ''
  editableGroupName.value = ''
  editableGroupEmojy.value = ''
  editableGroupRoute.value = ''
  showGroupsModal.value = false
}

const editModalData = (sidebarItem: SidebarGroupItem): void => {
  editableGroupID.value = sidebarItem.groupId
  editableGroupName.value = sidebarItem.name
  editableGroupRoute.value = sidebarItem.route
  editableGroupEmojy.value = sidebarItem.emoji
  showGroupsModal.value = true
  closeMenu()
  if (tabletWindow.value) isSidebarOpen.value = false
}

const deleteModalData = (sidebarItem: SidebarGroupItem) => {
    deleteId.value = sidebarItem?.groupId;
    isDelete.value = true
    closeMenu()
    if (tabletWindow.value) isSidebarOpen.value = false
}

// Данные для меню
const showMenu = computed(() => activeMenuId.value?.startsWith('sidebar-') || false)
const currentAnchorEl = ref<HTMLElement | null>(null)
const currentSidebarItem = ref<SidebarGroupItem | null>(null)
const isDelete = ref<boolean>(false)
const deleteId = ref<string | undefined>('')

const openMenu = (event: MouseEvent, sidebarItem: SidebarGroupItem | DraggableSidebarItem, index: number) => {
  event.preventDefault()
  event.stopPropagation()
  
  const menuId = `sidebar-${sidebarItem.groupId}`
  
  // Если кликнули по уже открытому — закрываем
  if (activeMenuId.value === menuId) {
    closeAllMenus()
  } else {
    currentAnchorEl.value = itemNamesRef.value[index]!
    currentSidebarItem.value = sidebarItem as SidebarGroupItem
    registerMenu(menuId) // Это закроет любое другое открытое меню в приложении
  }
}

const closeMenu = () => {
  closeAllMenus()
  currentAnchorEl.value = null
  currentSidebarItem.value = null
}

const removeGroup = async () => {
  await taskGroupsStore.deleteGroup(deleteId.value!)
  deleteId.value = ''
  isDelete.value = false
  clearModalData()
}

// Обработчик закрытия модалки с обновлением данных
const handleModalClose = () => {
  clearModalData()
}

// Обработчик изменения порядка элементов
const onReorder = async () => {
  // Получаем только группы в новом порядке
  const groups = draggableItems.value.filter(item => item.type === 'group')
  
  // Обновляем порядок для групп
  await Promise.all(
    groups.map((item, index) => 
      taskGroupsStore.updateGroup(item.groupId, { order: index })
    )
  )
  
  // Обновляем порядок в draggableItems
  const baseItems = draggableItems.value.filter(item => item.type === 'default')
  draggableItems.value = [...baseItems, ...groups]
}

const handleShowGroupsModal = () => {
    if (tabletWindow.value) isSidebarOpen.value = false
    showGroupsModal.value = true
}
</script>

<template>
    <div
        ref="sidebarRef"
        class="default-sidebar"
        :class="{
            'is-desktop-open': (isSidebarOpen && !tabletWindow) || tabletWindow,
            'is-mobile-hidden': tabletWindow && !isSidebarOpen,
            'is-mobile-open': tabletWindow && isSidebarOpen,
            'is-mobile': tabletWindow
        }"
    >
        <div class="default-sidebar__header">
            <div 
                ref="headerTextRef"
                class="logo"
                @click="router.push('/')"
            >
                <div class="icon">
                    <ToDoIcon />
                </div>
                <div class="text">
                    <div class="text__name">Todo Luna</div>
                    <div class="text__user">B1tter</div>
                </div>
            </div>
            <div
                v-if="!tabletWindow"
                class="toggle"
                @click="isSidebarOpen = !isSidebarOpen"
            >
                <ArrowsLeftRightIcon filled />
            </div>
        </div>
        
        <div class="default-sidebar__content">
            <div class="content-title">Группы</div>
            <div class="links">
                <!-- Базовые элементы (не перетаскиваются) -->
                <nuxt-link
                    v-for="(sidebarItem, index) in baseItems"
                    :key="sidebarItem.uniqueId"
                    class="sidebar-item not-draggable"
                    :class="[
                        { 'active': isCurrentRoute(sidebarItem.route, sidebarItem?.query) },
                        { 'menu-open': currentSidebarItem && currentSidebarItem.groupId === sidebarItem!.groupId }
                    ]"
                    :to="{
                        path: sidebarItem.route,
                        query: sidebarItem?.query
                    }"
                >
                    <div
                        :ref="el => { if (el) itemNamesRef[index] = el as HTMLElement }"
                        class="sidebar-item__name"
                    >
                        <span>{{ sidebarItem.emoji }}</span>
                        <p>{{ sidebarItem.name }}</p>
                    </div>
                    <div
                        v-if="isSidebarOpen && sidebarItem.editable"
                        class="menu"
                        :class="{ 'active': currentSidebarItem && currentSidebarItem.groupId === sidebarItem.groupId }"
                        @click="(e) => openMenu(e, sidebarItem, index)"
                    >
                        <DotsHorizontal />
                    </div>
                </nuxt-link>
                
                <!-- Группы (можно перетаскивать) -->
                <VueDraggable
                    :list="draggableItems"
                    item-key="uniqueId"
                    class="draggable-list"
                    :animation="200"
                    :ghost-class="'sorting'"
                    filter=".not-draggable"
                    handle=".drag-handle"
                    @end="onReorder"
                >
                    <template #item="{ element: sidebarItem }">
                        <nuxt-link
                            v-if="sidebarItem.type === 'group'"
                            class="sidebar-item"
                            :class="[
                                { 'active': isCurrentRoute(sidebarItem.route, sidebarItem?.query) },
                                { 'menu-open': currentSidebarItem && currentSidebarItem.groupId === sidebarItem!.groupId }
                            ]"
                            :to="{
                                path: sidebarItem.route,
                                query: sidebarItem?.query
                            }"
                        >
                            <div
                                class="drag-handle"
                            >
                                <ReOrderDots />
                            </div>
                            <div
                                :ref="el => { if (el) itemNamesRef[draggableItems.indexOf(sidebarItem)] = el as HTMLElement }"
                                class="sidebar-item__name"
                            >
                                <span>{{ sidebarItem.emoji }}</span>
                                <p>{{ sidebarItem.name }}</p>
                            </div>
                            <div
                                v-if="isSidebarOpen && sidebarItem.editable"
                                class="menu"
                                :class="{ 'active': currentSidebarItem && currentSidebarItem.groupId === sidebarItem.groupId }"
                                @click="(e) => openMenu(e, sidebarItem as DraggableSidebarItem, draggableItems.indexOf(sidebarItem))"
                            >
                                <DotsHorizontal />
                            </div>
                        </nuxt-link>
                    </template>
                </VueDraggable>
                <MenuModal
                    :anchor-el="currentAnchorEl!"
                    @edit="editModalData(currentSidebarItem!);"
                    @delete="deleteModalData(currentSidebarItem!)"
                    @close="closeMenu"
                />
            </div>
            <div
                class="create-group"
                @click="handleShowGroupsModal()"
            >
                <div class="create-group__text">
                    <PlusIcon filled />
                    <p>Создать новую группу</p>
                </div>
                <div class="keys-group">
                    <div class="key-block">
                        ctrl
                    </div>
                    <div class="key-block">
                        l
                    </div>
                </div>
            </div>
        </div>
        <GroupsModal
            v-model="showGroupsModal"
            v-model:emoji="editableGroupEmojy"
            v-model:name="editableGroupName"
            :group-id="editableGroupID"
            :group-route="editableGroupRoute"
            @close="handleModalClose()"
        />
        <RemoveModal
            v-model="isDelete"
            @remove="removeGroup()"
            @close="handleModalClose()"
        />
        <Teleport to="body">
            <div
                v-if="tabletWindow && isSidebarOpen"
                class="mobile-bg"
                @click="isSidebarOpen = false"
            />
        </Teleport>
    </div>
</template>

<style scoped lang="scss">
.mobile-bg {
    position: fixed;
    width: 100dvw;
    height: 100dvh;
    left: 0;
    top: 0;
    z-index: 500;
    background: rgba(0, 0, 0, 0.3);
}

.default-sidebar {
    padding: 15px;
    display: flex;
    flex-direction: column;
    width: 70px;
    min-width: 70px;
    background: var(--gray);
    height: 100dvh;
    overflow: hidden;
    position: relative;
    border-right: 1px solid color-mix(var(--placeholder) 10%, transparent);
    transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1), min-width 0.3s cubic-bezier(0.4, 0, 0.2, 1);

    &.is-mobile {
        position: fixed;
        top: 0;
        left: 0;
        box-shadow: 10px 0 30px rgba(0,0,0,0.1);
        z-index: 1000;
        transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);

        &.is-mobile-hidden {
            transform: translateX(-100%);
        }

        &.is-mobile-open {
            transform: translateX(0);
        }
    }

    &.is-desktop-open {
        width: 300px;
        min-width: 300px;

        .default-sidebar__header {
            .toggle {
                svg {
                    transform: rotate(180deg);
                }
            }

            .logo {
                .text {
                    opacity: 1;
                    transform: translateX(0);
                }
            }
        }

        .default-sidebar__content {
            transform: translateY(0);
            .content-title {
                opacity: 1;
                transform: translateX(0);
                transition-delay: 0.24s;
            }

            .sidebar-item {
                &__name {
                    
                    p {
                        opacity: 1;
                    }
                }
            }

            .create-group {
                &__text {
                    p {
                        opacity: 1;
                    }
                }

                .keys-group {
                    opacity: 1;
                    transform: translateX(0);
                }
            }

            &:hover {
                .sidebar-item:has(.drag-handle) {
                    .sidebar-item__name {
                        transform: translateX(24px);
                    }
                }
            }
        }
    }

    &__header {
        position: relative;
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
        z-index: 2;

        .logo {
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 10px;
            overflow: hidden;

            .icon {
                display: flex;
                align-items: center;
                justify-content: center;
                min-width: 40px;
                height: 40px;
                background: $dark-dark-back;
                border-radius: 5px;
                flex-shrink: 0;

                svg {
                    width: 24px;
                    height: 24px;
                    color: $white;
                }
            }

            .text {
                display: flex;
                flex-direction: column;
                gap: 3px;
                overflow: hidden;
                white-space: nowrap;
                opacity: 0;
                transform: translateX(-10px);
                transition: opacity 0.2s ease-out, transform 0.2s ease-out;
                transition-delay: 0.1s;

                &__name {
                    @include NP-20-500
                }

                &__user {
                    @include NP-14-400;
                    color: var(--gray-text);
                }
            }
        }
    }

    &__content {
        @include no-scroll;
        display: flex;
        flex-direction: column;
        gap: 5px;
        flex: 1;
        transform: translateY(-40px);
        transition: opacity 0.2s ease-out, transform 0.2s ease-out;
        transition-delay: 0.15s;
        max-height: calc(100dvh - 105px);

        .links {
            @include no-scroll;
            max-height: 100%;
            overflow: auto;
        }

        .draggable-list {
            display: flex;
            flex-direction: column;
            gap: 5px;
        }

        .content-title {
            @include NP-16-500;
            margin-bottom: 15px;
            opacity: 0;
            transform: translateX(-10px);
            transition: opacity 0.2s ease-out, transform 0.1s ease-out;
            transition-delay: 0.10s;
        }

        .default-sidebar.is-desktop-open &:hover .sidebar-item {
            .drag-handle {
                opacity: 1;
                visibility: visible;
            }
        }

        .sidebar-item {
            position: relative;
            display: flex;
            align-items: center;
            gap: 10px;
            height: 40px;
            min-height: 40px;
            color: var(--text-main);
            text-decoration: none;
            white-space: nowrap;
            border-radius: 5px;
            padding: 0 9px;

            .drag-handle {
                position: absolute;
                left: 0;
                display: flex;
                align-items: center;
                justify-content: center;
                width: 24px;
                height: 24px;
                flex-shrink: 0;
                opacity: 0;
                visibility: hidden;
                cursor: grab;
                transition: opacity 0.2s ease, visibility 0.2s ease;

                svg {
                    width: 16px;
                    height: 16px;
                    color: var(--gray-text);
                }

                &:active {
                    cursor: grabbing;
                }
            }

            &.sorting {
                opacity: 0.5;
                background: color-mix(var(--gray-text) 15%, transparent);
            }

            &.active {
                background: color-mix(var(--gray-text) 20%, transparent);

                .sidebar-item__name{
                    @include NP-14-500;
                }
            }

            &:hover{ 
                .sidebar-item__name {
                    max-width: calc(100% - 40px);
                }
                .menu {
                    opacity: 1;
                }
            }

            &:hover:not(.active) {
                background: color-mix(var(--gray-text) 10%, transparent);
            }

            &.menu-open {
                background: color-mix(var(--gray-text) 10%, transparent);

                .menu {
                    opacity: 1;
                    background: var(--placeholder);
                    border-radius: 5px;
                    color: var(--white);
                }
            }

            &__icon {
                min-width: 16px;
                flex-shrink: 0;
            }

            &__name {
                @include NP-14-400;
                display: flex;
                align-items: center;
                max-width: 100%;
                overflow: hidden;
                white-space: nowrap;
                transition: all 0.3s ease-out;
                min-width: 22px;
                line-height: 24px;

                p {
                    opacity: 0;
                    transition: opacity 0.2s ease-out, transform 0.2s ease-out;
                    text-overflow: ellipsis;
                    overflow: hidden;
                }

                span {
                    margin-right: 8px;
                    font-size: 16px;
                    flex-shrink: 0;
                    line-height: 24px;
                }
            }

            .menu {
                position: absolute;
                display: flex;
                align-items: center;
                justify-content: center;
                right: 10px;
                width: 32px;
                height: 32px;
                opacity: 0;
                transition: all 0.3s ease;

                svg {
                    width: 18px;
                    height: 18px;
                }

                &:hover:not(.active) {
                    background: var(--placeholder);
                    border-radius: 5px;
                    color: var(--white);
                }
            }
        }
    }

    &__header {
        position: relative;
    }

    &__content {
        .create-group {
            cursor: pointer;
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0 10px;
            gap: 5px;
            height: 40px;
            overflow: hidden;

            &__text {
                @include NP-14-400;
                display: flex;
                align-items: center;
                gap: 5px;
                white-space: nowrap;

                p {
                    opacity: 0;
                    transition: opacity 0.2s ease-out, transform 0.2s ease-out;
                    transition-delay: 0.1s;
                }
            }

            svg {
                min-width: 20px;
                width: 0;
                height: 20px;
                flex-shrink: 0;
            }

            &:hover {
                color: var(--blue-main);
            }

            .keys-group {
                display: flex;
                gap: 5px;
                opacity: 0;
                transform: translateX(-10px);
                transition: opacity 0.2s ease-out, transform 0.2s ease-out;
                transition-delay: 0.1s;
                flex-shrink: 0;
            }
        }
    }

    @media (max-width: $breakpoint-sm) {
        &:not(.is-mobile) {
            transform: translateX(-100%);
        }
    }
}
</style>