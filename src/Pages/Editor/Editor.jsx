import React, { useEffect, useRef, useState, useCallback } from 'react'
import { ThemeProvider, Box } from '@mui/material'
import { useEditor, EditorContent, BubbleMenu } from '@tiptap/react'
import { NodeSelection } from 'prosemirror-state'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import Table from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import BulletList from '@tiptap/extension-bullet-list'
import OrderedList from '@tiptap/extension-ordered-list'
import ListItem from '@tiptap/extension-list-item'


import { Column, Columns } from './plugins/Columns/Columns.jsx'
import SlashCommand from './SlashCommand/SlashCommand.jsx'
import { ImageUploader } from './plugins/image/ImageUploader.js'
import EditorToolbar from './EditorToolbar.jsx'
import EditorBubbleMenu from './EditorBubbleMenu/EditorBubbleMenu.jsx'
import { darkTheme } from './EditorTheme'

// Importação do TabPlugin
import TabPlugin from './plugins/TabPlugin/TabPlugin'

const SAVE_DEBOUNCE_MS = 1500

export default function Editor({ initialContent = '', onSave, noteId, fontFamily = 'Helvetica', fontSize = 'Médio' }) {
  const [saveStatus, setSaveStatus] = useState('saved')
  const debounceTimerRef = useRef(null)
  const isSavingRef = useRef(false)
  const lastSavedContentRef = useRef(initialContent)
  const parentRef = useRef(null) // Ref para o TabPlugin

  useEffect(() => {
    window.currentNoteId = noteId
    return () => delete window.currentNoteId
  }, [noteId])

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ bulletList: false, orderedList: false, listItem: false }),
      BulletList,
      OrderedList,
      ListItem,
      Placeholder.configure({ placeholder: () => 'Digite "/" ou comece a escrever...', includeChildren: true }),
      Underline,
      Image.configure({ HTMLAttributes: { class: 'uploaded-image' } }),
      ImageUploader,
      Link.configure({ openOnClick: false, autolink: true }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Table.configure({ resizable: true }),
      TableRow,
      TableCell,
      TableHeader,
      Column,
      Columns,
      SlashCommand,
    ],
    content: initialContent,
    editorProps: {
      attributes: {
        style: `font-family: ${fontFamily}; font-size: 1rem; line-height: 1.6;`,
        class: 'tiptap-editor-content'
      }
    },
    onCreate({ editor }) {
      lastSavedContentRef.current = editor.getHTML()
      setSaveStatus('saved')
    },
    onUpdate({ editor }) {
      if (isSavingRef.current) return
      const content = editor.getHTML()
      if (content !== lastSavedContentRef.current) {
        setSaveStatus('unsaved')
        if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current)
        debounceTimerRef.current = setTimeout(() => handleSave(), SAVE_DEBOUNCE_MS)
      }
    }
  })

  const handleSave = useCallback(async () => {
    if (!editor || !onSave || isSavingRef.current) return
    const htmlContent = editor.getHTML()
    if (htmlContent === lastSavedContentRef.current && saveStatus !== 'error') {
      if (saveStatus === 'unsaved') setSaveStatus('saved')
      return
    }

    isSavingRef.current = true
    setSaveStatus('saving')

    try {
      await onSave(htmlContent)
      lastSavedContentRef.current = htmlContent
      setSaveStatus('saved')
    } catch (err) {
      setSaveStatus('error')
    } finally {
      isSavingRef.current = false
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current)
    }
  }, [editor, onSave, saveStatus])

  const handleManualSave = () => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current)
    handleSave()
  }

  if (!editor) return null

  return (
    <ThemeProvider theme={darkTheme}>
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <EditorToolbar saveStatus={saveStatus} onManualSave={handleManualSave} />
        <BubbleMenu editor={editor} shouldShow={({ state }) => !state.selection.empty && !(state.selection instanceof NodeSelection)}>
          <EditorBubbleMenu editor={editor} />
        </BubbleMenu>

        {/* Ref para container principal do editor */}
        <Box ref={parentRef} sx={{ flexGrow: 1, overflowY: 'auto', padding: 3 }}>
          <EditorContent editor={editor} />
        </Box>

        {/* Inserção do TabPlugin */}
        <TabPlugin editor={editor} parentRef={parentRef} />
      </Box>
    </ThemeProvider>
  )
}