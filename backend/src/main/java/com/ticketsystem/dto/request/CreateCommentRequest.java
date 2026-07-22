package com.ticketsystem.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Schema(description = "Request body for adding a comment to a ticket")
public record CreateCommentRequest(
        @NotBlank String message,
        @NotNull Long createdById
) {}
