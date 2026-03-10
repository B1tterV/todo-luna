<script setup lang="ts">
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import { TextStyle } from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'
import { Highlight } from '@tiptap/extension-highlight'
import { Typography } from '@tiptap/extension-typography'

// Components
import DragHandle from '~/components/tiptap/extensions/DragHandle.vue'
import BubbleMenu from '~/components/tiptap/extensions/BubbleMenu.vue'

// Store
import { useToDosStore } from '~/stores/public/toDos'

const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
  todoId: {
    type: String,
    default: null,
  },
})

const emit = defineEmits(['update:modelValue'])

const toDosStore = useToDosStore()

const isDesktop = computed(() => {
  if (typeof window === 'undefined') return true
  return window.matchMedia('(min-width: 960px) and (pointer: fine)').matches
})

// Get todo content from store if todoId is provided
const todoContent = computed(() => {
  if (props.todoId) {
    const todo = toDosStore.getToDoById(props.todoId)
    return todo?.content || ''
  }
  return props.modelValue
})

// Initialize editor
const editor = useEditor({
  content: todoContent.value,
  extensions: [
    StarterKit.configure({
      bulletList: { keepMarks: true, keepAttributes: false },
      orderedList: { keepMarks: true, keepAttributes: false },
      link: false,
      underline: false,
    }),
    Underline,
    Link.configure({
      openOnClick: false,
      HTMLAttributes: { class: 'editor-link' },
    }),
    TextStyle,
    Color,
    Highlight,
    Typography,
    Placeholder.configure({
      placeholder: "Type '/' for commands",
      showOnlyCurrent: true,
      emptyEditorClass: 'is-editor-empty',
    }),
    SlashCommand.configure({
      suggestion: slashSuggestion,
    }),
  ],
  onUpdate: ({ editor }) => {
    const html = editor.getHTML()
    emit('update:modelValue', html)
    if (props.todoId) {
      toDosStore.updateToDoContent(props.todoId, html)
    }
  },
})

// Watch for content changes from outside
watch(() => props.modelValue, (newValue) => {
  if (editor.value && newValue !== editor.value.getHTML()) {
    editor.value.commands.setContent(newValue)
  }
})
</script>

<template>
  <div class="to-do-editor">
    <!-- Editor Content -->
    <editor-content :editor="editor" class="editor-content" />

    <!-- Extensions -->
    <BubbleMenu v-if="editor" :editor="editor"/>
    <DragHandle v-if="editor && isDesktop" :editor="editor" />
  </div>
</template>

<style scoped lang="scss">
.to-do-editor {
  position: relative;
  width: 100%;
}

// Editor Content
.editor-content {
  width: 100%;
  min-height: 100%;
  padding: 20px;
  border-radius: 0.75rem;
  transition: border-color 0.2s;

  &:focus-within {
    outline: none;
  }

  :deep(.ProseMirror) {
    @include container-1200-padding;
    min-height: 300px;
    outline: none;
    color: var(--text-main);

    p.is-editor-empty:first-child::before {
      content: attr(data-placeholder);
      float: left;
      color: var(--placeholder);
      pointer-events: none;
      height: 0;
    }

    // Placeholder for all empty paragraphs
    p.is-empty::before {
      content: attr(data-placeholder);
      float: left;
      color: var(--placeholder);
      pointer-events: none;
      height: 0;
    }

    h1 {
      @include NP-48-500;
      margin-top: 0.5em;
    }

    h2 {
      @include NP-30-500;
      margin-top: 1em;
    }

    h3 {
      @include NP-20-500;
      margin-top: 1.2em;
    }

    p {
      @include NP-14-400;
      text-align: justify;
      line-height: 22px;

      &:not(:first-child):not(td p):not(th p) {
        margin-top: 10px;
      }
    }

    ul,
    ol {
      display: flex;
      flex-direction: column;
      padding-left: 20px;
      margin-top: 1.5em;
      margin-bottom: 1.5em;

      li {
        padding: 0.25em 0;

        &::marker {
          color: var(--blue-main);
        }
      }
    }

    ul {
      list-style-type: disc;
    }

    ol {
      list-style-type: decimal;
    }

    blockquote {
      border-left: 4px solid var(--blue-main);
      padding: 0.65rem 1.25rem;
      margin: 1.5rem 0;
      background: var(--blue-back);
      border-radius: 0 0.5rem 0.5rem 0;
      font-style: italic;
      color: var(--text-main);

      p {
        margin: 0;
      }
    }

    pre {
      background: var(--dark-back);
      color: white;
      padding: 1.25rem;
      border-radius: 0.75rem;
      overflow-x: auto;
      margin-top: 1.5em;
      margin-bottom: 1.5em;
      border: 1px solid var(--line);

      code {
        background: transparent;
        padding: 0;
        border-radius: 0;
        font-size: 0.875rem;
        line-height: 1.6;
        color: inherit;
        border: none;
      }
    }

    code {
      background: var(--back-down);
      padding: 0.2em 0.5em;
      border-radius: 0.375rem;
      font-size: 0.875em;
      color: var(--text-main);
      border: 1px solid var(--line);
    }

    a {
      color: var(--blue-main);
      text-decoration: underline;
      text-underline-offset: 2px;

      &:hover {
        color: var(--blue-main-hover);
      }
    }

    hr {
      border: none;
      border-top: 2px solid var(--line);
      margin: 2em 0;
    }

    @media (max-width: $breakpoint-xs) {
      padding: 0 16px;
    }
  }

  :deep(.tiptap) {
    min-height: calc(100dvh - 98px);
    padding-bottom: calc(100dvh - 100px);
    ::selection {
      background-color: color-mix(var(--blue-main-hover) 15%, transparent); 
      color: inherit; 
    }
  }
}
</style>
