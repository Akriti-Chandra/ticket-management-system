package com.ticketsystem.dto.request;

import com.ticketsystem.entity.TicketStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;

@Schema(description = "Request body for changing ticket status")
public record UpdateTicketStatusRequest(@NotNull TicketStatus status) {}
