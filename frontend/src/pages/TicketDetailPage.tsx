import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { Link as RouterLink, useParams } from 'react-router-dom';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  FormControl,
  FormHelperText,
  InputLabel,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import { createComment, listComments } from '../api/commentsApi';
import { getTicket, updateTicketStatus } from '../api/ticketsApi';
import { listUsers } from '../api/usersApi';
import AppSnackbar from '../components/AppSnackbar';
import { useSnackbar } from '../hooks/useSnackbar';
import type { Comment, Ticket, TicketStatus, User } from '../types';
import { formatDateTime } from '../utils/dateUtils';
import { getErrorMessage, getFieldErrors } from '../utils/errorUtils';
import {
  formatStatusLabel,
  getPriorityColor,
  getStatusColor,
} from '../utils/statusUtils';
import {
  hasValidationErrors,
  omitFieldError,
  validateCreateComment,
} from '../utils/validationUtils';

export default function TicketDetailPage() {
  const { id } = useParams<{ id: string }>();
  const ticketId = Number(id);
  const { snackbar, showSnackbar, hideSnackbar } = useSnackbar();

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusUpdating, setStatusUpdating] = useState<TicketStatus | null>(
    null,
  );
  const [submittingComment, setSubmittingComment] = useState(false);

  const [commentMessage, setCommentMessage] = useState('');
  const [commentAuthorId, setCommentAuthorId] = useState<number | ''>('');
  const [commentFieldErrors, setCommentFieldErrors] = useState<
    Record<string, string>
  >({});

  const loadData = useCallback(async () => {
    if (!ticketId || Number.isNaN(ticketId)) {
      showSnackbar('Invalid ticket ID', 'error');
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const [ticketData, commentsData, usersData] = await Promise.all([
        getTicket(ticketId),
        listComments(ticketId),
        listUsers(),
      ]);
      setTicket(ticketData);
      setComments(commentsData);
      setUsers(usersData);
    } catch (error) {
      showSnackbar(getErrorMessage(error), 'error');
    } finally {
      setLoading(false);
    }
  }, [ticketId, showSnackbar]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleStatusChange = async (newStatus: TicketStatus) => {
    if (!ticket) return;

    setStatusUpdating(newStatus);
    try {
      const updated = await updateTicketStatus(ticket.id, { status: newStatus });
      setTicket(updated);
      showSnackbar(`Status updated to ${formatStatusLabel(newStatus)}`, 'success');
    } catch (error) {
      showSnackbar(getErrorMessage(error), 'error');
    } finally {
      setStatusUpdating(null);
    }
  };

  const handleCommentSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setCommentFieldErrors({});

    const clientErrors = validateCreateComment({
      message: commentMessage,
      createdById: commentAuthorId,
    });
    if (hasValidationErrors(clientErrors)) {
      setCommentFieldErrors(clientErrors);
      return;
    }

    setSubmittingComment(true);
    try {
      const newComment = await createComment(ticketId, {
        message: commentMessage.trim(),
        createdById: commentAuthorId as number,
      });
      setComments((prev) => [newComment, ...prev]);
      setCommentMessage('');
      showSnackbar('Comment added', 'success');
    } catch (error) {
      const errors = getFieldErrors(error);
      if (Object.keys(errors).length > 0) {
        setCommentFieldErrors(errors);
      } else {
        showSnackbar(getErrorMessage(error), 'error');
      }
    } finally {
      setSubmittingComment(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!ticket) {
    return (
      <Typography color="text.secondary">
        Ticket not found.{' '}
        <RouterLink to="/" style={{ color: 'inherit' }}>
          Return to list
        </RouterLink>
      </Typography>
    );
  }

  const allowedStatuses = Array.from(ticket.allowedNextStatuses ?? []);

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          mb: 3,
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            {ticket.title}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Chip
              label={ticket.priority}
              color={getPriorityColor(ticket.priority)}
              size="small"
            />
            <Chip
              label={formatStatusLabel(ticket.status)}
              color={getStatusColor(ticket.status)}
              size="small"
            />
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" component={RouterLink} to="/">
            Back
          </Button>
          <Button
            variant="outlined"
            component={RouterLink}
            to={`/tickets/${ticket.id}/edit`}
          >
            Edit
          </Button>
        </Box>
      </Box>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', mb: 2 }}>
          {ticket.description}
        </Typography>
        <Divider sx={{ my: 2 }} />
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
            gap: 2,
          }}
        >
          <Typography variant="body2" color="text.secondary">
            Assignee: <strong>{ticket.assignedTo.name}</strong>
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Created by: <strong>{ticket.createdBy.name}</strong>
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Created: {formatDateTime(ticket.createdAt)}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Updated: {formatDateTime(ticket.updatedAt)}
          </Typography>
        </Box>

        {allowedStatuses.length > 0 && (
          <>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle2" gutterBottom>
              Change Status
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {allowedStatuses.map((status) => (
                <Button
                  key={status}
                  variant="contained"
                  size="small"
                  color={status === 'CANCELLED' ? 'error' : 'primary'}
                  disabled={statusUpdating !== null}
                  onClick={() => handleStatusChange(status)}
                >
                  {statusUpdating === status ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    formatStatusLabel(status)
                  )}
                </Button>
              ))}
            </Box>
          </>
        )}
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Comments
        </Typography>

        {comments.length === 0 ? (
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            No comments yet.
          </Typography>
        ) : (
          <List disablePadding sx={{ mb: 3 }}>
            {comments.map((comment) => (
              <ListItem key={comment.id} disableGutters divider>
                <ListItemText
                  primary={comment.message}
                  secondary={`${comment.createdBy.name} · ${formatDateTime(comment.createdAt)}`}
                  slotProps={{
                    primary: { sx: { whiteSpace: 'pre-wrap' } },
                  }}
                />
              </ListItem>
            ))}
          </List>
        )}

        <Box component="form" onSubmit={handleCommentSubmit} noValidate>
          <TextField
            label="Message"
            value={commentMessage}
            onChange={(e) => {
              setCommentMessage(e.target.value);
              setCommentFieldErrors((prev) => omitFieldError(prev, 'message'));
            }}
            fullWidth
            required
            multiline
            minRows={2}
            margin="normal"
            error={Boolean(commentFieldErrors.message)}
            helperText={commentFieldErrors.message}
          />
          <FormControl
            fullWidth
            required
            margin="normal"
            error={Boolean(commentFieldErrors.createdById)}
          >
            <InputLabel id="comment-author-label">Author</InputLabel>
            <Select
              labelId="comment-author-label"
              label="Author"
              value={commentAuthorId}
              required
              onChange={(e) => {
                setCommentAuthorId(e.target.value as number);
                setCommentFieldErrors((prev) =>
                  omitFieldError(prev, 'createdById'),
                );
              }}
            >
              {users.map((user) => (
                <MenuItem key={user.id} value={user.id}>
                  {user.name} ({user.role})
                </MenuItem>
              ))}
            </Select>
            {commentFieldErrors.createdById && (
              <FormHelperText>{commentFieldErrors.createdById}</FormHelperText>
            )}
          </FormControl>
          <Button
            type="submit"
            variant="contained"
            disabled={submittingComment}
            sx={{ mt: 1 }}
          >
            {submittingComment ? 'Adding…' : 'Add Comment'}
          </Button>
        </Box>
      </Paper>

      <AppSnackbar snackbar={snackbar} onClose={hideSnackbar} />
    </>
  );
}
