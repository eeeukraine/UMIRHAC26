package com.restaurant.backend.controller;

import com.restaurant.backend.entity.Batch;
import com.restaurant.backend.repository.BatchRepository;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/analytics")

public class AnalyticsController {

    private final BatchRepository batchRepository;

    public AnalyticsController(BatchRepository batchRepository) {
        this.batchRepository = batchRepository;
    }

    // 1. Реальные списания (просроченные партии)
    @GetMapping("/write-offs")
    public List<Map<String, Object>> getWriteOffs() {
        List<Batch> allBatches = batchRepository.findAll();
        LocalDate today = LocalDate.now();
        
        return allBatches.stream()
            .filter(b -> b.getExpirationDate() != null && !b.getExpirationDate().isAfter(today))
            .map(b -> {
                Map<String, Object> writeOff = new HashMap<>();
                writeOff.put("productName", b.getProductName());
                writeOff.put("quantity", b.getQuantity());
                writeOff.put("unit", "кг");
                writeOff.put("date", b.getExpirationDate().toString());
                writeOff.put("supplier", "Не указан");
                return writeOff;
            })
            .collect(Collectors.toList());
    }

    // 2. Реальные поставки (группируем по дате создания)
    @GetMapping("/deliveries")
    public List<Map<String, Object>> getDeliveries() {
        List<Batch> allBatches = batchRepository.findAll();
        
        // Группируем по дате создания (getCreatedAt уже LocalDate)
        Map<LocalDate, List<Batch>> grouped = allBatches.stream()
            .filter(b -> b.getCreatedAt() != null)
            .collect(Collectors.groupingBy(Batch::getCreatedAt));

        List<Map<String, Object>> deliveries = new ArrayList<>();
        int idCounter = 1;

        for (Map.Entry<LocalDate, List<Batch>> dateEntry : grouped.entrySet()) {
            Map<String, Object> delivery = new HashMap<>();
            delivery.put("id", idCounter++);
            delivery.put("supplier", "Не указан");
            delivery.put("date", dateEntry.getKey().toString());
            delivery.put("status", "Принята");
            delivery.put("itemCount", dateEntry.getValue().size());
            deliveries.add(delivery);
        }
        
        deliveries.sort((a, b) -> ((String) b.get("date")).compareTo((String) a.get("date")));
        return deliveries;
    }
}