package com.restaurant.backend.controller;

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

    public AuthController(AuthenticationManager authenticationManager, 
                          CustomUserDetailsService userDetailsService, 
                          JwtService jwtService) {
        this.authenticationManager = authenticationManager;
        this.userDetailsService = userDetailsService;
        this.jwtService = jwtService;
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
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                        authRequest.get("username"), 
                        authRequest.get("password")
                    )
            );
            
            UserDetails userDetails = userDetailsService.loadUserByUsername(authRequest.get("username"));
            String jwtToken = jwtService.generateToken(userDetails);
            
            Map<String, Object> response = new HashMap<>();
            response.put("token", jwtToken);
            response.put("username", userDetails.getUsername());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("error", "Неверный логин или пароль"));
        }
    }
}