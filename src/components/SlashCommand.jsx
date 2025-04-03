// SlashCommand.jsx
import React from 'react'
import { createRoot } from 'react-dom/client'
import { Extension } from '@tiptap/core'
import Suggestion from '@tiptap/suggestion'
import tippy from 'tippy.js'
import SuggestionList from './SuggestionList'
import NotesIcon from '@mui/icons-material/Notes'
import LooksOneIcon from '@mui/icons-material/LooksOne'
import LooksTwoIcon from '@mui/icons-material/LooksTwo'
import Looks3Icon from '@mui/icons-material/Looks3'
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted'
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered'
import CheckBoxIcon from '@mui/icons-material/CheckBox'
import FormatQuoteIcon from '@mui/icons-material/FormatQuote'
import CodeIcon from '@mui/icons-material/Code'
import HorizontalRuleIcon from '@mui/icons-material/HorizontalRule'
import TableChartIcon from '@mui/icons-material/TableChart'
import ImageIcon from '@mui/icons-material/Image'
import ViewColumnIcon from '@mui/icons-material/ViewColumn'
import SubjectIcon from '@mui/icons-material/Subject'

const SlashCommand = Extension.create({
  name: 'slash-command',
  addOptions() {
    return {
      suggestion: {
        char: '/',
        startOfLine: false,
        items: ({ query }) => {
          const q = query.toLowerCase()
          const allItems = [
            {
              icon: <LooksOneIcon fontSize="small" />,
              title: 'Heading 1',
              command: ({ editor, range }) =>
                editor.chain().focus().deleteRange(range).setHeading({ level: 1 }).run(),
            },
            {
              icon: <LooksTwoIcon fontSize="small" />,
              title: 'Heading 2',
              command: ({ editor, range }) =>
                editor.chain().focus().deleteRange(range).setHeading({ level: 2 }).run(),
            },
            {
              icon: <Looks3Icon fontSize="small" />,
              title: 'Heading 3',
              command: ({ editor, range }) =>
                editor.chain().focus().deleteRange(range).setHeading({ level: 3 }).run(),
            },
            {
              icon: <NotesIcon fontSize="small" />,
              title: 'Paragraph',
              command: ({ editor, range }) =>
                editor.chain().focus().deleteRange(range).setParagraph().run(),
            },
            {
              icon: <FormatListBulletedIcon fontSize="small" />,
              title: 'Bullet List',
              command: ({ editor, range }) =>
                editor.chain().focus().deleteRange(range).toggleBulletList().run(),
            },
            {
              icon: <FormatListNumberedIcon fontSize="small" />,
              title: 'Numbered List',
              command: ({ editor, range }) =>
                editor.chain().focus().deleteRange(range).toggleOrderedList().run(),
            },
            {
              icon: <CheckBoxIcon fontSize="small" />,
              title: 'Task List',
              command: ({ editor, range }) =>
                editor.chain().focus().deleteRange(range).toggleTaskList().run(),
            },
            {
              icon: <FormatListBulletedIcon fontSize="small" />,
              title: 'Toggle List',
              command: ({ editor, range }) =>
                editor.chain().focus().deleteRange(range).toggleBulletList().run(),
            },
            {
              icon: <FormatQuoteIcon fontSize="small" />,
              title: 'Blockquote',
              command: ({ editor, range }) =>
                editor.chain().focus().deleteRange(range).toggleBlockquote().run(),
            },
            {
              icon: <CodeIcon fontSize="small" />,
              title: 'Code Block',
              command: ({ editor, range }) =>
                editor.chain().focus().deleteRange(range).toggleCodeBlock().run(),
            },
            {
              icon: <HorizontalRuleIcon fontSize="small" />,
              title: 'Horizontal Rule',
              command: ({ editor, range }) =>
                editor.chain().focus().deleteRange(range).setHorizontalRule().run(),
            },
            {
              icon: <TableChartIcon fontSize="small" />,
              title: 'Table',
              command: ({ editor, range }) => {
                editor.chain().focus().deleteRange(range)
                  .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
                  .run()
              },
            },
            {
              icon: <ImageIcon fontSize="small" />,
              title: 'Image',
              command: ({ editor, range }) => {
                const url = prompt('URL da imagem:')
                if (!url) return
                editor.chain().focus().deleteRange(range).setImage({ src: url }).run()
              },
            },
            {
              icon: <ImageIcon fontSize="small" />,
              title: 'Upload Image',
              command: ({ editor, range }) => {
                // Insere o nó do image uploader
                editor.chain().focus().deleteRange(range).insertContent({
                  type: 'imageUploader',
                }).run()
              },
            },
            {
              icon: <ViewColumnIcon fontSize="small" />,
              title: 'Columns',
              command: ({ editor, range }) => {
                editor.chain().focus().deleteRange(range).insertContent(`
                  <div style="display: flex; gap: 16px;">
                    <div style="flex: 1; border: 1px solid #ccc; padding: 8px;">
                      <p>Coluna 1</p>
                    </div>
                    <div style="flex: 1; border: 1px solid #ccc; padding: 8px;">
                      <p>Coluna 2</p>
                    </div>
                  </div>
                `).run()
              },
            },
            {
              icon: <SubjectIcon fontSize="small" />,
              title: 'Table of Contents',
              command: ({ editor, range }) => {
                editor.chain().focus().deleteRange(range).insertContent(`
                  <div style="border: 1px dashed #666; padding: 8px;">
                    <p><strong>[Table of Contents Placeholder]</strong></p>
                  </div>
                `).run()
              },
            },
          ]
          return allItems.filter((item) => item.title.toLowerCase().includes(q))
        },
        render: () => {
          let container, popup, root, suggestionRef = React.createRef()
          let currentProps = null

          function executeCommand(item) {
            if (currentProps) {
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
              container = document.createElement('div')
              root = createRoot(container)
              renderReactComponent(props)
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
              renderReactComponent(props)
              if (popup && popup[0] && !popup[0]._isDestroyed) {
                popup[0].setProps({
                  getReferenceClientRect: props.clientRect,
                })
              }
            },
            onKeyDown: (props) => {
              if (props.event.key === 'Escape') {
                if (popup && popup[0] && !popup[0]._isDestroyed) {
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
              if (popup && popup[0] && !popup[0]._isDestroyed) {
                popup[0].destroy()
              }
              if (root) {
                root.unmount()
              }
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
