import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import * as ticketsApi from '../api/ticketsApi';
import TicketListPage from './TicketListPage';
import { mockTicketSummary } from '../test/fixtures';
import { renderWithRouter } from '../test/testUtils';

vi.mock('../api/ticketsApi');

const mockedListTickets = vi.mocked(ticketsApi.listTickets);

describe('TicketListPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    mockedListTickets.mockResolvedValue({
      content: [mockTicketSummary],
      page: 0,
      size: 10,
      totalElements: 1,
      totalPages: 1,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders tickets from the API', async () => {
    renderWithRouter(<TicketListPage />);

    expect(await screen.findByRole('heading', { name: 'Tickets' })).toBeInTheDocument();
    expect(await screen.findByRole('link', { name: mockTicketSummary.title })).toBeInTheDocument();
    expect(screen.getByText('Bob Smith')).toBeInTheDocument();
    expect(screen.getByText('OPEN')).toBeInTheDocument();
  });

  it('searches tickets with debounced keyword', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderWithRouter(<TicketListPage />);

    await screen.findByRole('link', { name: mockTicketSummary.title });
    await user.type(screen.getByLabelText(/search/i), 'printer');

    await vi.advanceTimersByTimeAsync(300);

    await waitFor(() => {
      expect(mockedListTickets).toHaveBeenLastCalledWith({
        keyword: 'printer',
        status: undefined,
        page: 0,
        size: 10,
      });
    });
  });

  it('filters tickets by status', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderWithRouter(<TicketListPage />);

    await screen.findByRole('link', { name: mockTicketSummary.title });
    await user.click(screen.getByLabelText(/^status$/i));
    await user.click(screen.getByRole('option', { name: 'IN PROGRESS' }));

    await waitFor(() => {
      expect(mockedListTickets).toHaveBeenLastCalledWith({
        keyword: undefined,
        status: 'IN_PROGRESS',
        page: 0,
        size: 10,
      });
    });
  });
});
