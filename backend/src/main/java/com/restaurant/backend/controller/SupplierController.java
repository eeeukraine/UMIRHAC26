package com.restaurant.backend.controller;

import com.restaurant.backend.entity.Batch;
import com.restaurant.backend.entity.Delivery;
import com.restaurant.backend.entity.Product;
import com.restaurant.backend.entity.SupplierApiKey;
import com.restaurant.backend.entity.SupplierProposal;
import com.restaurant.backend.repository.BatchRepository;
import com.restaurant.backend.repository.DeliveryRepository;
import com.restaurant.backend.repository.ProductRepository;
import com.restaurant.backend.repository.SupplierProposalRepository;
import com.restaurant.backend.service.SupplierApiKeyService;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/supplier")
public class SupplierController {
    
    private final SupplierApiKeyService apiKeyService;
    private final SupplierProposalRepository proposalRepository;
    private final BatchRepository batchRepository;
    private final DeliveryRepository deliveryRepository;
    private final ProductRepository productRepository;
    
    // ✅ Добавляем все репозитории в конструктор
    public SupplierController(SupplierApiKeyService apiKeyService, 
                             SupplierProposalRepository proposalRepository,
                             BatchRepository batchRepository,
                             DeliveryRepository deliveryRepository,
                             ProductRepository productRepository) {
        this.apiKeyService = apiKeyService;
        this.proposalRepository = proposalRepository;
        this.batchRepository = batchRepository;
        this.deliveryRepository = deliveryRepository;
        this.productRepository = productRepository;
    }
    
    private SupplierApiKey validateSupplierRequest(String apiKey) {
        if (apiKey == null || apiKey.isEmpty()) {
            throw new RuntimeException("API ключ не предоставлен");
        }
        return apiKeyService.validateApiKey(apiKey);
    }
    
    @PostMapping("/propose")
    public Map<String, Object> proposeDelivery(
            @RequestHeader("X-API-Key") String apiKey,
            @RequestBody Map<String, Object> proposal) {
        try {
            SupplierApiKey key = validateSupplierRequest(apiKey);
            SupplierProposal newProposal = new SupplierProposal();
            newProposal.setSupplierName(key.getSupplierName());
            newProposal.setProductName((String) proposal.get("productName"));
            newProposal.setQuantity(Double.parseDouble(proposal.get("quantity").toString()));
            newProposal.setUnit((String) proposal.get("unit"));
            newProposal.setPricePerUnit(Double.parseDouble(proposal.get("pricePerUnit").toString()));
            newProposal.setExpirationDate(LocalDate.parse((String) proposal.get("expirationDate")));
            newProposal.setStatus("pending");
            
            proposalRepository.save(newProposal);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Предложение отправлено на рассмотрение");
            response.put("proposalId", newProposal.getId());
            return response;
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return response;
        }
    }
    
    @GetMapping("/my-proposals")
    public List<SupplierProposal> getMyProposals(@RequestHeader("X-API-Key") String apiKey) {
        SupplierApiKey key = validateSupplierRequest(apiKey);
        return proposalRepository.findBySupplierName(key.getSupplierName());
    }
    
    @GetMapping("/proposals")
    public List<SupplierProposal> getAllProposals() {
        return proposalRepository.findAll();
    }
    
    // ✅ ИСПРАВЛЕННЫЙ МЕТОД ПРИНЯТИЯ (использует реальные поля из Batch и Delivery)
    @PostMapping("/proposals/{id}/accept")
    @Transactional
    public Map<String, Object> acceptProposal(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> comment) {
        try {
            SupplierProposal proposal = proposalRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Предложение не найдено"));
            
            // 1. Ищем продукт по имени, чтобы получить его ID
            Product product = productRepository.findAll().stream()
                .filter(p -> p.getName() != null && p.getName().equalsIgnoreCase(proposal.getProductName()))
                .findFirst()
                .orElse(null);
            Long productId = product != null ? product.getId() : null;

            // 2. Создаём партию на складе (используем ТОЛЬКО существующие поля из Batch.java)
            Batch batch = new Batch();
            batch.setProductId(productId);
            batch.setProductName(proposal.getProductName());
            batch.setQuantity(proposal.getQuantity());
            batch.setUnit(proposal.getUnit());
            batch.setExpirationDate(proposal.getExpirationDate());
            batch.setBatchNumber("SUP-" + System.currentTimeMillis());
            batch.setCreatedAt(LocalDate.now());
            // (Поля supplier в Batch нет, поэтому не устанавливаем его)
            batchRepository.save(batch);
            
            // 3. Создаём запись в истории поставок (используем ТОЛЬКО существующие поля из Delivery.java)
            Delivery delivery = new Delivery();
            delivery.setDeliveryNumber("DEL-SUP-" + System.currentTimeMillis());
            delivery.setSupplierName("🌐 " + proposal.getSupplierName()); // Эмодзи поможет фронтенду распознать источник
            delivery.setDeliveryDate(LocalDate.now());
            delivery.setStatus("Принята");
            delivery.setTotalItems(1);
            delivery.setTotalAmount(proposal.getQuantity() * proposal.getPricePerUnit());
            deliveryRepository.save(delivery);

            // 4. Обновляем статус предложения
            proposal.setStatus("accepted");
            proposal.setReviewedAt(LocalDateTime.now());
            proposal.setReviewComment(comment != null ? comment.get("comment") : "Принято администратором");
            proposalRepository.save(proposal);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Запрос принят! Партия автоматически добавлена на склад.");
            return response;
            
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return response;
        }
    }
    
    @PostMapping("/proposals/{id}/reject")
    public Map<String, Object> rejectProposal(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> comment) {
        try {
            SupplierProposal proposal = proposalRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Предложение не найдено"));
            
            proposal.setStatus("rejected");
            proposal.setReviewedAt(LocalDateTime.now());
            proposal.setReviewComment(comment != null ? comment.get("comment") : "Отклонено");
            proposalRepository.save(proposal);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Предложение отклонено");
            return response;
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return response;
        }
    }
    
    @PostMapping("/api-keys")
    public SupplierApiKey createApiKey(@RequestBody Map<String, String> request) {
        return apiKeyService.createApiKey(request.get("supplierName"));
    }
    
    @GetMapping("/api-keys")
    public List<SupplierApiKey> getAllApiKeys() {
        return apiKeyService.getAllKeys();
    }
    
    @PostMapping("/api-keys/{id}/deactivate")
    public Map<String, Object> deactivateApiKey(@PathVariable Long id) {
        try {
            apiKeyService.deactivateApiKey(id);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Ключ деактивирован");
            return response;
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return response;
        }
    }
}