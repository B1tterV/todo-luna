<script setup lang="ts">
// Components
import BaseModal from '~/components/modals/BaseModal.vue';
import BaseInput from '~/components/common/BaseInput.vue';
import BaseSelect from '~/components/common/BaseSelect.vue';
import BaseButton from '~/components/common/BaseButton.vue';

// Store
import { useTaskGroupsStore } from '~/stores/public/taskGroups'
import { useToDosStore } from '~/stores/public/toDos'

const emit = defineEmits([
  'update:modelValue',
  'update:name',
  'update:groupIds',
  'close',
  'save',
  'created'
])

const props = defineProps({
  modelValue: { type: Boolean, default: true },
  toDoId: { type: String, default: '' },
  name: { type: String, default: '' },
  groupIds: { type: Array as () => string[], default: () => [] },
  groupSlug: { type: String, default: '' },
})

const router = useRouter()
const taskGroupsStore = useTaskGroupsStore()
const toDosStore = useToDosStore()

const isEditable = computed(() => !!props.toDoId)
const errors = ref<Array<string>>([])
const isLoading = ref(false)

const proxyModelValue = computed({
  get() {
    return props.modelValue
  },
  set(newValue) {
    emit('update:modelValue', newValue)
  }
})

const proxyName = computed({
  get() {
    return props.name || ''
  },
  set(newValue) {
    emit('update:name', newValue || null)
  }
})

const proxyGroupIds = computed({
  get() {
    return props.groupIds
  },
  set(newValue) {
    emit('update:groupIds', newValue)
  }
})

// Группы для выбора
const groupOptions = computed(() => {
  return taskGroupsStore.groups.map(group => ({
    value: group.id,
    label: group.name,
    emoji: group.emoji
  }))
})

/**
 * Закрытие
 */
 const handleClose = () => {
  proxyModelValue.value = false
  emit('close')
}

/**
 * Сохранение задачи (создание или обновление)
 */
 const handleSave = async () => {
  if (!proxyName.value.trim()) {
    errors.value = ['Название задачи обязательно']
    return
  }

  isLoading.value = true
  errors.value = []

  try {
    // Create clean arrays to avoid reactive proxy issues with IndexedDB
    const cleanGroupIds = [...proxyGroupIds.value]

    if (isEditable.value && props.toDoId) {
      // Обновление существующей задачи
      await toDosStore.updateToDo(props.toDoId, {
        name: proxyName.value,
        groupIds: cleanGroupIds,
      })
      handleClose()
      emit('save')
    } else {
      // Создание новой задачи
      const newToDo = await toDosStore.addToDo(proxyName.value, cleanGroupIds)
      handleClose()
      emit('save')
      // Redirect to editor after creating
      if (props.groupSlug) {
        router.push(`/group/${props.groupSlug}/${newToDo.slug}`)
      } else {
        emit('created', newToDo)
      }
    }
  } catch (error) {
    console.error('Failed to save toDo:', error)
    errors.value = ['Не удалось сохранить задачу. Попробуйте еще раз.']
  } finally {
    isLoading.value = false
  }
}

const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key.toLowerCase() === 'enter') {
    event.preventDefault()
    handleSave()
  }
}

/**
 * Создание новой группы
 */
const handleCreateGroup = async (groupName: string) => {
  const newGroup = await taskGroupsStore.addGroup(groupName, '📁')
  // Добавляем новую группу в выбранные
  const currentIds = proxyGroupIds.value
  if (!currentIds.includes(newGroup.id)) {
    proxyGroupIds.value = [...currentIds, newGroup.id]
  }
}

/**
 * Автоматически добавляем группу в proxyGroupIds, если передан groupSlug
 */
const autoSelectGroupBySlug = () => {
  if (!props.groupSlug) {
    return
  }
  
  const group = taskGroupsStore.groups.find(g => g.slug === props.groupSlug)
  if (group && !proxyGroupIds.value.includes(group.id)) {
    proxyGroupIds.value = [...proxyGroupIds.value, group.id]
  }
}

onMounted(async () => {
  document.addEventListener('keydown', handleKeyDown)
  // Загружаем все группы пользователя
  await taskGroupsStore.loadGroups()
  // После загрузки групп автоматически выбираем группу по slug
  autoSelectGroupBySlug()
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleKeyDown)
})

// Сброс ошибок при вводе
watch(() => proxyName.value, () => {
  if (proxyName.value) {
    errors.value = []
  }
})
</script>

<template>
    <BaseModal
        v-model="proxyModelValue"
        :title="isEditable ? 'Редактировать задачу' : 'Создать задачу'"
        @close="handleClose()"
    >
        <form
            class="to-do-modal"
            autocomplete="off"
            @submit.prevent="handleSave"
        >
            <div
              v-if="errors.length"
              class="form-errors"
            >
              <ul>
                <li
                  v-for="(error, errorIndex) in errors"
                  :key="`error-${errorIndex}`"
                >
                  {{ error }}
                </li>
              </ul>
            </div>
            <BaseInput
                v-model="proxyName"
                input-id="listName"
                placeholder="Моя первая задача"
                label="Название"
                autofocus
            />
            <BaseSelect
                v-model="proxyGroupIds"
                :options="groupOptions"
                label="Группы"
                placeholder="Выберите группу (необязательно)"
                multiple
                can-create
                @create="handleCreateGroup"
            />
            <BaseButton
                name="Сохранить"
                type="submit"
                :disabled="!proxyName"
                :is-loading="isLoading"
            />
        </form>
    </BaseModal>
</template>

<style scoped lang="scss">
.base-input {
    min-width: 400px;
}

.to-do-modal {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
</style>