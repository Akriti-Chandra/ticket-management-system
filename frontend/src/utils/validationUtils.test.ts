import { describe, expect, it } from 'vitest';
import {
  hasValidationErrors,
  omitFieldError,
  TITLE_MAX_LENGTH,
  validateCreateComment,
  validateCreateTicket,
  validateUpdateTicket,
} from './validationUtils';

describe('validationUtils', () => {
  describe('validateCreateTicket', () => {
    it('returns no errors for valid input', () => {
      const errors = validateCreateTicket({
        title: 'Install printer',
        description: 'Need help with setup',
        assignedToId: 1,
        createdById: 2,
      });

      expect(errors).toEqual({});
      expect(hasValidationErrors(errors)).toBe(false);
    });

    it('requires title, description, assignee, and creator', () => {
      const errors = validateCreateTicket({
        title: '   ',
        description: '',
        assignedToId: '',
        createdById: '',
      });

      expect(errors).toEqual({
        title: 'Title is required',
        description: 'Description is required',
        assignedToId: 'Assignee is required',
        createdById: 'Created By is required',
      });
    });

    it('rejects titles longer than 200 characters', () => {
      const errors = validateCreateTicket({
        title: 'a'.repeat(TITLE_MAX_LENGTH + 1),
        description: 'Valid description',
        assignedToId: 1,
        createdById: 2,
      });

      expect(errors.title).toBe(
        `Title must be at most ${TITLE_MAX_LENGTH} characters`,
      );
    });
  });

  describe('validateUpdateTicket', () => {
    it('returns no errors for valid input', () => {
      const errors = validateUpdateTicket({
        title: 'Updated title',
        description: 'Updated description',
        assignedToId: 2,
      });

      expect(errors).toEqual({});
    });

    it('requires assignee', () => {
      const errors = validateUpdateTicket({
        title: 'Updated title',
        description: 'Updated description',
        assignedToId: '',
      });

      expect(errors.assignedToId).toBe('Assignee is required');
    });
  });

  describe('validateCreateComment', () => {
    it('returns no errors for valid input', () => {
      const errors = validateCreateComment({
        message: 'Looks good',
        createdById: 1,
      });

      expect(errors).toEqual({});
    });

    it('requires message and author', () => {
      const errors = validateCreateComment({
        message: '   ',
        createdById: '',
      });

      expect(errors).toEqual({
        message: 'Message is required',
        createdById: 'Author is required',
      });
    });
  });

  describe('omitFieldError', () => {
    it('removes a single field error', () => {
      expect(
        omitFieldError(
          { title: 'Title is required', description: 'Description is required' },
          'title',
        ),
      ).toEqual({ description: 'Description is required' });
    });

    it('returns the same object when field is not present', () => {
      const errors = { title: 'Title is required' };
      expect(omitFieldError(errors, 'description')).toBe(errors);
    });
  });
});
