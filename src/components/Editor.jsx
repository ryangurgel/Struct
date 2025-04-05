// Editor.jsx
import React, { useState, useCallback, useEffect, useRef } from 'react';
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
import { NodeSelection } from 'prosemirror-state'; // NÃO É DO TIPTAP!

import { Columns, Column } from './Columns.jsx'; // Assuming these exist
import SlashCommand from './SlashCommand'; // Assuming this exists
import { ImageUploader } from './ImageUploader'; // Assuming this exists
import EditorBubbleMenu from './EditorBubbleMenu'; // Assuming this exists

import {
    Box,
    ThemeProvider,
    Button,
    CircularProgress,
    Typography, // Added for status text
    IconButton, // Added for potential icon button usage
    Tooltip, // Added for save status hint
} from '@mui/material';
import { createTheme } from '@mui/material/styles';
import SaveIcon from '@mui/icons-material/Save'; // Added
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'; // Added
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'; // Added
import EditNoteIcon from '@mui/icons-material/EditNote'; // Added for unsaved
import AutorenewIcon from '@mui/icons-material/Autorenew'; // Added for saving


// Importa estilos customizados
import './editor.css'; // Assuming this exists

const darkTheme = createTheme({
    palette: {
        mode: 'dark',
        primary: { main: '#bb86fc' }, // Roxo Notion-like
        secondary: { main: '#03dac6' }, // Teal Notion-like
        background: { default: '#1F1F1F', paper: '#2A2A2A' }, // Tons de cinza escuro
        text: { primary: '#E0E0E0', secondary: '#B0B0B0' },
        divider: '#424242',
        success: { main: '#66bb6a' }, // Verde para 'Salvo'
        warning: { main: '#ffa726' }, // Laranja/Amarelo para 'Não salvo'
        error: { main: '#f44336' },   // Vermelho para 'Erro'
        info: { main: '#29b6f6' }     // Azul para 'Salvando'
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
        // ... (rest of your theme components remain the same)
        MuiButton: {
             styleOverrides: {
               containedPrimary: {
                 backgroundColor: '#bb86fc',
                 color: '#000000', // Texto escuro para contraste com fundo roxo claro
                 '&:hover': {
                   backgroundColor: '#a36bf4',
                 },
                 '&.Mui-disabled': { // Estilo quando desabilitado
                    backgroundColor: 'rgba(187, 134, 252, 0.5)',
                    color: 'rgba(0, 0, 0, 0.5)',
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

const SAVE_DEBOUNCE_MS = 1500; // Salvar 1.5 segundos após parar de digitar

export default function Editor({ initialContent = '', onSave, noteId }) {
    const [fontFamily, setFontFamily] = useState('Helvetica'); // Default font
    const [fontSize, setFontSize] = useState('Médio'); // Default size key
    const [saveStatus, setSaveStatus] = useState('saved'); // 'saved', 'unsaved', 'saving', 'error'
    const debounceTimerRef = useRef(null); // Ref for debounce timeout ID
    const isSavingRef = useRef(false); // Ref to prevent concurrent saves
    const lastSavedContentRef = useRef(initialContent); // Store last successfully saved content

    // Passa noteId via window (não ideal, mas mantém estrutura original)
    useEffect(() => {
        window.currentNoteId = noteId;
        return () => {
            delete window.currentNoteId;
        };
    }, [noteId]);

    const editor = useEditor({
        extensions: [
            StarterKit,
            Placeholder.configure({
                placeholder: ({ node }) => {
                    if (node.type.name === 'heading') {
                        return `Título ${node.attrs.level}`;
                    }
                    if (node.type.name === 'paragraph' && node.isFirstChild && node.content.size === 0) {
                        return 'Digite \'/\' para comandos ou comece a escrever...';
                    }
                    return '';
                },
                includeChildren: true,
            }),
            Image.configure({
                inline: false,
                allowBase64: false,
                HTMLAttributes: { class: 'uploaded-image' },
            }),
            ImageUploader, // Assume que está configurado para usar window.currentNoteId
            Underline,
            Link.configure({ openOnClick: false, autolink: true, linkOnPaste: true }),
            TaskList,
            TaskItem.configure({ nested: true }),
            Table.configure({ resizable: true, HTMLAttributes: { class: 'tiptap-table' } }),
            TableRow.configure({ HTMLAttributes: { class: 'tiptap-tablerow' } }),
            TableCell.configure({ HTMLAttributes: { class: 'tiptap-tablecell' } }),
            TableHeader.configure({ HTMLAttributes: { class: 'tiptap-tableheader' } }),
            Column,
            Columns,
            SlashCommand,
        ],
        content: initialContent, // Define o conteúdo inicial
        editorProps: {
            attributes: {
                style: `
                    font-family: ${fontFamily}, sans-serif;
                    font-size: ${sizeMap[fontSize] || '1rem'};
                    line-height: 1.6;
                `,
                class: 'tiptap-editor-content',
            },
        },
        onCreate({ editor }) {
            lastSavedContentRef.current = editor.getHTML();
            setSaveStatus('saved'); // Assume initial content is the "saved" state
        },
        onUpdate({ editor }) {
            if (isSavingRef.current) return; // Don't trigger while a save is in progress

            const currentContent = editor.getHTML();
            // Only mark as unsaved if content actually changed from last saved state
            if (currentContent !== lastSavedContentRef.current) {
                 setSaveStatus('unsaved');
                 // Clear existing timer if user types again
                 if (debounceTimerRef.current) {
                     clearTimeout(debounceTimerRef.current);
                 }
                 // Set new timer for debounced save
                 debounceTimerRef.current = setTimeout(() => {
                     handleSave();
                 }, SAVE_DEBOUNCE_MS);
            }
        }
    }, [fontFamily, fontSize]); // Removido initialContent da dep array para evitar re-criações desnecessárias
                                // initialContent é pego pelo `content:` option agora.

    // Effect to update content if initialContent prop changes *after* mount
    useEffect(() => {
         if (editor && initialContent !== editor.getHTML() && !editor.isFocused) {
             // Only update if the prop changes AND editor doesn't have focus
             // Avoids overwriting user edits if prop changes unexpectedly
             const { from, to } = editor.state.selection; // Preserve selection
             editor.commands.setContent(initialContent, false); // false = don't fire update event
             editor.commands.setTextSelection({ from, to }); // Restore selection
             lastSavedContentRef.current = initialContent;
             setSaveStatus('saved'); // Reset status after programmatic change
             console.log("Editor content updated programmatically from initialContent prop change.");
         }
     }, [initialContent, editor]);


    // Core Save Function
    const handleSave = useCallback(async () => {
        if (!editor || !onSave || isSavingRef.current) {
             console.log("Save skipped: no editor, no onSave, or already saving.");
             return; // Skip if no editor, no save handler, or already saving
        }

        const htmlContent = editor.getHTML();

        // Avoid saving if content hasn't changed since last successful save
        if (htmlContent === lastSavedContentRef.current && saveStatus !== 'error') {
            console.log("Save skipped: content unchanged.");
            // If it was marked unsaved but content is same, reset to saved
            if(saveStatus === 'unsaved') setSaveStatus('saved');
            return;
        }


        isSavingRef.current = true; // Mark as saving
        setSaveStatus('saving');
        console.log("Attempting to save content..."); // Para debug

        try {
            await onSave(htmlContent); // Call the provided save function
            lastSavedContentRef.current = htmlContent; // Update last saved content on success
            setSaveStatus('saved');
            console.log("Content saved successfully.");
        } catch (error) {
            console.error("Error saving content:", error);
            setSaveStatus('error');
        } finally {
            isSavingRef.current = false; // Mark as not saving anymore
            // Clear any lingering debounce timer after save attempt
            if (debounceTimerRef.current) {
                 clearTimeout(debounceTimerRef.current);
                 debounceTimerRef.current = null;
            }
        }
    }, [editor, onSave, saveStatus]); // Include saveStatus to re-evaluate if save needed

    // Manual Save Trigger (clears debounce)
    const handleManualSave = () => {
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
            debounceTimerRef.current = null;
        }
        handleSave(); // Trigger save immediately
    };

    // Save on Unmount if there are unsaved changes
    useEffect(() => {
        return () => {
            // Cleanup function runs on unmount
            if (debounceTimerRef.current) {
                 clearTimeout(debounceTimerRef.current); // Clear any pending debounce
            }
            // Check if editor exists and has unsaved changes just before unmounting
            // Use refs and latest state check possible
             const isUnsaved = saveStatus === 'unsaved' || saveStatus === 'error'; // Consider error state as needing save too
             const hasChanged = editor && editor.getHTML() !== lastSavedContentRef.current;

            if (editor && (isUnsaved || hasChanged) && !isSavingRef.current) {
                console.log("Attempting to save unsaved changes on unmount...");
                // IMPORTANT: This save might be interrupted by the browser closing the page.
                // For critical data, consider navigator.sendBeacon or warning the user.
                handleSave();
            }
        };
    }, [editor, handleSave, saveStatus]); // Rerun if editor or handleSave changes

    // --- UI Elements ---

    const getSaveStatusIndicator = () => {
        switch (saveStatus) {
            case 'saving':
                return { icon: <AutorenewIcon sx={{ animation: 'spin 1s linear infinite' }} fontSize="small" color="info" />, text: 'Salvando...', color: 'info.main' };
            case 'saved':
                return { icon: <CheckCircleOutlineIcon fontSize="small" color="success" />, text: 'Salvo', color: 'success.main' };
            case 'unsaved':
                return { icon: <EditNoteIcon fontSize="small" color="warning" />, text: 'Alterações não salvas', color: 'warning.main' };
            case 'error':
                return { icon: <ErrorOutlineIcon fontSize="small" color="error" />, text: 'Erro ao salvar', color: 'error.main' };
            default:
                return { icon: null, text: '', color: 'text.secondary' };
        }
    };

    const { icon: statusIcon, text: statusText, color: statusColor } = getSaveStatusIndicator();

    // Styles for the main container
    const editorContainerStyle = {
        backgroundColor: 'background.default',
        color: 'text.primary',
        border: `1px solid ${darkTheme.palette.divider}`,
        borderRadius: '8px',
        overflow: 'hidden',
        display: 'flex', // Make it a flex container
        flexDirection: 'column', // Stack children vertically
        // Height: Needs to be controlled by the parent, or set explicitly like '100vh'
        // if this component *is* the main page content.
        height: 'calc(100vh - 64px)', // Example: Full viewport height minus a potential top navbar height
        // Or simply height: '100%' if parent allows expansion.
        // minHeight: '500px', // Keep a minimum height
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
            {/* Main container taking full height */}
            <Box sx={editorContainerStyle}>

                {/* Top Bar: Status Indicator & Save Button */}
                <Box sx={{
                    display: 'flex',
                    justifyContent: 'space-between', // Pushes items to ends
                    alignItems: 'center',
                    padding: '8px 16px',
                    borderBottom: `1px solid ${darkTheme.palette.divider}`,
                    flexShrink: 0, // Prevent bar from shrinking
                }}>
                    {/* Save Status Indicator */}
                    <Tooltip title={statusText} arrow placement="bottom-start">
                       <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: statusColor }}>
                            {statusIcon}
                            <Typography variant="caption" sx={{ display: { xs: 'none', sm: 'block' } }}> {/* Hide text on very small screens */}
                               {statusText}
                           </Typography>
                       </Box>
                   </Tooltip>


                   {/* Manual Save Button */}
                    <Button
                       variant="contained"
                       color="primary"
                       size="small"
                       onClick={handleManualSave}
                       disabled={saveStatus === 'saving'} // Disable while saving
                       startIcon={saveStatus === 'saving' ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
                   >
                       Salvar
                   </Button>
                </Box>

                {/* Bubble Menu (remains unchanged) */}
                 <BubbleMenu
                   editor={editor}
                   tippyOptions={{ duration: 100, placement: 'top', zIndex: 10 }} // Ensure zIndex is high enough
                   shouldShow={({ editor, state, view }) => {
                       const { selection, doc } = state;
                       if (!view.hasFocus() || selection.empty || selection instanceof NodeSelection) return false;

                       let textContentFound = false;
                       doc.nodesBetween(selection.from, selection.to, (node) => {
                           if (node.isText || (node.textContent && node.textContent.length > 0)) {
                               textContentFound = true;
                               return false; // stop iterating
                           }
                           return true;
                       });
                       if (!textContentFound) return false;

                       const $from = selection.$from;
                       if ($from.parent.type.name === 'imageUploader') return false; // Don't show on image uploader node itself

                       return true;
                   }}
                 >
                   {/* Ensure EditorBubbleMenu receives the theme or uses styled components compatible with the theme */}
                    <EditorBubbleMenu editor={editor} />
                 </BubbleMenu>


                 {/* Scrollable Editor Content Area */}
                 <Box sx={{
                     flexGrow: 1, // Takes up remaining vertical space
                     overflowY: 'auto', // Allows scrolling ONLY for the content
                     position: 'relative', // Needed for scrollbar styling container
                     padding: '0 2px 0 0' // Small padding for scrollbar space
                    }}>
                     {/* Inner Box for Padding */}
                     <Box sx={{ padding: '16px 24px' }}> {/* Your original content padding */}
                        <EditorContent editor={editor} className="tiptap-editor-scroll" />
                     </Box>
                 </Box>

                 {/* Removed the old bottom save button Box */}

             </Box>

             {/* Add CSS for the spin animation */}
              <style>{`
                 @keyframes spin {
                     from { transform: rotate(0deg); }
                     to { transform: rotate(360deg); }
                 }
                 .tiptap-editor-scroll {
                    /* Styles from editor.css should apply */
                    /* Ensure it fills the scrollable Box */
                    min-height: 100%; /* Make sure it can grow */
                 }
                 /* Improve scrollbar visibility within the content Box */
                 .MuiBox-root > .MuiBox-root::-webkit-scrollbar { /* Target scrollbar inside the flexGrow box */
                     width: 8px;
                 }
                 .MuiBox-root > .MuiBox-root::-webkit-scrollbar-track {
                     background: transparent;
                     border-radius: 4px;
                 }
                 .MuiBox-root > .MuiBox-root::-webkit-scrollbar-thumb {
                     background-color: #424242;
                     border-radius: 4px;
                     border: 2px solid transparent;
                     background-clip: padding-box;
                 }
                 .MuiBox-root > .MuiBox-root::-webkit-scrollbar-thumb:hover {
                      background-color: #555555;
                 }
              `}</style>
         </ThemeProvider>
     );
 }

