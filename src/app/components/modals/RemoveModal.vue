<script setup lang="ts">
// Components
import BaseModal from '~/components/modals/BaseModal.vue';
import BaseButton from '~/components/common/BaseButton.vue';

const emit = defineEmits(['update:modelValue', 'close', 'remove'])

const props = defineProps({
  modelValue: { type: Boolean, default: true },
  title: { type: String, default: 'Подтвердите удаление' }
})

const proxyModelValue = computed({
  get() {
    return props.modelValue
  },
  set(newValue) {
    emit("update:modelValue", newValue)
  }
})

/**
 * Закрытие модалки
 */
const handleClose = () => {
    proxyModelValue.value = false
    emit('close')
}
</script>

<template>
    <BaseModal
        v-model="proxyModelValue"
        :title="title"
        @close="handleClose()"
    >
        <div class="remove-modal">
            <div class="remove-modal__subtitle">
                После удаления данные будет невозможно вернуть. <br>
                Вы уверены, что хотите удалить?
            </div>
            <div class="buttons">
                <BaseButton
                    name="Удалить"
                    color="red"
                    @click="emit('remove')"
                />
                <BaseButton
                    name="Отменить"
                    color="gray"
                    @click="handleClose()"
                />
            </div>
        </div>
    </BaseModal>
</template>

<style scoped lang="scss">
.base-input {
    min-width: 400px;
}

.remove-modal {
    display: flex;
    flex-direction: column;
    gap: 10px;

    &__subtitle {
        margin-bottom: 10px;
        line-height: 20px;
        color: var(--red);
    }

    .buttons {
        display: flex;
        align-items: center;
        gap: 10px;
    }
}
</style>