package com.ticketsystem.controller;

import com.ticketsystem.dto.request.CreateTicketRequest;
import com.ticketsystem.dto.request.UpdateTicketRequest;
import com.ticketsystem.dto.request.UpdateTicketStatusRequest;
import com.ticketsystem.dto.response.PageResponse;
import com.ticketsystem.dto.response.TicketResponse;
import com.ticketsystem.dto.response.TicketSummaryResponse;
import com.ticketsystem.entity.Ticket;
import com.ticketsystem.entity.TicketStatus;
import com.ticketsystem.mapper.TicketMapper;
import com.ticketsystem.service.TicketService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
@Tag(name = "Tickets", description = "Ticket management endpoints")
public class TicketController {

    private final TicketService ticketService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create a new ticket")
    public TicketResponse create(@Valid @RequestBody CreateTicketRequest request) {
        Ticket ticket = ticketService.create(request);
        return TicketMapper.toResponse(ticket, ticketService.getAllowedNextStatuses(ticket.getStatus()));
    }

    @GetMapping
    @Operation(summary = "List and search tickets")
    public PageResponse<TicketSummaryResponse> list(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) TicketStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<Ticket> result = ticketService.search(
                keyword, status, PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "updatedAt")));
        return TicketMapper.toPageResponse(result);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get ticket details")
    public TicketResponse getById(@PathVariable Long id) {
        Ticket ticket = ticketService.findById(id);
        return TicketMapper.toResponse(ticket, ticketService.getAllowedNextStatuses(ticket.getStatus()));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update ticket fields (excluding status)")
    public TicketResponse update(@PathVariable Long id, @Valid @RequestBody UpdateTicketRequest request) {
        Ticket ticket = ticketService.update(id, request);
        return TicketMapper.toResponse(ticket, ticketService.getAllowedNextStatuses(ticket.getStatus()));
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Change ticket status")
    public TicketResponse updateStatus(
            @PathVariable Long id, @Valid @RequestBody UpdateTicketStatusRequest request) {
        Ticket ticket = ticketService.updateStatus(id, request.status());
        return TicketMapper.toResponse(ticket, ticketService.getAllowedNextStatuses(ticket.getStatus()));
    }
}
