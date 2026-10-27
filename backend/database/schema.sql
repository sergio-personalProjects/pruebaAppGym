CREATE DATABASE IF NOT EXISTS tuapp CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE tuapp;

CREATE TABLE IF NOT EXISTS users (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(190) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS exercises (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    muscle_group ENUM('pecho','hombro','espalda','pierna','biceps','triceps') NOT NULL,
    name VARCHAR(150) NOT NULL,
    description VARCHAR(255) NULL,
    UNIQUE KEY uq_exercise_group_name (muscle_group, name)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS workouts (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED NOT NULL,
    started_at DATETIME NOT NULL,
    duration_seconds INT UNSIGNED NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_workout_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_workout_user_started (user_id, started_at)
) ENGINE=InnoDB;

-- Una sola tabla de detalle para cada serie: entrenamiento + ejercicio + serie.
-- Así la relación es directa y resulta mucho más sencilla de administrar desde phpMyAdmin.
CREATE TABLE IF NOT EXISTS workout_sets (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    workout_id BIGINT UNSIGNED NOT NULL,
    exercise_id INT UNSIGNED NOT NULL,
    exercise_order INT UNSIGNED NOT NULL DEFAULT 1,
    set_number INT UNSIGNED NOT NULL,
    weight_kg DECIMAL(7,2) NOT NULL,
    repetitions INT UNSIGNED NOT NULL,
    CONSTRAINT fk_set_workout FOREIGN KEY (workout_id) REFERENCES workouts(id) ON DELETE CASCADE,
    CONSTRAINT fk_set_exercise FOREIGN KEY (exercise_id) REFERENCES exercises(id),
    INDEX idx_set_workout_order (workout_id, exercise_order, set_number),
    INDEX idx_set_exercise (exercise_id),
    UNIQUE KEY uq_workout_exercise_set (workout_id, exercise_order, set_number)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS workout_plans (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED NOT NULL,
    name VARCHAR(100) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_plan_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_plan_user_created (user_id, created_at)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS workout_plan_exercises (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    plan_id BIGINT UNSIGNED NOT NULL,
    exercise_id INT UNSIGNED NOT NULL,
    exercise_order INT UNSIGNED NOT NULL DEFAULT 1,
    CONSTRAINT fk_plan_exercise_plan FOREIGN KEY (plan_id) REFERENCES workout_plans(id) ON DELETE CASCADE,
    CONSTRAINT fk_plan_exercise_exercise FOREIGN KEY (exercise_id) REFERENCES exercises(id),
    INDEX idx_plan_exercise_order (plan_id, exercise_order),
    UNIQUE KEY uq_plan_exercise (plan_id, exercise_id)
) ENGINE=InnoDB;

INSERT IGNORE INTO exercises (muscle_group, name, description) VALUES
('pecho','Press banca con barra','Press horizontal con barra'),
('pecho','Press inclinado con mancuernas','Press inclinado con mancuernas'),
('pecho','Aperturas con mancuernas','Aperturas en banco'),
('pecho','Fondos para pecho','Fondos con énfasis en pectoral'),
('pecho','Cruce de poleas','Cruce de poleas para pectoral'),
('hombro','Press militar','Press vertical con barra'),
('hombro','Press de hombros con mancuernas','Press sentado o de pie'),
('hombro','Elevaciones laterales','Abducción lateral del hombro'),
('hombro','Elevaciones frontales','Flexión frontal del hombro'),
('hombro','Pájaros / reverse fly','Trabajo de deltoides posterior'),
('espalda','Dominadas','Tracción vertical con el peso corporal'),
('espalda','Jalón al pecho','Tracción vertical en polea'),
('espalda','Remo con barra','Remo horizontal con barra'),
('espalda','Remo sentado en polea','Remo horizontal en polea'),
('espalda','Pullover en polea','Extensión de hombro en polea'),
('pierna','Sentadilla con barra','Sentadilla trasera con barra'),
('pierna','Prensa de piernas','Prensa inclinada/horizontal'),
('pierna','Peso muerto rumano','Bisagra de cadera con barra'),
('pierna','Extensión de cuádriceps','Extensión de rodilla en máquina'),
('pierna','Curl femoral','Flexión de rodilla en máquina'),
('pierna','Elevación de gemelos','Trabajo de pantorrilla'),
('biceps','Curl con barra','Flexión de codo con barra'),
('biceps','Curl con mancuernas','Curl alterno o simultáneo'),
('biceps','Curl martillo','Curl con agarre neutro'),
('biceps','Curl predicador','Curl en banco predicador'),
('triceps','Press cerrado','Press de banca con agarre cerrado'),
('triceps','Extensión de tríceps en polea','Pushdown en polea'),
('triceps','Extensión por encima de la cabeza','Extensión de codo en polea/mancuerna'),
('triceps','Fondos para tríceps','Fondos con énfasis en tríceps'),
('triceps','Rompecráneos','Extensión tumbado con barra');

INSERT IGNORE INTO users (name, email, password_hash)
VALUES ('Usuario Demo', 'demo@tuapp.local', '$2y$12$I9a1hnH4tRuiJrCug53vpeVVSTIsAezBan/Cm0SYHxRmjU5bVxe.O');
