package com.ticketsystem.dto.response;

import com.ticketsystem.entity.UserRole;
import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "User details")
public record UserResponse(Long id, String name, String email, UserRole role) {}
