package com.equipment.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class SpaController {

    /**
     * Forwards all non-API and non-file requests to index.html 
     * so that Next.js client-side routing works.
     */
    @RequestMapping(value = { "{path:[^\\\\.]*}", "/**/{path:[^\\\\.]*}" })
    public String forward() {
        return "forward:/index.html";
    }
}
