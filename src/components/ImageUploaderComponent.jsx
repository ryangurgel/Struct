// ImageUploaderComponent.jsx
import React, { useRef, useState, useEffect, useCallback } from 'react';
import { NodeViewWrapper } from '@tiptap/react';
import { supabase } from '../supabaseClient'; // Ajuste o caminho se necessário
import {
  Box,
  Button,
  CircularProgress,
  Typography,
  IconButton,
  Stack,
  Tooltip,
  Slider,
  Collapse
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import BrokenImageIcon from '@mui/icons-material/BrokenImage';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import FormatAlignLeftIcon from '@mui/icons-material/FormatAlignLeft';
import FormatAlignCenterIcon from '@mui/icons-material/FormatAlignCenter';
import FormatAlignRightIcon from '@mui/icons-material/FormatAlignRight';

const ImageUploaderComponent = (props) => {
  const { node, updateAttributes, selected, deleteNode } = props;
  const containerRef = useRef(null);
  const imgRef = useRef(null);
  const inputRef = useRef(null);

  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [currentSrc, setCurrentSrc] = useState(node.attrs.src);
  const [sliderValue, setSliderValue] = useState(() => {
    if (node.attrs.width && typeof node.attrs.width === 'string' && node.attrs.width.endsWith('%')) {
      const percent = parseInt(node.attrs.width, 10);
      return isNaN(percent) ? 100 : percent;
    }
    return 100;
  });

  // Sincroniza o estado interno se os atributos externos mudarem
  useEffect(() => {
    setCurrentSrc(node.attrs.src);
    if (node.attrs.width && typeof node.attrs.width === 'string' && node.attrs.width.endsWith('%')) {
      const percent = parseInt(node.attrs.width, 10);
      if (!isNaN(percent) && percent !== sliderValue) {
        setSliderValue(percent);
      }
    }
  }, [node.attrs.src, node.attrs.width]);

  // Aplica alinhamento e largura no container principal (NodeViewWrapper)
  useEffect(() => {
    if (containerRef.current) {
      const { align } = node.attrs;
      const width = node.attrs.width || '100%';

      containerRef.current.style.width = width;
      containerRef.current.style.display = 'block';
      containerRef.current.style.height = 'auto';
      containerRef.current.style.maxWidth = '100%';

      if (align === 'left') {
        containerRef.current.style.marginLeft = '0';
        containerRef.current.style.marginRight = 'auto';
      } else if (align === 'right') {
        containerRef.current.style.marginLeft = 'auto';
        containerRef.current.style.marginRight = '0';
      } else {
        containerRef.current.style.marginLeft = 'auto';
        containerRef.current.style.marginRight = 'auto';
      }
    }
  }, [node.attrs.width, node.attrs.align]);

  // --- Upload/File Handling ---
  const handleFileSelect = useCallback(
    async (file) => {
      if (!file || !file.type.startsWith('image/')) {
        setError('Por favor, selecione um arquivo de imagem válido.');
        return;
      }
      setUploading(true);
      setError(null);

      const noteId = window.currentNoteId || 'unidentified-note';
      const filePath = `${noteId}/assets/${Date.now()}_${file.name.replace(/\s+/g, '_')}`;

      try {
        const { error: uploadError } = await supabase.storage
          .from('notes')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: publicData } = supabase.storage
          .from('notes')
          .getPublicUrl(filePath);

        if (!publicData || !publicData.publicUrl) {
          throw new Error('Não foi possível obter a URL pública da imagem.');
        }

        const publicUrl = publicData.publicUrl;
        setCurrentSrc(publicUrl);

        setSliderValue(100);
        updateAttributes({
          src: publicUrl,
          width: '100%',
          height: 'auto',
          align: node.attrs.align || 'center',
        });
        setError(null);
      } catch (err) {
        console.error('Erro no upload:', err);
        setError(`Erro no upload: ${err.message || 'Erro desconhecido'}`);
        setCurrentSrc(null);
        updateAttributes({ src: null });
      } finally {
        setUploading(false);
      }
    },
    [updateAttributes, node.attrs.align]
  );

  const handleFileChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      handleFileSelect(event.target.files[0]);
    }
    if (inputRef.current) inputRef.current.value = '';
  };

  // --- Drag and Drop (implementação simplificada) ---
  const handleDrop = useCallback((event) => {
    event.preventDefault();
    if (event.dataTransfer.files && event.dataTransfer.files[0]) {
      handleFileSelect(event.dataTransfer.files[0]);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((event) => {
    event.preventDefault();
  }, []);

  const handleDragLeave = useCallback((event) => {
    event.preventDefault();
  }, []);

  // --- Controle de largura ---
  const handleSliderChange = (event, newValue) => {
    setSliderValue(newValue);
    updateAttributes({ width: newValue + '%' });
  };

  const handleRemoveImage = useCallback(() => {
    setCurrentSrc(null);
    updateAttributes({ src: null, width: '100%', height: 'auto' });
    setSliderValue(100);
  }, [updateAttributes]);

  const handleDeleteNode = useCallback(() => {
    if (window.confirm('Tem certeza que deseja remover este bloco de imagem?')) {
      deleteNode();
    }
  }, [deleteNode]);

  const setAlignment = useCallback((align) => {
    updateAttributes({ align });
  }, [updateAttributes]);

  // --- Estilos ---
  const wrapperStyle = {
    maxWidth: '100%',
    position: 'relative',
    overflow: 'visible',
    backgroundColor: currentSrc ? 'transparent' : '#2A2A2A',
    borderRadius: currentSrc ? '0px' : '4px',
    padding: currentSrc ? '0' : '8px',
  };

  const imageWrapperStyle = {
    position: 'relative',
    display: 'block',
    border: selected ? '2px solid #bb86fc' : '2px solid transparent',
    padding: selected ? '4px' : '0px',
    borderRadius: '4px',
    overflow: 'hidden',
    transition: 'border 0.2s ease-in-out, padding 0.2s ease-in-out',
    backgroundColor: selected ? 'rgba(187, 134, 252, 0.05)' : 'transparent'
  };

  const imgStyle = {
    display: 'block',
    width: '100%',
    height: 'auto',
    objectFit: 'contain',
    borderRadius: '2px',
  };

  return (
    <NodeViewWrapper
        ref={containerRef}
        as="div"
        style={wrapperStyle}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`image-uploader-node ${selected ? 'is-selected' : ''} align-${node.attrs.align}`}
        data-drag-handle // Allows dragging the node via this wrapper
    >
        {currentSrc ? (
            <>
                {/* ==== Slider Panel (Shows Above Image on Selection) ==== */}
                <Collapse in={selected} timeout="auto" unmountOnExit>
  <Box
    sx={{
      padding: '4px 8px 8px 8px',
      display: 'flex',
      justifyContent: 'center',
      pointerEvents: 'auto',
    }}
  >
    <Box
      sx={{
        width: 200,
        minWidth: 200,
        flexShrink: 0, // ESSA PORRA É MÁGICA! Evita o encolhimento
      }}
    >
      <Slider
        value={sliderValue}
        min={10}
        max={100}
        step={5}
        onChange={handleSliderChange}
        size="small"
        valueLabelDisplay="auto"
        aria-labelledby="image-width-slider"
      />
    </Box>
  </Box>
</Collapse>


                {/* ==== Image Wrapper (Handles Border) ==== */}
                <Box style={imageWrapperStyle}>
                    <img
                        ref={imgRef}
                        src={currentSrc}
                        alt={node.attrs.alt || 'Imagem carregada'}
                        title={node.attrs.title}
                        style={imgStyle}
                        draggable="false"
                    />
                    {/* Remove Image Button (Top Right of Image) - Shows on selection */}
                    {selected && (
                        <Tooltip title="Remover Imagem (manter bloco)" placement="top">
                            <IconButton
                                onClick={handleRemoveImage}
                                size="small"
                                sx={{
                                    position: 'absolute',
                                    top: '8px', // Adjust based on padding
                                    right: '8px',
                                    backgroundColor: 'rgba(0, 0, 0, 0.6)',
                                    color: 'white',
                                    '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.8)' },
                                    zIndex: 10,
                                }}
                            >
                                <DeleteOutlineIcon fontSize="inherit" />
                            </IconButton>
                        </Tooltip>
                    )}
                </Box>

                {/* ==== Alignment Controls Panel (Shows Below Image on Selection) ==== */}
                <Collapse in={selected} timeout="auto" unmountOnExit>
                    {/* Apenas o Stack de alinhamento/delete permanece aqui */}
                    <Box sx={{ padding: '8px 0 4px 0', width: '100%' }}>
                        <Stack
                            direction="row"
                            spacing={1} // Increase spacing a bit
                            justifyContent="center" // Center the buttons
                            sx={{
                                // No absolute positioning needed
                            }}
                        >
                            <Tooltip title="Alinhar à Esquerda" placement="bottom">
                                <IconButton size="small" onClick={() => setAlignment('left')} color={node.attrs.align === 'left' ? 'primary' : 'default'}>
                                    <FormatAlignLeftIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Centralizar" placement="bottom">
                                <IconButton size="small" onClick={() => setAlignment('center')} color={node.attrs.align === 'center' ? 'primary' : 'default'}>
                                    <FormatAlignCenterIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Alinhar à Direita" placement="bottom">
                                <IconButton size="small" onClick={() => setAlignment('right')} color={node.attrs.align === 'right' ? 'primary' : 'default'}>
                                    <FormatAlignRightIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Remover Bloco Inteiro" placement="bottom">
                                <IconButton size="small" onClick={handleDeleteNode} sx={{ color: '#ff8a80', '&:hover': { color: '#ff5252' } }}>
                                    <DeleteOutlineIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        </Stack>
                    </Box>
                </Collapse>
            </>
        ) : (
            // ==== Placeholder ==== (Código do placeholder permanece o mesmo)
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '100%',
                    minHeight: '100px',
                    textAlign: 'center',
                    color: 'text.secondary',
                    borderRadius: '4px',
                }}
            >
                 <input ref={inputRef} type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }}/>
                 {uploading ? (
                     <>
                         <CircularProgress size={30} sx={{ mb: 1 }} />
                         <Typography variant="body2">Enviando...</Typography>
                     </>
                 ) : error ? (
                     <>
                         <BrokenImageIcon sx={{ fontSize: 40, mb: 1, color: 'error.light' }} />
                         <Typography variant="body2" color="error.light" sx={{ mb: 1 }}>{error}</Typography>
                         <Button variant="outlined" size="small" onClick={() => inputRef.current?.click()}>
                             Tentar Novamente
                         </Button>
                     </>
                 ) : (
                     <>
                         <CloudUploadIcon sx={{ fontSize: 40, mb: 1, color: '#616161' }} />
                         <Typography variant="body2" sx={{ mb: 1 }}> Arraste e solte ou </Typography>
                         <Button variant="contained" size="small" onClick={() => inputRef.current?.click()} startIcon={<CloudUploadIcon />}>
                             Escolher Imagem
                         </Button>
                     </>
                 )}
            </Box>
        )}
    </NodeViewWrapper>
);
};

export default ImageUploaderComponent;
