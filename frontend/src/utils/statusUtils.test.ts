import { describe, expect, it } from 'vitest';
import {
  formatStatusLabel,
  getPriorityColor,
  getStatusColor,
} from './statusUtils';

describe('statusUtils', () => {
  it('formats status labels for display', () => {
    expect(formatStatusLabel('IN_PROGRESS')).toBe('IN PROGRESS');
    expect(formatStatusLabel('OPEN')).toBe('OPEN');
  });

  it('maps statuses to chip colors', () => {
    expect(getStatusColor('OPEN')).toBe('info');
    expect(getStatusColor('IN_PROGRESS')).toBe('warning');
    expect(getStatusColor('RESOLVED')).toBe('success');
    expect(getStatusColor('CLOSED')).toBe('default');
    expect(getStatusColor('CANCELLED')).toBe('error');
  });

  it('maps priorities to chip colors', () => {
    expect(getPriorityColor('LOW')).toBe('default');
    expect(getPriorityColor('MEDIUM')).toBe('info');
    expect(getPriorityColor('HIGH')).toBe('warning');
    expect(getPriorityColor('CRITICAL')).toBe('error');
  });
});
