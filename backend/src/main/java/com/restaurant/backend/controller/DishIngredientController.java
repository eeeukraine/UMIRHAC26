package com.restaurant.backend.controller;

import com.restaurant.backend.entity.DishIngredient;
import com.restaurant.backend.repository.DishIngredientRepository;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/dish-ingredients")
@CrossOrigin(origins = "http://localhost:3000")
public class DishIngredientController {

    private final DishIngredientRepository dishIngredientRepository;

    public DishIngredientController(DishIngredientRepository dishIngredientRepository) {
        this.dishIngredientRepository = dishIngredientRepository;
    }

    @GetMapping
    public List<DishIngredient> getAll() {
        return dishIngredientRepository.findAll();
    }

    @GetMapping("/dish/{dishId}")
    public List<DishIngredient> getByDish(@PathVariable Long dishId) {
        return dishIngredientRepository.findByDishId(dishId);
    }

    @PostMapping
    public DishIngredient create(@RequestBody DishIngredient dishIngredient) {
        return dishIngredientRepository.save(dishIngredient);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        dishIngredientRepository.deleteById(id);
    }
}