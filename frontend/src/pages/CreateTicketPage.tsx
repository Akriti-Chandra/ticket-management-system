import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { createTicket } from '../api/ticketsApi';
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
  validateCreateTicket,
} from '../utils/validationUtils';

export default function CreateTicketPage() {
  const navigate = useNavigate();
  const { snackbar, showSnackbar, hideSnackbar } = useSnackbar();

  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TicketPriority>('MEDIUM');
  const [assignedToId, setAssignedToId] = useState<number | ''>('');
  const [createdById, setCreatedById] = useState<number | ''>('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    listUsers()
      .then(setUsers)
      .catch((error) => showSnackbar(getErrorMessage(error), 'error'))
      .finally(() => setLoadingUsers(false));
  }, [showSnackbar]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFieldErrors({});

    const clientErrors = validateCreateTicket({
      title,
      description,
      assignedToId,
      createdById,
    });
    if (hasValidationErrors(clientErrors)) {
      setFieldErrors(clientErrors);
      return;
    }

    setSubmitting(true);
    try {
      const ticket = await createTicket({
        title: title.trim(),
        description: description.trim(),
        priority,
        assignedToId: assignedToId as number,
        createdById: createdById as number,
      });
      navigate(`/tickets/${ticket.id}`);
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

  if (loadingUsers) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        Create Ticket
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
          <FormControl
            fullWidth
            required
            margin="normal"
            error={Boolean(fieldErrors.createdById)}
          >
            <InputLabel id="creator-label">Created By</InputLabel>
            <Select
              labelId="creator-label"
              label="Created By"
              value={createdById}
              required
              onChange={(e) => {
                setCreatedById(e.target.value as number);
                setFieldErrors((prev) => omitFieldError(prev, 'createdById'));
              }}
            >
              {users.map((user) => (
                <MenuItem key={user.id} value={user.id}>
                  {user.name} ({user.role})
                </MenuItem>
              ))}
            </Select>
            {fieldErrors.createdById && (
              <FormHelperText>{fieldErrors.createdById}</FormHelperText>
            )}
          </FormControl>

          <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
            <Button
              type="submit"
              variant="contained"
              disabled={submitting}
            >
              {submitting ? 'Creating…' : 'Create Ticket'}
            </Button>
            <Button variant="outlined" onClick={() => navigate('/')}>
              Cancel
            </Button>
          </Box>
        </Box>
      </Paper>

      <AppSnackbar snackbar={snackbar} onClose={hideSnackbar} />
    </Box>
  );
}
