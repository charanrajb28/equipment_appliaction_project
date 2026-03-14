package com.equipment.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class SpaController {

    /**
     * Forwards all non-API and non-file requests to index.html 
     * so that Next.js client-side routing works.
     */
    @RequestMapping(value = { "/", "/{path:[^\\.]*}", "/**/{path:[^\\.]*}" })
    public String forward(jakarta.servlet.http.HttpServletRequest request) {
        String path = request.getRequestURI();
        if (path.startsWith("/api") || path.contains(".")) {
            return "forward:" + path;
        }
        return "forward:/index.html";
    }
}
