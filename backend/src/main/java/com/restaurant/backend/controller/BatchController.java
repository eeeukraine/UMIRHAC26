package com.restaurant.backend.controller;

import com.restaurant.backend.entity.Batch;
import com.restaurant.backend.repository.BatchRepository;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/batches")
@CrossOrigin(origins = "http://localhost:3000")
public class BatchController {

    private final BatchRepository batchRepository;

    public BatchController(BatchRepository batchRepository) {
        this.batchRepository = batchRepository;
    }

    @GetMapping
    public List<Batch> getAllBatches() {
        return batchRepository.findAllAvailable();
    }

    @GetMapping("/product/{productId}")
    public List<Batch> getBatchesByProduct(@PathVariable Long productId) {
        return batchRepository.findAvailableByProductId(productId);
    }

    @GetMapping("/expiring")
    public List<Batch> getExpiringBatches(@RequestParam(defaultValue = "7") int days) {
        LocalDate date = LocalDate.now().plusDays(days);
        return batchRepository.findExpiringBefore(date);
    }
}