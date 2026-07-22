import axios, { AxiosError } from 'axios';
import { describe, expect, it } from 'vitest';
import { getErrorMessage, getFieldErrors } from './errorUtils';

function createAxiosError(
  status: number,
  data: { message?: string; errors?: { field: string; message: string }[] },
): AxiosError<{ message?: string; errors?: { field: string; message: string }[] }> {
  return new AxiosError(
    'Request failed',
    AxiosError.ERR_BAD_REQUEST,
    undefined,
    undefined,
    {
      status,
      data,
      headers: {},
      config: { headers: new axios.AxiosHeaders() },
      statusText: 'Bad Request',
    },
  ) as AxiosError<{ message?: string; errors?: { field: string; message: string }[] }>;
}

describe('errorUtils', () => {
  describe('getErrorMessage', () => {
    it('returns validation message for 400 validation errors', () => {
      const error = createAxiosError(400, {
        message: 'Validation Failed',
        errors: [{ field: 'title', message: 'must not be blank' }],
      });

      expect(getErrorMessage(error)).toBe('Validation Failed');
    });

    it('returns business error message for 400 responses', () => {
      const error = createAxiosError(400, {
        message: 'Cannot transition from OPEN to CLOSED',
      });

      expect(getErrorMessage(error)).toBe(
        'Cannot transition from OPEN to CLOSED',
      );
    });

    it('returns network message when server is unreachable', () => {
      const error = new AxiosError(
        'Network Error',
        AxiosError.ERR_NETWORK,
        undefined,
        undefined,
        undefined,
      );

      expect(getErrorMessage(error)).toBe('Unable to reach server');
    });

    it('returns generic message for unknown errors', () => {
      expect(getErrorMessage(new Error('boom'))).toBe(
        'An unexpected error occurred',
      );
    });
  });

  describe('getFieldErrors', () => {
    it('maps validation errors to field keys', () => {
      const error = createAxiosError(400, {
        message: 'Validation Failed',
        errors: [
          { field: 'title', message: 'must not be blank' },
          { field: 'description', message: 'must not be blank' },
        ],
      });

      expect(getFieldErrors(error)).toEqual({
        title: 'must not be blank',
        description: 'must not be blank',
      });
    });

    it('returns empty object for non-validation errors', () => {
      const error = createAxiosError(404, { message: 'Ticket not found' });
      expect(getFieldErrors(error)).toEqual({});
    });
  });
});
