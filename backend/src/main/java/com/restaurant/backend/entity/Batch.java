package com.restaurant.backend.entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "batches")
public class Batch {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "product_id")
    @JsonProperty("productId")
    private Long productId;

    @Column(name = "product_name", length = 100)
    @JsonProperty("productName")
    private String productName;

    @Column(nullable = false)
    @JsonProperty("quantity")
    private Double quantity;

    @Column(nullable = false, length = 10)
    @JsonProperty("unit")
    private String unit;

    @Column(name = "expiration_date", nullable = false)
    @JsonProperty("expirationDate")
    private LocalDate expirationDate;

    @Column(name = "batch_number", length = 50)
    @JsonProperty("batchNumber")
    private String batchNumber;

    @Column(name = "delivery_id")
    @JsonProperty("deliveryId")
    private Long deliveryId;

    @Column(name = "created_at")
    @JsonProperty("createdAt")
    private LocalDate createdAt = LocalDate.now();

    public Batch() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }

    public String getProductName() { return productName; }
    public void setProductName(String productName) { this.productName = productName; }

    public Double getQuantity() { return quantity; }
    public void setQuantity(Double quantity) { this.quantity = quantity; }

    public String getUnit() { return unit; }
    public void setUnit(String unit) { this.unit = unit; }

    public LocalDate getExpirationDate() { return expirationDate; }
    public void setExpirationDate(LocalDate expirationDate) { this.expirationDate = expirationDate; }

    public String getBatchNumber() { return batchNumber; }
    public void setBatchNumber(String batchNumber) { this.batchNumber = batchNumber; }

    public Long getDeliveryId() { return deliveryId; }
    public void setDeliveryId(Long deliveryId) { this.deliveryId = deliveryId; }

    public LocalDate getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDate createdAt) { this.createdAt = createdAt; }
}