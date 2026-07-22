package com.ticketsystem.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Generic error response")
public record ErrorResponse(String message) {}
