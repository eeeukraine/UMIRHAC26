package com.restaurant.backend.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "products")
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, length = 10)
    private String unit;

    @Column(name = "min_stock_quantity")
    private Double minStockQuantity = 0.0;

    private String category;

    @Column(name = "storage_type", length = 20)
    private String storageType = "refrigerator";

    @Column(name = "avg_shelf_life_days")
    private Integer avgShelfLifeDays = 7;

    @Column(name = "is_available")
    private Boolean isAvailable = true;

    public Product() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getUnit() { return unit; }
    public void setUnit(String unit) { this.unit = unit; }

    public Double getMinStockQuantity() { return minStockQuantity; }
    public void setMinStockQuantity(Double minStockQuantity) { this.minStockQuantity = minStockQuantity; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getStorageType() { return storageType; }
    public void setStorageType(String storageType) { this.storageType = storageType; }

    public Integer getAvgShelfLifeDays() { return avgShelfLifeDays; }
    public void setAvgShelfLifeDays(Integer avgShelfLifeDays) { this.avgShelfLifeDays = avgShelfLifeDays; }

    public Boolean getIsAvailable() { return isAvailable; }
    public void setIsAvailable(Boolean isAvailable) { this.isAvailable = isAvailable; }
}