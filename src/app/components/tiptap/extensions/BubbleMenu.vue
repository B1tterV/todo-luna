<script setup lang="ts">
// Icons
import BoldIcon from '@/assets/icons/tiptap/commands/bold-icon.svg'
import TextIcon from '@/assets/icons/tiptap/commands/bullet-icon.svg'
import ItalicIcon from '@/assets/icons/tiptap/commands/italic-icon.svg'
import LinkIcon from '@/assets/icons/tiptap/commands/link-icon.svg'
import StrikeIcon from '@/assets/icons/tiptap/commands/strike-icon.svg'
import UnderlineIcon from '@/assets/icons/tiptap/commands/underline-icon.svg'

// tiptap extension / types
import { BubbleMenu } from '@tiptap/vue-3/menus'
import type { Editor } from '@tiptap/vue-3'
import { slashMenuItems } from '~/utils/tiptapCommands'

const props = defineProps<{
  editor: Editor
}>()

const bubbleOptions = {
  placement: 'top-start',
  offset: {mainAxis: 10 },
  onHide: () => {
    isDropdownOpen.value = false
  },
} as const

// Хелпер теперь возвращает только базовые данные
const cmd = (name: string, method?: string) => ({
  name,
  method: method || `toggle${name.charAt(0).toUpperCase() + name.slice(1)}`,
})

// Группы кнопок (теперь это константа)
const menuGroups = [
  [
    { ...cmd('bold'), title: 'Bold', icon: BoldIcon },
    { ...cmd('italic'), title: 'Italic', icon: ItalicIcon },
    { ...cmd('strike'), title: 'Strikethrough', icon: StrikeIcon },
    { ...cmd('underline'), title: 'Underline', icon: UnderlineIcon },
  ],
  [
    {
      name: 'link',
      title: 'Link',
      icon: LinkIcon,
      onClick: () => setLink(),
    },
  ]
]

/**
 * Установить ссылку
 */
const setLink = () => {
  if (!props.editor) return

  const previousUrl = props.editor.getAttributes('link').href
  const url = window.prompt('Enter URL:', previousUrl)

  if (url === null) return

  if (url === '') {
    props.editor.chain().focus().extendMarkRange('link').unsetLink().run()
    return
  }

  props.editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
}

const isDropdownOpen = ref(false)

const currentStyle = computed(() => {
  const active = slashMenuItems.find(s => 
    s.name === 'heading' ? props.editor.isActive('heading', { level: s.level }) : props.editor.isActive(s.name)
  )
  return active || { label: 'Text', icon: TextIcon }
})

const selectStyle = (item: SlashMenuItem) => {
  item.command({editor: props.editor})
  isDropdownOpen.value = false
  
  const { state } = props.editor
  const { selection } = state
  
  props.editor.chain()
    .focus()
    .setTextSelection(selection.to)
    .run()
}
</script>

<template>
  <BubbleMenu v-if="editor" :editor="editor" :options="bubbleOptions">
    <div class="bubble-menu">

      <div class="dropdown-wrapper">
        <button 
          class="style-selector" 
          :class="{ 'is-active': isDropdownOpen }"
          @click="isDropdownOpen = !isDropdownOpen"
        >
          <component :is="currentStyle.icon" class="icon" />
          <span>{{ currentStyle.label }}</span>
          <span class="chevron">▼</span>
        </button>

        <div v-if="isDropdownOpen" class="dropdown-menu">
          <button 
            v-for="item in slashMenuItems" 
            :key="item.label"
            :class="{
                'is-selected':item.name === 'heading'
                    ? editor.isActive('heading', { level: item.level })
                    : editor.isActive(item.name) }"
            @click="selectStyle(item)"
          >
            <component :is="item.icon" class="icon" />
            {{ item.label }}
          </button>
        </div>
      </div>

      <span class="separator" />

      <template v-for="(group, groupIndex) in menuGroups" :key="groupIndex">
        <button
          v-for="btn in group"
          :key="btn.title"
          :title="btn.title"
          :class="{ 
            'is-active': btn.name === 'heading' 
              ? editor.isActive('heading', { level: btn.level }) 
              : editor.isActive(btn.name) 
          }"
          @click="btn.onClick ? btn.onClick() : (editor.chain().focus() as any)[btn.method]().run()"
        >
          <component :is="btn.icon" class="icon" />
        </button>
        <span v-if="groupIndex < menuGroups.length - 1" class="separator" />
      </template>

    </div>
  </BubbleMenu>
</template>

<style scoped lang="scss">
.dropdown-wrapper {
  position: relative;
  
  .style-selector {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 0 8px;
    font-size: 13px;
    font-weight: 500;
    
    .chevron {
      font-size: 8px;
      opacity: 0.5;
    }
  }

  .dropdown-menu {
    position: absolute;
    top: calc(100% + 8px);
    left: 0;
    background: var(--back-down);
    border: 1px solid var(--line);
    border-radius: 6px;
    padding: 4px;
    display: flex;
    flex-direction: column;
    min-width: 140px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    z-index: 10;
    white-space: nowrap;

    button {
      display: flex;
      align-items: center;
      gap: 10px;
      justify-content: flex-start;
      width: 100%;
      padding: 6px 8px;
      
      &.is-selected {
        color: var(--blue-main);
        background: rgba(35, 131, 226, 0.05);
      }

      svg {
        width: 16px;
        height: 16px;
      }
    }

    @media (max-width: $breakpoint-xs) {
      position: fixed !important;
      top: 42px !important;
      bottom: auto;
      left: 0 !important;
      width: 100% !important;
      border-radius: 0 0 20px 20px !important;
      // box-shadow: none;
      border-bottom: none;
    }
  }
}

.bubble-menu {
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 6px;
  background: var(--back-down);
  border: 1px solid var(--line);
  border-radius: 6px;
  box-shadow: 0px 3px 6px rgba(0, 0, 0, 0.04), 0px 9px 24px rgba(0, 0, 0, 0.08);
  user-select: none;

  button {
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 28px;
    height: 28px;
    padding: 0 8px;
    border: none;
    background: transparent;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    color: var(--text-main);
    transition: background 120ms ease-in;

    &:hover {
      background: var(--table-header);
    }

    &.is-active {
      color: var(--blue-main); 
      background: rgba(35, 131, 226, 0.07);
    }
    strong { font-weight: 700; }
    em { font-style: italic; }
  }

  .separator {
    width: 1px;
    height: 20px;
    background: var(--line);
    margin: 0 4px;
    opacity: 0.6;
  }

  @media (max-width: $breakpoint-xs) {
    display: flex;
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    bottom: auto !important;
    width: 100%;
    background: var(--back-down);
    border-top: 1px solid var(--line);
    transform: none !important;
    border-radius: 0px 0px 6px 6px;
    z-index: 100;
    justify-content: space-around;

    &:has(.style-selector.is-active) {
      border-radius: 0;
      border-bottom: none;
      box-shadow: none;
    }
  }
}

button {
  svg, span {
    display: flex;
    align-items: center;
    font-family: serif;
  }
}
</style>