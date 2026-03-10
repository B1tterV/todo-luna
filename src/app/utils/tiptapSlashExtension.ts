import { Extension } from '@tiptap/core'
import Suggestion from '@tiptap/suggestion'
import { VueRenderer } from '@tiptap/vue-3'
import tippy from 'tippy.js'
import SlashMenu from '@/components/tiptap/extensions/SlashMenu.vue'

export const SlashCommand = Extension.create({
  name: 'slashCommand',
  addOptions() {
    return {
      suggestion: {
        char: '/',
        allowSpaces: false, // Запрещаем пробелы
        startOfLine: false, // Разрешаем "/" не только в начале строки
        command: ({ editor, range, props }: any) => {
          props.command({ editor, range })
        },
      },
    }
  },
  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion,
      }),
    ]
  },
})

export const slashSuggestion = {
  items: ({ query }: { query: string }) => {
    return slashMenuItems
      .filter(item => item.label.toLowerCase().startsWith(query.toLowerCase()))
      .slice(0, 10)
  },

  render: () => {
    let component: any
    let popup: any

    return {
      onStart: (props: any) => {
        if (!props.items.length) return

        component = new VueRenderer(SlashMenu, { props, editor: props.editor })

        // tippy возвращает МАССИВ, берем [0]
        const tippyInstances = tippy('body', {
          getReferenceClientRect: props.clientRect,
          appendTo: () => document.body,
          content: component.element,
          showOnCreate: true,
          interactive: true,
          trigger: 'manual',
          placement: 'bottom-start',
        })
        
        popup = tippyInstances[0] 
      },

      onUpdate(props: SuggestionProps<SlashMenuItem>) {
        component?.updateProps(props)

        // Принудительное закрытие, если нет айтемов или нажат пробел
        const isSpace = props.editor.state.doc.textBetween(props.range.from, props.range.to).includes(' ')
        if (!props.items.length || isSpace) {
          this.onExit?.()
          return
        }

        popup?.setProps({
          getReferenceClientRect: props.clientRect,
        })
      },

      onKeyDown(props: any) {
        if (props.event.key === 'Escape') {
          popup?.hide()
          return true
        }
        return component?.ref?.onKeyDown(props)
      },

      onExit: () => {
        // Проверяем наличие метода destroy
        if (popup && typeof popup.destroy === 'function') {
          popup.destroy()
        }
        if (component) {
          component.destroy()
        }
        
        popup = null
        component = null
      },
    }
  },
}