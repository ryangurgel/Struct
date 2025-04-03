// NotesPage.jsx
import React, { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import Editor from './Editor'
import { v4 as uuidv4 } from 'uuid'

export default function NotesPage() {
  const [notes, setNotes] = useState([])
  const [selectedNote, setSelectedNote] = useState(null)
  const [editorContent, setEditorContent] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [noteId, setNoteId] = useState('')

  useEffect(() => {
    fetchNotes()
  }, [])

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

  const handleDelete = async (note) => {
    if (window.confirm(`Deseja deletar a nota ${note.name}?`)) {
      const { error } = await supabase.storage.from('notes').remove([`${note.name}/index.html`])
      if (error) {
        console.error('Erro ao deletar nota:', error)
      } else {
        fetchNotes()
      }
    }
  }

  const handleNewNote = () => {
    const newId = uuidv4()
    window.currentNoteId = newId
    setNoteId(newId)
    setSelectedNote(null)
    setEditorContent('')
    setIsEditing(true)
  }

  // Remove imagens que não estejam referenciadas no HTML salvo
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
    <div style={{ padding: '1rem', color: '#fff', backgroundColor: '#121212', minHeight: '100vh' }}>
      {!isEditing ? (
        <div>
          <h1>Notas</h1>
          <button onClick={handleNewNote}>Criar Nova Nota</button>
          <ul>
            {notes.map((note) => (
              <li key={note.name} style={{ margin: '0.5rem 0' }}>
                <strong>{note.name}</strong>
                <button onClick={() => handleEdit(note)} style={{ marginLeft: '1rem' }}>
                  Editar
                </button>
                <button onClick={() => handleDelete(note)} style={{ marginLeft: '0.5rem' }}>
                  Deletar
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div>
          <h2>{selectedNote ? `Editando: ${selectedNote.name}` : 'Criando nova nota'}</h2>
          <Editor initialContent={editorContent} onSave={handleSave} noteId={noteId} />
          <button onClick={() => setIsEditing(false)} style={{ marginTop: '1rem' }}>
            Cancelar
          </button>
        </div>
      )}
    </div>
  )
}
