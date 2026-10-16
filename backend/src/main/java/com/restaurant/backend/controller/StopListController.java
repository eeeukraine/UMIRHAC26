package com.restaurant.backend.controller;

import com.restaurant.backend.entity.Batch;
import com.restaurant.backend.entity.Dish;
import com.restaurant.backend.entity.DishIngredient;
import com.restaurant.backend.entity.Product;
import com.restaurant.backend.repository.BatchRepository;
import com.restaurant.backend.repository.DishIngredientRepository;
import com.restaurant.backend.repository.DishRepository;
import com.restaurant.backend.repository.ProductRepository; // ✅ 1. Добавили импорт
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping("/api/stop-list")
public class StopListController {

    private final DishRepository dishRepository;
    private final DishIngredientRepository dishIngredientRepository;
    private final BatchRepository batchRepository;
    private final ProductRepository productRepository; // ✅ 2. Добавили поле

    // ✅ 3. Добавили productRepository в конструктор
    public StopListController(DishRepository dishRepository,
                             DishIngredientRepository dishIngredientRepository,
                             BatchRepository batchRepository,
                             ProductRepository productRepository) {
        this.dishRepository = dishRepository;
        this.dishIngredientRepository = dishIngredientRepository;
        this.batchRepository = batchRepository;
        this.productRepository = productRepository;
    }

    @GetMapping
public List<Map<String, Object>> getStopList() {
    LocalDate today = LocalDate.now(); // ✅ Добавили эту строку!
    
    List<Map<String, Object>> stopList = new ArrayList<>();
    List<Dish> dishes = dishRepository.findAll();

    for (Dish dish : dishes) {
        List<DishIngredient> ingredients = dishIngredientRepository.findByDishId(dish.getId());
        List<String> missingProducts = new ArrayList<>();

        for (DishIngredient ingredient : ingredients) {
            List<Batch> batches = batchRepository.findAvailableByProductId(ingredient.getProductId());
            
            // ✅ Считаем доступными только те партии, чей срок СТРОГО ПОСЛЕ сегодня
            double available = batches.stream()
                .filter(b -> b.getExpirationDate() != null && b.getExpirationDate().isAfter(today))
                .mapToDouble(Batch::getQuantity)
                .sum();

            if (available < ingredient.getQuantity()) {
                String productName = productRepository.findById(ingredient.getProductId())
                    .map(Product::getName)
                    .orElse("Продукт ID:" + ingredient.getProductId());
                missingProducts.add(productName);
            }
        }

        if (!missingProducts.isEmpty()) {
            Map<String, Object> item = new HashMap<>();
            item.put("id", dish.getId());
            item.put("dishName", dish.getName());
            item.put("reason", "Нет: " + String.join(", ", missingProducts));
            item.put("missingProducts", missingProducts);
            stopList.add(item);
        }
    }

    return stopList;
    }
}
