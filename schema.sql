-- Proposed MySQL schema from the project report appendix.
-- This file is a database design reference; it is not connected to the browser demo.
CREATE DATABASE IF NOT EXISTS hostel_mess;
USE hostel_mess;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  room_number VARCHAR(10),
  role VARCHAR(10) NOT NULL,
  username VARCHAR(50) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL
);

CREATE TABLE menus (
  id INT AUTO_INCREMENT PRIMARY KEY,
  date DATE NOT NULL,
  meal_type VARCHAR(10) NOT NULL,
  items VARCHAR(500) NOT NULL,
  UNIQUE (date, meal_type)
);

CREATE TABLE orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  date DATE NOT NULL,
  meal_type VARCHAR(10) NOT NULL,
  status VARCHAR(10) NOT NULL DEFAULT 'PENDING',
  FOREIGN KEY (user_id) REFERENCES users(id),
  UNIQUE (user_id, date, meal_type)
);

CREATE TABLE skips (
  user_id INT NOT NULL,
  date DATE NOT NULL,
  meal_type VARCHAR(10) NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id),
  UNIQUE (user_id, date, meal_type)
);
