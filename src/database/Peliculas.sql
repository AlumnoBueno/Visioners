CREATE DATABASE IF NOT EXISTS Visioners;

USE Visioners;

CREATE TABLE IF NOT EXISTS peliculas(
    id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(100) NOT NULL,
    sinopsis TEXT(65535) NOT NULL,
    direccion VARCHAR(100) NOT NULL,
    duracion INT NOT NULL,
    caratula TEXT(65535) NOT NULL
);

select * from peliculas;