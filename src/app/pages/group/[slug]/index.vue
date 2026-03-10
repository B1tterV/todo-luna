<script setup lang="ts">
// Components
import ToDoModal from '~/components/modals/ToDoModal.vue';
import EmptyContent from '~/components/pages/EmptyContent.vue';

// Store
import { useTaskGroupsStore } from '~/stores/public/taskGroups'
import { useToDosStore } from '~/stores/public/toDos'

const route = useRoute()
const router = useRouter()
const taskGroupsStore = useTaskGroupsStore()
const toDosStore = useToDosStore()

const groupSlug = computed(() => route.params.slug as string)

// empty-group - зарезервированный роут для задач без группы
const isEmptyGroup = computed(() => groupSlug.value === 'empty-group')
const group = computed(() => isEmptyGroup.value ? null : taskGroupsStore.getGroupBySlug(groupSlug.value))

// Задачи текущей группы или задачи без группы
const groupToDos = computed(() => {
  if (isEmptyGroup.value) {
    return toDosStore.getToDosWithoutGroup()
  }
  if (!group.value) return []
  return toDosStore.getToDosByGroupId(group.value.id)
})

// Статистика
const groupStats = computed(() => {
  if (isEmptyGroup.value) {
    const todos = groupToDos.value
    return {
      total: todos.length,
      completed: todos.filter(t => t.isComplete).length,
      active: todos.filter(t => !t.isComplete).length
    }
  }
  return taskGroupsStore.groupsWithStats.find(g => g.id === group.value?.id)?.stats
})

// Пустая ли группа (нет задач)
const isEmpty = computed(() => groupToDos.value.length === 0)

// Если группа не найдена и это не empty-group, редиректим на главную
watchEffect(() => {
  if (taskGroupsStore.isLoaded && !group.value && !isEmptyGroup.value) {
    router.push('/')
  }
})

const isCreateModal = ref<boolean>(false)

// Modal state
const toDoName = ref('')
const toDoId = ref('')
const toDoGroupsIds = ref<string[]>([])

const closeToDoModal = () => {
  toDoName.value = ''
  toDoId.value = ''
  toDoGroupsIds.value = []
}
</script>

<template>
  <div class="group-page page-container">
    <div v-if="!isEmpty" class="group-page__content">
      <h1 class="group-page__title">
        <span class="group-page__emoji">{{ group?.emoji || "🫧" }}</span>
        <span class="group-page__name">{{ group?.name || "Без группы" }}</span>
      </h1>
      
      <!-- Stats -->
      <div class="group-page__stats">
        <span class="stat">
          <span class="stat-value">{{ groupStats?.total || 0 }}</span>
          <span class="stat-label">всего</span>
        </span>
        <span class="stat">
          <span class="stat-value">{{ groupStats?.active || 0 }}</span>
          <span class="stat-label">активных</span>
        </span>
        <span class="stat">
          <span class="stat-value">{{ groupStats?.completed || 0 }}</span>
          <span class="stat-label">завершено</span>
        </span>
      </div>

      <!-- Todos list -->
      <div class="todos-list">
        <TodoItem
            v-for="todo in groupToDos"
            :key="todo.id"
            :todo-id="todo.id"
            :name="todo.name"
            :slug="todo.slug"
            :group-ids="todo.groupIds"
            :is-complete="todo.isComplete"
            :created-at="todo.createdAt"
            :updated-at="todo.updatedAt"
          />
      </div>
    </div>

    
    <EmptyContent
      v-else-if="!isEmptyGroup"
      :title="`${group?.emoji} ${group?.name}`"
      :banner-text="`Группа ${group?.name} пока пуста. Готовы создать первую задачу для этой группы?`"
      action-text="Создать задачу"
      @create="isCreateModal = true"
    />

    <ToDoModal
      v-model="isCreateModal"
      v-model:name="toDoName"
      v-model:group-ids="toDoGroupsIds"
      :to-do-id="toDoId"
      :group-slug="groupSlug"
      @close="closeToDoModal"
      @save="closeToDoModal"
    />
  </div>
</template>

<style scoped lang="scss">
.group-page {
  &__content {
    padding: 20px;
  }

  &__title {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;
    color: var(--text-main);
  }

  &__emoji {
    font-size: 2.5rem;
  }

  &__name {
    @include NP-24-500;
  }

  &__stats {
    display: flex;
    gap: 24px;
    margin-bottom: 24px;
    padding: 16px;
    background: var(--gray);
    border-radius: 8px;
  }

  .stat {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
  }

  .stat-value {
    @include NP-20-500;
    color: var(--blue-main);
  }

  .stat-label {
    @include NP-12-400;
    color: var(--placeholder);
  }
}

.todos-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
</style>
