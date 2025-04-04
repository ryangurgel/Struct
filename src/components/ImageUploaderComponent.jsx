// ImageUploaderComponent.jsx
import React, { useRef, useState, useEffect, useCallback } from 'react';
import { NodeViewWrapper } from '@tiptap/react';
import { supabase } from '../supabaseClient'; // Garanta que o caminho está correto
import { Box, Button, CircularProgress, Typography, IconButton } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import BrokenImageIcon from '@mui/icons-material/BrokenImage';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'; // Ícone para remover imagem

const ImageUploaderComponent = (props) => {
    const { node, updateAttributes, selected, editor, getPos, deleteNode } = props;
    const containerRef = useRef(null);
    const inputRef = useRef(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);
    // Estado local para src para feedback imediato, mas a fonte da verdade é node.attrs.src
    const [currentSrc, setCurrentSrc] = useState(node.attrs.src);

    // Sincroniza o estado local se o atributo do nó mudar externamente
    useEffect(() => {
        setCurrentSrc(node.attrs.src);
    }, [node.attrs.src]);

    // Aplica dimensões ao container quando os atributos mudam
     // Aplica dimensões ao container quando os atributos mudam
    useEffect(() => {
        if (containerRef.current) {
            // Define diretamente o estilo, pois node.attrs pode ser % ou px
            containerRef.current.style.width = node.attrs.width;
            containerRef.current.style.height = node.attrs.height;
        }
    }, [node.attrs.width, node.attrs.height]);


    const handleFileSelect = useCallback(async (file) => {
        if (!file || !file.type.startsWith('image/')) {
            setError('Por favor, selecione um arquivo de imagem válido.');
            return;
        }
        setUploading(true);
        setError(null); // Limpa erros anteriores

        // Usa o noteId global (lembre-se da nota sobre isso em Editor.jsx)
        const noteId = window.currentNoteId || 'unidentified-note';
        const filePath = `${noteId}/assets/${Date.now()}_${file.name.replace(/\s+/g, '_')}`; // Remove espaços

        try {
            const { error: uploadError } = await supabase.storage
                .from('notes') // Seu bucket
                .upload(filePath, file, {
                     // cacheControl: '3600', // Opcional: Cache
                     // upsert: false // Opcional: Não sobrescrever
                });

            if (uploadError) {
                throw uploadError;
            }

            const { data: publicData } = supabase.storage
                .from('notes')
                .getPublicUrl(filePath);

            if (!publicData || !publicData.publicUrl) {
                throw new Error('Não foi possível obter a URL pública da imagem.');
            }

            const publicUrl = publicData.publicUrl;
            setCurrentSrc(publicUrl); // Atualiza visualização imediata
            updateAttributes({ src: publicUrl, width: '100%', height: 'auto' }); // Atualiza nó e reseta tamanho
            setError(null); // Limpa erro em caso de sucesso

        } catch (err) {
            console.error('Erro no upload:', err);
            setError(`Erro no upload: ${err.message || 'Erro desconhecido'}`);
            setCurrentSrc(null); // Remove imagem quebrada
            updateAttributes({ src: null }); // Limpa o src no nó
        } finally {
            setUploading(false);
        }
    }, [updateAttributes]); // Inclua dependências necessárias

    const handleFileChange = (event) => {
        if (event.target.files && event.target.files[0]) {
            handleFileSelect(event.target.files[0]);
        }
        // Reset input para permitir selecionar o mesmo arquivo novamente
        if (inputRef.current) inputRef.current.value = '';
    };

    const handleDrop = useCallback((event) => {
        event.preventDefault();
        event.stopPropagation(); // Impede que outros listeners capturem
        if (uploading) return; // Ignora se já estiver enviando

        if (event.dataTransfer.files && event.dataTransfer.files[0]) {
            handleFileSelect(event.dataTransfer.files[0]);
        }
         if (containerRef.current) {
            containerRef.current.classList.remove('drag-over');
         }
    }, [handleFileSelect, uploading]);

    const handleDragOver = useCallback((event) => {
        event.preventDefault();
        event.stopPropagation();
         if (containerRef.current) {
            containerRef.current.classList.add('drag-over');
         }
    }, []);

     const handleDragLeave = useCallback((event) => {
        event.preventDefault();
        event.stopPropagation();
         if (containerRef.current) {
             containerRef.current.classList.remove('drag-over');
         }
     }, []);


    // Atualiza atributos width/height QUANDO o usuário PARA de redimensionar
    const handleResizeEnd = useCallback(() => {
        if (containerRef.current) {
            // Lê as dimensões atuais do elemento DOM (incluindo px)
            const newWidth = containerRef.current.offsetWidth + 'px';
            const newHeight = containerRef.current.offsetHeight + 'px';

            // Compara com os atributos atuais para evitar updates desnecessários
            if (newWidth !== node.attrs.width || newHeight !== node.attrs.height) {
                 // console.log(`Resized to: ${newWidth} x ${newHeight}`);
                updateAttributes({ width: newWidth, height: newHeight });
            }
        }
    }, [node.attrs.width, node.attrs.height, updateAttributes]);

    // Botão para remover a imagem (opcional)
    const handleRemoveImage = useCallback(() => {
        if (window.confirm('Tem certeza que deseja remover esta imagem?')) {
            // Poderia adicionar lógica para remover do Supabase também, se desejado
            setCurrentSrc(null);
            updateAttributes({ src: null, width: '100%', height: 'auto' }); // Limpa e reseta tamanho
        }
    }, [updateAttributes]);

    // Botão para deletar o nó inteiro
    const handleDeleteNode = useCallback(() => {
        if (window.confirm('Tem certeza que deseja remover este bloco de imagem?')) {
            deleteNode();
        }
    }, [deleteNode]);

    // Estilo do container principal
    // Usamos NodeViewWrapper para que o Tiptap gerencie a seleção e o foco
    const wrapperStyle = {
         border: selected ? '2px solid #bb86fc' : '1px dashed #616161', // Destaque roxo se selecionado, cinza pontilhado senão
         padding: '8px',
         position: 'relative', // Para posicionar botões internos
         // Habilita o redimensionamento pelo navegador (funciona melhor em divs)
         resize: 'both',
         overflow: 'hidden', // Essencial para 'resize' funcionar bem
         // Dimensões mínimas para o container ser usável
         minWidth: '150px',
         minHeight: '100px',
         // Dimensões são aplicadas via useEffect com node.attrs
         // Estilo de transição para suavizar a mudança da borda
         transition: 'border 0.2s ease-in-out',
         // Garante que não exceda a largura do contêiner pai
         maxWidth: '100%',
         // Centraliza o conteúdo interno (placeholder ou imagem)
         display: 'flex',
         alignItems: 'center',
         justifyContent: 'center',
         backgroundColor: '#2A2A2A', // Fundo interno ligeiramente diferente
         borderRadius: '4px',
     };


    return (
        <NodeViewWrapper
            ref={containerRef}
            as="div"
            style={wrapperStyle} // Aplica os estilos definidos acima
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            // Chama handleResizeEnd no mouse up DEPOIS de redimensionar
            onMouseUp={handleResizeEnd}
            className={`image-uploader-node ${selected ? 'is-selected' : ''}`}
        >
            {currentSrc ? (
                <>
                    <img
                        src={currentSrc}
                        alt={node.attrs.alt || 'Imagem carregada'}
                        title={node.attrs.title}
                        style={{
                            display: 'block', // Remove espaço extra abaixo da imagem
                            width: '100%',
                            height: '100%', // Ocupa todo o espaço do container
                            objectFit: 'contain', // Garante que a imagem inteira seja visível, sem cortar
                        }}
                        // Previne que a imagem seja arrastável separadamente (o container já é)
                        draggable="false"
                    />
                    {/* Botão para remover imagem (mostra no hover ou seleção) */}
                    {selected && (
                         <IconButton
                             onClick={handleRemoveImage}
                             size="small"
                             sx={{
                                 position: 'absolute',
                                 top: '12px', // Ajuste conforme padding
                                 right: '12px',
                                 backgroundColor: 'rgba(0, 0, 0, 0.6)',
                                 color: 'white',
                                 '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.8)' },
                                 zIndex: 10 // Garante que fique sobre a imagem
                             }}
                             title="Remover Imagem (manter bloco)"
                         >
                             <DeleteOutlineIcon fontSize="small" />
                         </IconButton>
                    )}
                </>
            ) : (
                // Placeholder interativo
                 <Box
                     sx={{
                         display: 'flex',
                         flexDirection: 'column',
                         alignItems: 'center',
                         justifyContent: 'center',
                         padding: 2,
                         width: '100%',
                         height: '100%',
                         textAlign: 'center',
                         color: 'text.secondary', // Cor de texto secundária do tema
                     }}
                 >
                     {uploading ? (
                         <>
                             <CircularProgress size={30} sx={{ mb: 1 }} />
                             <Typography variant="body2">Enviando...</Typography>
                         </>
                     ) : error ? (
                         <>
                             <BrokenImageIcon sx={{ fontSize: 40, mb: 1, color: 'error.light' }} />
                             <Typography variant="body2" color="error.light" sx={{ mb: 1 }}>{error}</Typography>
                             <Button
                                 variant="outlined"
                                 size="small"
                                 onClick={() => inputRef.current?.click()}
                             >
                                 Tentar Novamente
                             </Button>
                         </>
                     ) : (
                         <>
                             <CloudUploadIcon sx={{ fontSize: 40, mb: 1, color: '#616161' }} />
                             <Typography variant="body2" sx={{ mb: 1 }}>
                                 Arraste e solte ou
                             </Typography>
                             <Button
                                 variant="contained"
                                 size="small"
                                 onClick={() => inputRef.current?.click()}
                                 startIcon={<CloudUploadIcon />}
                             >
                                 Escolher Imagem
                             </Button>
                         </>
                     )}
                     <input
                        ref={inputRef}
                        type="file"
                        accept="image/*" // Aceita qualquer tipo de imagem
                        onChange={handleFileChange}
                        style={{ display: 'none' }} // Oculto, ativado pelo botão
                    />
                 </Box>
             )}

             {/* Botão para deletar o nó inteiro (sempre visível quando selecionado) */}
             {/* {selected && (
                 <IconButton
                    onClick={handleDeleteNode}
                    size="small"
                    sx={{
                         position: 'absolute',
                         bottom: '12px',
                         right: '12px',
                         backgroundColor: 'rgba(255, 0, 0, 0.6)', // Vermelho para deletar
                         color: 'white',
                         '&:hover': { backgroundColor: 'rgba(255, 0, 0, 0.8)' },
                         zIndex: 10
                    }}
                    title="Remover Bloco Inteiro"
                 >
                     <DeleteForeverIcon fontSize="small" />
                 </IconButton>
             )} */}

        </NodeViewWrapper>
    );
};

export default ImageUploaderComponent;