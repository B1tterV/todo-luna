<script setup lang="ts">
import ToDoEditor from '~/components/tiptap/ToDoEditor.vue'

// Store
import { useToDosStore } from '~/stores/public/toDos'

const route = useRoute()
const router = useRouter()
const toDosStore = useToDosStore()

const groupSlug = computed(() => route.params.slug as string)
const toDoSlug = computed(() => route.params.toDoSlug as string)

// empty-group - зарезервированный роут для задач без группы
const isEmptyGroup = computed(() => groupSlug.value === 'empty-group')
const todo = computed(() => toDosStore.getToDoBySlug(toDoSlug.value))

// Если задача не найдена, редиректим на страницу группы
watchEffect(() => {
  if (toDosStore.isLoaded && !todo.value) {
    if (isEmptyGroup.value) {
      router.push('/empty-group')
    } else {
      router.push(`/group/${groupSlug.value}`)
    }
  }
})

const goBack = () => {
  if (isEmptyGroup.value) {
    router.push('/empty-group')
  } else {
    router.push(`/group/${groupSlug.value}`)
  }
}
</script>

<template>
  <div class="to-do-editor-page">
    <div class="to-do-editor-page__header">
      <h1 v-if="todo" class="to-do-editor-page__title">
        {{ todo.name }}
      </h1>
    </div>
    <ToDoEditor
      v-if="todo"
      :todo-id="todo.id"
    />
  </div>
</template>

<style scoped lang="scss">
.to-do-editor-page {
  min-height: calc(100dvh - 70px);

  &__header {
    @include container-1200-padding;
    display: flex;
    flex-direction: column;
    margin-top: 20px;
    margin-bottom: 10px;

  }

  &__title {
    @include NP-24-500;
    color: var(--text-main);
  }
}
</style>
