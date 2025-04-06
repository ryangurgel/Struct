import React from 'react'
import { createRoot } from 'react-dom/client'
import { Extension } from '@tiptap/core'
import Suggestion from '@tiptap/suggestion'
import tippy from 'tippy.js'
import Fuse from 'fuse.js'
import SuggestionList from './SuggestionList'

import {
  Notes as NotesIcon,
  LooksOne as LooksOneIcon,
  LooksTwo as LooksTwoIcon,
  Looks3 as Looks3Icon,
  FormatListBulleted as FormatListBulletedIcon,
  FormatListNumbered as FormatListNumberedIcon,
  CheckBox as CheckBoxIcon,
  FormatQuote as FormatQuoteIcon,
  Code as CodeIcon,
  HorizontalRule as HorizontalRuleIcon,
  TableChart as TableChartIcon,
  Image as ImageIcon,
  ViewColumn as ViewColumnIcon,
} from '@mui/icons-material'

const SlashCommand = Extension.create({
  name: 'slash-command',
  addOptions() {
    return {
      suggestion: {
        char: '/',
        startOfLine: false,
        items: ({ query }) => {
          const allItems = [
            {
              icon: <LooksOneIcon fontSize="small" />,
              title: 'Heading 1',
              category: 'Texto',
              keywords: ['h1', 'título', 'title'],
              command: ({ editor, range }) =>
                editor.chain().focus().deleteRange(range).setHeading({ level: 1 }).run(),
            },
            {
              icon: <LooksTwoIcon fontSize="small" />,
              title: 'Heading 2',
              category: 'Texto',
              keywords: ['h2', 'subtítulo'],
              command: ({ editor, range }) =>
                editor.chain().focus().deleteRange(range).setHeading({ level: 2 }).run(),
            },
            {
              icon: <Looks3Icon fontSize="small" />,
              title: 'Heading 3',
              category: 'Texto',
              keywords: ['h3', 'subsubtitulo'],
              command: ({ editor, range }) =>
                editor.chain().focus().deleteRange(range).setHeading({ level: 3 }).run(),
            },
            {
              icon: <NotesIcon fontSize="small" />,
              title: 'Parágrafo',
              category: 'Texto',
              keywords: ['paragraph', 'text', 'paragrafi'],
              command: ({ editor, range }) =>
                editor.chain().focus().deleteRange(range).setParagraph().run(),
            },
            {
              icon: <FormatListBulletedIcon fontSize="small" />,
              title: 'Lista com bullets',
              category: 'Listas',
              keywords: ['lista', 'bullets', 'ul'],
              command: ({ editor, range }) =>
                editor.chain().focus().deleteRange(range).toggleBulletList().run(),
            },
            {
              icon: <FormatListNumberedIcon fontSize="small" />,
              title: 'Lista numerada',
              category: 'Listas',
              keywords: ['numerada', 'ol', 'números'],
              command: ({ editor, range }) =>
                editor.chain().focus().deleteRange(range).toggleOrderedList().run(),
            },
            {
              icon: <CheckBoxIcon fontSize="small" />,
              title: 'Lista de tarefas',
              category: 'Listas',
              keywords: ['task', 'checkbox', 'check'],
              command: ({ editor, range }) =>
                editor.chain().focus().deleteRange(range).toggleTaskList().run(),
            },
            {
              icon: <FormatQuoteIcon fontSize="small" />,
              title: 'Citação',
              category: 'Texto',
              keywords: ['quote', 'blockquote', 'citação'],
              command: ({ editor, range }) =>
                editor.chain().focus().deleteRange(range).toggleBlockquote().run(),
            },
            {
              icon: <CodeIcon fontSize="small" />,
              title: 'Bloco de código',
              category: 'Texto',
              keywords: ['code', 'programação'],
              command: ({ editor, range }) =>
                editor.chain().focus().deleteRange(range).toggleCodeBlock().run(),
            },
            {
              icon: <HorizontalRuleIcon fontSize="small" />,
              title: 'Linha Horizontal',
              category: 'Texto',
              keywords: ['hr', 'linha', 'separador'],
              command: ({ editor, range }) =>
                editor.chain().focus().deleteRange(range).setHorizontalRule().run(),
            },
            {
              icon: <TableChartIcon fontSize="small" />,
              title: 'Tabela',
              category: 'Layout',
              keywords: ['table', 'tabela', 'grid'],
              command: ({ editor, range }) =>
                editor.chain().focus().deleteRange(range).insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(),
            },
            {
              icon: <ImageIcon fontSize="small" />,
              title: 'Imagem via URL',
              category: 'Mídia',
              keywords: ['imagem', 'url', 'foto'],
              command: ({ editor, range }) => {
                const url = prompt('URL da imagem:')
                if (!url) return
                editor.chain().focus().deleteRange(range).setImage({ src: url }).run()
              },
            },
            {
              icon: <ImageIcon fontSize="small" />,
              title: 'Upload de Imagem',
              category: 'Mídia',
              keywords: ['upload', 'imagem', 'foto'],
              command: ({ editor, range }) =>
                editor.chain().focus().deleteRange(range).insertContent({ type: 'imageUploader' }).run(),
            },
            {
              icon: <ViewColumnIcon fontSize="small" />,
              title: 'Colunas',
              category: 'Layout',
              keywords: ['columns', 'layout', 'duas colunas'],
              command: ({ editor, range }) =>
                editor.chain().focus().deleteRange(range).insertContent('<div data-type="columns"><div data-type="column"><p>Coluna 1</p></div><div data-type="column"><p>Coluna 2</p></div></div>').run(),
            },
          ]

          const fuse = new Fuse(allItems, {
            keys: ['title', 'keywords'],
            threshold: 0.4,
          })

          const results = !query ? allItems : fuse.search(query).map(r => r.item)

          const grouped = {}
          for (const item of results) {
            if (!grouped[item.category]) grouped[item.category] = []
            grouped[item.category].push(item)
          }

          return Object.entries(grouped).flatMap(([category, items]) => [
            { type: 'category', title: category },
            ...items,
          ])
        },

        render: () => {
          let container, popup, root, suggestionRef = React.createRef()
          let currentProps = null

          function executeCommand(item) {
            if (currentProps && item.type !== 'category') {
              item.command({
                editor: currentProps.editor,
                range: currentProps.range,
              })
            }
          }

          function renderReactComponent(props) {
            currentProps = props
            if (!root) return
            root.render(
              <SuggestionList
                ref={suggestionRef}
                items={props.items || []}
                command={executeCommand}
              />
            )
          }

          return {
            onStart: (props) => {
              if (!props.clientRect) return
              container = document.createElement('div')
              root = createRoot(container)
              renderReactComponent(props)

              if (!props.clientRect) return // ← CHECA DE NOVO ANTES DO TIPPY
              popup = tippy('body', {
                getReferenceClientRect: props.clientRect,
                appendTo: () => document.body,
                content: container,
                showOnCreate: true,
                interactive: true,
                trigger: 'manual',
                placement: 'bottom-start',
                maxWidth: 'none',
              })
            },

            onUpdate: (props) => {
              if (!props.clientRect) return
              renderReactComponent(props)
              if (popup && popup[0] && popup[0]._tippy && !popup[0]._tippy.state.isDestroyed) {
                popup[0].setProps({
                  getReferenceClientRect: props.clientRect,
                })
              }
            },

            onKeyDown: (props) => {
              if (props.event.key === 'Escape') {
                if (popup && popup[0] && popup[0]._tippy && !popup[0]._tippy.state.isDestroyed) {
                  popup[0].hide()
                }
                return true
              }
              if (suggestionRef.current && suggestionRef.current.onKeyDown) {
                return suggestionRef.current.onKeyDown(props)
              }
              return false
            },

            onExit: () => {
              if (popup && popup[0] && popup[0]._tippy && !popup[0]._tippy.state.isDestroyed) {
                popup[0].destroy()
              }
              if (root) root.unmount()
            },
          }
        },
      },
    }
  },
  addProseMirrorPlugins() {
    return [Suggestion({ editor: this.editor, ...this.options.suggestion })]
  },
})

export default SlashCommand
