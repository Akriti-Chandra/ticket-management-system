package com.ticketsystem.repository;

import com.ticketsystem.entity.Ticket;
import com.ticketsystem.entity.TicketStatus;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface TicketRepository extends JpaRepository<Ticket, Long> {

    @Query("SELECT t FROM Ticket t JOIN FETCH t.assignedTo JOIN FETCH t.createdBy WHERE t.id = :id")
    Optional<Ticket> findByIdWithUsers(@Param("id") Long id);

    @EntityGraph(attributePaths = "assignedTo")
    @Query("SELECT t FROM Ticket t WHERE "
            + "(:status IS NULL OR t.status = :status) AND "
            + "(:keyword IS NULL OR :keyword = '' OR "
            + " LOWER(t.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR "
            + " LOWER(t.description) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<Ticket> search(
            @Param("keyword") String keyword,
            @Param("status") TicketStatus status,
            Pageable pageable);
}
