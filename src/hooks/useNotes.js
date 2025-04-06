import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../supabaseClient'
import { v4 as uuidv4 } from 'uuid'

export function useNotes() {
  const [notes, setNotes] = useState([])
  const [selectedNote, setSelectedNote] = useState(null)
  const [editorContent, setEditorContent] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [noteId, setNoteId] = useState('')

  useEffect(() => {
    fetchNotes()
  }, [])

  const fetchNotes = useCallback(async () => {
    setIsLoading(true)
    try {
      const { data: folders, error } = await supabase.storage.from('notes').list('', { limit: 100 })
      if (error) throw error

      const validNotes = []

      for (const folder of folders) {
        const path = `${folder.name}/index.html`
        const { data, error: fileError } = await supabase.storage.from('notes').download(path)

        if (!fileError && data) {
          validNotes.push({
            id: folder.name,
            name: folder.name,
            path,
          })
        }
      }

      setNotes(validNotes)
    } catch (error) {
      console.error('Erro ao buscar notas:', error)
      setErrorMsg(`Falha ao buscar notas: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const handleEdit = useCallback(async (note) => {
    setIsEditing(true)
    setSelectedNote(note)
    setNoteId(note.id)
    setIsLoading(true)

    try {
      const { data } = supabase.storage.from('notes').getPublicUrl(note.path)
      const bustedUrl = `${data.publicUrl}?t=${Date.now()}`
      const response = await fetch(bustedUrl)
      const text = await response.text()
      setEditorContent(text)
    } catch (error) {
      console.error('Erro ao carregar conteúdo da nota:', error)
      setErrorMsg(`Falha ao carregar conteúdo da nota: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const handleDelete = useCallback(async (note) => {
    const confirmDelete = window.confirm(`Tem certeza que deseja deletar a nota "${note.name}"?`)
    if (!confirmDelete) return
    setIsLoading(true)

    try {
      const { error: fileError } = await supabase.storage.from('notes').remove([
        `${note.id}/index.html`,
        `${note.id}/assets/`,
      ])
      if (fileError) throw fileError

      fetchNotes()
    } catch (error) {
      console.error('Erro ao deletar nota:', error)
      setErrorMsg(`Falha ao deletar a nota: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }, [fetchNotes])

  const handleNewNote = useCallback(() => {
    const newId = uuidv4()
    setIsEditing(true)
    setSelectedNote(null)
    setEditorContent('')
    setNoteId(newId)
  }, [])

  const handleSave = useCallback(async (htmlContent) => {
    if (!noteId) {
      setErrorMsg('Erro: ID da nota não definido. Não é possível salvar.')
      return
    }

    setIsSaving(true)
    setErrorMsg('')

    try {
      const file = new File([htmlContent], 'index.html', {
        type: 'text/html',
      })

      const { error } = await supabase.storage.from('notes').upload(`${noteId}/index.html`, file, {
        upsert: true,
      })

      if (error) throw error

      fetchNotes()
    } catch (error) {
      console.error('Erro ao salvar nota:', error)
      setErrorMsg(`Falha ao salvar a nota: ${error.message}`)
    } finally {
      setIsSaving(false)
    }
  }, [noteId, fetchNotes])

  const handleCancelEdit = useCallback(() => {
    setIsEditing(false)
    setSelectedNote(null)
    setEditorContent('')
    setNoteId('')
    setErrorMsg('')
  }, [])

  return {
    notes,
    selectedNote,
    editorContent,
    isEditing,
    isLoading,
    isSaving,
    errorMsg,
    noteId,

    fetchNotes,
    handleEdit,
    handleDelete,
    handleNewNote,
    handleSave,
    handleCancelEdit,
    setErrorMsg, // pra zerar erro de fora se quiser
  }
}
