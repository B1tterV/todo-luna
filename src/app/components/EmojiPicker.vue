<script setup lang="ts">
import EmojiPicker from 'vue3-emoji-picker'
import 'vue3-emoji-picker/css'

import type { EmojiExt } from 'vue3-emoji-picker'

const emit = defineEmits(['update:modelValue'])

const props = defineProps({
  modelValue: { type: Object as PropType<EmojiExt>, default: () => ({}) },
  generateRandom: { type: Boolean, default: false }
})

const colorMode = useColorMode()

const selectedEmoji = computed({
  get() {
    return props.modelValue
  },
  set(newValue) {
    emit("update:modelValue", newValue.i)
  }
})

onMounted(() => {
  if (!selectedEmoji.value?.i && props.generateRandom) {
    selectedEmoji.value = {
      i: '📁',
      n: ['file folder', 'file_folder'],
      r: '1f4c1',
      t: 'neutral',
      u: '1f4c1'
    }
  }
})

const showPicker = ref(false)

const onSelectEmoji = (emoji: EmojiExt) => {
  selectedEmoji.value = emoji
  showPicker.value = false
}

const setTheme = () => {
  switch (colorMode.value) {
    case 'light':
      return 'light'
    case 'dark':
      return 'dark'
    default:
      return 'auto'
  }
}
</script>

<template>
  <div>
    <button class="emoji-button" @click="showPicker = true">
      {{ selectedEmoji.i || '😊' }}
    </button>
    
    <teleport to="body">
      <div v-if="showPicker" class="modal-overlay" @click.stop="showPicker = false">
        <div class="modal-content" @click.stop>
          <EmojiPicker 
            :native="true"
            :show-search="true"
            :theme="setTheme()"
            disable-skin-tones
            display-recent
            @select="onSelectEmoji"
          />
        </div>
      </div>
    </teleport>
  </div>
</template>

<style scoped>
.emoji-button {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: var(--gray);
  height: 42px;
  width: 42px;
  font-size: 20px;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

:deep(.v3-emoji-picker) {
  --v3-picker-bg: var(--white)
}
</style>