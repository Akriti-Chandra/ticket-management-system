package com.ticketsystem.service;

import com.ticketsystem.dto.request.CreateCommentRequest;
import com.ticketsystem.entity.Comment;
import com.ticketsystem.entity.Ticket;
import com.ticketsystem.entity.User;
import com.ticketsystem.exception.ResourceNotFoundException;
import com.ticketsystem.repository.CommentRepository;
import com.ticketsystem.repository.TicketRepository;
import com.ticketsystem.repository.UserRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class CommentService {

    private final CommentRepository commentRepository;
    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<Comment> findByTicketId(Long ticketId) {
        ensureTicketExists(ticketId);
        return commentRepository.findByTicketIdOrderByCreatedAtDesc(ticketId);
    }

    @Transactional
    public Comment create(Long ticketId, CreateCommentRequest request) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found with id: " + ticketId));

        User createdBy = userRepository.findById(request.createdById())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "User not found with id: " + request.createdById()));

        Comment comment = Comment.builder()
                .ticket(ticket)
                .message(request.message())
                .createdBy(createdBy)
                .build();

        log.info("Adding comment to ticket {}", ticketId);
        return commentRepository.save(comment);
    }

    private void ensureTicketExists(Long ticketId) {
        if (!ticketRepository.existsById(ticketId)) {
            throw new ResourceNotFoundException("Ticket not found with id: " + ticketId);
        }
    }
}
