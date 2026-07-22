package com.ticketsystem.mapper;

import com.ticketsystem.dto.response.UserResponse;
import com.ticketsystem.dto.response.UserSummary;
import com.ticketsystem.entity.User;

public final class UserMapper {

    private UserMapper() {}

    public static UserSummary toSummary(User user) {
        return new UserSummary(user.getId(), user.getName());
    }

    public static UserResponse toResponse(User user) {
        return new UserResponse(user.getId(), user.getName(), user.getEmail(), user.getRole());
    }
}
