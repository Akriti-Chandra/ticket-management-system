package com.ticketsystem.mapper;

import com.ticketsystem.dto.response.PageResponse;
import com.ticketsystem.dto.response.TicketResponse;
import com.ticketsystem.dto.response.TicketSummaryResponse;
import com.ticketsystem.entity.Ticket;
import com.ticketsystem.entity.TicketStatus;
import java.util.Set;
import org.springframework.data.domain.Page;

public final class TicketMapper {

    private TicketMapper() {}

    public static TicketResponse toResponse(Ticket ticket, Set<TicketStatus> allowedNextStatuses) {
        return new TicketResponse(
                ticket.getId(),
                ticket.getTitle(),
                ticket.getDescription(),
                ticket.getPriority(),
                ticket.getStatus(),
                UserMapper.toSummary(ticket.getAssignedTo()),
                UserMapper.toSummary(ticket.getCreatedBy()),
                ticket.getCreatedAt(),
                ticket.getUpdatedAt(),
                allowedNextStatuses);
    }

    public static TicketSummaryResponse toSummaryResponse(Ticket ticket) {
        return new TicketSummaryResponse(
                ticket.getId(),
                ticket.getTitle(),
                ticket.getPriority(),
                ticket.getStatus(),
                UserMapper.toSummary(ticket.getAssignedTo()),
                ticket.getUpdatedAt());
    }

    public static PageResponse<TicketSummaryResponse> toPageResponse(Page<Ticket> page) {
        return new PageResponse<>(
                page.getContent().stream().map(TicketMapper::toSummaryResponse).toList(),
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages());
    }
}
