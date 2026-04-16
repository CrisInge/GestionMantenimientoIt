create database gestion_mantenimiento_it;
use gestion_mantenimiento_it;

CREATE TABLE usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100),
  correo VARCHAR(100) UNIQUE,
  password VARCHAR(255),
  rol VARCHAR(50) -- admin, tecnico
);

CREATE TABLE equipos (
    id_equipo INT AUTO_INCREMENT PRIMARY KEY,
    dueno_equipo VARCHAR(100) NOT NULL,
    marca VARCHAR(50),
    modelo VARCHAR(50),
    service_tag VARCHAR(100) UNIQUE,
    area VARCHAR(100),
    usuario_asignado VARCHAR(100),
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE mantenimientos (
    id_mantenimiento INT AUTO_INCREMENT PRIMARY KEY,
    
    id_equipo INT NOT NULL,
    id_tecnico INT,  -- IMPORTANTE: sin NOT NULL
    
    tipo ENUM('Preventivo', 'Correctivo') NOT NULL,
    descripcion TEXT,
    solucion TEXT,
    estado ENUM('Activo','Finalizado') DEFAULT 'Activo',
	fecha_inicio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	fecha_fin TIMESTAMP NULL,

    CONSTRAINT fk_equipo
        FOREIGN KEY (id_equipo)
        REFERENCES equipos(id_equipo)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT fk_tecnico
        FOREIGN KEY (id_tecnico)
        REFERENCES usuarios(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
);

CREATE TABLE historial_mantenimiento (
  id INT AUTO_INCREMENT PRIMARY KEY,
  mantenimiento_id INT,
  comentario TEXT,
  fecha DATETIME,

  FOREIGN KEY (mantenimiento_id) REFERENCES mantenimientos(id_mantenimiento)
);




show tables;
select * from usuarios;
select * from equipos;
select * from mantenimientos;
select * from historial_mantenimiento;