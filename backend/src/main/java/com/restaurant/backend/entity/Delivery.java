package com.restaurant.backend.entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "deliveries")
public class Delivery {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "delivery_number", unique = true, length = 50)
    @JsonProperty("deliveryNumber")
    private String deliveryNumber;

    @Column(name = "supplier_name", nullable = false, length = 150)
    @JsonProperty("supplier") // ← было supplierName
    private String supplierName;

    @Column(name = "delivery_date", nullable = false)
    @JsonProperty("date") // ← было deliveryDate
    private LocalDate deliveryDate;

    @Column(nullable = false)
    @JsonProperty("status")
    private String status = "Принята"; // ← русские значения

    @Column(name = "total_items")
    @JsonProperty("itemsCount") // ← было totalItems
    private Integer totalItems = 0;

    @Column(name = "total_amount")
    @JsonProperty("totalAmount")
    private Double totalAmount = 0.0;

    private String notes;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @OneToMany(mappedBy = "delivery", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @JsonProperty("items")
    private List<DeliveryItem> items;

    public Delivery() {}

    // Геттеры и сеттеры (без изменений)
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getDeliveryNumber() { return deliveryNumber; }
    public void setDeliveryNumber(String deliveryNumber) { this.deliveryNumber = deliveryNumber; }

    public String getSupplierName() { return supplierName; }
    public void setSupplierName(String supplierName) { this.supplierName = supplierName; }

    public LocalDate getDeliveryDate() { return deliveryDate; }
    public void setDeliveryDate(LocalDate deliveryDate) { this.deliveryDate = deliveryDate; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Integer getTotalItems() { return totalItems; }
    public void setTotalItems(Integer totalItems) { this.totalItems = totalItems; }

    public Double getTotalAmount() { return totalAmount; }
    public void setTotalAmount(Double totalAmount) { this.totalAmount = totalAmount; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public List<DeliveryItem> getItems() { return items; }
    public void setItems(List<DeliveryItem> items) { this.items = items; }
}