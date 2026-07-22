package com.ticketsystem.service;

import com.ticketsystem.dto.request.CreateTicketRequest;
import com.ticketsystem.dto.request.UpdateTicketRequest;
import com.ticketsystem.entity.Ticket;
import com.ticketsystem.entity.TicketStatus;
import com.ticketsystem.entity.User;
import com.ticketsystem.exception.ResourceNotFoundException;
import com.ticketsystem.repository.TicketRepository;
import com.ticketsystem.repository.UserRepository;
import com.ticketsystem.validation.TicketStatusTransitionValidator;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class TicketService {

    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;
    private final TicketStatusTransitionValidator statusTransitionValidator;

    @Transactional
    public Ticket create(CreateTicketRequest request) {
        User assignedTo = findUserOrThrow(request.assignedToId());
        User createdBy = findUserOrThrow(request.createdById());

        Ticket ticket = Ticket.builder()
                .title(request.title())
                .description(request.description())
                .priority(request.priority())
                .status(TicketStatus.OPEN)
                .assignedTo(assignedTo)
                .createdBy(createdBy)
                .build();

        log.info("Creating ticket with title: {}", request.title());
        Ticket saved = ticketRepository.save(ticket);
        return findTicketWithUsersOrThrow(saved.getId());
    }

    @Transactional(readOnly = true)
    public Ticket findById(Long ticketId) {
        return findTicketWithUsersOrThrow(ticketId);
    }

    @Transactional(readOnly = true)
    public Page<Ticket> search(String keyword, TicketStatus status, Pageable pageable) {
        return ticketRepository.search(keyword, status, pageable);
    }

    @Transactional
    public Ticket update(Long ticketId, UpdateTicketRequest request) {
        Ticket ticket = findTicketOrThrow(ticketId);
        User assignedTo = findUserOrThrow(request.assignedToId());

        ticket.setTitle(request.title());
        ticket.setDescription(request.description());
        ticket.setPriority(request.priority());
        ticket.setAssignedTo(assignedTo);

        log.info("Updating ticket {}", ticketId);
        ticketRepository.save(ticket);
        return findTicketWithUsersOrThrow(ticketId);
    }

    @Transactional
    public Ticket updateStatus(Long ticketId, TicketStatus newStatus) {
        Ticket ticket = findTicketOrThrow(ticketId);

        TicketStatus currentStatus = ticket.getStatus();
        statusTransitionValidator.validate(currentStatus, newStatus);

        log.info("Updating ticket {} status from {} to {}", ticketId, currentStatus, newStatus);
        ticket.setStatus(newStatus);
        ticketRepository.save(ticket);
        return findTicketWithUsersOrThrow(ticketId);
    }

    public Set<TicketStatus> getAllowedNextStatuses(TicketStatus currentStatus) {
        return statusTransitionValidator.getAllowedNextStatuses(currentStatus);
    }

    private Ticket findTicketOrThrow(Long ticketId) {
        return ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found with id: " + ticketId));
    }

    private Ticket findTicketWithUsersOrThrow(Long ticketId) {
        return ticketRepository.findByIdWithUsers(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found with id: " + ticketId));
    }

    private User findUserOrThrow(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
    }
}
