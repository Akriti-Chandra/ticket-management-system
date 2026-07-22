package com.ticketsystem.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.ticketsystem.entity.Ticket;
import com.ticketsystem.entity.TicketStatus;
import com.ticketsystem.exception.InvalidStatusTransitionException;
import com.ticketsystem.exception.ResourceNotFoundException;
import com.ticketsystem.repository.TicketRepository;
import com.ticketsystem.repository.UserRepository;
import com.ticketsystem.validation.TicketStatusTransitionValidator;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class TicketServiceTest {

    @Mock
    private TicketRepository ticketRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private TicketStatusTransitionValidator statusTransitionValidator;

    @InjectMocks
    private TicketService ticketService;

    @Test
    void updateStatus_validatesTransitionAndPersists() {
        Ticket ticket = Ticket.builder()
                .id(1L)
                .status(TicketStatus.OPEN)
                .build();

        when(ticketRepository.findById(1L)).thenReturn(Optional.of(ticket));
        when(ticketRepository.save(ticket)).thenReturn(ticket);
        when(ticketRepository.findByIdWithUsers(1L)).thenReturn(Optional.of(ticket));

        Ticket result = ticketService.updateStatus(1L, TicketStatus.IN_PROGRESS);

        assertThat(result.getStatus()).isEqualTo(TicketStatus.IN_PROGRESS);
        verify(statusTransitionValidator).validate(TicketStatus.OPEN, TicketStatus.IN_PROGRESS);
        verify(ticketRepository).save(ticket);
    }

    @Test
    void updateStatus_throwsWhenTicketNotFound() {
        when(ticketRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> ticketService.updateStatus(99L, TicketStatus.IN_PROGRESS))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage("Ticket not found with id: 99");

        verify(statusTransitionValidator, never()).validate(any(), any());
        verify(ticketRepository, never()).save(any());
    }

    @Test
    void updateStatus_propagatesInvalidTransition() {
        Ticket ticket = Ticket.builder()
                .id(1L)
                .status(TicketStatus.OPEN)
                .build();

        when(ticketRepository.findById(1L)).thenReturn(Optional.of(ticket));
        doThrow(new InvalidStatusTransitionException("Cannot transition from OPEN to CLOSED"))
                .when(statusTransitionValidator).validate(TicketStatus.OPEN, TicketStatus.CLOSED);

        assertThatThrownBy(() -> ticketService.updateStatus(1L, TicketStatus.CLOSED))
                .isInstanceOf(InvalidStatusTransitionException.class)
                .hasMessage("Cannot transition from OPEN to CLOSED");

        assertThat(ticket.getStatus()).isEqualTo(TicketStatus.OPEN);
        verify(ticketRepository, never()).save(any());
    }
}
