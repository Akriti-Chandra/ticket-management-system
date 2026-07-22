package com.ticketsystem.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI ticketManagementOpenApi() {
        return new OpenAPI()
                .info(new Info()
                        .title("Ticket Management API")
                        .description("REST API for support ticket management")
                        .version("1.0.0"));
    }
}
