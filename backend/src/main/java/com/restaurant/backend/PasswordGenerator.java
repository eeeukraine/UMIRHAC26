package com.restaurant.backend;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class PasswordGenerator {
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        String password = "12345";
        String hashed = encoder.encode(password);
        System.out.println("========================================");
        System.out.println("Хеш для пароля '12345':");
        System.out.println(hashed);
        System.out.println("========================================");
    }
}