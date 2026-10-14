package com.restaurant.backend.entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;

@Entity
@Table(name = "dish_ingredients")
public class DishIngredient {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "dish_id", nullable = false)
    @JsonProperty("dishId")
    private Long dishId;

    @Column(name = "product_id", nullable = false)
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

    public DishIngredient() {}

    // Геттеры и сеттеры
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getDishId() { return dishId; }
    public void setDishId(Long dishId) { this.dishId = dishId; }

    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }

    public String getProductName() { return productName; }
    public void setProductName(String productName) { this.productName = productName; }

    public Double getQuantity() { return quantity; }
    public void setQuantity(Double quantity) { this.quantity = quantity; }

    public String getUnit() { return unit; }
    public void setUnit(String unit) { this.unit = unit; }
}