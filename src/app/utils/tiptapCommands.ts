// Icons
import BulletIcon from '@/assets/icons/tiptap/commands/bullet-icon.svg?component'
import H1Icon from '@/assets/icons/tiptap/commands/h1-icon.svg?component'
import H2Icon from '@/assets/icons/tiptap/commands/h2-icon.svg?component'
import H3Icon from '@/assets/icons/tiptap/commands/h3-icon.svg?component'
import NumberedIcon from '@/assets/icons/tiptap/commands/numbered-icon.svg?component'
import BlockquoteIcon from '@/assets/icons/tiptap/commands/blockquote-icon.svg?component'
import CodeIcon from '@/assets/icons/tiptap/commands/code-icon.svg?component'
import DividerIcon from '@/assets/icons/tiptap/commands/divider-icon.svg?component'
import TextIcon from '@/assets/icons/tiptap/commands/text-icon.svg?component'

//Tiptap
import type { Editor, Range } from '@tiptap/core'

export interface SlashMenuItem {
  name: string
  label: string
  description: string
  icon: Component
  level?: number
  command: (props: { editor: Editor; range?: Range }) => void
}


export interface SlashMenuItem {
  name: string
  label: string
  description: string
  icon: Component // Исправлено: Component вместо string
  level?: number
  command: (props: { editor: Editor; range?: Range }) => void
}

export const slashMenuItems: SlashMenuItem[] = [
  {
    name: 'paragraph',
    label: 'Text',
    description: 'Обычный текст',
    icon: markRaw(TextIcon), // Оборачиваем каждую иконку
    command: ({ editor, range }) => {
      let chain = editor.chain().focus()
      if (range) chain = chain.deleteRange(range)
      chain.setParagraph().run()
    },
  },
  {
    name: 'heading',
    level: 1,
    label: 'Heading 1',
    description: 'Большой заголовок',
    icon: markRaw(H1Icon),
    command: ({ editor, range }) => {
      let chain = editor.chain().focus()
      if (range) chain = chain.deleteRange(range)
      chain.setNode('heading', { level: 1 }).run()
    },
  },
  {
    name: 'heading',
    level: 2,
    label: 'Heading 2',
    description: 'Средний заголовок',
    icon: markRaw(H2Icon),
    command: ({ editor, range }) => {
      let chain = editor.chain().focus()
      if (range) chain = chain.deleteRange(range)
      chain.setNode('heading', { level: 2 }).run()
    },
  },
  {
    name: 'heading',
    level: 3,
    label: 'Heading 3',
    description: 'Маленький заголовок',
    icon: markRaw(H3Icon),
    command: ({ editor, range }) => {
      let chain = editor.chain().focus()
      if (range) chain = chain.deleteRange(range)
      chain.setNode('heading', { level: 3 }).run()
    },
  },
  {
    name: 'bulletList',
    label: 'Bullet List',
    description: 'Маркированный список',
    icon: markRaw(BulletIcon),
    command: ({ editor, range }) => {
      let chain = editor.chain().focus()
      if (range) chain = chain.deleteRange(range)
      chain.toggleBulletList().run()
    },
  },
  {
    name: 'orderedList',
    label: 'Numbered List',
    description: 'Нумерованный список',
    icon: markRaw(NumberedIcon),
    command: ({ editor, range }) => {
      let chain = editor.chain().focus()
      if (range) chain = chain.deleteRange(range)
      chain.toggleOrderedList().run()
    },
  },
  {
    name: 'blockquote',
    label: 'Blockquote',
    description: 'Цитата',
    icon: markRaw(BlockquoteIcon),
    command: ({ editor, range }) => {
      let chain = editor.chain().focus()
      if (range) chain = chain.deleteRange(range)
      chain.toggleBlockquote().run()
    },
  },
  {
    name: 'codeBlock',
    label: 'Code Block',
    description: 'Блок кода',
    icon: markRaw(CodeIcon),
    command: ({ editor, range }) => {
      let chain = editor.chain().focus()
      if (range) chain = chain.deleteRange(range)
      chain.setCodeBlock().run()
    },
  },
  {
    name: 'horizontalRule',
    label: 'Divider',
    description: 'Горизонтальный разделитель',
    icon: markRaw(DividerIcon),
    command: ({ editor, range }) => {
      let chain = editor.chain().focus()
      if (range) chain = chain.deleteRange(range)
      chain.setHorizontalRule().run()
    },
  },
]