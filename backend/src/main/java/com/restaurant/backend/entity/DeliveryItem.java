package com.restaurant.backend.entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "delivery_items")
public class DeliveryItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "delivery_id", nullable = false)
    @JsonIgnore // не отдаём в JSON, чтобы не было циклической ссылки
    private Delivery delivery;

    @Column(name = "product_id")
    @JsonProperty("productId")
    private Long productId;

    @Column(name = "product_name", length = 100)
    @JsonProperty("productName") // <-- ИСПРАВЛЕНО: теперь совпадает с тем, что шлёт фронтенд
    private String productName;

    @Column(nullable = false)
    @JsonProperty("quantity")
    private Double quantity;

    @Column(nullable = false, length = 10)
    @JsonProperty("unit")
    private String unit = "шт";

    @Column(name = "unit_price")
    @JsonProperty("unitPrice")
    private Double unitPrice = 0.0;

    @Column(name = "total_price")
    @JsonProperty("totalPrice")
    private Double totalPrice = 0.0;

    @Column(name = "expiration_date", nullable = false)
    @JsonProperty("expirationDate")
    private LocalDate expirationDate;

    @Column(name = "batch_number", length = 50)
    @JsonProperty("batchNumber")
    private String batchNumber;

    public DeliveryItem() {}

    // Геттеры и сеттеры
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Delivery getDelivery() { return delivery; }
    public void setDelivery(Delivery delivery) { this.delivery = delivery; }

    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }

    public String getProductName() { return productName; }
    public void setProductName(String productName) { this.productName = productName; }

    public Double getQuantity() { return quantity; }
    public void setQuantity(Double quantity) { this.quantity = quantity; }

    public String getUnit() { return unit; }
    public void setUnit(String unit) { this.unit = unit; }

    public Double getUnitPrice() { return unitPrice; }
    public void setUnitPrice(Double unitPrice) { this.unitPrice = unitPrice; }

    public Double getTotalPrice() { return totalPrice; }
    public void setTotalPrice(Double totalPrice) { this.totalPrice = totalPrice; }

    public LocalDate getExpirationDate() { return expirationDate; }
    public void setExpirationDate(LocalDate expirationDate) { this.expirationDate = expirationDate; }

    public String getBatchNumber() { return batchNumber; }
    public void setBatchNumber(String batchNumber) { this.batchNumber = batchNumber; }
}