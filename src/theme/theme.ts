import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1B3D6B',
      light: '#2A5CA0',
      dark: '#122A4A',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#0CB89E',
      light: '#2DD4BE',
      dark: '#0A8F7C',
      contrastText: '#FFFFFF',
    },
    success: {
      main: '#1E8A5E',
      light: '#2EAD77',
      dark: '#146843',
      contrastText: '#FFFFFF',
    },
    error: {
      main: '#D94F3D',
      light: '#E5705F',
      dark: '#B73A2A',
      contrastText: '#FFFFFF',
    },
    warning: {
      main: '#E8900B',
      light: '#F0A83D',
      dark: '#C07308',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#F8F9FB',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#0F1621',
      secondary: '#7A8699',
    },
    divider: '#E4E8EE',
  },
  typography: {
    fontFamily: '"DM Sans", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 700 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 700 },
    h4: { fontWeight: 700 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 10,
          padding: '10px 20px',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 4px rgba(15,22,33,0.06)',
          borderRadius: 16,
          border: '1px solid #E4E8EE',
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: '16px 20px',
          '&:last-child': { paddingBottom: '16px' },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          boxShadow: '0 1px 4px rgba(15,22,33,0.06)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
          },
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          height: '48px',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          padding: '12px 16px',
          borderColor: '#E4E8EE',
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-root': {
            fontWeight: 600,
            color: '#7A8699',
            backgroundColor: '#F8F9FB',
          },
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: '#F3F5F8',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500,
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 20,
          backgroundImage: 'none',
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          padding: '24px 24px 16px',
          fontSize: '1.25rem',
          fontWeight: 600,
        },
      },
    },
    MuiDialogContent: {
      styleOverrides: {
        root: {
          padding: '16px 24px',
        },
      },
    },
    MuiDialogActions: {
      styleOverrides: {
        root: {
          padding: '16px 24px 24px',
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          minHeight: '48px',
          fontSize: '0.95rem',
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: {
          height: 3,
          borderRadius: 3,
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          borderRadius: 8,
          fontSize: '0.875rem',
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          margin: '2px 4px',
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          height: 8,
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: '#E4E8EE',
        },
      },
    },
    MuiBottomNavigation: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(248,249,251,0.97)',
        },
      },
    },
    MuiBottomNavigationAction: {
      styleOverrides: {
        root: {
          '&.Mui-selected': {
            color: '#1B3D6B',
          },
        },
      },
    },
  },
});

export default theme;
