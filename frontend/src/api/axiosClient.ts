import axios, { type AxiosError } from 'axios';
import type { ErrorResponse, ValidationErrorResponse } from '../types';

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/api';

export const axiosClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export type ApiError = ErrorResponse | ValidationErrorResponse;

export function isValidationError(
  error: unknown,
): error is AxiosError<ValidationErrorResponse> {
  return (
    axios.isAxiosError(error) &&
    error.response?.status === 400 &&
    Array.isArray((error.response.data as ValidationErrorResponse)?.errors)
  );
}

export function isErrorResponse(
  error: unknown,
): error is AxiosError<ErrorResponse> {
  return (
    axios.isAxiosError(error) &&
    typeof (error.response?.data as ErrorResponse)?.message === 'string'
  );
}

axiosClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiError>) => Promise.reject(error),
);

export default axiosClient;
