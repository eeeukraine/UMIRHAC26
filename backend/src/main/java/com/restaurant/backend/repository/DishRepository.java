package com.restaurant.backend.repository;

import com.restaurant.backend.entity.Dish;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface DishRepository extends JpaRepository<Dish, Long> {
    
    List<Dish> findByCategoryId(Long categoryId);
    
    List<Dish> findByIsAvailableTrue();
}