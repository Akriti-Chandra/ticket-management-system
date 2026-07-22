package com.ticketsystem.validation;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.ticketsystem.entity.TicketStatus;
import com.ticketsystem.exception.InvalidStatusTransitionException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class TicketStatusTransitionValidatorTest {

    private TicketStatusTransitionValidator validator;

    @BeforeEach
    void setUp() {
        validator = new TicketStatusTransitionValidator();
    }

    @Test
    void allowsValidTransitions() {
        assertThatCode(() -> validator.validate(TicketStatus.OPEN, TicketStatus.IN_PROGRESS))
                .doesNotThrowAnyException();
        assertThatCode(() -> validator.validate(TicketStatus.IN_PROGRESS, TicketStatus.RESOLVED))
                .doesNotThrowAnyException();
        assertThatCode(() -> validator.validate(TicketStatus.RESOLVED, TicketStatus.CLOSED))
                .doesNotThrowAnyException();
        assertThatCode(() -> validator.validate(TicketStatus.OPEN, TicketStatus.CANCELLED))
                .doesNotThrowAnyException();
        assertThatCode(() -> validator.validate(TicketStatus.IN_PROGRESS, TicketStatus.CANCELLED))
                .doesNotThrowAnyException();
    }

    @Test
    void rejectsInvalidTransitions() {
        assertThatThrownBy(() -> validator.validate(TicketStatus.OPEN, TicketStatus.CLOSED))
                .isInstanceOf(InvalidStatusTransitionException.class)
                .hasMessage("Cannot transition from OPEN to CLOSED");

        assertThatThrownBy(() -> validator.validate(TicketStatus.OPEN, TicketStatus.RESOLVED))
                .isInstanceOf(InvalidStatusTransitionException.class)
                .hasMessage("Cannot transition from OPEN to RESOLVED");

        assertThatThrownBy(() -> validator.validate(TicketStatus.RESOLVED, TicketStatus.OPEN))
                .isInstanceOf(InvalidStatusTransitionException.class)
                .hasMessage("Cannot transition from RESOLVED to OPEN");

        assertThatThrownBy(() -> validator.validate(TicketStatus.CANCELLED, TicketStatus.OPEN))
                .isInstanceOf(InvalidStatusTransitionException.class)
                .hasMessage("Cannot transition from CANCELLED to OPEN");

        assertThatThrownBy(() -> validator.validate(TicketStatus.CLOSED, TicketStatus.IN_PROGRESS))
                .isInstanceOf(InvalidStatusTransitionException.class)
                .hasMessage("Cannot transition from CLOSED to IN_PROGRESS");
    }

    @Test
    void returnsAllowedNextStatuses() {
        assertThat(validator.getAllowedNextStatuses(TicketStatus.OPEN))
                .containsExactlyInAnyOrder(TicketStatus.IN_PROGRESS, TicketStatus.CANCELLED);
        assertThat(validator.getAllowedNextStatuses(TicketStatus.IN_PROGRESS))
                .containsExactlyInAnyOrder(TicketStatus.RESOLVED, TicketStatus.CANCELLED);
        assertThat(validator.getAllowedNextStatuses(TicketStatus.RESOLVED))
                .containsExactly(TicketStatus.CLOSED);
        assertThat(validator.getAllowedNextStatuses(TicketStatus.CLOSED)).isEmpty();
        assertThat(validator.getAllowedNextStatuses(TicketStatus.CANCELLED)).isEmpty();
    }
}
