import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as commentsApi from '../api/commentsApi';
import * as ticketsApi from '../api/ticketsApi';
import * as usersApi from '../api/usersApi';
import TicketDetailPage from './TicketDetailPage';
import { mockComment, mockTicket, mockUsers } from '../test/fixtures';
import { renderWithRouter } from '../test/testUtils';

vi.mock('../api/ticketsApi');
vi.mock('../api/commentsApi');
vi.mock('../api/usersApi');

const mockedGetTicket = vi.mocked(ticketsApi.getTicket);
const mockedListComments = vi.mocked(commentsApi.listComments);
const mockedListUsers = vi.mocked(usersApi.listUsers);
const mockedUpdateTicketStatus = vi.mocked(ticketsApi.updateTicketStatus);
const mockedCreateComment = vi.mocked(commentsApi.createComment);

describe('TicketDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedGetTicket.mockResolvedValue(mockTicket);
    mockedListComments.mockResolvedValue([mockComment]);
    mockedListUsers.mockResolvedValue(mockUsers);
  });

  it('renders ticket details and comments', async () => {
    renderWithRouter(<TicketDetailPage />, {
      route: '/tickets/1',
      path: '/tickets/:id',
    });

    expect(await screen.findByRole('heading', { name: mockTicket.title })).toBeInTheDocument();
    expect(screen.getByText(mockTicket.description)).toBeInTheDocument();
    expect(screen.getByText(/Investigating the issue/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Back' })).toBeInTheDocument();
  });

  it('shows only allowed next status buttons from the API', async () => {
    renderWithRouter(<TicketDetailPage />, {
      route: '/tickets/1',
      path: '/tickets/:id',
    });

    expect(await screen.findByRole('button', { name: 'IN PROGRESS' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'CANCELLED' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'CLOSED' })).not.toBeInTheDocument();
  });

  it('updates ticket status when an allowed button is clicked', async () => {
    const user = userEvent.setup();
    mockedUpdateTicketStatus.mockResolvedValue({
      ...mockTicket,
      status: 'IN_PROGRESS',
      allowedNextStatuses: ['RESOLVED', 'CANCELLED'],
    });

    renderWithRouter(<TicketDetailPage />, {
      route: '/tickets/1',
      path: '/tickets/:id',
    });
    await screen.findByRole('button', { name: 'IN PROGRESS' });

    await user.click(screen.getByRole('button', { name: 'IN PROGRESS' }));

    await waitFor(() => {
      expect(mockedUpdateTicketStatus).toHaveBeenCalledWith(1, {
        status: 'IN_PROGRESS',
      });
    });
    expect(await screen.findByText(/status updated to in progress/i)).toBeInTheDocument();
  });

  it('shows client-side validation errors for empty comment form', async () => {
    const user = userEvent.setup();
    renderWithRouter(<TicketDetailPage />, {
      route: '/tickets/1',
      path: '/tickets/:id',
    });

    await screen.findByRole('heading', { name: mockTicket.title });
    await user.click(screen.getByRole('button', { name: /add comment/i }));

    expect(await screen.findByText('Message is required')).toBeInTheDocument();
    expect(screen.getByText('Author is required')).toBeInTheDocument();
    expect(mockedCreateComment).not.toHaveBeenCalled();
  });

  it('submits a valid comment', async () => {
    const user = userEvent.setup();
    mockedCreateComment.mockResolvedValue({
      id: 11,
      message: 'Please reboot the printer.',
      createdBy: { id: 2, name: 'Bob Smith' },
      createdAt: '2026-07-19T12:00:00.000Z',
    });

    renderWithRouter(<TicketDetailPage />, {
      route: '/tickets/1',
      path: '/tickets/:id',
    });
    await screen.findByRole('heading', { name: mockTicket.title });

    await user.type(screen.getByLabelText(/message/i), 'Please reboot the printer.');
    await user.click(screen.getByRole('combobox', { name: /author/i }));
    await user.click(screen.getByRole('option', { name: /Bob Smith/i }));
    await user.click(screen.getByRole('button', { name: /add comment/i }));

    await waitFor(() => {
      expect(mockedCreateComment).toHaveBeenCalledWith(1, {
        message: 'Please reboot the printer.',
        createdById: 2,
      });
    });
    expect(await screen.findByText('Comment added')).toBeInTheDocument();
  });
});
