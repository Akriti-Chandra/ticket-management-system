import axiosClient from './axiosClient';
import type { Comment, CreateCommentRequest } from '../types';

export async function listComments(ticketId: number): Promise<Comment[]> {
  const { data } = await axiosClient.get<Comment[]>(
    `/tickets/${ticketId}/comments`,
  );
  return data;
}

export async function createComment(
  ticketId: number,
  request: CreateCommentRequest,
): Promise<Comment> {
  const { data } = await axiosClient.post<Comment>(
    `/tickets/${ticketId}/comments`,
    request,
  );
  return data;
}
