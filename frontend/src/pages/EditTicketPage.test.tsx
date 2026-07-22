import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as ticketsApi from '../api/ticketsApi';
import * as usersApi from '../api/usersApi';
import EditTicketPage from './EditTicketPage';
import { mockTicket, mockUsers } from '../test/fixtures';
import { renderWithRouter } from '../test/testUtils';

vi.mock('../api/ticketsApi');
vi.mock('../api/usersApi');

const mockedGetTicket = vi.mocked(ticketsApi.getTicket);
const mockedListUsers = vi.mocked(usersApi.listUsers);
const mockedUpdateTicket = vi.mocked(ticketsApi.updateTicket);

describe('EditTicketPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedGetTicket.mockResolvedValue(mockTicket);
    mockedListUsers.mockResolvedValue(mockUsers);
  });

  it('pre-fills ticket data for editing', async () => {
    renderWithRouter(<EditTicketPage />, {
      route: '/tickets/1/edit',
      path: '/tickets/:id/edit',
    });

    expect(await screen.findByRole('heading', { name: 'Edit Ticket #1' })).toBeInTheDocument();
    expect(screen.getByLabelText(/title/i)).toHaveValue(mockTicket.title);
    expect(screen.getByLabelText(/description/i)).toHaveValue(mockTicket.description);
  });

  it('shows client-side validation errors when title is blank', async () => {
    const user = userEvent.setup();
    renderWithRouter(<EditTicketPage />, {
      route: '/tickets/1/edit',
      path: '/tickets/:id/edit',
    });

    const titleInput = await screen.findByLabelText(/title/i);
    await user.clear(titleInput);
    await user.click(screen.getByRole('button', { name: /save changes/i }));

    expect(await screen.findByText('Title is required')).toBeInTheDocument();
    expect(mockedUpdateTicket).not.toHaveBeenCalled();
  });

  it('submits updated ticket data', async () => {
    const user = userEvent.setup();
    mockedUpdateTicket.mockResolvedValue({
      ...mockTicket,
      title: 'Updated printer issue',
    });

    renderWithRouter(<EditTicketPage />, {
      route: '/tickets/1/edit',
      path: '/tickets/:id/edit',
    });
    const titleInput = await screen.findByLabelText(/title/i);

    await user.clear(titleInput);
    await user.type(titleInput, 'Updated printer issue');
    await user.click(screen.getByRole('button', { name: /save changes/i }));

    await waitFor(() => {
      expect(mockedUpdateTicket).toHaveBeenCalledWith(1, {
        title: 'Updated printer issue',
        description: mockTicket.description,
        priority: mockTicket.priority,
        assignedToId: mockTicket.assignedTo.id,
      });
    });
  });
});
