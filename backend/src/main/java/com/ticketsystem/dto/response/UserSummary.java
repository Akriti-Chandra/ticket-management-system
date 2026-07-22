package com.ticketsystem.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Minimal user info for nested references")
public record UserSummary(Long id, String name) {}
