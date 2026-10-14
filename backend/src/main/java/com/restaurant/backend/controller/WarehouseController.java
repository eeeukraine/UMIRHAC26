package com.restaurant.backend.controller;

import com.restaurant.backend.entity.Batch;
import com.restaurant.backend.entity.Dish;
import com.restaurant.backend.entity.DishIngredient;
import com.restaurant.backend.entity.Product;
import com.restaurant.backend.repository.BatchRepository;
import com.restaurant.backend.repository.DishIngredientRepository;
import com.restaurant.backend.repository.DishRepository;
import com.restaurant.backend.repository.ProductRepository;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/warehouse")
@CrossOrigin(origins = "http://localhost:3000")
public class WarehouseController {

    private final BatchRepository batchRepository;
    private final ProductRepository productRepository;
    private final DishRepository dishRepository;
    private final DishIngredientRepository dishIngredientRepository;

    public WarehouseController(BatchRepository batchRepository, 
                               ProductRepository productRepository,
                               DishRepository dishRepository,
                               DishIngredientRepository dishIngredientRepository) {
        this.batchRepository = batchRepository;
        this.productRepository = productRepository;
        this.dishRepository = dishRepository;
        this.dishIngredientRepository = dishIngredientRepository;
    }

    // 1. Все продукты с их партиями
    @GetMapping("/products")
    public List<Map<String, Object>> getAllProductsWithBatches() {
        List<Product> products = productRepository.findAll();
        List<Batch> allBatches = batchRepository.findAllAvailable();
        
        return products.stream().map(product -> {
            Map<String, Object> productData = new HashMap<>();
            productData.put("id", product.getId());
            productData.put("name", product.getName());
            productData.put("unit", product.getUnit());
            productData.put("minStock", product.getMinStockQuantity());
            productData.put("category", product.getCategory());
            
            List<Batch> productBatches = allBatches.stream()
                .filter(b -> b.getProductId().equals(product.getId()))
                .collect(Collectors.toList());
            
            // Округляем до 2 знаков, чтобы избежать проблем с плавающей точкой (17.0000000004)
            double totalQuantity = Math.round(productBatches.stream()
                .mapToDouble(Batch::getQuantity)
                .sum() * 100.0) / 100.0;
            
            productData.put("totalQuantity", totalQuantity);
            productData.put("batches", productBatches);
            
            if (totalQuantity < product.getMinStockQuantity()) {
                productData.put("status", "low");
            } else {
                productData.put("status", "ok");
            }
            
            return productData;
        }).collect(Collectors.toList());
    }

    // 2. Продукты с истекающим сроком (в течение N дней)
    @GetMapping("/expiring")
    public List<Batch> getExpiringBatches(@RequestParam(defaultValue = "7") int days) {
        LocalDate date = LocalDate.now().plusDays(days);
        return batchRepository.findExpiringBefore(date);
    }

    // 3. Продукты ниже минимального остатка (с приоритетом и рекомендацией)
    @GetMapping("/low-stock")
    public List<Map<String, Object>> getLowStockProducts() {
        List<Product> products = productRepository.findAll();
        List<Batch> allBatches = batchRepository.findAllAvailable();
        
        return products.stream()
            .filter(product -> {
                double total = allBatches.stream()
                    .filter(b -> b.getProductId().equals(product.getId()))
                    .mapToDouble(Batch::getQuantity)
                    .sum();
                // Показываем только если остаток меньше 80% от минимума (чтобы не спамить мелочью)
                return total < (product.getMinStockQuantity() * 0.8);
            })
            .map(product -> {
                Map<String, Object> data = new HashMap<>();
                double total = allBatches.stream()
                    .filter(b -> b.getProductId().equals(product.getId()))
                    .mapToDouble(Batch::getQuantity)
                    .sum();
                
                // Округляем
                total = Math.round(total * 100.0) / 100.0;
                double minStock = product.getMinStockQuantity();
                double ratio = total / minStock;
                
                // Определяем приоритет
                String priority;
                if (ratio < 0.3) priority = "critical";
                else if (ratio < 0.6) priority = "high";
                else priority = "medium";

                data.put("id", product.getId());
                data.put("name", product.getName());
                data.put("unit", product.getUnit());
                data.put("currentQuantity", total);
                data.put("minQuantity", minStock);
                data.put("priority", priority);
                data.put("suggestedQuantity", Math.ceil(minStock - total)); // Сколько докупить
                
                return data;
            })
            .sorted(Comparator.comparing(m -> {
                // Сортировка по приоритету: critical -> high -> medium
                String p = (String) m.get("priority");
                return p.equals("critical") ? 0 : (p.equals("high") ? 1 : 2);
            }))
            .collect(Collectors.toList());
    }

    // 4. Рецепты под угрозой (не хватает ингредиентов даже на 1 порцию)
    @GetMapping("/at-risk-recipes")
    public List<Map<String, Object>> getAtRiskRecipes() {
        List<Map<String, Object>> atRisk = new ArrayList<>();
        List<Dish> dishes = dishRepository.findAll();
        List<Batch> allBatches = batchRepository.findAllAvailable();

        for (Dish dish : dishes) {
            List<DishIngredient> ingredients = dishIngredientRepository.findByDishId(dish.getId());
            List<String> missingProducts = new ArrayList<>();

            for (DishIngredient ingredient : ingredients) {
                double available = allBatches.stream()
                    .filter(b -> b.getProductId().equals(ingredient.getProductId()))
                    .mapToDouble(Batch::getQuantity)
                    .sum();

                if (available < ingredient.getQuantity()) {
                    String productName = allBatches.stream()
                        .filter(b -> b.getProductId().equals(ingredient.getProductId()))
                        .findFirst()
                        .map(Batch::getProductName)
                        .orElse("Продукт ID:" + ingredient.getProductId());
                    missingProducts.add(productName);
                }
            }

            if (!missingProducts.isEmpty()) {
                Map<String, Object> recipe = new HashMap<>();
                recipe.put("id", dish.getId());
                recipe.put("name", dish.getName());
                recipe.put("missingProducts", missingProducts);
                atRisk.add(recipe);
            }
        }

        return atRisk;
    }

    // 5. Статистика для дашборда
    @GetMapping("/stats")
    public Map<String, Object> getStats() {
        Map<String, Object> stats = new HashMap<>();
        
        List<Product> products = productRepository.findAll();
        List<Batch> allBatches = batchRepository.findAllAvailable();
        
        stats.put("totalProducts", products.size());
        
        // Требуют поставки (менее 80% от минимума)
        long lowStock = products.stream()
            .filter(product -> {
                double total = allBatches.stream()
                    .filter(b -> b.getProductId().equals(product.getId()))
                    .mapToDouble(Batch::getQuantity)
                    .sum();
                return total < (product.getMinStockQuantity() * 0.8);
            })
            .count();
        stats.put("lowStock", lowStock);
        
        // Близко к истечению (7 дней)
        LocalDate weekLater = LocalDate.now().plusDays(7);
        long expiringSoon = allBatches.stream()
            .filter(b -> b.getExpirationDate().isBefore(weekLater))
            .count();
        stats.put("expiringSoon", expiringSoon);
        
        // Рецепты под угрозой (считаем динамически)
        long recipesAtRisk = getAtRiskRecipes().size();
        stats.put("recipesAtRisk", recipesAtRisk);
        
        return stats;
    }
}