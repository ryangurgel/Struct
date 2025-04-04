// Editor.jsx
import React, { useState, useCallback, useEffect } from 'react';
import { useEditor, EditorContent, BubbleMenu } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image'; // Para imagens via URL
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import Placeholder from '@tiptap/extension-placeholder'; // Para texto de placeholder

import { Columns, Column } from './Columns.jsx';
import SlashCommand from './SlashCommand';
import { ImageUploader } from './ImageUploader'; // Nossa extensão de upload
import MenuBar from './MenuBar'; // Barra de ferramentas fixa
import EditorBubbleMenu from './EditorBubbleMenu'; // Conteúdo do BubbleMenu

import {
    Box,
    ThemeProvider,
    Button,
    CircularProgress,
} from '@mui/material';
import { createTheme } from '@mui/material/styles';

// Importa estilos customizados
import './editor.css';

const darkTheme = createTheme({
    palette: {
        mode: 'dark',
        primary: { main: '#bb86fc' }, // Roxo Notion-like
        secondary: { main: '#03dac6' }, // Teal Notion-like
        background: { default: '#1F1F1F', paper: '#2A2A2A' }, // Tons de cinza escuro
        text: { primary: '#E0E0E0', secondary: '#B0B0B0' },
        divider: '#424242',
    },
    typography: {
        fontFamily: 'inherit', // Usa a fonte definida no editor
        button: {
            textTransform: 'none', // Botões sem caixa alta por padrão
        },
    },
    components: {
        MuiTooltip: {
            styleOverrides: {
                tooltip: {
                    backgroundColor: '#333333',
                    color: '#E0E0E0',
                    fontSize: '0.8rem',
                },
                arrow: {
                    color: '#333333',
                },
            },
        },
         MuiIconButton: {
            styleOverrides: {
                root: {
                    color: '#B0B0B0', // Cor padrão dos ícones
                    '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.08)', // Leve destaque no hover
                    },
                },
            },
        },
        MuiSelect: {
             styleOverrides: {
                 root: {
                     color: '#E0E0E0', // Cor do texto no select
                     '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#424242', // Cor da borda
                     },
                     '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#616161', // Borda no hover
                     },
                     '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#bb86fc', // Borda quando focado (cor primária)
                     },
                     '& .MuiSvgIcon-root': {
                        color: '#B0B0B0', // Cor do ícone do dropdown
                    },
                 }
             }
        },
         MuiMenuItem: {
            styleOverrides: {
                root: {
                    '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    },
                    '&.Mui-selected': {
                        backgroundColor: 'rgba(187, 134, 252, 0.16)', // Fundo quando selecionado (cor primária com alpha)
                        '&:hover': {
                            backgroundColor: 'rgba(187, 134, 252, 0.24)',
                        }
                    }
                }
            }
        },
        MuiInputLabel: {
            styleOverrides: {
                root: {
                     color: '#B0B0B0', // Cor do label
                     '&.Mui-focused': {
                         color: '#bb86fc', // Cor do label quando focado
                     },
                }
            }
        },
        MuiButton: {
             styleOverrides: {
                 containedPrimary: {
                     backgroundColor: '#bb86fc',
                     color: '#000000', // Texto escuro para contraste com fundo roxo claro
                     '&:hover': {
                         backgroundColor: '#a36bf4',
                     }
                 }
             }
        }
    },
});

// Mapeamento mais flexível para tamanhos de fonte
const sizeMap = {
    'Pequeno': '0.9rem',
    'Médio': '1rem', // Tamanho base
    'Grande': '1.15rem',
    'Extra Grande': '1.3rem'
};

