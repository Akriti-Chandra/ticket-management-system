import axios from 'axios';
import type { FieldError } from '../types';
import { isErrorResponse, isValidationError } from '../api/axiosClient';

export function getErrorMessage(error: unknown): string {
  if (isValidationError(error)) {
    return error.response?.data?.message ?? 'Validation failed';
  }
  if (isErrorResponse(error)) {
    return error.response?.data?.message ?? 'An error occurred';
  }
  if (axios.isAxiosError(error) && !error.response) {
    return 'Unable to reach server';
  }
  return 'An unexpected error occurred';
}

export function getFieldErrors(error: unknown): Record<string, string> {
  if (!isValidationError(error)) {
    return {};
  }

  const errors = error.response?.data?.errors ?? [];
  return errors.reduce<Record<string, string>>(
    (acc, { field, message }: FieldError) => {
      acc[field] = message;
      return acc;
    },
    {},
  );
}
