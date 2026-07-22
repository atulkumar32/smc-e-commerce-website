import { createTheme } from '@mui/material/styles';

// ── Shared design tokens ───────────────────────────────────────────────────────
// Matches the reference image: dark navy sidebar (#1a2236), white content,
// Inter font, blue primary, clean card shadows.

const adminTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main:         '#1565c0',
      light:        '#5e92f3',
      dark:         '#003c8f',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#ff6f00',
    },
    success: { main: '#16a34a', light: '#dcfce7', dark: '#14532d' },
    warning: { main: '#d97706', light: '#fef3c7', dark: '#92400e' },
    error:   { main: '#dc2626', light: '#fee2e2', dark: '#7f1d1d' },
    info:    { main: '#0891b2', light: '#e0f2fe', dark: '#164e63' },
    background: {
      default: '#ffffff',   // pure white content area
      paper:   '#ffffff',
    },
    text: {
      primary:   '#101828',
      secondary: '#667085',
      disabled:  '#98a2b3',
    },
    divider: '#e4e7ec',
  },

  typography: {
    fontFamily: '"Inter", "Segoe UI", "Roboto", "Helvetica", "Arial", sans-serif',
    fontSize:   14,
    h4: { fontWeight: 700, color: '#101828' },
    h5: { fontWeight: 700, color: '#101828' },
    h6: { fontWeight: 700, color: '#101828' },
    subtitle1: { fontWeight: 600 },
    subtitle2: { fontWeight: 600 },
    body1: { fontSize: '0.875rem', color: '#344054' },
    body2: { fontSize: '0.8rem',   color: '#667085' },
    caption:{ fontSize: '0.72rem', color: '#98a2b3' },
  },

  shape: { borderRadius: 10 },

  shadows: [
    'none',
    '0 1px 2px rgba(16,24,40,0.05)',
    '0 1px 3px rgba(16,24,40,0.1), 0 1px 2px rgba(16,24,40,0.06)',
    '0 4px 8px -2px rgba(16,24,40,0.1), 0 2px 4px -2px rgba(16,24,40,0.06)',
    '0 6px 12px -2px rgba(16,24,40,0.08)',
    ...Array(20).fill('none'),
  ],

  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 8,
          boxShadow: 'none',
          '&:hover': { boxShadow: 'none' },
        },
        containedPrimary: {
          background: '#1565c0',
          '&:hover': { background: '#0d47a1' },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 1px 3px rgba(16,24,40,0.1), 0 1px 2px rgba(16,24,40,0.06)',
          border: '1px solid #e4e7ec',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: 'none' },
        elevation1: { boxShadow: '0 1px 3px rgba(16,24,40,0.08)' },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: { fontWeight: 700, fontSize: '0.75rem', color: '#344054', background: '#f9fafb' },
        body: { fontSize: '0.82rem', color: '#101828' },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 600, fontSize: '0.7rem', borderRadius: 6 },
      },
    },
    MuiTextField: {
      defaultProps: { size: 'small' },
    },
    MuiInputBase: {
      styleOverrides: {
        root: { fontSize: '0.85rem' },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          background: '#1a2236',   // dark navy — matches the reference image sidebar
          color: '#ffffff',
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          color: '#94a3b8',
          '&.Mui-selected': {
            background: 'rgba(99,179,237,0.15)',
            color: '#ffffff',
            '& .MuiListItemIcon-root': { color: '#ffffff' },
            '&:hover': { background: 'rgba(99,179,237,0.22)' },
          },
          '&:hover': {
            background: 'rgba(255,255,255,0.06)',
            color: '#ffffff',
          },
        },
      },
    },
    MuiListItemIcon: {
      styleOverrides: {
        root: { color: '#94a3b8', minWidth: 40 },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: { borderColor: '#e4e7ec' },
      },
    },
  },
});

export default adminTheme;
