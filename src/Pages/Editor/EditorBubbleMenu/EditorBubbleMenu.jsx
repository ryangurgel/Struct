// EditorBubbleMenu.jsx
// No changes needed based on the requirements.
// This component just renders the UI for the bubble menu.
// The logic for *when* it appears is handled in the useEditor setup.

import React, { useCallback } from 'react';
import { Box, Tooltip, IconButton, Divider } from '@mui/material';
import {
    FormatBold as FormatBoldIcon,
    FormatItalic as FormatItalicIcon,
    FormatUnderlined as FormatUnderlinedIcon,
    StrikethroughS as StrikethroughSIcon,
    FormatQuote as FormatQuoteIcon,
    Code as CodeIcon,
    Link as LinkIcon,
    LinkOff as LinkOffIcon,
} from '@mui/icons-material';

export default function EditorBubbleMenu({ editor }) {
    const setLink = useCallback(() => {
        // ... (link logic remains the same)
         const previousUrl = editor.getAttributes('link').href;
        const url = window.prompt('URL do link:', previousUrl);

        if (url === null) return; // Cancelled

        if (url === '') { // Remove link
            editor.chain().focus().extendMarkRange('link').unsetLink().run();
            return;
        }
        // Add/update link
        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    }, [editor]);

    if (!editor) {
        return null;
    }

    // Do not render if the editor doesn't think the bubble menu should be active
    // This check might be redundant if using the official BubbleMenu extension's rendering,
    // but can be a safeguard if rendering manually.
    // if (!editor.isFocused || !editor.state.selection || editor.state.selection.empty || editor.state.selection instanceof NodeSelection) {
    //     return null;
    // }


    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                backgroundColor: 'background.paper', // Use theme background
                padding: '4px 8px',
                borderRadius: '6px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                border: (theme) => `1px solid ${theme.palette.divider}`, // Use theme divider
                color: 'text.primary', // Use theme text color
            }}
        >
            {/* --- Formatting Buttons --- */}
            <Tooltip title="Negrito (Ctrl+B)" arrow placement="top">
                <IconButton size="small" onClick={() => editor.chain().focus().toggleBold().run()} color={editor.isActive('bold') ? 'primary' : 'inherit'}>
                    <FormatBoldIcon fontSize="small" />
                </IconButton>
            </Tooltip>
            <Tooltip title="Itálico (Ctrl+I)" arrow placement="top">
                <IconButton size="small" onClick={() => editor.chain().focus().toggleItalic().run()} color={editor.isActive('italic') ? 'primary' : 'inherit'}>
                    <FormatItalicIcon fontSize="small" />
                </IconButton>
            </Tooltip>
             <Tooltip title="Sublinhado (Ctrl+U)" arrow placement="top">
                 <IconButton size="small" onClick={() => editor.chain().focus().toggleUnderline().run()} color={editor.isActive('underline') ? 'primary' : 'inherit'}>
                     <FormatUnderlinedIcon fontSize="small" />
                 </IconButton>
             </Tooltip>
            <Tooltip title="Tachado" arrow placement="top">
                <IconButton size="small" onClick={() => editor.chain().focus().toggleStrike().run()} color={editor.isActive('strike') ? 'primary' : 'inherit'}>
                    <StrikethroughSIcon fontSize="small" />
                </IconButton>
            </Tooltip>

            <Divider orientation="vertical" flexItem sx={{ marginX: 0.5 }}/>

            {/* --- Link Buttons --- */}
            {editor.isActive('link') ? (
                <Tooltip title="Remover Link" arrow placement="top">
                    <IconButton size="small" onClick={() => editor.chain().focus().unsetLink().run()}>
                        <LinkOffIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
            ) : (
                <Tooltip title="Adicionar Link (Ctrl+K)" arrow placement="top">
                    <IconButton size="small" onClick={setLink}>
                        <LinkIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
            )}

            <Divider orientation="vertical" flexItem sx={{ marginX: 0.5 }}/>

            {/* --- Block Type Buttons (Example) --- */}
            <Tooltip title="Citação" arrow placement="top">
                <IconButton size="small" onClick={() => editor.chain().focus().toggleBlockquote().run()} color={editor.isActive('blockquote') ? 'primary' : 'inherit'}>
                    <FormatQuoteIcon fontSize="small"/>
                </IconButton>
            </Tooltip>
            <Tooltip title="Código (Inline)" arrow placement="top">
                <IconButton size="small" onClick={() => editor.chain().focus().toggleCode().run()} color={editor.isActive('code') ? 'primary' : 'inherit'}>
                    <CodeIcon fontSize="small"/>
                </IconButton>
            </Tooltip>
        </Box>
    );
}