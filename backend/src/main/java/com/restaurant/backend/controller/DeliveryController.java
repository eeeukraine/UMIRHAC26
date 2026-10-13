package com.restaurant.backend.controller;

import com.restaurant.backend.entity.Delivery;
import com.restaurant.backend.entity.DeliveryItem;
import com.restaurant.backend.repository.DeliveryRepository;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/deliveries")
@CrossOrigin(origins = "http://localhost:3000")
public class DeliveryController {

    private final DeliveryRepository deliveryRepository;

    public DeliveryController(DeliveryRepository deliveryRepository) {
        this.deliveryRepository = deliveryRepository;
    }

    @GetMapping
    public List<Delivery> getAllDeliveries() {
        return deliveryRepository.findAll();
    }

    @GetMapping("/{id}")
    public Delivery getDeliveryById(@PathVariable Long id) {
        return deliveryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Поставка не найдена"));
    }

    @PostMapping
    public Delivery createDelivery(@RequestBody Delivery delivery) {
        // Подсчитываем количество позиций и сумму
        if (delivery.getItems() != null) {
            delivery.setTotalItems(delivery.getItems().size());
            
            double total = 0.0;
            for (DeliveryItem item : delivery.getItems()) {
                item.setDelivery(delivery); // Связываем позицию с поставкой
                if (item.getUnitPrice() != null && item.getQuantity() != null) {
                    item.setTotalPrice(item.getQuantity() * item.getUnitPrice());
                    total += item.getTotalPrice();
                }
            }
            delivery.setTotalAmount(total);
        }
        
        // Генерируем номер поставки если не указан
        if (delivery.getDeliveryNumber() == null || delivery.getDeliveryNumber().isEmpty()) {
            delivery.setDeliveryNumber("DEL-" + System.currentTimeMillis());
        }
        
        return deliveryRepository.save(delivery);
    }

    @PatchMapping("/{id}/status")
    public Delivery updateStatus(@PathVariable Long id, @RequestBody String status) {
        Delivery delivery = deliveryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Поставка не найдена"));
        delivery.setStatus(status);
        return deliveryRepository.save(delivery);
    }

    @DeleteMapping("/{id}")
    public void deleteDelivery(@PathVariable Long id) {
        deliveryRepository.deleteById(id);
    }
}