package com.ticketsystem.dto.response;

import com.ticketsystem.entity.TicketPriority;
import com.ticketsystem.entity.TicketStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import java.time.Instant;

@Schema(description = "Ticket summary for list views")
public record TicketSummaryResponse(
        Long id,
        String title,
        TicketPriority priority,
        TicketStatus status,
        UserSummary assignedTo,
        Instant updatedAt
) {}
