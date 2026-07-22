package com.ticketsystem.repository;

import com.ticketsystem.entity.Comment;
import java.util.List;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CommentRepository extends JpaRepository<Comment, Long> {

    @EntityGraph(attributePaths = "createdBy")
    List<Comment> findByTicketIdOrderByCreatedAtDesc(Long ticketId);
}
