import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import Editor from '../components/Editor';
import { v4 as uuidv4 } from 'uuid';
import {
  LuPlus,
  LuPencil,
  LuTrash2,
  LuSave,
  LuLoader,
  LuX
} from "react-icons/lu";
import styles from '../styles/NotesPage.module.css';

export default function NotesPage() {
  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [editorContent, setEditorContent] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [noteId, setNoteId] = useState('');

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    setIsLoading(true);
    try {
      const { data: folders, error } = await supabase
        .storage
        .from('notes')
        .list('', { limit: 100 });

      if (error) throw error;

      const validNotes = [];

      for (const folder of folders) {
        const path = `${folder.name}/index.html`;
        const { data, error: fileError } = await supabase
          .storage
          .from('notes')
          .download(path);

        if (!fileError && data) {
          validNotes.push({
            id: folder.name,
            name: folder.name,
            path,
          });
        }
      }

      setNotes(validNotes);
    } catch (error) {
      console.error('Erro ao buscar notas:', error);
      setErrorMsg(`Falha ao buscar notas: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = async (note) => {
    setIsEditing(true);
    setSelectedNote(note);
    setNoteId(note.id);
    setIsLoading(true);
    try {
        const { data } = supabase
        .storage
        .from('notes')
        .getPublicUrl(note.path);
      
      const bustedUrl = `${data.publicUrl}?t=${Date.now()}`;
      const response = await fetch(bustedUrl);
      const text = await response.text();
      setEditorContent(text);
      
    } catch (error) {
      console.error('Erro ao carregar conteúdo da nota:', error);
      setErrorMsg(`Falha ao carregar conteúdo da nota: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (note) => {
    const confirmDelete = window.confirm(`Tem certeza que deseja deletar a nota "${note.name}"?`);
    if (!confirmDelete) return;
    setIsLoading(true);
    try {
      const { error: fileError } = await supabase
        .storage
        .from('notes')
        .remove([
          `${note.id}/index.html`,
          `${note.id}/assets/` // se tiver pasta de imagens
        ]);
      if (fileError) throw fileError;
      fetchNotes();
    } catch (error) {
      console.error('Erro ao deletar nota:', error);
      setErrorMsg(`Falha ao deletar a nota: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewNote = () => {
    const newId = uuidv4();
    setIsEditing(true);
    setSelectedNote(null);
    setEditorContent('');
    setNoteId(newId);
  };

  const handleSave = async (htmlContent) => {
    const currentNoteId = noteId;
    if (!currentNoteId) {
      setErrorMsg('Erro: ID da nota não definido. Não é possível salvar.');
      return;
    }
    setIsSaving(true);
    setErrorMsg('');
  
    try {
      const file = new File([htmlContent], 'index.html', {
        type: 'text/html',
      });
  
      const { error } = await supabase
        .storage
        .from('notes')
        .upload(`${currentNoteId}/index.html`, file, {
          upsert: true,
        });
  
      if (error) throw error;
  
      setIsEditing(false);
      setSelectedNote(null);
      setEditorContent('');
      setNoteId('');
      fetchNotes();
    } catch (error) {
      console.error('Erro ao salvar nota:', error);
      setErrorMsg(`Falha ao salvar a nota: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };
  

  const handleCancelEdit = () => {
    setIsEditing(false);
    setSelectedNote(null);
    setEditorContent('');
    setNoteId('');
    setErrorMsg('');
  };

  const IconWrapper = ({ children }) => <span className={`${styles.buttonIcon} react-icon`}>{children}</span>;

  if (isLoading && notes.length === 0 && !isEditing) {
    return (
      <div className={styles.loadingMessage}>
        <LuLoader size={30} className={styles.loadingSpinner} />
        Carregando notas...
      </div>
    );
  }

  return (
    <div className={styles.notesPageContainer}>
      {errorMsg && (
        <div className={styles.errorMessage} role="alert">
          <div>
            <strong>Erro: </strong>
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg('')} className={styles.closeErrorButton}>
            <LuX size={20} className="react-icon" />
          </button>
        </div>
      )}

      {!isEditing && (
        <div className={styles.header}>
          <h1 className={styles.title}>Minhas Notas</h1>
          <button
            onClick={handleNewNote}
            disabled={isLoading}
            className={`${styles.button} ${styles.buttonPrimary}`}
          >
            <IconWrapper><LuPlus size={18} /></IconWrapper>
            Criar Nova Nota
          </button>
        </div>
      )}

      {isEditing ? (
        <div className={styles.editorContainer}>
          <h2 className={styles.editorHeader}>
            {selectedNote ? `Editando: ${selectedNote.name}` : `Criando Nova Nota`}
          </h2>
          <Editor
            initialContent={editorContent}
            onSave={handleSave}
            noteId={noteId}
            isSaving={isSaving}
          />
          <div className={styles.editorActions}>
            <button
              onClick={handleCancelEdit}
              disabled={isSaving}
              className={`${styles.button} ${styles.buttonCancel}`}
            >
              <IconWrapper><LuX size={18} /></IconWrapper>
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <div className={styles.noteListContainer}>
          {isLoading && !isEditing && (
            <div className={styles.loadingMessage}>
              <LuLoader size={24} className={styles.loadingSpinner} />
              Atualizando lista...
            </div>
          )}
          {!isLoading && notes.length === 0 && (
            <p className={styles.emptyMessage}>Nenhuma nota encontrada. Crie sua primeira nota!</p>
          )}
          <ul className={styles.noteList}>
            {notes.map((note) => (
              <li key={note.name} className={styles.noteItem}>
                <span className={styles.noteName} title={note.name}>
                  {note.name}
                </span>
                <div className={styles.noteActions}>
                  <button
                    onClick={() => handleEdit(note)}
                    disabled={isLoading || isSaving}
                    className={`${styles.button} ${styles.buttonWarning} ${styles.buttonSmall}`}
                    title="Editar Nota"
                  >
                    <IconWrapper><LuPencil size={16} /></IconWrapper>
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(note)}
                    disabled={isLoading || isSaving}
                    className={`${styles.button} ${styles.buttonDanger} ${styles.buttonSmall}`}
                    title="Deletar Nota"
                  >
                    <IconWrapper><LuTrash2 size={16} /></IconWrapper>
                    Deletar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
