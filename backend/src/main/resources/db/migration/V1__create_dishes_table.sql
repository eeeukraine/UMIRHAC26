-- Таблица категорий блюд
CREATE TABLE IF NOT EXISTS categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Таблица блюд
CREATE TABLE IF NOT EXISTS dishes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    category_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    prep_time_minutes INT DEFAULT 0,
    calories INT DEFAULT 0,
    price DECIMAL(10,2) DEFAULT 0.00,
    is_available BOOLEAN DEFAULT TRUE,
    sort_order INT DEFAULT 0,
    image_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT,
    INDEX idx_category (category_id),
    INDEX idx_name (name),
    INDEX idx_available (is_available)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Таблица ингредиентов блюд
CREATE TABLE IF NOT EXISTS dish_ingredients (
    id INT PRIMARY KEY AUTO_INCREMENT,
    dish_id INT NOT NULL,
    ingredient VARCHAR(255) NOT NULL,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (dish_id) REFERENCES dishes(id) ON DELETE CASCADE,
    INDEX idx_dish (dish_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Добавим начальные категории
INSERT INTO categories (name, description, sort_order) VALUES
('Горячее', 'Горячие блюда', 1),
('Салаты', 'Салаты и закуски', 2),
('Супы', 'Первые блюда', 3),
('Десерты', 'Десерты и сладкое', 4),
('Напитки', 'Напитки', 5);