DROP TABLE IF EXISTS employee_schedule;
DROP TABLE IF EXISTS employees CASCADE;
DROP TABLE IF EXISTS hourly_call_forecast;
DROP TABLE IF EXISTS customer_scheduled_calls;
DROP TABLE IF EXISTS employee_day_off;

-- 1. Call forecasting data imported from Excel
CREATE TABLE hourly_call_forecast (
    id SERIAL PRIMARY KEY,
    timestamp TIMESTAMP NOT NULL UNIQUE,
    predicted_volume INT NOT NULL,
    average_call_duration INT DEFAULT 180, -- in seconds
    actual_volume INT
); -- 🔥 תוקן: נוספו סוגריים ונקודה-פסיק

-- 2. Employee roster and scheduling constraints
CREATE TABLE employees (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    role VARCHAR(50) NOT NULL,             -- e.g., 'Manager', 'Agent'
    available_from TIME NOT NULL,
    available_to TIME NOT NULL,
    max_hours_per_day INT DEFAULT 8,
    max_hours_per_week INT DEFAULT 40,
    max_hours_per_month INT DEFAULT 180,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
); -- 🔥 תוקן

-- 3. Final roster connections mapping employees to specific hourly blocks
CREATE TABLE employee_schedule (
    id SERIAL PRIMARY KEY,
    employee_id INT REFERENCES employees(id) ON DELETE CASCADE,
    timestamp TIMESTAMP NOT NULL,
    is_manual_edit BOOLEAN DEFAULT FALSE,
    UNIQUE(employee_id, timestamp)
); -- 🔥 תוקן

-- 4. Employee Days Off
CREATE TABLE employee_day_off (
    id integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    employee_id integer NOT NULL,
    blocked_date date NOT NULL,
    reason varchar(255),
    created_at timestamp DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'UTC'),
    CONSTRAINT uq_employee_date UNIQUE (employee_id, blocked_date),
    CONSTRAINT fk_employee_day_off_employees FOREIGN KEY (employee_id) REFERENCES employees (id) ON DELETE CASCADE
);

-- 5. Future Customer Calls
CREATE TABLE customer_scheduled_calls (
    id SERIAL PRIMARY KEY,
    employee_id INT REFERENCES employees(id) ON DELETE CASCADE,
    customer_name VARCHAR(100) NOT NULL,
    scheduled_time TIMESTAMP NOT NULL,
    duration_minutes INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);