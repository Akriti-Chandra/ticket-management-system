import axiosClient from './axiosClient';
import type {
  CreateTicketRequest,
  PageResponse,
  Ticket,
  TicketStatus,
  TicketSummary,
  UpdateTicketRequest,
  UpdateTicketStatusRequest,
} from '../types';

export interface TicketSearchParams {
  keyword?: string;
  status?: TicketStatus;
  page?: number;
  size?: number;
}

export async function listTickets(
  params: TicketSearchParams = {},
): Promise<PageResponse<TicketSummary>> {
  const { data } = await axiosClient.get<PageResponse<TicketSummary>>(
    '/tickets',
    { params },
  );
  return data;
}

export async function getTicket(id: number): Promise<Ticket> {
  const { data } = await axiosClient.get<Ticket>(`/tickets/${id}`);
  return data;
}

export async function createTicket(
  request: CreateTicketRequest,
): Promise<Ticket> {
  const { data } = await axiosClient.post<Ticket>('/tickets', request);
  return data;
}

export async function updateTicket(
  id: number,
  request: UpdateTicketRequest,
): Promise<Ticket> {
  const { data } = await axiosClient.put<Ticket>(`/tickets/${id}`, request);
  return data;
}

export async function updateTicketStatus(
  id: number,
  request: UpdateTicketStatusRequest,
): Promise<Ticket> {
  const { data } = await axiosClient.patch<Ticket>(
    `/tickets/${id}/status`,
    request,
  );
  return data;
}