export default function Editor({ initialContent, onSave, noteId }) {
    const [fontFamily, setFontFamily] = useState('Helvetica'); // Default font
    const [fontSize, setFontSize] = useState('Médio'); // Default size key

    // NOTA: Usar window.currentNoteId não é ideal para produção.
    // O correto seria passar o noteId via props ou contexto React.
    useEffect(() => {
        window.currentNoteId = noteId; // Disponibiliza globalmente para ImageUploaderComponent
        return () => {
            delete window.currentNoteId; // Limpa ao desmontar
        };
    }, [noteId]);

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                // Desabilitar heading padrão se quiser controle total via slash command
                // heading: false,
                // Desabilitar blockquote padrão se quiser controle total via slash command
                // blockquote: false,
                // etc.
            }),
            Placeholder.configure({
                placeholder: ({ node }) => {
                    if (node.type.name === 'heading') {
                        return `Título ${node.attrs.level}`;
                    }
                    // Placeholder padrão para parágrafos vazios, exceto o primeiro
                    if (node.type.name === 'paragraph' && node.isFirstChild && node.content.size === 0) {
                         return 'Digite \'/\' para comandos...';
                    }
                    // Placeholder para outros nós vazios (opcional)
                    // if (node.content.size === 0) {
                    //     return 'Digite algo...';
                    // }
                    return '';
                },
                includeChildren: true, // Permite placeholder em nós com filhos (ex: Table)
            }),
            Image.configure({
                inline: false, // Imagens como blocos por padrão
                allowBase64: false, // Não permitir base64 por segurança e performance
                 HTMLAttributes: {
                    class: 'uploaded-image', // Classe para estilização CSS
                 },
            }),
            ImageUploader, // Nossa extensão para upload/redimensionamento
            Underline,
            Link.configure({
                openOnClick: false, // Abrir link com Ctrl/Cmd + Click
                autolink: true, // Transforma URLs digitadas em links automaticamente
                linkOnPaste: true, // Transforma links colados
            }),
            TaskList,
            TaskItem.configure({
                nested: true, // Permite listas de tarefas aninhadas
            }),
            Table.configure({
                resizable: true, // Habilita redimensionamento de colunas
                // Adiciona classes para estilização mais fácil
                HTMLAttributes: {
                    class: 'tiptap-table',
                },
             }),
            TableRow.configure({
                 HTMLAttributes: {
                    class: 'tiptap-tablerow',
                 }
            }),
            TableCell.configure({
                 HTMLAttributes: {
                    class: 'tiptap-tablecell',
                 }
            }),
            TableHeader.configure({
                 HTMLAttributes: {
                    class: 'tiptap-tableheader',
                 }
            }),
            Column, // Extensão de coluna única
            Columns, // Extensão para layout de 2 colunas
            SlashCommand, // Nossa extensão de comando com '/'
        ],
        content: initialContent || '', // Inicia vazio para o placeholder funcionar melhor
        // Atualiza o estilo do editor quando a fonte ou tamanho mudam
        editorProps: {
            attributes: {
                style: `
                    font-family: ${fontFamily}, sans-serif;
                    font-size: ${sizeMap[fontSize] || '1rem'};
                    line-height: 1.6;
                `,
                class: 'tiptap-editor-content', // Adiciona classe para escopo CSS
            },
        },
        // Define o conteúdo inicial apenas uma vez quando o editor estiver pronto
        onCreate({ editor }) {
             if (initialContent) {
                 editor.commands.setContent(initialContent, false); // false para não disparar update
             }
         },
         // Atualiza o conteúdo se initialContent mudar DEPOIS da criação
         onUpdate({ editor }) {
            // console.log('Editor updated!'); // Para debug
         }
    }, [fontFamily, fontSize, initialContent]); // Recria o editor se a fonte/tamanho base mudar

    // Lógica para salvar
    const handleSaveClick = useCallback(() => {
        if (editor && onSave) {
            const htmlContent = editor.getHTML();
             console.log("Saving content:", htmlContent); // Para debug
            onSave(htmlContent);
        }
    }, [editor, onSave]);

    // Estilo dinâmico para o container do editor, se necessário
    const editorContainerStyle = {
        backgroundColor: 'background.default', // Cor de fundo do tema
        color: 'text.primary', // Cor do texto principal do tema
        border: `1px solid ${darkTheme.palette.divider}`,
        borderRadius: '8px',
        padding: '0', // Padding será interno do EditorContent
        overflow: 'hidden', // Para conter elementos internos
        display: 'flex',
        flexDirection: 'column',
        minHeight: '400px', // Altura mínima
        height: '100%', // Ocupa altura disponível se o pai permitir
    };

    if (!editor) {
        return (
            <ThemeProvider theme={darkTheme}>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
                    <CircularProgress />
                </Box>
            </ThemeProvider>
        );
    }

    return (
        <ThemeProvider theme={darkTheme}>
            <Box sx={editorContainerStyle}>
                {/* Barra de Ferramentas Fixa */}
                <MenuBar
                    editor={editor}
                    fontFamily={fontFamily}
                    setFontFamily={setFontFamily}
                    fontSize={fontSize}
                    setFontSize={setFontSize}
                    availableFontSizes={Object.keys(sizeMap)} // Passa as chaves do map
                />

                {/* Menu Flutuante (Bubble Menu) para formatação de seleção */}
                <BubbleMenu editor={editor} tippyOptions={{ duration: 100, placement: 'top' }}>
                    <EditorBubbleMenu editor={editor} />
                </BubbleMenu>

                {/* Área de Conteúdo do Editor */}
                 <Box sx={{ flexGrow: 1, overflowY: 'auto', padding: '16px 24px' }}> {/* Padding interno */}
                    <EditorContent editor={editor} className="tiptap-editor-scroll" /> {/* Classe para scroll */}
                </Box>

                {/* Botão Salvar (Exemplo de posicionamento) */}
                <Box sx={{ padding: '10px 16px', borderTop: `1px solid ${darkTheme.palette.divider}`, textAlign: 'right' }}>
                    <Button variant="contained" color="primary" onClick={handleSaveClick} size="small">
                        Salvar Nota
                    </Button>
                </Box>
            </Box>
        </ThemeProvider>
    );
}
