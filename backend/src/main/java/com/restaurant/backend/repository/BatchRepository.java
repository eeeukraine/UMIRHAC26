package com.restaurant.backend.repository;

import com.restaurant.backend.entity.Batch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface BatchRepository extends JpaRepository<Batch, Long> {

    @Query("SELECT b FROM Batch b WHERE b.productId = :productId AND b.quantity > 0 ORDER BY b.expirationDate ASC")
    List<Batch> findAvailableByProductId(@Param("productId") Long productId);

    @Query("SELECT b FROM Batch b WHERE b.quantity > 0 ORDER BY b.expirationDate ASC")
    List<Batch> findAllAvailable();

    @Query("SELECT b FROM Batch b WHERE b.quantity > 0 AND b.expirationDate <= :date ORDER BY b.expirationDate ASC")
    List<Batch> findExpiringBefore(@Param("date") LocalDate date);

    List<Batch> findByProductId(Long productId);
}