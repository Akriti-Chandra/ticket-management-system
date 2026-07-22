package com.ticketsystem.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Validation error for a specific field")
public record FieldError(String field, String message) {}
