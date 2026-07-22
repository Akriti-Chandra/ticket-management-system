import type { Comment, Ticket, TicketSummary, User } from '../types';

export const mockUsers: User[] = [
  {
    id: 1,
    name: 'Alice Johnson',
    email: 'alice.johnson@example.com',
    role: 'EMPLOYEE',
  },
  {
    id: 2,
    name: 'Bob Smith',
    email: 'bob.smith@example.com',
    role: 'SUPPORT_AGENT',
  },
];

export const mockTicketSummary: TicketSummary = {
  id: 1,
  title: 'Printer not working',
  priority: 'HIGH',
  status: 'OPEN',
  assignedTo: { id: 2, name: 'Bob Smith' },
  updatedAt: '2026-07-19T10:00:00.000Z',
};

export const mockTicket: Ticket = {
  id: 1,
  title: 'Printer not working',
  description: 'Office printer on floor 2 is offline.',
  priority: 'HIGH',
  status: 'OPEN',
  assignedTo: { id: 2, name: 'Bob Smith' },
  createdBy: { id: 1, name: 'Alice Johnson' },
  createdAt: '2026-07-19T09:00:00.000Z',
  updatedAt: '2026-07-19T10:00:00.000Z',
  allowedNextStatuses: ['IN_PROGRESS', 'CANCELLED'],
};

export const mockComment: Comment = {
  id: 10,
  message: 'Investigating the issue.',
  createdBy: { id: 2, name: 'Bob Smith' },
  createdAt: '2026-07-19T11:00:00.000Z',
};
