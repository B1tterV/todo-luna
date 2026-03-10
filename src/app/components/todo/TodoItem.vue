<script setup lang="ts">
// Icons
import DotsHorizontal from '@/assets/icons/common/dots-horizontal.svg'

// Components
import BaseCheckbox from '~/components/common/BaseCheckbox.vue'
import MenuModal from '~/components/menu/MenuModal.vue'
import ToDoModal from '~/components/modals/ToDoModal.vue'
import RemoveModal from '~/components/modals/RemoveModal.vue'

// Composables
import { useMenuRegistry } from '~/composables/useMenuRegistry'

// Store
import { useToDosStore } from '~/stores/public/toDos'
import { useTaskGroupsStore } from '~/stores/public/taskGroups'

const props = defineProps({
  todoId: { type: String, required: true },
  name: { type: String, required: true },
  slug: { type: String, required: true },
  groupIds: { type: Array as PropType<string[]>, required: true },
  isComplete: { type: Boolean, required: true },
  createdAt: { type: Number, required: true },
  updatedAt: { type: Number, required: true },
  editable: { type: Boolean, default: true },
})

const router = useRouter()
const route = useRoute()
const toDosStore = useToDosStore()
const taskGroupsStore = useTaskGroupsStore()
const { activeMenuId, registerMenu, closeAllMenus } = useMenuRegistry()

// Смена статуса
const toggleToDoComplete = async (todoId: string, isComplete: boolean) => {
  await toDosStore.toggleToDoComplete(todoId, isComplete)
}

// Получить первую группу для роутинга
const getFirstGroupSlug = (groupIds: string[]): string => {
  if (!groupIds || groupIds.length === 0) return ''

  // Сначала проверяем, находимся ли мы сейчас в группе
  const currentGroupSlug = route.params.slug as string | undefined
  if (currentGroupSlug) {
    return currentGroupSlug
  }

  // Если мы не в группе (на главном экране), получаем первую группу
  const group = taskGroupsStore.getGroupById(groupIds[0]!)
  return group?.slug || ''
}

// Меню
const showMenu = computed(() => activeMenuId.value === props.todoId)
const currentAnchorEl = ref<HTMLElement | null>(null)
const menuButtonRef = ref<HTMLElement | null>(null)

  const openMenu = (event: MouseEvent) => {
  event.preventDefault()
  event.stopPropagation()
  
  // Если меню уже открыто для этого todo, закрываем его (тогл)
  if (showMenu.value) {
    closeMenu()
  } else {
    currentAnchorEl.value = menuButtonRef.value
    registerMenu(props.todoId) // Регистрируем ID в глобальном реестре
  }
}

const closeMenu = () => {
  closeAllMenus() // Очищаем реестр
  currentAnchorEl.value = null
}

// Модальные окна
const showToDoModal = ref<boolean>(false)

// Данные для ToDoModal
const editableToDoId = ref<string>('')
const editableToDoName = ref<string>('')
const editableToDoGroupIds = ref<string[]>([])

const openEditModal = () => {
  editableToDoId.value = props.todoId
  editableToDoName.value = props.name
  editableToDoGroupIds.value = [...props.groupIds]
  showToDoModal.value = true
  closeMenu()
}

const handleToDoModalClose = () => {
  showToDoModal.value = false
  editableToDoId.value = ''
  editableToDoName.value = ''
  editableToDoGroupIds.value = []
}

const handleToDoModalSave = () => {
  showToDoModal.value = false
  editableToDoId.value = ''
  editableToDoName.value = ''
  editableToDoGroupIds.value = []
}

// Данные для RemoveModal
const isDelete = ref<boolean>(false)

const openDeleteModal = () => {
  isDelete.value = true
  closeMenu()
}

const handleRemove = async () => {
  await toDosStore.deleteToDo(props.todoId)
  isDelete.value = false
  handleRemoveModalClose()
}

const handleRemoveModalClose = () => {
  isDelete.value = false
}

// Клик по todo-item
const handleTodoClick = () => {
  if (props.groupIds && props.groupIds.length > 0) {
    router.push(`/group/${getFirstGroupSlug(props.groupIds)}/${props.slug}`)
  } else {
    router.push(`/group/empty-group/${props.slug}`)
  }
}
</script>

<template>
    <div
        class="todo-item"
        :class="{ 'todo-item--clickable': true }"
        @click="handleTodoClick"
    >
        <BaseCheckbox
            :model-value="isComplete"
            @update:model-value="toggleToDoComplete(todoId, $event)"
            @click.stop
        />
        <span
            class="todo-item__name"
            :class="{ 'todo-item__name--no-group': !groupIds || groupIds.length === 0 }"
        >
            {{ name }}
        </span>
        <span
            v-if="groupIds && groupIds.length > 0"
            class="todo-item__groups"
        >
            {{ groupIds.length }} групп
        </span>
        <div
            v-if="editable"
            ref="menuButtonRef"
            class="todo-item__menu"
            @click.prevent="openMenu"
        >
            <DotsHorizontal />
        </div>
    </div>
    <MenuModal
        v-if="showMenu"
        :anchor-el="currentAnchorEl"
        @edit="openEditModal"
        @delete="openDeleteModal"
        @close="closeMenu"
    />
    <ToDoModal
        v-model="showToDoModal"
        v-model:name="editableToDoName"
        v-model:group-ids="editableToDoGroupIds"
        :to-do-id="editableToDoId"
        @close="handleToDoModalClose"
        @save="handleToDoModalSave"
    />
    <RemoveModal
        v-model="isDelete"
        @remove="handleRemove"
        @close="handleRemoveModalClose"
    />
</template>


<style scoped lang="scss">
.todo-item {
  @include NP-14-400;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: var(--gray);
  border-radius: 8px;
  transition: all 0.2s;

  &:hover {
    background: var(--table-header);
  }

  &--clickable {
    cursor: pointer;
  }

  &.is-completed {
    background: var(--blue-back);
  }

  &__name {
    flex: 1;
    color: var(--text-main);
    transition: all 0.2s;
    max-width: calc(100% - 60px);
    overflow: hidden;
    text-overflow: ellipsis;

    &:hover {
        color: var(--blue-main);
    }
  }

  &__groups{
    @include NP-12-400;
    padding: 4px 8px;
    background: var(--blue-back);
    color: var(--blue-main);
    border-radius: 4px;
    margin-left: 12px;
  }

  &__menu {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    cursor: pointer;
    transition: all 0.2s;

    svg {
      width: 18px;
      height: 18px;
    }

    &:hover {
      background: var(--placeholder);
      border-radius: 5px;
      color: var(--white);
    }
  }
}
</style>