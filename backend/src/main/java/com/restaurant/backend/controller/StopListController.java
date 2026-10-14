package com.restaurant.backend.controller;

import com.restaurant.backend.entity.Batch;
import com.restaurant.backend.entity.Dish;
import com.restaurant.backend.entity.DishIngredient;
import com.restaurant.backend.repository.BatchRepository;
import com.restaurant.backend.repository.DishIngredientRepository;
import com.restaurant.backend.repository.DishRepository;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/stop-list")
@CrossOrigin(origins = "http://localhost:3000")
public class StopListController {

    private final DishRepository dishRepository;
    private final DishIngredientRepository dishIngredientRepository;
    private final BatchRepository batchRepository;

    public StopListController(DishRepository dishRepository,
                             DishIngredientRepository dishIngredientRepository,
                             BatchRepository batchRepository) {
        this.dishRepository = dishRepository;
        this.dishIngredientRepository = dishIngredientRepository;
        this.batchRepository = batchRepository;
    }

    @GetMapping
    public List<Map<String, Object>> getStopList() {
        List<Map<String, Object>> stopList = new ArrayList<>();
        List<Dish> dishes = dishRepository.findAll();

        for (Dish dish : dishes) {
            List<DishIngredient> ingredients = dishIngredientRepository.findByDishId(dish.getId());
            List<String> missingProducts = new ArrayList<>();

            for (DishIngredient ingredient : ingredients) {
                List<Batch> batches = batchRepository.findAvailableByProductId(ingredient.getProductId());
                double available = batches.stream().mapToDouble(Batch::getQuantity).sum();

                if (available < ingredient.getQuantity()) {
                    String productName = batches.isEmpty() ? 
                        "Продукт ID:" + ingredient.getProductId() : 
                        batches.get(0).getProductName();
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