<script setup lang="ts">
// Components
import BaseModal from '~/components/modals/BaseModal.vue';
import BaseInput from '~/components/common/BaseInput.vue';
import BaseButton from '~/components/common/BaseButton.vue';
import EmojiPicker from '~/components/EmojiPicker.vue';

// Store
import { useTaskGroupsStore } from '~/stores/public/taskGroups'

const emit = defineEmits([
  'update:modelValue',
  'update:emoji',
  'update:name',
  'close',
  'save'
])

const props = defineProps({
  modelValue: { type: Boolean, default: true },
  groupId: { type: String, default: null },
  groupRoute: { type: String, default: null },
  emoji: { type: String, default: null },
  name: { type: String, default: null },
})

const taskGroupsStore = useTaskGroupsStore()
const isEditable = computed(() => !!props.groupId)

const proxyModelValue = computed({
  get() {
    return props.modelValue
  },
  set(newValue) {
    emit("update:modelValue", newValue)
  }
})

const proxyEmoji = computed({
  get() {
    return {
      i: props.emoji,
      n: [],
      r: '',
      t: '',
      u: ''
    }
  },
  set(newValue) {
    emit("update:emoji", newValue)
  }
})

const proxyName = computed({
  get() {
    return props.name
  },
  set(newValue) {
    emit("update:name", newValue)
  }
})

/**
 * Закрытие баннера
 */
const handleClose = () => {
  proxyModelValue.value = false
  emit('close')
}

const validateForm = () => {
  errors.value = []

  if (!proxyName.value.trim()) {
    errors.value.push('Название не может быть пустым')
  }

  if (!proxyEmoji.value) {
    errors.value.push('Выберите иконку')
  }
}

/**
 * Сохранение новой группы
 */
const handleSave = async () => {
  validateForm()
  if (errors.value.length) return

  if (isEditable.value) {
    await taskGroupsStore.updateGroup(props.groupId, {
      name: proxyName.value,
      emoji: proxyEmoji.value!.i
    })
  } else {
    await taskGroupsStore.addGroup(proxyName.value.trim(), proxyEmoji.value!.i)
  }

  // Очищаем форму
  proxyName.value = ''
  errors.value = []

  emit('save')
  handleClose()
}

const errors = ref<Array<string>>([])

const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key.toLowerCase() === 'enter') {
    event.preventDefault()
    handleSave()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeyDown)
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
        title="Создать группу"
        @close="handleClose()"
    >
        <form
            class="groups-modal"
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
            <div class="form-item">
                <div class="form-item__title">
                    Название группы и иконка
                </div>
                <div class="row">
                    <EmojiPicker 
                        v-model="proxyEmoji"
                        generate-random
                        @click.prevent
                    />
                    <input type="text" style="display:none" aria-hidden="true">
                    <BaseInput
                        v-model="proxyName"
                        input-id="listName"
                        placeholder="Работа"
                        autofocus
                    />
                </div>
            </div>
            <BaseButton
                name="Сохранить"
                type="submit"
                :disabled="!proxyName"
            />
        </form>
    </BaseModal>
</template>

<style scoped lang="scss">
.base-input {
    min-width: 400px;
}

.groups-modal {
    display: flex;
    flex-direction: column;
    gap: 10px;

    .form-item {
        &__title {
            @include NP-14-500;
            display: block;
            color: var(--text-main);
        }
    }

    .row {
        display: flex;
        align-items: center;
        align-items: flex-end;
        gap: 10px;
    }
}
</style>