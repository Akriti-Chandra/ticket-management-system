import { useCallback, useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Chip,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { listTickets } from '../api/ticketsApi';
import AppSnackbar from '../components/AppSnackbar';
import { useDebounce } from '../hooks/useDebounce';
import { useSnackbar } from '../hooks/useSnackbar';
import type { TicketStatus, TicketSummary } from '../types';
import { formatDateTime } from '../utils/dateUtils';
import { getErrorMessage } from '../utils/errorUtils';
import {
  TICKET_STATUSES,
  formatStatusLabel,
  getPriorityColor,
  getStatusColor,
} from '../utils/statusUtils';

const PAGE_SIZE = 10;

export default function TicketListPage() {
  const { snackbar, showSnackbar, hideSnackbar } = useSnackbar();
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState<TicketStatus | ''>('');
  const [page, setPage] = useState(0);
  const [tickets, setTickets] = useState<TicketSummary[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);

  const debouncedKeyword = useDebounce(keyword, 300);

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    try {
      const response = await listTickets({
        keyword: debouncedKeyword || undefined,
        status: statusFilter || undefined,
        page,
        size: PAGE_SIZE,
      });
      setTickets(response.content);
      setTotalElements(response.totalElements);
    } catch (error) {
      showSnackbar(getErrorMessage(error), 'error');
    } finally {
      setLoading(false);
    }
  }, [debouncedKeyword, statusFilter, page, showSnackbar]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  useEffect(() => {
    setPage(0);
  }, [debouncedKeyword, statusFilter]);

  return (
    <>
      <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
        Tickets
      </Typography>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Box
          sx={{
            display: 'flex',
            gap: 2,
            flexWrap: 'wrap',
            alignItems: 'center',
          }}
        >
          <TextField
            label="Search"
            placeholder="Search title or description"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            size="small"
            sx={{ minWidth: 240, flexGrow: 1 }}
          />
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel id="status-filter-label">Status</InputLabel>
            <Select
              labelId="status-filter-label"
              label="Status"
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as TicketStatus | '')
              }
            >
              <MenuItem value="">All</MenuItem>
              {TICKET_STATUSES.map((status) => (
                <MenuItem key={status} value={status}>
                  {formatStatusLabel(status)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Paper>

      <TableContainer component={Paper}>
        {loading && tickets.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress />
          </Box>
        ) : tickets.length === 0 ? (
          <Box sx={{ py: 6, textAlign: 'center' }}>
            <Typography color="text.secondary">No tickets found.</Typography>
          </Box>
        ) : (
          <>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Title</TableCell>
                  <TableCell>Priority</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Assignee</TableCell>
                  <TableCell>Updated</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tickets.map((ticket) => (
                  <TableRow key={ticket.id} hover>
                    <TableCell>
                      <RouterLink
                        to={`/tickets/${ticket.id}`}
                        style={{ textDecoration: 'none', color: 'inherit' }}
                      >
                        <Typography
                          component="span"
                          color="primary"
                          sx={{ fontWeight: 500 }}
                        >
                          {ticket.title}
                        </Typography>
                      </RouterLink>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={ticket.priority}
                        color={getPriorityColor(ticket.priority)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={formatStatusLabel(ticket.status)}
                        color={getStatusColor(ticket.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{ticket.assignedTo.name}</TableCell>
                    <TableCell>{formatDateTime(ticket.updatedAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <TablePagination
              component="div"
              count={totalElements}
              page={page}
              onPageChange={(_, newPage) => setPage(newPage)}
              rowsPerPage={PAGE_SIZE}
              rowsPerPageOptions={[PAGE_SIZE]}
            />
          </>
        )}
      </TableContainer>

      <AppSnackbar snackbar={snackbar} onClose={hideSnackbar} />
    </>
  );
}
