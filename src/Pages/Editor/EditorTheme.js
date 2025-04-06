import { createTheme } from '@mui/material/styles'

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#bb86fc' },
    secondary: { main: '#03dac6' },
    background: {
      default: '#1F1F1F',
      paper: '#2A2A2A'
    },
    text: {
      primary: '#E0E0E0',
      secondary: '#B0B0B0'
    },
    divider: '#424242',
    success: { main: '#66bb6a' },
    warning: { main: '#ffa726' },
    error: { main: '#f44336' },
    info: { main: '#29b6f6' }
  },
  typography: {
    fontFamily: 'inherit',
    button: {
      textTransform: 'none'
    }
  },
  components: {
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: '#333',
          color: '#E0E0E0',
          fontSize: '0.8rem'
        },
        arrow: {
          color: '#333'
        }
      }
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          color: '#B0B0B0',
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.08)'
          }
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        containedPrimary: {
          backgroundColor: '#bb86fc',
          color: '#000',
          '&:hover': {
            backgroundColor: '#a36bf4'
          },
          '&.Mui-disabled': {
            backgroundColor: 'rgba(187, 134, 252, 0.5)',
            color: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    }
  }
})
