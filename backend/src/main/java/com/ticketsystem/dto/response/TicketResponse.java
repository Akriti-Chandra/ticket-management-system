package com.ticketsystem.dto.response;

import com.ticketsystem.entity.TicketPriority;
import com.ticketsystem.entity.TicketStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import java.time.Instant;
import java.util.Set;

@Schema(description = "Full ticket details including allowed next statuses")
public record TicketResponse(
        Long id,
        String title,
        String description,
        TicketPriority priority,
        TicketStatus status,
        UserSummary assignedTo,
        UserSummary createdBy,
        Instant createdAt,
        Instant updatedAt,
        Set<TicketStatus> allowedNextStatuses
) {}
