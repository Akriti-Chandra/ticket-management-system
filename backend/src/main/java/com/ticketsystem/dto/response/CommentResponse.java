package com.ticketsystem.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import java.time.Instant;

@Schema(description = "Comment on a ticket")
public record CommentResponse(
        Long id,
        String message,
        UserSummary createdBy,
        Instant createdAt
) {}
