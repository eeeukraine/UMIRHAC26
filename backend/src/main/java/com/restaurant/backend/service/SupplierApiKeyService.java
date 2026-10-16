package com.restaurant.backend.service;

import com.restaurant.backend.entity.SupplierApiKey;
import com.restaurant.backend.repository.SupplierApiKeyRepository;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.UUID;
import java.util.List;  // ✅ Импорт List

@Service
public class SupplierApiKeyService {
    
    private final SupplierApiKeyRepository repository;
    
    public SupplierApiKeyService(SupplierApiKeyRepository repository) {
        this.repository = repository;
    }
    
    public SupplierApiKey createApiKey(String supplierName) {
        SupplierApiKey key = new SupplierApiKey();
        key.setApiKey(UUID.randomUUID().toString());
        key.setSupplierName(supplierName);
        key.setActive(true);
        return repository.save(key);
    }
    
    public SupplierApiKey validateApiKey(String apiKey) {
        SupplierApiKey key = repository.findByApiKeyAndActiveTrue(apiKey)
            .orElseThrow(() -> new RuntimeException("Недействительный API ключ"));
        
        key.setLastUsedAt(LocalDateTime.now());
        return repository.save(key);
    }
    
    public void deactivateApiKey(Long id) {
        SupplierApiKey key = repository.findById(id)
            .orElseThrow(() -> new RuntimeException("Ключ не найден"));
        key.setActive(false);
        repository.save(key);
    }
    
    public List<SupplierApiKey> getAllKeys() {  // Теперь List найден
        return repository.findAll();
    }
}