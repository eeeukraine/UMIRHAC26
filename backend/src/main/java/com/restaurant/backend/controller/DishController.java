package com.restaurant.backend.controller;

import com.restaurant.backend.entity.Dish;
import com.restaurant.backend.entity.DishIngredient;
import com.restaurant.backend.repository.DishIngredientRepository;
import com.restaurant.backend.repository.DishRepository;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/dishes")
@CrossOrigin(origins = "http://localhost:3000")
public class DishController {

    private final DishRepository dishRepository;
    private final DishIngredientRepository dishIngredientRepository;

    public DishController(DishRepository dishRepository, DishIngredientRepository dishIngredientRepository) {
        this.dishRepository = dishRepository;
        this.dishIngredientRepository = dishIngredientRepository;
    }

    @GetMapping
    public List<Dish> getAllDishes() {
        return dishRepository.findAll();
    }

    @GetMapping("/{id}")
    public Dish getDishById(@PathVariable Long id) {
        return dishRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Блюдо не найдено: " + id));
    }

    @PostMapping
    public Dish createDish(@RequestBody Dish dish) {
        return dishRepository.save(dish);
    }

    @PutMapping("/{id}")
    public Dish updateDish(@PathVariable Long id, @RequestBody Dish dish) {
        dish.setId(id);
        return dishRepository.save(dish);
    }

    @DeleteMapping("/{id}")
    public void deleteDish(@PathVariable Long id) {
        dishRepository.deleteById(id);
    }

    @GetMapping("/with-ingredients")
    public List<Map<String, Object>> getDishesWithIngredients() {
        List<Map<String, Object>> result = new ArrayList<>();
        List<Dish> dishes = dishRepository.findAll();
        
        for (Dish dish : dishes) {
            Map<String, Object> dishData = new HashMap<>();
            
            // Заполняем основные поля блюда
            dishData.put("id", dish.getId());
            dishData.put("name", dish.getName());
            dishData.put("description", dish.getDescription());
            dishData.put("price", dish.getPrice());
            dishData.put("prepTimeMinutes", dish.getPrepTimeMinutes());
            dishData.put("calories", dish.getCalories());
            
            // ✅ ИСПРАВЛЕНИЕ: используем getCategoryId()
            dishData.put("categoryId", dish.getCategoryId());
            
            // Ингредиенты
            List<DishIngredient> ingredients = dishIngredientRepository.findByDishId(dish.getId());
            List<Map<String, Object>> ingredientsData = new ArrayList<>();
            
            for (DishIngredient ing : ingredients) {
                Map<String, Object> ingData = new HashMap<>();
                ingData.put("name", ing.getProductName());
                ingData.put("quantity", ing.getQuantity());
                ingData.put("unit", ing.getUnit());
                ingredientsData.add(ingData);
            }
            
            dishData.put("ingredients", ingredientsData);
            result.add(dishData);
        }
        
        return result;
    }
}