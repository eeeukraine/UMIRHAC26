package com.restaurant.backend.service;

import com.restaurant.backend.entity.Dish;
import com.restaurant.backend.entity.Order;
import com.restaurant.backend.entity.OrderItem;
import com.restaurant.backend.repository.DishRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Random;

@Service
public class OrderGeneratorService {

    private static final Logger log = LoggerFactory.getLogger(OrderGeneratorService.class);
    private final DishRepository dishRepository;
    private final OrderService orderService;
    private final Random random = new Random();

    public OrderGeneratorService(DishRepository dishRepository, OrderService orderService) {
        this.dishRepository = dishRepository;
        this.orderService = orderService;
    }

    // Этот метод будет вызываться автоматически каждые 30 секунд (можно изменить)
    // @Scheduled(fixedRate = 30000) 
    public void generateRandomOrder() {
        List<Dish> allDishes = dishRepository.findAll();
        if (allDishes.isEmpty()) {
            log.warn("Невозможно сгенерировать заказ: меню пусто");
            return;
        }

        // Создаем заказ на 1-3 случайных блюда
        int dishesCount = random.nextInt(3) + 1;
        List<OrderItem> items = new ArrayList<>();

        for (int i = 0; i < dishesCount; i++) {
            Dish randomDish = allDishes.get(random.nextInt(allDishes.size()));
            OrderItem item = new OrderItem();
            item.setDishId(randomDish.getId());
            item.setDishName(randomDish.getName());
            item.setQuantity(random.nextInt(2) + 1); // 1 или 2 порции
            items.add(item);
        }

        Order order = new Order();
        order.setTableNumber(random.nextInt(20) + 1); // Стол от 1 до 20
        order.setStatus("pending");
        order.setItems(items);

        // Пытаемся создать заказ через наш основной сервис (с FIFO и проверкой стоп-листа)
        Map<String, Object> result = orderService.createOrder(order);

        if ((Boolean) result.get("success")) {
            log.info("✅ АВТО-ЗАКАЗ УСПЕШЕН: Стол {}, Блюд: {}", order.getTableNumber(), items.size());
        } else {
            log.warn("❌ АВТО-ЗАКАЗ ОТКЛОНЕН (Стоп-лист): {}", result.get("message"));
        }
    }

    // Метод для ручного создания нескольких заказов сразу (для демо)
    public Map<String, Object> generateMultipleOrders(int count) {
        int successCount = 0;
        int failCount = 0;
        
        for (int i = 0; i < count; i++) {
            generateRandomOrder();
            // Небольшая пауза, чтобы заказы имели разное время
            try { Thread.sleep(100); } catch (InterruptedException e) {}
        }
        
        return Map.of(
            "total", count,
            "message", "Генерация завершена. Проверьте логи или страницу заказов."
        );
    }
}