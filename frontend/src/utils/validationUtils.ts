export type FieldErrors = Record<string, string>;

const TITLE_MAX_LENGTH = 200;

export function hasValidationErrors(errors: FieldErrors): boolean {
  return Object.keys(errors).length > 0;
}

export function omitFieldError(
  errors: FieldErrors,
  field: string,
): FieldErrors {
  if (!errors[field]) {
    return errors;
  }

  const { [field]: _removed, ...rest } = errors;
  return rest;
}

function validateTitle(title: string): string | undefined {
  const trimmed = title.trim();
  if (!trimmed) {
    return 'Title is required';
  }
  if (trimmed.length > TITLE_MAX_LENGTH) {
    return `Title must be at most ${TITLE_MAX_LENGTH} characters`;
  }
  return undefined;
}

function validateDescription(description: string): string | undefined {
  if (!description.trim()) {
    return 'Description is required';
  }
  return undefined;
}

function validateAssignee(assignedToId: number | ''): string | undefined {
  if (!assignedToId) {
    return 'Assignee is required';
  }
  return undefined;
}

function validateCreatedBy(createdById: number | ''): string | undefined {
  if (!createdById) {
    return 'Created By is required';
  }
  return undefined;
}

export function validateCreateTicket(values: {
  title: string;
  description: string;
  assignedToId: number | '';
  createdById: number | '';
}): FieldErrors {
  const errors: FieldErrors = {};

  const titleError = validateTitle(values.title);
  if (titleError) errors.title = titleError;

  const descriptionError = validateDescription(values.description);
  if (descriptionError) errors.description = descriptionError;

  const assigneeError = validateAssignee(values.assignedToId);
  if (assigneeError) errors.assignedToId = assigneeError;

  const createdByError = validateCreatedBy(values.createdById);
  if (createdByError) errors.createdById = createdByError;

  return errors;
}

export function validateUpdateTicket(values: {
  title: string;
  description: string;
  assignedToId: number | '';
}): FieldErrors {
  const errors: FieldErrors = {};

  const titleError = validateTitle(values.title);
  if (titleError) errors.title = titleError;

  const descriptionError = validateDescription(values.description);
  if (descriptionError) errors.description = descriptionError;

  const assigneeError = validateAssignee(values.assignedToId);
  if (assigneeError) errors.assignedToId = assigneeError;

  return errors;
}

export function validateCreateComment(values: {
  message: string;
  createdById: number | '';
}): FieldErrors {
  const errors: FieldErrors = {};

  if (!values.message.trim()) {
    errors.message = 'Message is required';
  }

  if (!values.createdById) {
    errors.createdById = 'Author is required';
  }

  return errors;
}

export { TITLE_MAX_LENGTH };
