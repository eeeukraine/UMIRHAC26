package com.restaurant.backend.repository;

import com.restaurant.backend.entity.SupplierApiKey;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface SupplierApiKeyRepository extends JpaRepository<SupplierApiKey, Long> {
    Optional<SupplierApiKey> findByApiKey(String apiKey);
    Optional<SupplierApiKey> findByApiKeyAndActiveTrue(String apiKey);
}