// NotesPage.jsx
import React, { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import Editor from './Editor'
import { v4 as uuidv4 } from 'uuid'
import {
  Container,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'

export default function NotesPage() {
  const [notes, setNotes] = useState([])
  const [selectedNote, setSelectedNote] = useState(null)
  const [editorContent, setEditorContent] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [noteId, setNoteId] = useState('')
  const [confirmDialog, setConfirmDialog] = useState({ open: false, note: null })

  useEffect(() => {
    fetchNotes()
  }, [])

  // Busca as notas do Supabase Storage
  const fetchNotes = async () => {
    const { data, error } = await supabase.storage.from('notes').list('', {
      limit: 100,
      offset: 0,
      sortBy: { column: 'name', order: 'asc' },
    })
    if (error) {
      console.error('Erro ao buscar notas:', error)
    } else {
      setNotes(data)
    }
  }

  // Função para editar uma nota
  const handleEdit = async (note) => {
    window.currentNoteId = note.name
    setNoteId(note.name)
    // Acrescenta um query parameter para evitar cache
    const filePath = `${note.name}/index.html?t=${Date.now()}`
    const { data, error } = await supabase.storage.from('notes').download(filePath)
    if (error) {
      console.error('Erro ao baixar nota:', error)
      return
    }
    const htmlText = await data.text()
    setEditorContent(htmlText)
    setSelectedNote(note)
    setIsEditing(true)
  }

  // Abre o diálogo de confirmação para deleção
  const handleDeleteConfirm = (note) => {
    setConfirmDialog({ open: true, note })
  }

  // Executa a deleção após confirmação
  const handleDelete = async () => {
    const note = confirmDialog.note
    if (window.confirm(`Deseja deletar a nota ${note.name}?`)) {
      const { error } = await supabase.storage.from('notes').remove([`${note.name}/index.html`])
      if (error) {
        console.error('Erro ao deletar nota:', error)
      } else {
        fetchNotes()
      }
    }
    setConfirmDialog({ open: false, note: null })
  }

  // Cria uma nova nota
  const handleNewNote = () => {
    const newId = uuidv4()
    window.currentNoteId = newId
    setNoteId(newId)
    setSelectedNote(null)
    setEditorContent('')
    setIsEditing(true)
  }

  // Remove imagens não referenciadas no HTML salvo
  const cleanupUnusedImages = async (noteId, htmlContent) => {
    const regex = /<(?:img|div)[^>]+src=["']([^"']+)["']/g
    const imgSrcs = []
    let match
    while ((match = regex.exec(htmlContent)) !== null) {
      imgSrcs.push(match[1])
    }

    const { data: assets, error } = await supabase.storage.from('notes').list(`${noteId}/assets`, {
      limit: 100,
      offset: 0,
    })
    if (error) {
      console.error('Erro ao listar assets:', error)
      return
    }

    for (const file of assets) {
      const filePath = `${noteId}/assets/${file.name}`
      const { data: publicData } = supabase.storage.from('notes').getPublicUrl(filePath)
      const publicUrl = publicData.publicUrl
      if (!imgSrcs.includes(publicUrl)) {
        await supabase.storage.from('notes').remove([filePath])
      }
    }
  }

  // Salva a nota
  const handleSave = async (htmlContent) => {
    const currentNoteName = selectedNote ? selectedNote.name : noteId
    if (!currentNoteName) {
      alert('Não há nota definida.')
      return
    }
    const filePath = `${currentNoteName}/index.html`
    // Remove o arquivo antigo para garantir a atualização
    await supabase.storage.from('notes').remove([filePath])
    const { error } = await supabase.storage.from('notes').upload(filePath, htmlContent, {
      upsert: true,
    })
    if (error) {
      console.error('Erro ao salvar nota:', error)
    } else {
      await cleanupUnusedImages(currentNoteName, htmlContent)
      setIsEditing(false)
      fetchNotes()
    }
  }

  return (
    <Container maxWidth="md" sx={{ pt: 2, pb: 4, color: '#fff', backgroundColor: '#121212', minHeight: '100vh' }}>
      {!isEditing ? (
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Notas
          </Typography>
          <Button variant="contained" color="primary" onClick={handleNewNote} sx={{ mb: 2 }}>
            Criar Nova Nota
          </Button>
          <List>
            {notes.map((note) => (
              <ListItem key={note.name} sx={{ borderBottom: '1px solid #333' }}>
                <ListItemText primary={note.name} />
                <ListItemSecondaryAction>
                  <IconButton edge="end" aria-label="edit" onClick={() => handleEdit(note)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteConfirm(note)}>
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </Box>
      ) : (
        <Box>
          <Typography variant="h5" gutterBottom>
            {selectedNote ? `Editando: ${selectedNote.name}` : 'Criando nova nota'}
          </Typography>
          <Editor initialContent={editorContent} onSave={handleSave} noteId={noteId} />
          <Box sx={{ mt: 2, textAlign: 'right' }}>
            <Button variant="outlined" color="secondary" onClick={() => setIsEditing(false)}>
              Cancelar
            </Button>
          </Box>
        </Box>
      )}

      {/* Diálogo de confirmação para deleção */}
      <Dialog open={confirmDialog.open} onClose={() => setConfirmDialog({ open: false, note: null })}>
        <DialogTitle>Confirmação</DialogTitle>
        <DialogContent>
          <Typography>
            Tem certeza que deseja deletar a nota {confirmDialog.note?.name}?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog({ open: false, note: null })}>Cancelar</Button>
          <Button color="error" onClick={handleDelete}>Deletar</Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}
