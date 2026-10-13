package com.restaurant.backend.repository;

import com.restaurant.backend.entity.Delivery;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface DeliveryRepository extends JpaRepository<Delivery, Long> {
    
    List<Delivery> findByStatus(String status);
    
    @Query("SELECT d FROM Delivery d ORDER BY d.createdAt DESC")
    List<Delivery> findRecentDeliveries();
}