package com.ticketsystem.integration;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ticketsystem.dto.request.CreateCommentRequest;
import com.ticketsystem.dto.request.CreateTicketRequest;
import com.ticketsystem.dto.request.UpdateTicketStatusRequest;
import com.ticketsystem.dto.response.CommentResponse;
import com.ticketsystem.dto.response.ErrorResponse;
import com.ticketsystem.dto.response.TicketResponse;
import com.ticketsystem.dto.response.UserResponse;
import com.ticketsystem.dto.response.ValidationErrorResponse;
import com.ticketsystem.entity.Ticket;
import com.ticketsystem.entity.TicketPriority;
import com.ticketsystem.entity.TicketStatus;
import com.ticketsystem.entity.User;
import com.ticketsystem.repository.TicketRepository;
import com.ticketsystem.repository.UserRepository;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@ActiveProfiles("test")
class TicketStatusTransitionIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private TicketRepository ticketRepository;

    @Autowired
    private UserRepository userRepository;

    private User supportAgent;
    private User employee;

    @BeforeEach
    void setUpUsers() {
        supportAgent = userRepository.findByEmail("carol.davis@example.com").orElseThrow();
        employee = userRepository.findByEmail("alice.johnson@example.com").orElseThrow();
    }

    @Test
    void openToInProgress_succeeds() throws Exception {
        Ticket ticket = createTicketWithStatus(TicketStatus.OPEN);

        TicketResponse response = patchStatus(ticket.getId(), TicketStatus.IN_PROGRESS);

        assertThat(response.status()).isEqualTo(TicketStatus.IN_PROGRESS);
        assertThat(statusInDatabase(ticket.getId())).isEqualTo(TicketStatus.IN_PROGRESS);
    }

    @Test
    void inProgressToResolved_succeeds() throws Exception {
        Ticket ticket = createTicketWithStatus(TicketStatus.IN_PROGRESS);

        TicketResponse response = patchStatus(ticket.getId(), TicketStatus.RESOLVED);

        assertThat(response.status()).isEqualTo(TicketStatus.RESOLVED);
        assertThat(statusInDatabase(ticket.getId())).isEqualTo(TicketStatus.RESOLVED);
    }

    @Test
    void resolvedToClosed_succeeds() throws Exception {
        Ticket ticket = createTicketWithStatus(TicketStatus.RESOLVED);

        TicketResponse response = patchStatus(ticket.getId(), TicketStatus.CLOSED);

        assertThat(response.status()).isEqualTo(TicketStatus.CLOSED);
        assertThat(statusInDatabase(ticket.getId())).isEqualTo(TicketStatus.CLOSED);
    }

    @Test
    void openToCancelled_succeeds() throws Exception {
        Ticket ticket = createTicketWithStatus(TicketStatus.OPEN);

        TicketResponse response = patchStatus(ticket.getId(), TicketStatus.CANCELLED);

        assertThat(response.status()).isEqualTo(TicketStatus.CANCELLED);
        assertThat(statusInDatabase(ticket.getId())).isEqualTo(TicketStatus.CANCELLED);
    }

    @Test
    void inProgressToCancelled_succeeds() throws Exception {
        Ticket ticket = createTicketWithStatus(TicketStatus.IN_PROGRESS);

        TicketResponse response = patchStatus(ticket.getId(), TicketStatus.CANCELLED);

        assertThat(response.status()).isEqualTo(TicketStatus.CANCELLED);
        assertThat(statusInDatabase(ticket.getId())).isEqualTo(TicketStatus.CANCELLED);
    }

    @Test
    void openToClosed_rejectedWithMessageAndDbUnchanged() throws Exception {
        Ticket ticket = createTicketWithStatus(TicketStatus.OPEN);

        ErrorResponse response = patchStatusExpectingError(ticket.getId(), TicketStatus.CLOSED);

        assertThat(response.message()).contains("Cannot transition");
        assertThat(response.message()).contains("OPEN");
        assertThat(response.message()).contains("CLOSED");
        assertThat(statusInDatabase(ticket.getId())).isEqualTo(TicketStatus.OPEN);
    }

    @Test
    void openToResolved_rejectedWithMessageAndDbUnchanged() throws Exception {
        Ticket ticket = createTicketWithStatus(TicketStatus.OPEN);

        ErrorResponse response = patchStatusExpectingError(ticket.getId(), TicketStatus.RESOLVED);

        assertThat(response.message()).contains("Cannot transition");
        assertThat(response.message()).contains("OPEN");
        assertThat(response.message()).contains("RESOLVED");
        assertThat(statusInDatabase(ticket.getId())).isEqualTo(TicketStatus.OPEN);
    }

    @Test
    void resolvedToOpen_rejectedWithMessageAndDbUnchanged() throws Exception {
        Ticket ticket = createTicketWithStatus(TicketStatus.RESOLVED);

        ErrorResponse response = patchStatusExpectingError(ticket.getId(), TicketStatus.OPEN);

        assertThat(response.message()).contains("Cannot transition");
        assertThat(response.message()).contains("RESOLVED");
        assertThat(response.message()).contains("OPEN");
        assertThat(statusInDatabase(ticket.getId())).isEqualTo(TicketStatus.RESOLVED);
    }

    @Test
    void cancelledToOpen_rejectedWithMessageAndDbUnchanged() throws Exception {
        Ticket ticket = createTicketWithStatus(TicketStatus.CANCELLED);

        ErrorResponse response = patchStatusExpectingError(ticket.getId(), TicketStatus.OPEN);

        assertThat(response.message()).contains("Cannot transition");
        assertThat(response.message()).contains("CANCELLED");
        assertThat(response.message()).contains("OPEN");
        assertThat(statusInDatabase(ticket.getId())).isEqualTo(TicketStatus.CANCELLED);
    }

    @Test
    void closedToInProgress_rejectedWithMessageAndDbUnchanged() throws Exception {
        Ticket ticket = createTicketWithStatus(TicketStatus.CLOSED);

        ErrorResponse response = patchStatusExpectingError(ticket.getId(), TicketStatus.IN_PROGRESS);

        assertThat(response.message()).contains("Cannot transition");
        assertThat(response.message()).contains("CLOSED");
        assertThat(response.message()).contains("IN_PROGRESS");
        assertThat(statusInDatabase(ticket.getId())).isEqualTo(TicketStatus.CLOSED);
    }

    @Test
    void createTicket_blankTitle_returnsValidationErrors() throws Exception {
        CreateTicketRequest request = new CreateTicketRequest(
                "   ",
                "Description",
                TicketPriority.LOW,
                supportAgent.getId(),
                employee.getId());

        MvcResult result = mockMvc.perform(post("/api/tickets")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andReturn();

        ValidationErrorResponse response =
                objectMapper.readValue(result.getResponse().getContentAsString(), ValidationErrorResponse.class);

        assertThat(response.message()).isEqualTo("Validation Failed");
        assertThat(response.errors()).anyMatch(e -> "title".equals(e.field()));
    }

    @Test
    void createComment_succeeds() throws Exception {
        Ticket ticket = createTicketWithStatus(TicketStatus.OPEN);
        CreateCommentRequest request = new CreateCommentRequest("Integration test comment", employee.getId());

        MvcResult result = mockMvc.perform(post("/api/tickets/{id}/comments", ticket.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andReturn();

        CommentResponse response =
                objectMapper.readValue(result.getResponse().getContentAsString(), CommentResponse.class);

        assertThat(response.message()).isEqualTo("Integration test comment");
    }

    @Test
    void listUsers_returnsSeededUsers() throws Exception {
        MvcResult result = mockMvc.perform(get("/api/users"))
                .andExpect(status().isOk())
                .andReturn();

        List<UserResponse> users = objectMapper.readValue(
                result.getResponse().getContentAsString(), new TypeReference<>() {});

        assertThat(users).hasSizeGreaterThanOrEqualTo(5);
    }

    private Ticket createTicketWithStatus(TicketStatus status) {
        Ticket ticket = Ticket.builder()
                .title("Integration ticket " + UUID.randomUUID())
                .description("Ticket for status transition integration test")
                .priority(TicketPriority.MEDIUM)
                .status(status)
                .assignedTo(supportAgent)
                .createdBy(employee)
                .build();
        return ticketRepository.save(ticket);
    }

    private TicketResponse patchStatus(Long ticketId, TicketStatus newStatus) throws Exception {
        MvcResult result = mockMvc.perform(patch("/api/tickets/{id}/status", ticketId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new UpdateTicketStatusRequest(newStatus))))
                .andExpect(status().isOk())
                .andReturn();

        return objectMapper.readValue(result.getResponse().getContentAsString(), TicketResponse.class);
    }

    private ErrorResponse patchStatusExpectingError(Long ticketId, TicketStatus newStatus) throws Exception {
        MvcResult result = mockMvc.perform(patch("/api/tickets/{id}/status", ticketId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new UpdateTicketStatusRequest(newStatus))))
                .andExpect(status().isBadRequest())
                .andReturn();

        return objectMapper.readValue(result.getResponse().getContentAsString(), ErrorResponse.class);
    }

    private TicketStatus statusInDatabase(Long ticketId) {
        return ticketRepository.findById(ticketId).orElseThrow().getStatus();
    }
}
