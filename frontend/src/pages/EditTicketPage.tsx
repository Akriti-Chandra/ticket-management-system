import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Button,
  CircularProgress,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import { getTicket, updateTicket } from '../api/ticketsApi';
import { listUsers } from '../api/usersApi';
import AppSnackbar from '../components/AppSnackbar';
import { useSnackbar } from '../hooks/useSnackbar';
import type { TicketPriority, User } from '../types';
import { getErrorMessage, getFieldErrors } from '../utils/errorUtils';
import { TICKET_PRIORITIES } from '../utils/statusUtils';
import {
  hasValidationErrors,
  omitFieldError,
  TITLE_MAX_LENGTH,
  validateUpdateTicket,
} from '../utils/validationUtils';

export default function EditTicketPage() {
  const { id } = useParams<{ id: string }>();
  const ticketId = Number(id);
  const navigate = useNavigate();
  const { snackbar, showSnackbar, hideSnackbar } = useSnackbar();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TicketPriority>('MEDIUM');
  const [assignedToId, setAssignedToId] = useState<number | ''>('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!ticketId || Number.isNaN(ticketId)) {
      showSnackbar('Invalid ticket ID', 'error');
      setLoading(false);
      return;
    }

    Promise.all([getTicket(ticketId), listUsers()])
      .then(([ticket, userList]) => {
        setTitle(ticket.title);
        setDescription(ticket.description);
        setPriority(ticket.priority);
        setAssignedToId(ticket.assignedTo.id);
        setUsers(userList);
      })
      .catch((error) => showSnackbar(getErrorMessage(error), 'error'))
      .finally(() => setLoading(false));
  }, [ticketId, showSnackbar]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFieldErrors({});

    const clientErrors = validateUpdateTicket({
      title,
      description,
      assignedToId,
    });
    if (hasValidationErrors(clientErrors)) {
      setFieldErrors(clientErrors);
      return;
    }

    setSubmitting(true);
    try {
      await updateTicket(ticketId, {
        title: title.trim(),
        description: description.trim(),
        priority,
        assignedToId: assignedToId as number,
      });
      navigate(`/tickets/${ticketId}`);
    } catch (error) {
      const errors = getFieldErrors(error);
      if (Object.keys(errors).length > 0) {
        setFieldErrors(errors);
      } else {
        showSnackbar(getErrorMessage(error), 'error');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        Edit Ticket #{ticketId}
      </Typography>

      <Paper sx={{ p: 3, maxWidth: 640, width: '100%' }}>
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <TextField
            label="Title"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              setFieldErrors((prev) => omitFieldError(prev, 'title'));
            }}
            fullWidth
            required
            margin="normal"
            slotProps={{ htmlInput: { maxLength: TITLE_MAX_LENGTH } }}
            error={Boolean(fieldErrors.title)}
            helperText={fieldErrors.title}
          />
          <TextField
            label="Description"
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              setFieldErrors((prev) => omitFieldError(prev, 'description'));
            }}
            fullWidth
            required
            multiline
            minRows={4}
            margin="normal"
            error={Boolean(fieldErrors.description)}
            helperText={fieldErrors.description}
          />
          <FormControl fullWidth margin="normal" error={Boolean(fieldErrors.priority)}>
            <InputLabel id="priority-label">Priority</InputLabel>
            <Select
              labelId="priority-label"
              label="Priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value as TicketPriority)}
            >
              {TICKET_PRIORITIES.map((p) => (
                <MenuItem key={p} value={p}>
                  {p}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl
            fullWidth
            required
            margin="normal"
            error={Boolean(fieldErrors.assignedToId)}
          >
            <InputLabel id="assignee-label">Assignee</InputLabel>
            <Select
              labelId="assignee-label"
              label="Assignee"
              value={assignedToId}
              required
              onChange={(e) => {
                setAssignedToId(e.target.value as number);
                setFieldErrors((prev) => omitFieldError(prev, 'assignedToId'));
              }}
            >
              {users.map((user) => (
                <MenuItem key={user.id} value={user.id}>
                  {user.name} ({user.role})
                </MenuItem>
              ))}
            </Select>
            {fieldErrors.assignedToId && (
              <FormHelperText>{fieldErrors.assignedToId}</FormHelperText>
            )}
          </FormControl>

          <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
            <Button
              type="submit"
              variant="contained"
              disabled={submitting}
            >
              {submitting ? 'Saving…' : 'Save Changes'}
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate(`/tickets/${ticketId}`)}
            >
              Cancel
            </Button>
          </Box>
        </Box>
      </Paper>

      <AppSnackbar snackbar={snackbar} onClose={hideSnackbar} />
    </Box>
  );
}
