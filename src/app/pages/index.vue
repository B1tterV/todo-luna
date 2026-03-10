<script setup lang="ts">
// Components
import BaseBanner from '~/components/common/BaseBanner.vue';
import EmptyContent from '~/components/pages/EmptyContent.vue';
import ToDoModal from '~/components/modals/ToDoModal.vue';
import TodoItem from '~/components/todo/TodoItem.vue';
import CreateTodoBanner from '~/components/todo/CreateTodoBanner.vue';

// Utils
import { formatDateFull } from '~/utils/dateHelpers';

// Store
import { useToDosStore } from '~/stores/public/toDos'

const toDosStore = useToDosStore()

const WELCOME_BANNER_STORAGE_KEY = 'hide_welcome_banner'
const showBanner = ref<boolean>(false)
const isCreateModal = ref<boolean>(false)

const toDoName = ref('')
const toDoId = ref('')
const toDoGroupsIds = ref<string[]>([])

// Все задачи (включая те, что без групп)
const allToDos = computed(() => toDosStore.toDos)

const isEmpty = computed(() => allToDos.value.length === 0)

const closeToDoModal = () => {
  toDoName.value = ''
  toDoId.value = ''
  toDoGroupsIds.value = []
}

const closeBanner = () => {
  showBanner.value = false
  // Сохраняем состояние "закрыто" навсегда
  localStorage.setItem(WELCOME_BANNER_STORAGE_KEY, 'true')
}

onMounted(() => {
  // Проверяем наличие ключа в хранилище
  const isHidden = localStorage.getItem(WELCOME_BANNER_STORAGE_KEY)
  
  if (!isHidden) {
    showBanner.value = true
  }
})
</script>

<template>
  <div class="home-page page-container">
    <div v-if="!isEmpty" class="home-page__content">
      <h1 class="page-title">Доброе утро, B1tter</h1>
      <h1 class="page-description">Сегодня {{ formatDateFull(new Date()) }}</h1>
      <BaseBanner
        v-model="showBanner"
        emojy="💡"
        text='
          Устали жонглировать множеством задач и дедлайнов? Наше приложение
          "Список дел" здесь, чтобы упростить вашу жизнь и повысить продуктивность.
          Будь то рабочие проекты, домашние дела или личные цели — мы поможем вам
          со всем справиться.
        '
        @close="closeBanner()"
      />
      <CreateTodoBanner
        @create="isCreateModal = true"
      />
      
      <div class="todos-section">
        <h2 class="section-title">Все задачи</h2>
        <div class="todos-list">
          <TodoItem
            v-for="todo in allToDos"
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
    </div>
    <EmptyContent
      v-else
      title="Начните с чистого листа"
      banner-text="
        Пустой список — это возможность начать с правильных приоритетов.
        Добавьте свою первую задачу прямо сейчас
      "
      action-text="Поставить первую задачу"
      @create="isCreateModal = true"
    />
    <ToDoModal
      v-model="isCreateModal"
      v-model:name="toDoName"
      v-model:group-ids="toDoGroupsIds"
      :to-do-id="toDoId"
      @close="closeToDoModal()"
      @save="closeToDoModal()"
    />
  </div>
</template>

<style scoped lang="scss">
.page-title {
  margin-bottom: 8px;
}

.page-description {
  margin-bottom: 20px;
}

.todos-section {
  margin-top: 32px;
}

.section-title {
  @include NP-20-500;
  margin-bottom: 16px;
  color: var(--text-main);
}

.todos-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
</style>
