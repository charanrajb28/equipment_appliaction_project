package com.equipment.controller;

import org.springframework.boot.autoconfigure.web.servlet.error.ErrorViewResolver;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.web.servlet.ModelAndView;

@Configuration
public class SpaController {

    @Bean
    public ErrorViewResolver spaErrorViewResolver() {
        return (request, status, model) -> {
            // Forward 404s (Route not found) to the Next.js index.html
            if (status == HttpStatus.NOT_FOUND) {
                String path = (String) model.get("path");
                if (path != null && !path.startsWith("/api") && !path.contains(".")) {
                    return new ModelAndView("forward:/index.html");
                }
            }
            return null;
        };
    }
}
