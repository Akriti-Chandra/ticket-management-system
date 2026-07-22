import { useCallback, useState } from 'react';

export interface SnackbarState {
  open: boolean;
  message: string;
  severity: 'success' | 'error' | 'info' | 'warning';
}

const initialState: SnackbarState = {
  open: false,
  message: '',
  severity: 'info',
};

export function useSnackbar() {
  const [snackbar, setSnackbar] = useState<SnackbarState>(initialState);

  const showSnackbar = useCallback(
    (message: string, severity: SnackbarState['severity'] = 'info') => {
      setSnackbar({ open: true, message, severity });
    },
    [],
  );

  const hideSnackbar = useCallback(() => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  }, []);

  return { snackbar, showSnackbar, hideSnackbar };
}
