package com.restaurant.backend.controller;

import com.restaurant.backend.service.OrderGeneratorService;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/generator")

public class GeneratorController {

    private final OrderGeneratorService generatorService;

    public GeneratorController(OrderGeneratorService generatorService) {
        this.generatorService = generatorService;
    }

    @PostMapping("/orders")
    public Map<String, Object> generateOrders(@RequestParam(defaultValue = "5") int count) {
        return generatorService.generateMultipleOrders(count);
    }
}