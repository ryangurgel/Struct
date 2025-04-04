import React from 'react';
import { Box, Tooltip, IconButton, FormControl, Select, MenuItem, InputLabel, OutlinedInput } from '@mui/material';
import {
    FormatBold as FormatBoldIcon,
    FormatItalic as FormatItalicIcon,
    FormatUnderlined as FormatUnderlinedIcon,
    StrikethroughS as StrikethroughSIcon,
    FormatQuote as FormatQuoteIcon,
    Code as CodeIcon,
    Link as LinkIcon,
    Image as ImageIcon,
} from '@mui/icons-material';

export default function Toolbar({ editor, fontFamily, setFontFamily, fontSize, setFontSize }) {
    const setLink = () => {
        const url = prompt('URL do link:');
        url
            ? editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
            : editor.chain().focus().unsetLink().run();
    };

    const insertImage = () => {
        const url = prompt('URL da imagem:');
        url && editor.chain().focus().setImage({ src: url }).run();
    };

    return (
        <Box sx={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <FormControl size="small" sx={{ minWidth: 100 }}>
                <InputLabel>Fonte</InputLabel>
                <Select value={fontFamily} onChange={e => setFontFamily(e.target.value)} input={<OutlinedInput label="Fonte" />} sx={{ color: '#ccc' }}>
                    <MenuItem value="Helvetica">Helvetica</MenuItem>
                    <MenuItem value="Arial">Arial</MenuItem>
                    <MenuItem value="Georgia">Georgia</MenuItem>
                </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 100 }}>
                <InputLabel>Tamanho</InputLabel>
                <Select value={fontSize} onChange={e => setFontSize(e.target.value)} input={<OutlinedInput label="Tamanho" />} sx={{ color: '#ccc' }}>
                    <MenuItem value="Small">Small</MenuItem>
                    <MenuItem value="Medium">Medium</MenuItem>
                    <MenuItem value="Large">Large</MenuItem>
                </Select>
            </FormControl>

            <Tooltip title="Negrito"><IconButton onClick={() => editor.chain().focus().toggleBold().run()} color={editor.isActive('bold') ? 'primary' : 'default'}><FormatBoldIcon /></IconButton></Tooltip>
            <Tooltip title="Itálico"><IconButton onClick={() => editor.chain().focus().toggleItalic().run()} color={editor.isActive('italic') ? 'primary' : 'default'}><FormatItalicIcon /></IconButton></Tooltip>
            <Tooltip title="Sublinhado"><IconButton onClick={() => editor.chain().focus().toggleUnderline().run()} color={editor.isActive('underline') ? 'primary' : 'default'}><FormatUnderlinedIcon /></IconButton></Tooltip>
            <Tooltip title="Tachado"><IconButton onClick={() => editor.chain().focus().toggleStrike().run()} color={editor.isActive('strike') ? 'primary' : 'default'}><StrikethroughSIcon /></IconButton></Tooltip>
            <Tooltip title="Blockquote"><IconButton onClick={() => editor.chain().focus().toggleBlockquote().run()} color={editor.isActive('blockquote') ? 'primary' : 'default'}><FormatQuoteIcon /></IconButton></Tooltip>
            <Tooltip title="Code Block"><IconButton onClick={() => editor.chain().focus().toggleCodeBlock().run()} color={editor.isActive('codeBlock') ? 'primary' : 'default'}><CodeIcon /></IconButton></Tooltip>
            <Tooltip title="Link"><IconButton onClick={setLink}><LinkIcon /></IconButton></Tooltip>
            <Tooltip title="Imagem"><IconButton onClick={insertImage}><ImageIcon /></IconButton></Tooltip>
        </Box>
    );
}