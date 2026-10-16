package com.restaurant.backend.controller;

import com.restaurant.backend.entity.User;
import com.restaurant.backend.repository.UserRepository;
import com.restaurant.backend.security.JwtService;
import com.restaurant.backend.security.CustomUserDetailsService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final CustomUserDetailsService userDetailsService;
    private final JwtService jwtService;
    private final UserRepository userRepository; // ✅ Добавили

    public AuthController(AuthenticationManager authenticationManager, 
                          CustomUserDetailsService userDetailsService, 
                          JwtService jwtService,
                          UserRepository userRepository) { // ✅ Добавили
        this.authenticationManager = authenticationManager;
        this.userDetailsService = userDetailsService;
        this.jwtService = jwtService;
        this.userRepository = userRepository;
    }

    @GetMapping("/generate-hash")
    public Map<String, String> generateHash(@RequestParam String password) {
        org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder encoder = 
            new org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder();
        String hash = encoder.encode(password);
        return Map.of("hash", hash);
    }

    @PostMapping("/login")
    public ResponseEntity<?> authenticate(@RequestBody Map<String, String> authRequest) {
        try {
            System.out.println("=== ПОПЫТКА ВХОДА ===");
            System.out.println("Username: " + authRequest.get("username"));
            
            // 1. Аутентификация
            authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                    authRequest.get("username"), 
                    authRequest.get("password")
                )
            );
            
            System.out.println("✅ Аутентификация прошла успешно");
            
            // 2. Генерируем токен
            UserDetails userDetails = userDetailsService.loadUserByUsername(authRequest.get("username"));
            String jwtToken = jwtService.generateToken(userDetails);
            
            // 3. ✅ Загружаем пользователя напрямую из репозитория
            User user = userRepository.findByUsername(authRequest.get("username"))
                .orElseThrow(() -> new RuntimeException("Пользователь не найден"));
            
            System.out.println("User ID: " + user.getId());
            System.out.println("User Role: " + user.getRole());
            System.out.println("User FirmId: " + user.getFirmId());
            
            // 4. Формируем ответ
            Map<String, Object> response = new HashMap<>();
            response.put("token", jwtToken);
            
            Map<String, Object> userInfo = new HashMap<>();
            userInfo.put("id", user.getId());
            userInfo.put("name", user.getName() != null ? user.getName() : user.getUsername());
            userInfo.put("role", user.getRole());
            userInfo.put("firmId", user.getFirmId());
            
            response.put("user", userInfo);
            
            System.out.println("=== ВХОД УСПЕШЕН ===");
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.out.println("❌ ОШИБКА ВХОДА: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(401).body(Map.of("error", "Неверный логин или пароль"));
        }
    }
}