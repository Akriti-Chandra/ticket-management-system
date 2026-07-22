import type { TicketPriority, TicketStatus } from '../types';

export const TICKET_STATUSES: TicketStatus[] = [
  'OPEN',
  'IN_PROGRESS',
  'RESOLVED',
  'CLOSED',
  'CANCELLED',
];

export const TICKET_PRIORITIES: TicketPriority[] = [
  'LOW',
  'MEDIUM',
  'HIGH',
  'CRITICAL',
];

type ChipColor =
  | 'default'
  | 'primary'
  | 'secondary'
  | 'error'
  | 'info'
  | 'success'
  | 'warning';

export function getStatusColor(status: TicketStatus): ChipColor {
  switch (status) {
    case 'OPEN':
      return 'info';
    case 'IN_PROGRESS':
      return 'warning';
    case 'RESOLVED':
      return 'success';
    case 'CLOSED':
      return 'default';
    case 'CANCELLED':
      return 'error';
    default:
      return 'default';
  }
}

export function getPriorityColor(priority: TicketPriority): ChipColor {
  switch (priority) {
    case 'LOW':
      return 'default';
    case 'MEDIUM':
      return 'info';
    case 'HIGH':
      return 'warning';
    case 'CRITICAL':
      return 'error';
    default:
      return 'default';
  }
}

export function formatStatusLabel(status: TicketStatus): string {
  return status.replace(/_/g, ' ');
}
