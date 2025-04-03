// ImageUploaderComponent.jsx
import React, { useRef, useState, useEffect } from 'react'
import { supabase } from './supabaseClient'

const ImageUploaderComponent = (props) => {
  const { node, updateAttributes, selected } = props
  const containerRef = useRef(null)
  const inputRef = useRef(null)
  const [uploading, setUploading] = useState(false)
  const [src, setSrc] = useState(node.attrs.src)
  const [hovered, setHovered] = useState(false)

  // Ao montar ou quando os atributos de tamanho mudam, aplica as dimensões ao contêiner.
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.style.width = node.attrs.width
      containerRef.current.style.height = node.attrs.height
    }
  }, [node.attrs.width, node.attrs.height])

  const handleFileChange = async (event) => {
    const file = event.target.files[0]
    if (!file) return
    setUploading(true)
    const noteId = window.currentNoteId || 'default-note'
    const filePath = `${noteId}/assets/${Date.now()}_${file.name}`
    const { error } = await supabase.storage.from('notes').upload(filePath, file)
    if (error) {
      alert('Erro no upload da imagem: ' + error.message)
      setUploading(false)
      return
    }
    const { data: publicData } = supabase.storage.from('notes').getPublicUrl(filePath)
    const publicUrl = publicData.publicUrl
    if (!publicUrl) {
      alert('Não foi possível obter a URL pública da imagem.')
      setUploading(false)
      return
    }
    setSrc(publicUrl)
    updateAttributes({ src: publicUrl })
    setUploading(false)
  }

  const handleDrop = async (event) => {
    event.preventDefault()
    const file = event.dataTransfer.files[0]
    if (!file) return
    setUploading(true)
    const noteId = window.currentNoteId || 'default-note'
    const filePath = `${noteId}/assets/${Date.now()}_${file.name}`
    const { error } = await supabase.storage.from('notes').upload(filePath, file)
    if (error) {
      alert('Erro no upload da imagem: ' + error.message)
      setUploading(false)
      return
    }
    const { data: publicData } = supabase.storage.from('notes').getPublicUrl(filePath)
    const publicUrl = publicData.publicUrl
    if (!publicUrl) {
      alert('Não foi possível obter a URL pública da imagem.')
      setUploading(false)
      return
    }
    setSrc(publicUrl)
    updateAttributes({ src: publicUrl })
    setUploading(false)
  }

  const handleDragOver = (event) => {
    event.preventDefault()
  }

  // Atualiza as dimensões após o redimensionamento
  const handleResizeEnd = () => {
    if (containerRef.current) {
      const newWidth = containerRef.current.offsetWidth + 'px'
      const newHeight = containerRef.current.offsetHeight + 'px'
      updateAttributes({ width: newWidth, height: newHeight })
    }
  }

  // Controla o estado de hover para exibir a borda de seleção
  const handleMouseEnter = () => setHovered(true)
  const handleMouseLeave = () => setHovered(false)

  // Define o estilo do contêiner: a borda só aparece se o nó estiver selecionado ou em hover.
  const containerStyle = {
    border: (selected || hovered) ? '2px dashed #ccc' : '1px solid transparent',
    padding: '8px',
    textAlign: 'center',
    position: 'relative',
    resize: 'both',
    overflow: 'hidden',
    minWidth: '200px',
    minHeight: '150px',
    transition: 'border 0.2s ease-in-out',
  }

  return (
    <div
      ref={containerRef}
      contentEditable={false}
      style={containerStyle}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onMouseUp={handleResizeEnd}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      data-node-view-wrapper
    >
      {src ? (
        <img
          src={src}
          alt="Uploaded"
          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ marginBottom: '8px', opacity: 0.2 }}
          >
            <rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect>
            <circle cx="9" cy="9" r="2"></circle>
            <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path>
          </svg>
          <div style={{ fontSize: '14px', marginBottom: '8px', color: '#888' }}>
            Drag and drop or
          </div>
          <button
            onClick={() => inputRef.current && inputRef.current.click()}
            style={{
              border: 'none',
              borderRadius: '4px',
              padding: '8px 12px',
              background: '#007bff',
              color: '#fff',
              cursor: 'pointer',
            }}
          >
            Upload an image
          </button>
          <input
            ref={inputRef}
            accept=".jpg,.jpeg,.png,.webp,.gif"
            type="file"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
          {uploading && <div style={{ marginTop: '8px', fontSize: '12px' }}>Uploading...</div>}
        </div>
      )}
    </div>
  )
}

export default ImageUploaderComponent
