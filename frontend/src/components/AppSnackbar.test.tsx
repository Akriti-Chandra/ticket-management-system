import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import AppSnackbar from './AppSnackbar';

describe('AppSnackbar', () => {
  it('renders message with severity', () => {
    render(
      <AppSnackbar
        snackbar={{ open: true, message: 'Saved successfully', severity: 'success' }}
        onClose={vi.fn()}
      />,
    );

    expect(screen.getByText('Saved successfully')).toBeInTheDocument();
  });

  it('calls onClose when dismissed', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(
      <AppSnackbar
        snackbar={{ open: true, message: 'Something failed', severity: 'error' }}
        onClose={onClose}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Close' }));
    expect(onClose).toHaveBeenCalled();
  });
});
