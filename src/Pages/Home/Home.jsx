import React from 'react'
import Editor from '../Editor/Editor'
import { LuPlus, LuPencil, LuTrash2, LuLoader, LuX } from "react-icons/lu"
import styles from './Home.module.css'
import { useNotes } from '../../hooks/useNotes'

export default function Home() {
  const {
    notes,
    selectedNote,
    editorContent,
    isEditing,
    isLoading,
    isSaving,
    errorMsg,
    noteId,
    handleEdit,
    handleDelete,
    handleNewNote,
    handleSave,
    handleCancelEdit,
    setErrorMsg,
  } = useNotes()

  const IconWrapper = ({ children }) => (
    <span className={`${styles.buttonIcon} react-icon`}>{children}</span>
  )

  if (isLoading && notes.length === 0 && !isEditing) {
    return (
      <div className={styles.loadingMessage}>
        <LuLoader size={30} className={styles.loadingSpinner} />
        Carregando notas...
      </div>
    )
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
  )
}
