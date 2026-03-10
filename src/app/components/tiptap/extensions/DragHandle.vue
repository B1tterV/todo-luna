<script setup lang="ts">
// Icons
import ReOrderDots from '@/assets/icons/common/re-order-dots.svg'

// tiptap extension / types
import { DragHandle } from '@tiptap/extension-drag-handle-vue-3'
import type { Editor } from '@tiptap/vue-3'

defineProps<{
  editor: Editor
}>()
</script>

<template>
  <drag-handle
    :editor="editor"
    :compute-position-config="{
      placement: 'left',
      middleware: [
      ]
    }"
  >
    <ReOrderDots filled />
  </drag-handle>
</template>

<style scoped lang="scss">
.drag-handle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background: var(--gray);
  border-radius: 4px;
  cursor: grab;
  color: var(--placeholder);
  transform: translateX(-20px);
  transition: all 0.15s ease-out; 

  &:hover {
    background: var(--table-header);
    color: var(--text-main);
  }

  &.is-dragging {
    opacity: 0.5;
  }
}

:deep(.tiptap-drag-handle) {
  transition: all 0.2s ease-in-out;
  pointer-events: none;
}
</style>