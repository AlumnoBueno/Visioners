CREATE DATABASE IF NOT EXISTS Visioners;

USE Visioners;

CREATE TABLE IF NOT EXISTS usuarios(
    email VARCHAR(100) PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    telefono INT(9) NOT NULL,
    contraseña VARCHAR(50) NOT NULL
);

select * from usuarios