package com.restaurant.backend.repository;

import com.restaurant.backend.entity.DishIngredient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface DishIngredientRepository extends JpaRepository<DishIngredient, Long> {
    
    List<DishIngredient> findByDishId(Long dishId);
    
    List<DishIngredient> findByProductId(Long productId);
}