package com.restaurant.backend.service;

import com.restaurant.backend.entity.Batch;
import com.restaurant.backend.entity.DishIngredient;
import com.restaurant.backend.entity.Order;
import com.restaurant.backend.entity.OrderItem;
import com.restaurant.backend.repository.BatchRepository;
import com.restaurant.backend.repository.DishIngredientRepository;
import com.restaurant.backend.repository.OrderRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final BatchRepository batchRepository;
    private final DishIngredientRepository dishIngredientRepository;

    public OrderService(OrderRepository orderRepository, 
                       BatchRepository batchRepository,
                       DishIngredientRepository dishIngredientRepository) {
        this.orderRepository = orderRepository;
        this.batchRepository = batchRepository;
        this.dishIngredientRepository = dishIngredientRepository;
    }

    @Transactional
    public Map<String, Object> createOrder(Order order) {
        Map<String, Object> result = new HashMap<>();

        // Генерируем номер заказа
        if (order.getOrderNumber() == null || order.getOrderNumber().isEmpty()) {
            order.setOrderNumber("ORD-" + System.currentTimeMillis());
        }

        // Собираем все необходимые ингредиенты для заказа
        Map<Long, Double> requiredIngredients = new HashMap<>();

        if (order.getItems() != null) {
            for (OrderItem item : order.getItems()) {
                item.setOrder(order);

                // Получаем ингредиенты блюда
                List<DishIngredient> ingredients = dishIngredientRepository.findByDishId(item.getDishId());

                for (DishIngredient ingredient : ingredients) {
                    Long productId = ingredient.getProductId();
                    double needed = ingredient.getQuantity() * item.getQuantity();

                    requiredIngredients.merge(productId, needed, Double::sum);
                }
            }
        }

        // Проверяем наличие ингредиентов на складе
        List<String> missingProducts = new ArrayList<>();

        for (Map.Entry<Long, Double> entry : requiredIngredients.entrySet()) {
            Long productId = entry.getKey();
            double needed = entry.getValue();

            List<Batch> batches = batchRepository.findAvailableByProductId(productId);
            double available = batches.stream().mapToDouble(Batch::getQuantity).sum();

            if (available < needed) {
                // Находим название продукта
                String productName = batches.isEmpty() ? "Продукт ID:" + productId : batches.get(0).getProductName();
                missingProducts.add(productName + " (нужно: " + needed + ", есть: " + available + ")");
            }
        }

        // Если чего-то не хватает — отказываем в заказе
        if (!missingProducts.isEmpty()) {
            result.put("success", false);
            result.put("message", "Недостаточно ингредиентов: " + String.join(", ", missingProducts));
            result.put("missingProducts", missingProducts);
            return result;
        }

        // Всё есть — списываем по FIFO
        for (Map.Entry<Long, Double> entry : requiredIngredients.entrySet()) {
            Long productId = entry.getKey();
            double toDeduct = entry.getValue();

            // Получаем партии, отсортированные по сроку годности (FIFO)
            List<Batch> batches = batchRepository.findAvailableByProductId(productId);

            for (Batch batch : batches) {
    if (toDeduct <= 0) break;

    double available = batch.getQuantity();

    if (available <= toDeduct + 0.0001) { // +0.0001 для защиты от погрешности
        toDeduct -= available;
        batch.setQuantity(0.0);
    } else {
        double newQuantity = Math.round((available - toDeduct) * 10000.0) / 10000.0;
        batch.setQuantity(newQuantity);
        toDeduct = 0;
    }

    batchRepository.save(batch);
}
        }

        // Сохраняем заказ
        Order savedOrder = orderRepository.save(order);

        result.put("success", true);
        result.put("order", savedOrder);
        result.put("message", "Заказ успешно создан");

        return result;
    }

    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    public Order getOrderById(Long id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Заказ не найден"));
    }
}