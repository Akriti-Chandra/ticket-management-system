package com.ticketsystem.validation;

import com.ticketsystem.entity.TicketStatus;
import com.ticketsystem.exception.InvalidStatusTransitionException;
import java.util.Map;
import java.util.Set;
import org.springframework.stereotype.Component;

@Component
public final class TicketStatusTransitionValidator {

    private static final Map<TicketStatus, Set<TicketStatus>> ALLOWED = Map.of(
            TicketStatus.OPEN, Set.of(TicketStatus.IN_PROGRESS, TicketStatus.CANCELLED),
            TicketStatus.IN_PROGRESS, Set.of(TicketStatus.RESOLVED, TicketStatus.CANCELLED),
            TicketStatus.RESOLVED, Set.of(TicketStatus.CLOSED)
    );

    public void validate(TicketStatus from, TicketStatus to) {
        if (!ALLOWED.getOrDefault(from, Set.of()).contains(to)) {
            throw new InvalidStatusTransitionException(
                    "Cannot transition from %s to %s".formatted(from, to));
        }
    }

    public Set<TicketStatus> getAllowedNextStatuses(TicketStatus current) {
        return ALLOWED.getOrDefault(current, Set.of());
    }
}
