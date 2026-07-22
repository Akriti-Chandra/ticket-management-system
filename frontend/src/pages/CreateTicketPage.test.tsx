import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as ticketsApi from '../api/ticketsApi';
import * as usersApi from '../api/usersApi';
import CreateTicketPage from './CreateTicketPage';
import { mockUsers } from '../test/fixtures';
import { renderWithRouter } from '../test/testUtils';

vi.mock('../api/usersApi');
vi.mock('../api/ticketsApi');

const mockedListUsers = vi.mocked(usersApi.listUsers);
const mockedCreateTicket = vi.mocked(ticketsApi.createTicket);

describe('CreateTicketPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedListUsers.mockResolvedValue(mockUsers);
  });

  it('renders create ticket form after users load', async () => {
    renderWithRouter(<CreateTicketPage />, { route: '/tickets/new' });

    expect(await screen.findByRole('heading', { name: 'Create Ticket' })).toBeInTheDocument();
    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/assignee/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/created by/i)).toBeInTheDocument();
  });

  it('shows client-side validation errors when required fields are missing', async () => {
    const user = userEvent.setup();
    renderWithRouter(<CreateTicketPage />, { route: '/tickets/new' });

    await screen.findByRole('heading', { name: 'Create Ticket' });
    await user.click(screen.getByRole('button', { name: /create ticket/i }));

    expect(await screen.findByText('Title is required')).toBeInTheDocument();
    expect(screen.getByText('Description is required')).toBeInTheDocument();
    expect(screen.getByText('Assignee is required')).toBeInTheDocument();
    expect(screen.getByText('Created By is required')).toBeInTheDocument();
    expect(mockedCreateTicket).not.toHaveBeenCalled();
  });

  it('submits valid form data to the API', async () => {
    const user = userEvent.setup();
    mockedCreateTicket.mockResolvedValue({
      id: 99,
      title: 'Install Cursor',
      description: 'Need IDE setup',
      priority: 'MEDIUM',
      status: 'OPEN',
      assignedTo: { id: 2, name: 'Bob Smith' },
      createdBy: { id: 1, name: 'Alice Johnson' },
      createdAt: '2026-07-19T10:00:00.000Z',
      updatedAt: '2026-07-19T10:00:00.000Z',
      allowedNextStatuses: ['IN_PROGRESS', 'CANCELLED'],
    });

    renderWithRouter(<CreateTicketPage />, { route: '/tickets/new' });
    await screen.findByRole('heading', { name: 'Create Ticket' });

    await user.type(screen.getByLabelText(/title/i), 'Install Cursor');
    await user.type(screen.getByLabelText(/description/i), 'Need IDE setup');
    await user.click(screen.getByLabelText(/assignee/i));
    await user.click(screen.getByRole('option', { name: /Bob Smith/i }));
    await user.click(screen.getByLabelText(/created by/i));
    await user.click(screen.getByRole('option', { name: /Alice Johnson/i }));
    await user.click(screen.getByRole('button', { name: /create ticket/i }));

    await waitFor(() => {
      expect(mockedCreateTicket).toHaveBeenCalledWith({
        title: 'Install Cursor',
        description: 'Need IDE setup',
        priority: 'MEDIUM',
        assignedToId: 2,
        createdById: 1,
      });
    });
  });
});
