package com.ticketsystem.dto.request;

import com.ticketsystem.entity.TicketPriority;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

@Schema(description = "Request body for creating a new ticket")
public record CreateTicketRequest(
        @NotBlank @Size(max = 200) String title,
        @NotBlank String description,
        @NotNull TicketPriority priority,
        @NotNull Long assignedToId,
        @NotNull Long createdById
) {}
