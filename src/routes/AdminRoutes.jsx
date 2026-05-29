import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import AdminLayout from '../components/AdminLayout';
import { AdminProvider } from '../context/AdminContext';
import adminTheme from '../theme/adminTheme';

export function AdminShell() {
  return (
    <ThemeProvider theme={adminTheme}>
      <CssBaseline />
      <AdminProvider>
        <AdminLayout />
      </AdminProvider>
    </ThemeProvider>
  );
}
