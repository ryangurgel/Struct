// SuggestionList.jsx
import React, { useState, useEffect, useImperativeHandle, forwardRef, useRef } from 'react';
import { Box, Button, Typography } from '@mui/material';

const SuggestionList = forwardRef(({ items, command, editor }, ref) => {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const listRef = useRef(null); // Ref para a lista para scroll

    // Reseta o índice quando os itens mudam
    useEffect(() => {
        setSelectedIndex(0);
    }, [items]);

    // Garante que o item selecionado esteja visível
    useEffect(() => {
        if (listRef.current && items.length > 0) {
            const selectedElement = listRef.current.children[selectedIndex];
            if (selectedElement) {
                 // scrollIntoView({ block: 'nearest' }) é mais suave
                selectedElement.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
            }
        }
    }, [selectedIndex, items]); // Roda quando o índice ou itens mudam


    // Expõe a função onKeyDown para o Tiptap Suggestion plugin
    useImperativeHandle(ref, () => ({
        onKeyDown: ({ event }) => {
            if (!items || items.length === 0) return false; // Não faz nada se não houver itens

            if (event.key === 'ArrowUp') {
                setSelectedIndex((prevIndex) => (prevIndex + items.length - 1) % items.length);
                return true; // Indica que a tecla foi tratada
            }
            if (event.key === 'ArrowDown') {
                setSelectedIndex((prevIndex) => (prevIndex + 1) % items.length);
                return true; // Indica que a tecla foi tratada
            }
            if (event.key === 'Enter') {
                if (items[selectedIndex]) {
                    // Passa o editor junto, pois o comando pode precisar dele
                    command(items[selectedIndex]);
                    return true; // Indica que a tecla foi tratada
                }
            }
            return false; // Deixa o Tiptap tratar outras teclas
        },
    }));

    return (
        <Box
            ref={listRef} // Adiciona a ref ao elemento scrollável
            sx={{
                backgroundColor: 'background.paper', // Cor de fundo do tema
                border: (theme) => `1px solid ${theme.palette.divider}`,
                borderRadius: '8px',
                padding: '6px',
                minWidth: '250px', // Largura mínima
                maxWidth: '300px', // Largura máxima
                boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px', // Espaço entre os botões
                maxHeight: '300px', // Altura máxima antes de scroll
                overflowY: 'auto', // Habilita scroll vertical se necessário
                 // Estilo da barra de rolagem (opcional, para Webkit)
                 '&::-webkit-scrollbar': {
                     width: '6px',
                 },
                 '&::-webkit-scrollbar-track': {
                     background: 'transparent', // Fundo transparente
                     borderRadius: '3px',
                 },
                 '&::-webkit-scrollbar-thumb': {
                     backgroundColor: '#555', // Cor da barra
                     borderRadius: '3px',
                     '&:hover': {
                        backgroundColor: '#777', // Cor no hover
                     }
                 },
            }}
        >
            {items && items.length > 0 ? (
                items.map((item, index) => (
                    <Button
                        key={item.title + index} // Chave mais robusta
                        onClick={() => command(item)}
                        variant="text" // Botões sem fundo por padrão
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'flex-start', // Alinha conteúdo à esquerda
                            width: '100%', // Ocupa toda a largura
                            padding: '6px 10px',
                            borderRadius: '6px',
                            textTransform: 'none', // Sem caixa alta
                            color: 'text.primary', // Cor primária do texto
                            backgroundColor: index === selectedIndex ? 'action.hover' : 'transparent', // Destaque sutil no selecionado
                            '&:hover': {
                                backgroundColor: 'action.hover', // Mesmo destaque no hover
                            },
                            // Estilo para o ícone
                            '& .MuiSvgIcon-root': {
                                marginRight: '10px', // Espaço entre ícone e texto
                                color: 'text.secondary', // Cor secundária para ícone
                                fontSize: '1.1rem', // Tamanho do ícone
                            },
                        }}
                    >
                        {item.icon || <div style={{ width: '1.1rem', marginRight: '10px' }} />} {/* Placeholder se não houver ícone */}
                        <Typography variant="body2" component="span" sx={{ flexGrow: 1 }}> {/* Ocupa espaço restante */}
                            {item.title}
                        </Typography>
                    </Button>
                ))
            ) : (
                <Typography variant="body2" sx={{ padding: '8px 12px', color: 'text.secondary', textAlign: 'center' }}>
                    Nenhum comando encontrado
                </Typography>
            )}
        </Box>
    );
});

export default SuggestionList;