package com.restaurant.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "supplier_proposals")
public class SupplierProposal {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String supplierName; // Кто предложил
    
    @Column(nullable = false)
    private String productName; // Название продукта
    
    @Column(nullable = false)
    private Double quantity; // Количество
    
    @Column(nullable = false)
    private String unit; // Единица измерения (кг, л, шт)
    
    @Column(nullable = false)
    private Double pricePerUnit; // Цена за единицу
    
    @Column(name = "expiration_date")
    private LocalDate expirationDate; // Срок годности
    
    @Column(nullable = false)
    private String status = "pending"; // pending, accepted, rejected
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt; // Когда рассмотрели
    
    @Column(name = "review_comment")
    private String reviewComment; // Комментарий при принятии/отклонении
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
    
    // Геттеры и сеттеры
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getSupplierName() { return supplierName; }
    public void setSupplierName(String supplierName) { this.supplierName = supplierName; }
    
    public String getProductName() { return productName; }
    public void setProductName(String productName) { this.productName = productName; }
    
    public Double getQuantity() { return quantity; }
    public void setQuantity(Double quantity) { this.quantity = quantity; }
    
    public String getUnit() { return unit; }
    public void setUnit(String unit) { this.unit = unit; }
    
    public Double getPricePerUnit() { return pricePerUnit; }
    public void setPricePerUnit(Double pricePerUnit) { this.pricePerUnit = pricePerUnit; }
    
    public LocalDate getExpirationDate() { return expirationDate; }
    public void setExpirationDate(LocalDate expirationDate) { this.expirationDate = expirationDate; }
    
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public LocalDateTime getReviewedAt() { return reviewedAt; }
    public void setReviewedAt(LocalDateTime reviewedAt) { this.reviewedAt = reviewedAt; }
    
    public String getReviewComment() { return reviewComment; }
    public void setReviewComment(String reviewComment) { this.reviewComment = reviewComment; }
}