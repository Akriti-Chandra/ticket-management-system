package com.ticketsystem.mapper;

import com.ticketsystem.dto.response.CommentResponse;
import com.ticketsystem.entity.Comment;

public final class CommentMapper {

    private CommentMapper() {}

    public static CommentResponse toResponse(Comment comment) {
        return new CommentResponse(
                comment.getId(),
                comment.getMessage(),
                UserMapper.toSummary(comment.getCreatedBy()),
                comment.getCreatedAt());
    }
}
