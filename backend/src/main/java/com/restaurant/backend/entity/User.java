package com.restaurant.backend.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String username;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String role;

    // ✅ ДОБАВЛЕНО: Имя пользователя для отображения в интерфейсе
    private String name;

    // ✅ ДОБАВЛЕНО: ID фирмы для мульти-тенантности (разделения данных)
    @Column(name = "firm_id")
    private Long firmId = 1L; // Значение по умолчанию

    // Геттеры и сеттеры
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    // ✅ Геттеры и сеттеры для новых полей
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public Long getFirmId() { return firmId; }
    public void setFirmId(Long firmId) { this.firmId = firmId; }
}