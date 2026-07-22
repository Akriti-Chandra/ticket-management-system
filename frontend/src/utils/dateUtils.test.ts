import { describe, expect, it } from 'vitest';
import { formatDateTime } from './dateUtils';

describe('dateUtils', () => {
  it('formats ISO timestamps using locale string', () => {
    const formatted = formatDateTime('2026-07-19T15:30:00.000Z');
    expect(formatted).toBe(new Date('2026-07-19T15:30:00.000Z').toLocaleString());
  });
});
