package com.ticketsystem.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.List;

@Schema(description = "Validation error response with field-level details")
public record ValidationErrorResponse(String message, List<FieldError> errors) {}
