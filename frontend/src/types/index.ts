export type TicketStatus =
  | 'OPEN'
  | 'IN_PROGRESS'
  | 'RESOLVED'
  | 'CLOSED'
  | 'CANCELLED';

export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type UserRole = 'EMPLOYEE' | 'SUPPORT_AGENT' | 'ADMIN';

export interface UserSummary {
  id: number;
  name: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
}

export interface Ticket {
  id: number;
  title: string;
  description: string;
  priority: TicketPriority;
  status: TicketStatus;
  assignedTo: UserSummary;
  createdBy: UserSummary;
  createdAt: string;
  updatedAt: string;
  allowedNextStatuses: TicketStatus[];
}

export interface TicketSummary {
  id: number;
  title: string;
  priority: TicketPriority;
  status: TicketStatus;
  assignedTo: UserSummary;
  updatedAt: string;
}

export interface Comment {
  id: number;
  message: string;
  createdBy: UserSummary;
  createdAt: string;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface ErrorResponse {
  message: string;
}

export interface FieldError {
  field: string;
  message: string;
}

export interface ValidationErrorResponse {
  message: string;
  errors: FieldError[];
}

export interface CreateTicketRequest {
  title: string;
  description: string;
  priority: TicketPriority;
  assignedToId: number;
  createdById: number;
}

export interface UpdateTicketRequest {
  title: string;
  description: string;
  priority: TicketPriority;
  assignedToId: number;
}

export interface UpdateTicketStatusRequest {
  status: TicketStatus;
}

export interface CreateCommentRequest {
  message: string;
  createdById: number;
}
