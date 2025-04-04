// MenuBar.jsx
import React from 'react';
import { Box, FormControl, Select, MenuItem, InputLabel, OutlinedInput, Divider } from '@mui/material';

// Mapeamento de fontes para exibição
const fontFamilies = {
    'Helvetica': 'Helvetica, Arial, sans-serif',
    'Arial': 'Arial, sans-serif',
    'Georgia': 'Georgia, serif',
    'Times New Roman': '"Times New Roman", Times, serif',
    'Courier New': '"Courier New", Courier, monospace',
    'Verdana': 'Verdana, Geneva, sans-serif'
};

// Mapeamento de tamanhos (deve corresponder ao de Editor.jsx)
const sizeMap = {
    'Pequeno': '0.9rem',
    'Médio': '1rem',
    'Grande': '1.15rem',
    'Extra Grande': '1.3rem'
};
const fontSizes = Object.keys(sizeMap); // Pega as chaves ['Pequeno', 'Médio', ...]

export default function MenuBar({ editor, fontFamily, setFontFamily, fontSize, setFontSize }) {
    if (!editor) {
        return null;
    }

    return (
        <Box
            sx={{
                display: 'flex',
                flexWrap: 'wrap', // Permite quebrar linha em telas menores
                alignItems: 'center',
                gap: '12px', // Espaçamento entre controles
                padding: '8px 16px',
                borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
                backgroundColor: 'background.paper', // Fundo ligeiramente diferente
            }}
        >
            {/* Seletor de Fonte */}
            <FormControl size="small" sx={{ minWidth: 130 }}>
                <InputLabel id="font-family-select-label">Fonte</InputLabel>
                <Select
                    labelId="font-family-select-label"
                    value={fontFamily}
                    onChange={(e) => setFontFamily(e.target.value)}
                    input={<OutlinedInput label="Fonte" />}
                >
                    {Object.entries(fontFamilies).map(([name, value]) => (
                         <MenuItem key={name} value={name} style={{ fontFamily: value }}>
                             {name}
                         </MenuItem>
                     ))}
                </Select>
            </FormControl>

            {/* Seletor de Tamanho */}
            <FormControl size="small" sx={{ minWidth: 110 }}>
                <InputLabel id="font-size-select-label">Tamanho</InputLabel>
                <Select
                    labelId="font-size-select-label"
                    value={fontSize}
                    onChange={(e) => setFontSize(e.target.value)}
                    input={<OutlinedInput label="Tamanho" />}
                 >
                    {fontSizes.map((sizeKey) => (
                        <MenuItem key={sizeKey} value={sizeKey}>
                            {sizeKey} {/* Exibe 'Pequeno', 'Médio', etc. */}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>

             <Divider orientation="vertical" flexItem sx={{ marginX: 1 }} />

             {/* Aqui você pode adicionar outros botões fixos se necessário */}
             {/* Exemplo:
             <Tooltip title="Limpar Formatação">
                 <IconButton size="small" onClick={() => editor.chain().focus().unsetAllMarks().run()}>
                     <FormatClearIcon fontSize="small"/>
                 </IconButton>
             </Tooltip>
             */}
        </Box>
    );
}