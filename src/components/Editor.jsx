// Editor.jsx
import React, { useState, useCallback, useRef } from 'react'
import { useEditor, EditorContent, FloatingMenu } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import Table from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import SlashCommand from './SlashCommand'
import TabPlugin from './TabPlugin'
import { 
  Box, 
  ThemeProvider, 
  Tooltip, 
  IconButton, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  OutlinedInput 
} from '@mui/material'
import { createTheme } from '@mui/material/styles'

// Ícones para a toolbar
import FormatBoldIcon from '@mui/icons-material/FormatBold'
import FormatItalicIcon from '@mui/icons-material/FormatItalic'
import FormatUnderlinedIcon from '@mui/icons-material/FormatUnderlined'
import StrikethroughSIcon from '@mui/icons-material/StrikethroughS'
import FormatQuoteIcon from '@mui/icons-material/FormatQuote'
import CodeIcon from '@mui/icons-material/Code'
import LinkIcon from '@mui/icons-material/Link'
import ImageIcon from '@mui/icons-material/Image'

// Importa os estilos customizados
import './editor.css'

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#bb86fc' },
    background: { default: '#121212', paper: '#1e1e1e' },
  },
})

export default function Editor() {
  const [fontFamily, setFontFamily] = useState('Helvetica')
  const [fontSize, setFontSize] = useState('Medium')
  const sizeMap = { Small: '14px', Medium: '16px', Large: '18px' }
  const containerRef = useRef(null)

  const editorStyle = useCallback(() => ({
    fontFamily,
    fontSize: sizeMap[fontSize] || '16px',
    minHeight: '200px',
    padding: '1rem',
    backgroundColor: '#121212',
    color: '#ccc',
  }), [fontFamily, fontSize])

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      TaskList,
      TaskItem,
      Table.configure({ resizable: true }),
      TableRow,
      TableCell,
      TableHeader,
      SlashCommand,
    ],
    content: `<p>Type "/" to open the slash command menu.</p>`,
  })

  if (!editor) return null

  const setLink = () => {
    const url = prompt('URL do link:')
    if (url) {
      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
    } else {
      editor.chain().focus().unsetLink().run()
    }
  }

  const insertImage = () => {
    const url = prompt('URL da imagem:')
    if (url) {
      editor.chain().focus().setImage({ src: url }).run()
    }
  }

  return (
    <ThemeProvider theme={darkTheme}>
      <Box 
        ref={containerRef}
        sx={{ 
          backgroundColor: 'background.paper', 
          color: '#ccc', 
          border: '1px solid #333', 
          borderRadius: '4px', 
          position: 'relative', 
          p: 1 
        }}
      >
        {/* FloatingMenu: Toolbar */}
        <FloatingMenu
          editor={editor}
          tippyOptions={{ duration: 100, placement: 'top-start', maxWidth: 'none' }}
          shouldShow={({ editor }) => !editor.state.selection.empty}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FormControl size="small" sx={{ minWidth: 100 }}>
              <InputLabel>Fonte</InputLabel>
              <Select
                value={fontFamily}
                onChange={(e) => setFontFamily(e.target.value)}
                input={<OutlinedInput label="Fonte" />}
                sx={{ color: '#ccc' }}
              >
                <MenuItem value="Helvetica">Helvetica</MenuItem>
                <MenuItem value="Arial">Arial</MenuItem>
                <MenuItem value="Georgia">Georgia</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 100 }}>
              <InputLabel>Tamanho</InputLabel>
              <Select
                value={fontSize}
                onChange={(e) => setFontSize(e.target.value)}
                input={<OutlinedInput label="Tamanho" />}
                sx={{ color: '#ccc' }}
              >
                <MenuItem value="Small">Small</MenuItem>
                <MenuItem value="Medium">Medium</MenuItem>
                <MenuItem value="Large">Large</MenuItem>
              </Select>
            </FormControl>
            <Tooltip title="Negrito">
              <IconButton onClick={() => editor.chain().focus().toggleBold().run()} color={editor.isActive('bold') ? 'primary' : 'default'}>
                <FormatBoldIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Itálico">
              <IconButton onClick={() => editor.chain().focus().toggleItalic().run()} color={editor.isActive('italic') ? 'primary' : 'default'}>
                <FormatItalicIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Sublinhado">
              <IconButton onClick={() => editor.chain().focus().toggleUnderline().run()} color={editor.isActive('underline') ? 'primary' : 'default'}>
                <FormatUnderlinedIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Tachado">
              <IconButton onClick={() => editor.chain().focus().toggleStrike().run()} color={editor.isActive('strike') ? 'primary' : 'default'}>
                <StrikethroughSIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Blockquote">
              <IconButton onClick={() => editor.chain().focus().toggleBlockquote().run()} color={editor.isActive('blockquote') ? 'primary' : 'default'}>
                <FormatQuoteIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Code Block">
              <IconButton onClick={() => editor.chain().focus().toggleCodeBlock().run()} color={editor.isActive('codeBlock') ? 'primary' : 'default'}>
                <CodeIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Link">
              <IconButton onClick={setLink}>
                <LinkIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Imagem">
              <IconButton onClick={insertImage}>
                <ImageIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </FloatingMenu>

        {/* Área do editor com classe para aplicar estilos customizados */}
        <Box sx={editorStyle()} className="tiptap-content">
          <EditorContent editor={editor} />
        </Box>

        {/* Integração do plugin de abas para linha e coluna */}
        <TabPlugin editor={editor} parentRef={containerRef} />
      </Box>
    </ThemeProvider>
  )
}
