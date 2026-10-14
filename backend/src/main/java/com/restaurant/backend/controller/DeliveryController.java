package com.restaurant.backend.controller;

import com.restaurant.backend.entity.Batch;
import com.restaurant.backend.entity.Delivery;
import com.restaurant.backend.entity.DeliveryItem;
import com.restaurant.backend.entity.Product;
import com.restaurant.backend.repository.BatchRepository;
import com.restaurant.backend.repository.DeliveryRepository;
import com.restaurant.backend.repository.ProductRepository;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/deliveries")
@CrossOrigin(origins = "http://localhost:3000")
public class DeliveryController {

    private final DeliveryRepository deliveryRepository;
    private final BatchRepository batchRepository;
    private final ProductRepository productRepository;

    public DeliveryController(DeliveryRepository deliveryRepository, 
                             BatchRepository batchRepository,
                             ProductRepository productRepository) {
        this.deliveryRepository = deliveryRepository;
        this.batchRepository = batchRepository;
        this.productRepository = productRepository;
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
    @Transactional
    public Delivery createDelivery(@RequestBody Delivery delivery) {
        
        if (delivery.getDeliveryNumber() == null || delivery.getDeliveryNumber().isEmpty()) {
            delivery.setDeliveryNumber("DEL-" + System.currentTimeMillis());
        }
        
        if (delivery.getItems() != null) {
            delivery.setTotalItems(delivery.getItems().size());
            double total = 0.0;
            
            for (DeliveryItem item : delivery.getItems()) {
                item.setDelivery(delivery);
                
                if (item.getUnitPrice() != null && item.getQuantity() != null) {
                    item.setTotalPrice(item.getQuantity() * item.getUnitPrice());
                    total += item.getTotalPrice();
                }

                Long productId = item.getProductId();
                String productName = item.getProductName();
                
                System.out.println("🔍 Обработка позиции: productId=" + productId + ", productName=" + productName);
                
                // Если productId null, ищем по имени
                if (productId == null && productName != null && !productName.isEmpty()) {
                    final String searchName = productName.trim(); // ✅ FINAL переменная для lambda
                    
                    List<Product> found = productRepository.findAll().stream()
                        .filter(p -> p.getName() != null && 
                               (p.getName().equalsIgnoreCase(searchName) || 
                                p.getName().toLowerCase().contains(searchName.toLowerCase())))
                        .toList();
                    
                    if (!found.isEmpty()) {
                        productId = found.get(0).getId();
                        productName = found.get(0).getName();
                        System.out.println("✅ Найден продукт: " + productName + ", ID=" + productId);
                    } else {
                        System.err.println("❌ Продукт не найден: '" + productName + "'");
                        System.err.println("   Доступные: " + productRepository.findAll().stream().map(Product::getName).toList());
                    }
                }

                if (productId != null) {
                    Batch batch = new Batch();
                    batch.setProductId(productId);
                    batch.setProductName(productName);
                    batch.setQuantity(item.getQuantity());
                    batch.setUnit(item.getUnit() != null ? item.getUnit() : "шт");
                    batch.setExpirationDate(item.getExpirationDate());
                    batch.setBatchNumber(item.getBatchNumber() != null ? item.getBatchNumber() : "BATCH-" + System.currentTimeMillis());
                    batch.setCreatedAt(LocalDate.now());
                    
                    batchRepository.save(batch);
                    System.out.println("✅ Создана партия: " + productName + ", qty=" + item.getQuantity());
                } else {
                    System.err.println("⚠️ Пропущено: нет productId");
                }
            }
            
            delivery.setTotalAmount(total);
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