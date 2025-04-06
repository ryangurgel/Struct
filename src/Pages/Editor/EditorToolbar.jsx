import React from 'react'
import { Box, Button, CircularProgress, Tooltip, Typography } from '@mui/material'
import SaveIcon from '@mui/icons-material/Save'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'
import EditNoteIcon from '@mui/icons-material/EditNote'
import AutorenewIcon from '@mui/icons-material/Autorenew'

const saveStates = {
  saving: {
    icon: <AutorenewIcon sx={{ animation: 'spin 1s linear infinite' }} fontSize="small" color="info" />,
    text: 'Salvando...',
    color: 'info.main'
  },
  saved: {
    icon: <CheckCircleOutlineIcon fontSize="small" color="success" />,
    text: 'Salvo',
    color: 'success.main'
  },
  unsaved: {
    icon: <EditNoteIcon fontSize="small" color="warning" />,
    text: 'Alterações não salvas',
    color: 'warning.main'
  },
  error: {
    icon: <ErrorOutlineIcon fontSize="small" color="error" />,
    text: 'Erro ao salvar',
    color: 'error.main'
  }
}

export default function EditorToolbar({ saveStatus, onManualSave }) {
  const { icon, text, color } = saveStates[saveStatus] || {}

  return (
    <Box sx={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '8px 16px',
      borderBottom: '1px solid #444',
      flexShrink: 0
    }}>
      <Tooltip title={text} arrow>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color }}>
          {icon}
          <Typography variant="caption" sx={{ display: { xs: 'none', sm: 'block' } }}>
            {text}
          </Typography>
        </Box>
      </Tooltip>

      <Button
        variant="contained"
        color="primary"
        size="small"
        onClick={onManualSave}
        disabled={saveStatus === 'saving'}
        startIcon={saveStatus === 'saving' ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
      >
        Salvar
      </Button>
    </Box>
  )
}
