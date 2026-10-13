package com.restaurant.backend.controller;

import com.restaurant.backend.entity.Dish;
import com.restaurant.backend.repository.DishRepository;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/dishes")
@CrossOrigin(origins = "http://localhost:3000")
public class DishController {

    private final DishRepository dishRepository;

    public DishController(DishRepository dishRepository) {
        this.dishRepository = dishRepository;
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
}