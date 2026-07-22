import axiosClient from './axiosClient';
import type { User } from '../types';

export async function listUsers(): Promise<User[]> {
  const { data } = await axiosClient.get<User[]>('/users');
  return data;
}
