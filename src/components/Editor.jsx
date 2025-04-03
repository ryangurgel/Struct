// Editor.jsx
import React, { useState, useCallback, useEffect } from 'react'
import { useEditor, EditorContent, FloatingMenu } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import Table from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import { Columns, Column } from './Columns.jsx'
import SlashCommand from './SlashCommand'
import { ImageUploader } from './ImageUploader'
import {
  Box,
  ThemeProvider,
  Tooltip,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
  Button,
  useMediaQuery,
} from '@mui/material'
import { createTheme } from '@mui/material/styles'

// Ícones da toolbar
import FormatBoldIcon from '@mui/icons-material/FormatBold'
import FormatItalicIcon from '@mui/icons-material/FormatItalic'
import FormatUnderlinedIcon from '@mui/icons-material/FormatUnderlined'
import StrikethroughSIcon from '@mui/icons-material/StrikethroughS'
import FormatQuoteIcon from '@mui/icons-material/FormatQuote'
import CodeIcon from '@mui/icons-material/Code'
import LinkIcon from '@mui/icons-material/Link'
import ImageIcon from '@mui/icons-material/Image'

// Importa estilos customizados
import './editor.css'

// Tema escuro customizado com responsividade
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#bb86fc' },
    background: { default: '#121212', paper: '#1e1e1e' },
  },
  typography: {
    fontFamily: 'Helvetica, Arial, sans-serif',
  },
})

export default function Editor({ initialContent, onSave, noteId }) {
  const [fontFamily, setFontFamily] = useState('Helvetica')
  const [fontSize, setFontSize] = useState('Medium')
  const sizeMap = { Small: '14px', Medium: '16px', Large: '18px' }
  const isMobile = useMediaQuery(darkTheme.breakpoints.down('sm'))

  // Define estilo do editor com base nas configurações e responsividade
  const editorStyle = useCallback(() => ({
    fontFamily,
    fontSize: sizeMap[fontSize] || '16px',
    minHeight: '200px',
    padding: '1rem',
    backgroundColor: darkTheme.palette.background.paper,
    color: '#ccc',
    borderRadius: '4px',
  }), [fontFamily, fontSize])

  // Configuração do editor com extensões
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
      Column, // Extensão para colunas
      Columns,
      SlashCommand,
      ImageUploader, // Extensão customizada para upload de imagens
    ],
    content: initialContent || `<p>Digite "/" para abrir o menu de comandos.</p>`,
  })

  useEffect(() => {
    if (editor && initialContent) {
      editor.commands.setContent(initialContent)
    }
  }, [initialContent, editor])

  if (!editor) return null

  // Função para definir ou remover link
  const setLink = () => {
    const url = prompt('URL do link:')
    if (url) {
      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
    } else {
      editor.chain().focus().unsetLink().run()
    }
  }

  // Função para inserir imagem
  const insertImage = () => {
    const url = prompt('URL da imagem:')
    if (url) {
      editor.chain().focus().setImage({ src: url }).run()
    }
  }

  // Função para salvar conteúdo
  const handleSaveClick = () => {
    const htmlContent = editor.getHTML()
    if (onSave) onSave(htmlContent)
  }

  return (
    <ThemeProvider theme={darkTheme}>
      <Box
        sx={{
          backgroundColor: 'background.paper',
          color: '#ccc',
          border: '1px solid #333',
          borderRadius: '4px',
          p: { xs: 1, sm: 2 },
          position: 'relative',
        }}
      >
        <FloatingMenu
          editor={editor}
          tippyOptions={{ duration: 100, placement: 'top-start', maxWidth: 'none' }}
          shouldShow={({ editor }) => !editor.state.selection.empty}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
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
        <Box sx={editorStyle()} className="tiptap-content">
          <EditorContent editor={editor} />
        </Box>
        <Box sx={{ mt: 2, textAlign: 'right' }}>
          <Button variant="contained" color="primary" onClick={handleSaveClick}>
            Salvar Nota
          </Button>
        </Box>
      </Box>
    </ThemeProvider>
  )
}
