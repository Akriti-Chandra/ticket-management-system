package com.ticketsystem.dto.request;

import com.ticketsystem.entity.TicketPriority;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

@Schema(description = "Request body for updating ticket fields (status excluded)")
public record UpdateTicketRequest(
        @NotBlank @Size(max = 200) String title,
        @NotBlank String description,
        @NotNull TicketPriority priority,
        @NotNull Long assignedToId
) {}
