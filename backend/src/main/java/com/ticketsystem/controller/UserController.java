package com.ticketsystem.controller;

import com.ticketsystem.dto.response.UserResponse;
import com.ticketsystem.mapper.UserMapper;
import com.ticketsystem.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Tag(name = "Users", description = "Read-only user listing for dropdowns")
public class UserController {

    private final UserService userService;

    @GetMapping
    @Operation(summary = "List all users")
    public List<UserResponse> list() {
        return userService.findAll().stream().map(UserMapper::toResponse).toList();
    }
}
