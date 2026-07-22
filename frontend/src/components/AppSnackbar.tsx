import { Alert, Snackbar } from '@mui/material';
import type { SnackbarState } from '../hooks/useSnackbar';

interface AppSnackbarProps {
  snackbar: SnackbarState;
  onClose: () => void;
}

export default function AppSnackbar({ snackbar, onClose }: AppSnackbarProps) {
  return (
    <Snackbar
      open={snackbar.open}
      autoHideDuration={6000}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
    >
      <Alert onClose={onClose} severity={snackbar.severity} sx={{ width: '100%' }}>
        {snackbar.message}
      </Alert>
    </Snackbar>
  );
}
