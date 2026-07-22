package com.ticketsystem.controller;

import com.ticketsystem.dto.request.CreateCommentRequest;
import com.ticketsystem.dto.response.CommentResponse;
import com.ticketsystem.entity.Comment;
import com.ticketsystem.mapper.CommentMapper;
import com.ticketsystem.service.CommentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/tickets/{ticketId}/comments")
@RequiredArgsConstructor
@Tag(name = "Comments", description = "Ticket comment endpoints")
public class CommentController {

    private final CommentService commentService;

    @GetMapping
    @Operation(summary = "List comments for a ticket (newest first)")
    public List<CommentResponse> list(@PathVariable Long ticketId) {
        return commentService.findByTicketId(ticketId).stream()
                .map(CommentMapper::toResponse)
                .toList();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Add a comment to a ticket")
    public CommentResponse create(
            @PathVariable Long ticketId, @Valid @RequestBody CreateCommentRequest request) {
        Comment comment = commentService.create(ticketId, request);
        return CommentMapper.toResponse(comment);
    }
}
